# 安全依赖升级说明

## 概要

本次变更升级了存在安全风险的运行时依赖，并移除了未使用的依赖，使 `npm audit` 不再报告已知漏洞。

升级前，`npm audit` 报告：

- 3 个 critical 漏洞
- 6 个 high 漏洞
- 2 个 moderate 漏洞
- 共 11 个存在漏洞的依赖项

升级后：

```text
found 0 vulnerabilities
```

## 依赖变更

升级的直接依赖：

| 依赖 | 原版本 | 新版本 |
| --- | ---: | ---: |
| `@modelcontextprotocol/sdk` | `^0.6.0` | `^1.29.0` |
| `dotenv` | `^16.3.1` | `^17.4.2` |
| `imap` | `^0.8.19` | `^0.8.17` |
| `mailparser` | `^3.7.3` | `^3.9.8` |
| `nodemailer` | `^6.9.7` | `^8.0.7` |

升级的开发依赖：

| 依赖 | 原版本 | 新版本 |
| --- | ---: | ---: |
| `@types/node` | `^20.10.0` | `^25.6.0` |
| `@types/nodemailer` | `^6.4.14` | `^8.0.0` |

移除的依赖：

- `axios`

`axios` 在 `package.json` 中声明为直接依赖，但服务端代码没有导入或使用它。移除后可以消除由它引入的多条传递依赖安全告警，同时不影响当前 MCP 服务的运行逻辑。

新增 npm override：

```json
{
  "overrides": {
    "minimist": "^1.2.8"
  }
}
```

该 override 用于修复下面这条传递依赖链中的漏洞：

```text
poplib -> optimist -> minimist
```

`poplib` 仍被 POP3 收信流程使用，因此这里没有移除 POP3 支持，而是通过覆盖 `minimist` 版本来降低改动风险。

## 修复的主要漏洞类别

本次升级覆盖了以下依赖区域的安全告警：

- MCP TypeScript SDK 的 ReDoS 和 DNS rebinding 相关告警
- Nodemailer 地址解析 DoS、SMTP command injection 等相关告警
- Mailparser HTML 解析相关告警
- Axios DoS、SSRF、prototype pollution 等相关告警
- 由 Axios 依赖链引入的 form-data boundary 随机数安全告警
- `imap -> utf7 -> semver` 传递链上的 ReDoS 告警
- `poplib -> optimist -> minimist` 传递链上的 prototype pollution 告警

## 验证结果

执行过的命令：

```bash
npm audit
node --check index.js
npm run publish-check
```

结果：

```text
npm audit
# found 0 vulnerabilities

node --check index.js
# 通过

npm run publish-check
# 通过
```

运行时冒烟测试：

- MCP `tools/list` 能正常返回工具列表。
- QQ SMTP/IMAP 连接测试通过。
- 使用升级后的 `nodemailer` 发送 QQ 邮件成功。
- UTF-8 中文邮件正文发送和显示正常。

## 兼容性说明

`@modelcontextprotocol/sdk` 从 `0.6.x` 升级到了 `1.x`。这是一次主版本升级。当前项目现有的 import 写法和 stdio transport 用法在本地冒烟测试中仍可正常工作，但发布前建议维护者再结合实际 MCP 客户端做一次确认。

`imap` 固定为 `0.8.17`，是因为 `npm audit` 对 `>=0.8.18` 报告了 `utf7 -> semver` 传递依赖漏洞。固定到 `0.8.17` 可以避开该漏洞链，同时保留现有 IMAP API 使用方式。

`poplib` 本身仍然比较旧，并依赖 `optimist`。本次通过 npm `overrides` 将 `minimist` 提升到安全版本，保留 POP3 功能不变。长期来看，可以考虑替换维护状态更好的 POP3 客户端库。

