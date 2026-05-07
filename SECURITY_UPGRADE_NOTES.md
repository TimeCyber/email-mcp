# Security Dependency Upgrade Notes

## Summary

This change updates vulnerable runtime dependencies and removes an unused dependency so `npm audit` reports zero known vulnerabilities.

Before the upgrade, `npm audit` reported:

- 3 critical vulnerabilities
- 6 high vulnerabilities
- 2 moderate vulnerabilities
- 11 total vulnerable dependency entries

After the upgrade:

```text
found 0 vulnerabilities
```

## Dependency Changes

Updated direct dependencies:

| Package | Previous | Updated |
| --- | ---: | ---: |
| `@modelcontextprotocol/sdk` | `^0.6.0` | `^1.29.0` |
| `dotenv` | `^16.3.1` | `^17.4.2` |
| `imap` | `^0.8.19` | `^0.8.17` |
| `mailparser` | `^3.7.3` | `^3.9.8` |
| `nodemailer` | `^6.9.7` | `^8.0.7` |

Updated dev dependencies:

| Package | Previous | Updated |
| --- | ---: | ---: |
| `@types/node` | `^20.10.0` | `^25.6.0` |
| `@types/nodemailer` | `^6.4.14` | `^8.0.0` |

Removed:

- `axios`

`axios` was present as a direct dependency but is not imported by the server code. Removing it eliminates several transitive advisories without changing runtime behavior.

Added override:

```json
{
  "overrides": {
    "minimist": "^1.2.8"
  }
}
```

This addresses the vulnerable transitive chain:

```text
poplib -> optimist -> minimist
```

`poplib` is still used by POP3 flows, so the safer change is to override `minimist` rather than remove POP3 support.

## Notable Audit Items Addressed

The upgrade addresses advisories affecting these dependency areas:

- MCP TypeScript SDK ReDoS and DNS rebinding related advisories
- Nodemailer address parsing and SMTP command injection related advisories
- Mailparser HTML parsing advisory
- Axios DoS, SSRF, and prototype pollution related advisories
- Form-data unsafe boundary generation via the removed Axios chain
- `imap -> utf7 -> semver` ReDoS advisory by using the audit-recommended `imap@0.8.17`
- `minimist` prototype pollution via npm overrides

## Verification

Commands run:

```bash
npm audit
node --check index.js
npm run publish-check
```

Results:

```text
npm audit
# found 0 vulnerabilities

node --check index.js
# passed

npm run publish-check
# passed
```

Runtime smoke checks performed:

- MCP `tools/list` returned the expected tool list.
- QQ SMTP/IMAP connection test passed.
- QQ mail send test passed with upgraded `nodemailer`.
- UTF-8 Chinese email body test passed.

## Compatibility Notes

`@modelcontextprotocol/sdk` was upgraded from `0.6.x` to `1.x`. The existing imports and stdio transport usage continue to work in local smoke testing, but this is a major dependency upgrade and should be reviewed carefully before release.

`imap` was pinned to `0.8.17` because npm audit reports the vulnerable path on `>=0.8.18`. This avoids the `utf7 -> semver` vulnerable chain while keeping the existing IMAP API surface.

