import assert from 'node:assert/strict';
import { after, afterEach, beforeEach, test } from 'node:test';
import fs, { mkdtemp, mkdir, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer as createTCPServer } from 'node:net';
import tls, { createServer as createTLSServer, createSecureContext, TLSSocket } from 'node:tls';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { UniversalEmailMCPServer } from './index.js';

// Each run creates a fresh localhost certificate in a private temporary directory.
const certificateDirectory = await mkdtemp(join(tmpdir(), 'email-mcp-tls-'));
after(() => rm(certificateDirectory, { recursive: true, force: true }));
const keyPath = join(certificateDirectory, 'key.pem');
const certificatePath = join(certificateDirectory, 'certificate.pem');
execFileSync('openssl', [
  'req', '-x509', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:P-256',
  '-nodes', '-sha384', '-days', '1', '-subj', '/CN=localhost',
  '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1',
  '-keyout', keyPath, '-out', certificatePath
], { stdio: ['ignore', 'pipe', 'pipe'] });
const key = await fs.readFile(keyPath, 'utf8');
const cert = await fs.readFile(certificatePath, 'utf8');

let previousEnvironment;
beforeEach(() => {
  previousEnvironment = Object.fromEntries(Object.entries(process.env)
    .filter(([name]) => /^(EMAIL_|WECHAT_EMAIL_)/.test(name)));
  for (const name of Object.keys(previousEnvironment)) delete process.env[name];
  process.env.EMAIL_USER = 'security-test@qq.com';
  process.env.EMAIL_PASSWORD = 'public-test-only-credential';
});
afterEach(() => {
  for (const name of Object.keys(process.env)) {
    if (/^(EMAIL_|WECHAT_EMAIL_)/.test(name)) delete process.env[name];
  }
  Object.assign(process.env, previousEnvironment);
});

test('SMTP requires encryption and blocks mail-library file and URL access', () => {
  const server = new UniversalEmailMCPServer();
  for (const manual of [false, true]) {
    if (manual) {
      process.env.EMAIL_SMTP_HOST = 'localhost';
      process.env.EMAIL_SMTP_PORT = '587';
      process.env.EMAIL_SMTP_SECURE = 'false';
    }
    const transporter = server.createSMTPTransporter();
    const options = transporter.options;
    assert.equal(options.requireTLS, true);
    assert.equal(options.tls.rejectUnauthorized, true);
    assert.equal(options.disableFileAccess, true);
    assert.equal(options.disableUrlAccess, true);
    if (!manual) {
      assert.equal(options.host, 'smtp.qq.com');
      assert.equal(options.port, 465);
      assert.equal(options.secure, true);
    }
    transporter.close();
  }
});

test('IMAP and POP3 keep TLS enabled for automatic and manual configuration', () => {
  const server = new UniversalEmailMCPServer();
  for (const manual of [false, true]) {
    if (manual) {
      process.env.EMAIL_IMAP_HOST = 'localhost';
      process.env.EMAIL_IMAP_SECURE = 'false';
      process.env.EMAIL_POP3_HOST = 'localhost';
      process.env.EMAIL_POP3_SECURE = 'false';
    }
    const imap = server.createIMAPConnection();
    assert.equal(imap._config.tls, true);
    assert.equal(imap._config.tlsOptions.rejectUnauthorized, true);
    assert.equal(server.createPOP3Connection().tls, true);
  }
});

test('SMTP refuses a server without STARTTLS before sending credentials', { timeout: 5000 }, async t => {
  const commands = [];
  const fixture = createTCPServer(socket => {
    socket.write('220 localhost test SMTP\r\n');
    socket.on('data', data => {
      commands.push(data.toString());
      socket.write(data.toString().startsWith('EHLO')
        ? '250-localhost\r\n250 AUTH PLAIN LOGIN\r\n'
        : '502 STARTTLS unavailable\r\n');
    });
  });
  fixture.listen(0, '127.0.0.1');
  await once(fixture, 'listening');
  t.after(() => new Promise(resolve => fixture.close(resolve)));
  Object.assign(process.env, {
    EMAIL_SMTP_HOST: '127.0.0.1', EMAIL_SMTP_PORT: String(fixture.address().port), EMAIL_SMTP_SECURE: 'false'
  });
  const transporter = new UniversalEmailMCPServer().createSMTPTransporter();
  t.after(() => transporter.close());
  await assert.rejects(transporter.verify(), /STARTTLS|TLS/i);
  assert(!commands.some(command => /AUTH|public-test-only-credential/.test(command)));
});

for (const protocol of ['IMAP', 'POP3']) {
  test(`${protocol} rejects an untrusted TLS server before login`, { timeout: 5000 }, async t => {
    const commands = [];
    const fixture = createTLSServer({ key, cert }, socket => {
      socket.write(protocol === 'IMAP' ? '* OK local test IMAP\r\n' : '+OK local test POP3\r\n');
      socket.on('data', data => {
        const line = data.toString();
        commands.push(line);
        if (protocol === 'IMAP') {
          const tag = line.split(' ')[0];
          if (line.includes('CAPABILITY')) {
            socket.write(`* CAPABILITY IMAP4rev1\r\n${tag} OK CAPABILITY\r\n`);
          } else {
            socket.end(`${tag} NO local test authentication refused\r\n`);
          }
        } else {
          socket.end('-ERR local test authentication refused\r\n');
        }
      });
    });
    fixture.listen(0, '127.0.0.1');
    await once(fixture, 'listening');
    t.after(() => new Promise(resolve => fixture.close(resolve)));
    process.env[`EMAIL_${protocol}_HOST`] = '127.0.0.1';
    process.env[`EMAIL_${protocol}_PORT`] = String(fixture.address().port);
    const server = new UniversalEmailMCPServer();
    await assert.rejects(protocol === 'IMAP'
      ? server.getRecentEmailsIMAP({ limit: 1 })
      : server.getRecentEmailsPOP3({ limit: 1 }), /self.signed|certificate/i);
    assert(!commands.some(command => /LOGIN|USER|PASS|public-test-only-credential/.test(command)));
  });
}

for (const protocol of ['SMTP', 'IMAP']) {
  test(`${protocol} accepts a trusted TLS connection`, { timeout: 5000 }, async t => {
    const commands = [];
    const fixture = createTLSServer({ key, cert }, socket => {
      socket.write(protocol === 'SMTP' ? '220 localhost test SMTP\r\n' : '* OK local test IMAP\r\n');
      socket.on('data', data => {
        const line = data.toString();
        commands.push(line);
        if (protocol === 'SMTP') {
          if (line.startsWith('EHLO')) socket.write('250-localhost\r\n250 AUTH PLAIN\r\n');
          else if (line.startsWith('AUTH')) socket.write('235 authenticated\r\n');
          else socket.end('221 bye\r\n');
        } else {
          const tag = line.split(' ')[0];
          if (line.includes('CAPABILITY')) socket.write(`* CAPABILITY IMAP4rev1\r\n${tag} OK CAPABILITY\r\n`);
          else if (line.includes('LOGOUT')) socket.end(`* BYE\r\n${tag} OK LOGOUT\r\n`);
          else socket.write(`${tag} OK test command\r\n`);
        }
      });
    });
    fixture.listen(0, '127.0.0.1');
    await once(fixture, 'listening');
    t.after(() => new Promise(resolve => fixture.close(resolve)));
    process.env[`EMAIL_${protocol}_HOST`] = '127.0.0.1';
    process.env[`EMAIL_${protocol}_PORT`] = String(fixture.address().port);
    const server = new UniversalEmailMCPServer();
    if (protocol === 'SMTP') {
      process.env.EMAIL_SMTP_SECURE = 'true';
      const transporter = server.createSMTPTransporter();
      t.after(() => transporter.close());
      transporter.transporter.options.tls = { ...transporter.transporter.options.tls, ca: cert };
      await transporter.verify();
      assert(commands.some(command => command.startsWith('AUTH')));
    } else {
      const imap = server.createIMAPConnection();
      t.after(() => imap.destroy());
      imap._config.tlsOptions.ca = cert;
      imap.connect();
      await once(imap, 'ready');
      assert(commands.some(command => command.includes('LOGIN')));
      imap.end();
    }
  });
}

test('SMTP STARTTLS authenticates only after a trusted TLS upgrade', { timeout: 5000 }, async t => {
  const plaintext = [];
  const encrypted = [];
  const fixture = createTCPServer(socket => {
    socket.write('220 localhost test SMTP\r\n');
    socket.on('data', data => {
      const command = data.toString();
      plaintext.push(command);
      if (command.startsWith('EHLO')) {
        socket.write('250-localhost\r\n250-STARTTLS\r\n250 AUTH PLAIN\r\n');
      } else if (command.startsWith('STARTTLS')) {
        socket.write('220 upgrade ready\r\n');
        socket.removeAllListeners('data');
        const secure = new TLSSocket(socket, { isServer: true, secureContext: createSecureContext({ key, cert }) });
        secure.on('error', error => fixture.emit('error', error));
        secure.on('data', chunk => {
          const line = chunk.toString();
          encrypted.push(line);
          if (line.startsWith('EHLO')) secure.write('250-localhost\r\n250 AUTH PLAIN\r\n');
          else if (line.startsWith('AUTH')) secure.write('235 authenticated\r\n');
          else secure.end('221 bye\r\n');
        });
      } else {
        socket.end('530 TLS required\r\n');
      }
    });
  });
  fixture.listen(0, '127.0.0.1');
  await once(fixture, 'listening');
  t.after(() => new Promise(resolve => fixture.close(resolve)));
  Object.assign(process.env, {
    EMAIL_SMTP_HOST: '127.0.0.1', EMAIL_SMTP_PORT: String(fixture.address().port), EMAIL_SMTP_SECURE: 'false'
  });
  const transporter = new UniversalEmailMCPServer().createSMTPTransporter();
  t.after(() => transporter.close());
  transporter.transporter.options.tls = { ...transporter.transporter.options.tls, ca: cert };
  await transporter.verify();
  assert(plaintext.some(command => command.startsWith('STARTTLS')));
  assert(!plaintext.some(command => command.startsWith('AUTH')));
  assert(encrypted.some(command => command.startsWith('AUTH')));
});

test('POP3 authenticates over trusted TLS with certificate verification enabled', { timeout: 5000 }, async t => {
  const commands = [];
  const fixture = createTLSServer({ key, cert }, socket => {
    socket.write('+OK local test POP3\r\n');
    socket.on('data', data => {
      const line = data.toString();
      commands.push(line);
      if (line.startsWith('USER')) socket.write('+OK user accepted\r\n');
      else if (line.startsWith('PASS')) socket.write('+OK authenticated\r\n');
      else if (line.startsWith('LIST')) socket.write('+OK 0 messages\r\n.\r\n');
      else socket.end('+OK bye\r\n');
    });
  });
  fixture.listen(0, '127.0.0.1');
  await once(fixture, 'listening');
  t.after(() => new Promise(resolve => fixture.close(resolve)));
  const connect = tls.connect;
  t.mock.method(tls, 'connect', (options, callback) => {
    assert.equal(options.host, '127.0.0.1');
    assert.equal(options.port, fixture.address().port);
    assert.equal(options.rejectUnauthorized, true);
    return connect({ ...options, ca: cert }, callback);
  });
  process.env.EMAIL_POP3_HOST = '127.0.0.1';
  process.env.EMAIL_POP3_PORT = String(fixture.address().port);
  const result = await new UniversalEmailMCPServer().getRecentEmailsPOP3({ limit: 1 });
  assert.match(result.content[0].text, /邮箱中没有邮件/);
  assert(commands.some(command => command.startsWith('USER')));
  assert(commands.some(command => command.startsWith('PASS')));
});

test('attachments allow approved files and base64 while rejecting escape paths and URLs', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'email-mcp-security-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const approved = join(directory, 'approved');
  const sibling = join(directory, 'approved-extra');
  await mkdir(approved);
  await mkdir(sibling);
  await writeFile(join(approved, 'report.txt'), 'approved report');
  await writeFile(join(directory, 'private.txt'), 'test-only private file');
  await writeFile(join(sibling, 'private.txt'), 'test-only sibling file');
  await symlink(join(directory, 'private.txt'), join(approved, 'escape.txt'));
  const sent = [];
  const server = new UniversalEmailMCPServer();
  t.mock.method(server, 'createSMTPTransporter', () => ({
    async sendMail(options) { sent.push(options); return { messageId: 'offline-test' }; }
  }));
  const message = { to: ['recipient@example.invalid'], subject: 'Offline test', text: 'test' };
  await server.sendEmail({ ...message, attachments: [{ filename: 'inline.txt', content: 'aGVsbG8=' }] });
  assert.equal(sent[0].attachments[0].encoding, 'base64');
  await assert.rejects(server.sendEmail({ ...message, attachments: [{ path: join(approved, 'report.txt') }] }), /EMAIL_ATTACHMENTS_DIR/);
  process.env.EMAIL_ATTACHMENTS_DIR = approved;
  await server.sendEmail({ ...message, attachments: [{ filename: 'report.txt', path: 'report.txt' }] });
  assert.equal(sent[1].attachments[0].content.toString(), 'approved report');
  assert.equal(sent[1].attachments[0].path, undefined);
  for (const path of ['../private.txt', join(directory, 'private.txt'), join(sibling, 'private.txt'), 'escape.txt']) {
    await assert.rejects(server.sendEmail({ ...message, attachments: [{ path }] }), /EMAIL_ATTACHMENTS_DIR/);
  }
  await assert.rejects(server.sendEmail({ ...message, attachments: [{ path: 'https://example.invalid/private.txt' }] }));
  const large = await fs.open(join(approved, 'large.bin'), 'w');
  await large.truncate(25 * 1024 * 1024);
  await large.close();
  await assert.rejects(server.sendEmail({ ...message, attachments: [
    { content: 'aGVsbG8=' }, { path: 'large.bin' }
  ] }), /25 MiB/);
  assert.equal(sent.length, 2);
});

test('attachments reject replacement between validation and open, and close rejected handles', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'email-mcp-race-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  process.env.EMAIL_ATTACHMENTS_DIR = directory;
  const file = join(directory, 'approved.txt');
  await writeFile(file, 'approved content');
  const server = new UniversalEmailMCPServer();
  t.mock.method(server, 'createSMTPTransporter', () => ({ sendMail() { assert.fail('replaced file was sent'); } }));
  const originalOpen = fs.open;
  let opened;
  t.mock.method(fs, 'open', async (path, flags) => {
    await rename(file, join(directory, 'original.txt'));
    await writeFile(file, 'replacement content');
    opened = await originalOpen(path, flags);
    return opened;
  });
  await assert.rejects(server.sendEmail({
    to: ['recipient@example.invalid'], subject: 'race test', text: 'test', attachments: [{ path: file }]
  }), /校验期间发生变化/);
  assert.equal(opened.fd, -1);
});

test('attachments refuse a symlink introduced immediately before opening', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'email-mcp-symlink-race-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const approved = join(directory, 'approved');
  await mkdir(approved);
  process.env.EMAIL_ATTACHMENTS_DIR = approved;
  const file = join(approved, 'report.txt');
  const outside = join(directory, 'private.txt');
  await writeFile(file, 'approved content');
  await writeFile(outside, 'test-only outside content');
  const server = new UniversalEmailMCPServer();
  t.mock.method(server, 'createSMTPTransporter', () => ({ sendMail() { assert.fail('outside file was sent'); } }));
  const originalOpen = fs.open;
  t.mock.method(fs, 'open', async (path, flags) => {
    await rename(file, join(approved, 'original.txt'));
    await symlink(outside, file);
    return originalOpen(path, flags);
  });
  await assert.rejects(server.sendEmail({
    to: ['recipient@example.invalid'], subject: 'symlink race test', text: 'test', attachments: [{ path: file }]
  }), /ELOOP|校验期间发生变化/);
});

for (const entrypoint of ['direct', 'symlink']) {
  test(`MCP stdio (${entrypoint}) preserves the protocol and refuses runtime credential/server configuration`, { timeout: 5000 }, async t => {
    const directory = await mkdtemp(join(tmpdir(), 'email-mcp-stdio-'));
    t.after(() => rm(directory, { recursive: true, force: true }));
    await writeFile(join(directory, '.env'), 'EMAIL_TYPE=qq\n');
    const source = fileURLToPath(new URL('./index.js', import.meta.url));
    const linked = join(directory, 'server.js');
    await symlink(source, linked);
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [entrypoint === 'direct' ? source : linked],
      env: { EMAIL_USER: 'security-test@qq.com', EMAIL_PASSWORD: 'public-test-only-credential' },
      stderr: 'pipe',
      cwd: directory
    });
    let diagnostics = '';
    transport.stderr.on('data', chunk => { diagnostics += chunk.toString(); });
    const protocolErrors = [];
    const client = new Client({ name: 'security-regression', version: '1.0.0' });
    client.onerror = error => protocolErrors.push(error);
    t.after(() => client.close());
    await client.connect(transport);
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map(tool => tool.name), [
      'send_email', 'get_recent_emails', 'get_email_content', 'list_supported_providers', 'test_email_connection'
    ]);
    for (const name of ['setup_email_account', 'configure_email_server']) {
      const result = await client.callTool({ name, arguments: {
        user: 'security-test@qq.com', password: 'public-test-only-credential', smtpHost: 'attacker.invalid'
      } });
      assert.equal(result.isError, true);
    }
    const providers = await client.callTool({ name: 'list_supported_providers', arguments: {} });
    assert.match(providers.content[0].text, /EMAIL_USER/);
    assert(!providers.content[0].text.includes('public-test-only-credential'));
    const sendFailure = await client.callTool({ name: 'send_email', arguments: {
      to: ['recipient@example.invalid'], subject: 'No network', text: 'test', attachments: [{ path: '/unapproved.txt' }]
    } });
    assert.equal(sendFailure.isError, true);
    assert.match(sendFailure.content[0].text, /EMAIL_ATTACHMENTS_DIR/);
    assert.equal(protocolErrors.length, 0);
    assert(!diagnostics.includes('public-test-only-credential'));
  });
}
