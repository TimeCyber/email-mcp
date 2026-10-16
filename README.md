# 📧 通用邮箱 MCP Server

[![npm version](https://badge.fury.io/js/mcp-email.svg)](https://badge.fury.io/js/mcp-email)
[![npm downloads](https://img.shields.io/npm/dm/mcp-email.svg)](https://www.npmjs.com/package/mcp-email)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个让AI轻松接管邮箱的通用MCP服务器，基于 Model Context Protocol (MCP) 构建，支持在 MCP-X、Claude Desktop 等 MCP 客户端中使用。

**支持多种邮箱服务商自动配置**：QQ邮箱、163邮箱、Gmail、Outlook、腾讯企业邮箱、网易企业邮箱、**阿里云企业邮箱**、阿里云邮箱、新浪邮箱、搜狐邮箱等。

## 📦 快速安装

```bash
# npm 安装
npm install -g mcp-email

# 使用 npx 运行（推荐）
npx mcp-email
```

## ✨ 功能特性

- 📤 **邮件发送**: 支持发送HTML和纯文本邮件
- 👥 **多收件人**: 支持多个收件人、抄送、密送
- 📎 **附件支持**: 支持文件附件和Base64编码内容
- 🔧 **动态配置**: 支持运行时配置邮箱服务器
- 🔍 **连接测试**: 内置SMTP服务器连接测试
- 🛡️ **安全认证**: 支持微信企业邮箱授权码认证
- ⚡ **高性能**: 优化的连接超时和重试机制

## 📚 详细配置指南

项目提供了详细的配置指南，包含各大邮箱服务商的配置说明：

📖 **[CONFIG_GUIDE.md](./CONFIG_GUIDE.md)** - 完整配置指南，包含：
- 📧 163邮箱详细配置教程
- 🏢 腾讯 / 阿里云等企业邮箱配置指南
- 🌐 QQ邮箱、Gmail等主流邮箱配置
- 🛠️ 故障排除和常见问题解决

## 📋 系统要求

- Node.js 16.x 或更高版本
- 邮箱账号
- MCP 客户端 (如 Claude Desktop)

## 🚀 快速开始

### 方式一：直接使用npm包（推荐）

#### 1. 安装npm包

```bash
# 全局安装
npm install -g mcp-email

# 或本地安装
npm install mcp-email
```

#### 2. 在MCP客户端中配置

**MCP-X 配置示例：**
```json
{
  "mcpServers": {
    "universal-email": {
      "command": "npx",
      "args": ["mcp-email"],
      "env": {
        "EMAIL_USER": "your-email@domain.com",
        "EMAIL_PASSWORD": "your-password-or-auth-code",
        "EMAIL_TYPE": "auto"
      }
    }
  }
}
```

### 方式二：从源码安装

#### 1. 克隆项目

```bash
git clone https://github.com/TimeCyber/email-mcp.git
cd email-mcp
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 配置 MCP 客户端（源码安装）

**MCP-X 配置：**
```json
{
  "mcpServers": {
    "universal-email": {
      "command": "node",
      "args": ["F:\\path\\to\\email-mcp\\index.js"],
      "env": {
        "EMAIL_USER": "your-email@domain.com",
        "EMAIL_PASSWORD": "your-password-or-auth-code",
        "EMAIL_TYPE": "auto"
      }
    }
  }
}
```

**企业邮箱配置（腾讯企业邮箱）：**
```json
{
  "mcpServers": {
    "enterprise-email": {
      "command": "node",
      "args": ["F:\\path\\to\\email-mcp\\index.js"],
      "env": {
        "EMAIL_USER": "user@company.com",
        "EMAIL_PASSWORD": "your-enterprise-auth-code",
        "EMAIL_TYPE": "exmail"
      }
    }
  }
}
```

**阿里云企业邮箱配置：**
```json
{
  "mcpServers": {
    "aliyun-enterprise-email": {
      "command": "node",
      "args": ["F:\\path\\to\\email-mcp\\index.js"],
      "env": {
        "EMAIL_USER": "user@company.com",
        "EMAIL_PASSWORD": "your-enterprise-auth-code",
        "EMAIL_TYPE": "aliyun-enterprise"
      }
    }
  }
}
```
> 服务器：SMTP `smtp.qiye.aliyun.com:465`、IMAP `imap.qiye.aliyun.com:993`、POP3 `pop.qiye.aliyun.com:995`（均启用 SSL）

#### 4. 测试配置

```bash
# 测试邮件配置是否成功
node test-auto-config.js
```

## 📧 邮箱配置指南

### 获取授权码
不同邮箱的授权码获取方式：

**腾讯企业邮箱：**
1. 访问 [企业邮箱管理后台](https://exmail.qq.com/)
2. 进入 **"设置"** → **"账户"** → **"客户端专用密码"**
3. 生成 **客户端专用密码** (授权码)
4. 进入 **"设置"** → **"收发信设置"** → **"设置方法"**
5. 开启 **"POP/IMAP/SMTP服务"**

**阿里云企业邮箱：**
1. 登录 [阿里云企业邮箱](https://qiye.aliyun.com/) 管理后台
2. 开启 **POP/IMAP/SMTP** 服务
3. 获取客户端授权码（或按管理员要求使用登录密码）
4. MCP 配置中设置 `EMAIL_TYPE: "aliyun-enterprise"`

**QQ邮箱：**
1. 登录QQ邮箱，进入**"设置"** → **"账户"**
2. 开启**"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"**
3. 生成授权码

**163邮箱：**
1. 登录163邮箱，进入**"设置"** → **"POP3/SMTP/IMAP"**
2. 开启**"POP3/SMTP/IMAP服务"**
3. 设置客户端授权密码

💡 **关键提示**: 
- 企业邮箱必须设置 `EMAIL_TYPE` 字段（如腾讯 `"exmail"`、阿里云 `"aliyun-enterprise"`）！
- 个人邮箱可以使用 `EMAIL_TYPE: "auto"` 自动识别

📖 **[CONFIG_GUIDE.md](./CONFIG_GUIDE.md)** - 完整配置指南，包含所有邮箱类型详细说明

## 🔧 MCP 工具说明

### 1. `send_email` - 发送邮件

发送邮件，支持多种格式和收件人。

#### 参数
- **`to`** (必需): 收件人邮箱地址数组
- **`subject`** (必需): 邮件主题
- **`text`** (必需): 纯文本邮件内容
- **`cc`** (可选): 抄送邮箱地址数组
- **`bcc`** (可选): 密送邮箱地址数组
- **`html`** (可选): HTML格式邮件内容
- **`attachments`** (可选): 附件数组

#### 使用示例

**基本邮件发送：**
```json
{
  "to": ["recipient@example.com"],
  "subject": "测试邮件",
  "text": "这是一封测试邮件"
}
```

**带抄送和HTML内容：**
```json
{
  "to": ["recipient1@example.com", "recipient2@example.com"],
  "cc": ["manager@example.com"],
  "subject": "项目报告",
  "text": "请查看项目报告",
  "html": "<h1>项目报告</h1><p>项目进展顺利。</p>"
}
```

**带附件的邮件：**
```json
{
  "to": ["recipient@example.com"],
  "subject": "带附件的邮件",
  "text": "请查看附件",
  "attachments": [
    {
      "filename": "report.pdf",
      "path": "C:\\path\\to\\report.pdf"
    },
    {
      "filename": "data.txt",
      "content": "SGVsbG8gV29ybGQ="
    }
  ]
}
```

### 2. `get_recent_emails` - 获取最近邮件

获取最近几天的邮件列表，自动选择最佳协议（IMAP/POP3）。

#### 参数
- **`limit`** (可选): 返回邮件数量限制，默认20
- **`days`** (可选): 获取最近几天的邮件，默认3天

#### 使用示例
```json
{
  "limit": 10,
  "days": 7
}
```

### 3. `get_email_content` - 获取邮件内容

获取指定邮件的详细内容。

#### 参数
- **`uid`** (必需): 邮件唯一标识符（从邮件列表中获取）

#### 使用示例
```json
{
  "uid": "12345"
}
```

### 4. `setup_email_account` - 设置邮箱账号

自动识别邮箱类型并配置服务器，支持 QQ / 163 / Gmail / Outlook / 腾讯企业邮 / 阿里云企业邮等多种服务商。

#### 参数
- **`email`** (必需): 邮箱地址
- **`password`** (必需): 邮箱密码或授权码
- **`provider`** (可选): 邮箱提供商（手动指定，用于企业邮箱）

#### 支持的邮箱类型
- `qq` - QQ邮箱
- `163` - 网易邮箱
- `gmail` - Gmail
- `outlook` - Outlook/Hotmail
- `exmail` - 腾讯企业邮箱
- `netease-enterprise` - 网易企业邮箱
- `aliyun` - 阿里云邮箱
- `aliyun-enterprise` - 阿里云企业邮箱
- `sina` - 新浪邮箱
- `sohu` - 搜狐邮箱

#### 使用示例

**个人邮箱（自动识别）：**
```json
{
  "email": "user@qq.com",
  "password": "your-auth-code"
}
```

**企业邮箱（手动指定）：**
```json
{
  "email": "user@company.com",
  "password": "your-enterprise-auth-code",
  "provider": "exmail"
}
```

**阿里云企业邮箱：**
```json
{
  "email": "user@company.com",
  "password": "your-enterprise-auth-code",
  "provider": "aliyun-enterprise"
}
```

### 5. `list_supported_providers` - 列出支持的邮箱

查看所有支持的邮箱服务商及其配置信息。

#### 参数
无需参数

#### 使用示例
```json
{}
```

### 6. `configure_email_server` - 手动配置服务器

手动配置邮箱服务器设置（高级用户使用）。

#### 参数
- **`user`** (必需): 邮箱账号
- **`password`** (必需): 邮箱密码或授权码
- **`smtpHost`** (可选): SMTP服务器地址
- **`smtpPort`** (可选): SMTP端口
- **`smtpSecure`** (可选): 是否使用SSL
- **`imapHost`** (可选): IMAP服务器地址
- **`imapPort`** (可选): IMAP端口
- **`imapSecure`** (可选): 是否使用SSL

#### 使用示例
```json
{
  "user": "your-email@domain.com",
  "password": "your-password",
  "smtpHost": "smtp.domain.com",
  "smtpPort": 465,
  "smtpSecure": true
}
```

### 7. `test_email_connection` - 测试连接

测试邮箱服务器连接状态。

#### 参数
- **`testType`** (可选): 测试类型
  - `smtp` - 仅测试发送服务器
  - `imap` - 仅测试接收服务器
  - `both` - 测试全部（默认）

#### 使用示例
```json
{
  "testType": "smtp"
}
```

## 📊 支持的邮箱服务商

### 主流邮箱服务器配置

| 邮箱类型 | SMTP服务器 | SMTP端口 | IMAP服务器 | IMAP端口 | 推荐协议 |
|---------|------------|----------|------------|----------|----------|
| QQ邮箱 | smtp.qq.com | 587 | imap.qq.com | 993 | IMAP |
| 网易邮箱 | smtp.163.com | 465 | imap.163.com | 993 | POP3* |
| Gmail* | smtp.gmail.com | 587 | imap.gmail.com | 993 | IMAP |
| Outlook | smtp-mail.outlook.com | 587 | outlook.office365.com | 993 | IMAP |
| 腾讯企业邮箱 | smtp.exmail.qq.com | 465 | imap.exmail.qq.com | 993 | IMAP |
| 阿里云邮箱 | smtp.mxhichina.com | 465 | imap.mxhichina.com | 993 | IMAP |
| 阿里云企业邮箱 | smtp.qiye.aliyun.com | 465 | imap.qiye.aliyun.com | 993 | IMAP |

<!--- | 网易企业邮箱 | smtphz.qiye.163.com | 994 | imaphz.qiye.163.com | 993 | POP3* | --->


***网易邮箱（163/126/yeah）自动使用POP3协议以避免"Unsafe Login"错误**

***Gmail特殊说明**: 从2025年5月1日起，Google Workspace账号不再支持"less secure apps"，必须使用OAuth认证。个人Gmail需要使用应用专用密码。详见[配置指南](CONFIG_GUIDE.md#gmail-详细配置教程)。**

### 🔧 自动配置特性

- ✅ **智能识别**: 根据邮箱域名自动选择服务器配置
- ✅ **协议优化**: 163邮箱自动使用POP3，其他使用IMAP
- ✅ **企业邮箱**: 支持通过 `EMAIL_TYPE` 字段手动指定
- ✅ **错误处理**: IMAP失败时自动尝试POP3协议

## 🔍 故障排除

### 常见错误和解决方案

#### 1. `535 Error: authentication failed`
**原因**: 认证失败
**解决方案**:
- 确认已在邮箱设置中开启SMTP/IMAP/POP3服务
- 重新生成授权码或应用专用密码
- 检查邮箱地址和授权码是否正确
- 对于企业邮箱，确认管理员已允许第三方访问

#### 2. `[IMAP] EXAMINE Unsafe Login` (网易邮箱常见)
**原因**: 网易邮箱安全限制
**解决方案**:
- 系统会自动切换到POP3协议
- 确认已在网易邮箱中开启POP3/SMTP服务
- 使用最新生成的16位授权码

#### 3. `ECONNREFUSED` 或连接超时
**原因**: 网络连接问题
**解决方案**:
- 检查网络连接状态
- 确认防火墙没有阻挡邮件端口 (25, 465, 587, 993, 995)
- 尝试不同的网络环境或VPN

#### 4. `EMAIL_TYPE` 相关错误
**原因**: 企业邮箱域名和服务器不匹配
**解决方案**:
- 为企业邮箱设置正确的 `EMAIL_TYPE` 字段
- 腾讯企业邮箱设置为 `"exmail"`
- 阿里云企业邮箱设置为 `"aliyun-enterprise"`
- 网易企业邮箱设置为 `"netease-enterprise"`

### 📋 诊断工具

使用内置诊断命令：

```bash
# 测试邮箱配置
node test-auto-config.js

# 测试EMAIL_TYPE功能
node test-email-type.js

# 使用MCP工具测试连接
# 在MCP客户端中调用 test_email_connection
```

### 🔧 调试技巧

1. **查看详细日志**: 系统会自动输出配置和连接信息
2. **使用测试工具**: 通过 `test_email_connection` 诊断问题
3. **检查邮箱类型**: 使用 `list_supported_providers` 确认支持
4. **逐步配置**: 先使用 `setup_email_account` 自动配置

## 📁 项目结构

```
├── index.js                     # MCP Server主程序
├── package.json                # 项目依赖配置
├── README.md                   # 项目主文档
├── CONFIG_GUIDE.md            # 详细配置指南
├── .gitignore                 # Git忽略文件
├── 📁 配置模板/
│   ├── mcp-x_config_v2.json      # 通用配置模板
│   └── mcp-x_config_multi.json   # 多账户配置
├── 📁 测试工具/
│   ├── test-auto-config.js       # 自动配置测试
│   └── test-email-type.js        # EMAIL_TYPE功能测试
└── LICENSE                     # 开源许可证
```

### 🔑 核心文件说明

- **`index.js`** - 主要的MCP服务器程序，包含所有邮件功能
- **`CONFIG_GUIDE.md`** - 详细的配置指南，包含各种邮箱配置说明
- **`mcp-x_config_v2.json`** - 通用配置模板，支持EMAIL_TYPE字段
- **`test-auto-config.js`** - 测试自动配置功能的脚本
- **`test-email-type.js`** - 验证EMAIL_TYPE字段功能的测试脚本

## 🔐 安全注意事项

1. **保护授权码**: 不要将授权码提交到版本控制系统
2. **使用环境变量**: 推荐使用环境变量存储敏感信息
3. **定期更新**: 定期更新授权码和检查安全设置
4. **权限控制**: 确保只有授权用户可以访问MCP服务器

## 📞 技术支持

### 📖 文档资源
- 📋 **[CONFIG_GUIDE.md](./CONFIG_GUIDE.md)** - 完整配置指南
- 🔧 **测试工具** - 使用 `test-auto-config.js` 和 `test-email-type.js`
- 🛠️ **内置诊断** - 使用 `test_email_connection` 工具

### 🌐 官方文档
- [网易邮箱客户端设置](https://help.mail.163.com/faqDetail.do?code=d7a5dc8471cd0c0e8b4b8f4f8e49998b374173cfe9171305fa1ce630d7f67ac2a5feb28b66796d3b)
- [腾讯企业邮箱配置](https://open.work.weixin.qq.com/help2/pc/19886?person_id=1)
- [QQ邮箱帮助中心](https://kf.qq.com/product/tx_mail.html)
- [Gmail设置指南](https://support.google.com/mail/answer/7126229)

### 🤝 贡献指南
欢迎提交 Issue 和 Pull Request 来改进这个项目！

- 🐛 **报告Bug**: 请详细描述问题和复现步骤
- 💡 **功能建议**: 欢迎提出新的邮箱支持需求
- 📝 **文档改进**: 帮助完善使用文档

### 📊 项目状态
- ✅ **生产就绪**: 支持 QQ、163、Gmail、Outlook、腾讯企业邮、阿里云企业邮等主流邮箱服务商
- 🔄 **持续更新**: 根据用户反馈不断改进
- 🛡️ **安全保障**: 支持SSL/TLS加密和授权码认证

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

## 🎉 快速测试

配置完成后，可以在MCP客户端中测试功能：

**发送测试邮件：**
```
请发送一封测试邮件到 test@example.com，主题为"MCP测试邮件"，内容为"Hello from Universal Email MCP!"
```

**获取邮件列表：**
```
请获取最近3天的邮件列表，限制10封邮件
```

**测试连接：**
```
请测试邮箱连接状态
```

如果一切配置正确，所有功能都应该正常工作！🚀 