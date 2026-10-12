# 📧 通用邮件MCP客户端配置指南

## 🚀 新版本特性

✅ **自动识别邮箱类型** - 无需手动配置SMTP/IMAP服务器  
✅ **智能协议选择** - 根据邮箱类型自动选择最佳协议  
✅ **简化配置** - 只需邮箱地址和密码/授权码  
✅ **支持多账户** - 可同时配置多个不同类型的邮箱  

## 📁 配置文件说明

### 1. `mcp-x_config_v2.json` - 通用模板
```json
{
  "mcpServers": {
    "universal-email": {
      "command": "node",
      "args": ["F:\\enterprise\\mail\\index.js"],
      "env": {
        "EMAIL_USER": "your-email@domain.com",
        "EMAIL_PASSWORD": "your-password-or-auth-code",
        "EMAIL_TYPE": "auto"
      }
    }
  }
}
```

#### EMAIL_TYPE 字段说明

**个人邮箱类型**:
- **`auto`** - 自动检测（默认值，根据邮箱域名自动识别）
- **`qq`** - QQ邮箱（@qq.com）
- **`163`** - 网易邮箱（@163.com, @126.com, @yeah.net）
- **`gmail`** - Gmail（@gmail.com）
- **`outlook`** - Outlook/Hotmail（@outlook.com, @hotmail.com, @live.com）
- **`aliyun`** - 阿里云邮箱（@aliyun.com）
- **`sina`** - 新浪邮箱（@sina.com）
- **`sohu`** - 搜狐邮箱（@sohu.com）

**企业邮箱类型**:
- **`exmail`** - 腾讯企业邮箱（使用企业域名，但服务器为smtp.exmail.qq.com）
- **`netease-enterprise`** - 网易企业邮箱（使用企业域名，但服务器为smtp.ym.163.com）

💡 **企业邮箱重要提示**: 
- 如果您的邮箱地址是 `user@company.com` 但使用腾讯企业邮箱服务 → 设置 `EMAIL_TYPE: "exmail"`
- 如果您的邮箱地址是 `user@enterprise.com` 但使用网易企业邮箱服务 → 设置 `EMAIL_TYPE: "netease-enterprise"`

### 2. `mcp-x_config_enterprise.json` - 企业邮箱专用配置
```json
{
  "mcpServers": {
    "enterprise-email-tencent": {
      "command": "node",
      "args": ["F:\\enterprise\\mail\\index.js"],
      "env": {
        "EMAIL_USER": "user@company.com",
        "EMAIL_PASSWORD": "your-enterprise-auth-code",
        "EMAIL_TYPE": "exmail"
      }
    },
    "enterprise-email-netease": {
      "command": "node",
      "args": ["F:\\enterprise\\mail\\index.js"],
      "env": {
        "EMAIL_USER": "user@enterprise.com",
        "EMAIL_PASSWORD": "your-enterprise-auth-code",
        "EMAIL_TYPE": "163"
      }
    }
  }
}
```

### 3. `mcp-x_config_multi.json` - 多账户配置
```json
{
  "mcpServers": {
    "email-163": {
      "command": "node",
      "args": ["F:\\enterprise\\mail\\index.js"],
      "env": {
        "EMAIL_USER": "user1@163.com",
        "EMAIL_PASSWORD": "auth-code-163"
      }
    },
    "email-qq": {
      "command": "node", 
      "args": ["F:\\enterprise\\mail\\index.js"],
      "env": {
        "EMAIL_USER": "user2@qq.com",
        "EMAIL_PASSWORD": "auth-code-qq"
      }
    },
    "email-gmail": {
      "command": "node",
      "args": ["F:\\enterprise\\mail\\index.js"], 
      "env": {
        "EMAIL_USER": "user3@gmail.com",
        "EMAIL_PASSWORD": "app-password-gmail"
      }
    }
  }
}
```

## 🔧 配置步骤

### 1. 选择配置文件
根据您的邮箱类型选择对应的配置文件：
- **个人邮箱**: 使用 `mcp-x_config_v2.json`（通用模板）
- **企业邮箱**: 使用 `mcp-x_config_enterprise.json`（企业专用）
- **多账户**: 使用 `mcp-x_config_multi.json`（多账户配置）

### 2. 修改配置
- 将 `EMAIL_USER` 替换为您的完整邮箱地址
- 将 `EMAIL_PASSWORD` 替换为您的邮箱密码或授权码
- **企业邮箱用户**: 请正确设置 `EMAIL_TYPE` 字段

### 🏢 企业邮箱配置重点

企业邮箱的域名和实际邮件服务器通常不同，需要通过 `EMAIL_TYPE` 字段手动指定：

#### 腾讯企业邮箱示例
```json
{
  "EMAIL_USER": "user@yourcompany.com",
  "EMAIL_PASSWORD": "your-enterprise-auth-code", 
  "EMAIL_TYPE": "exmail"
}
```
- 邮箱地址: `user@yourcompany.com`（企业域名）
- 实际服务器: `smtp.exmail.qq.com`（腾讯企业邮箱）
- 必须设置: `EMAIL_TYPE: "exmail"`

#### 网易企业邮箱示例
```json
{
  "EMAIL_USER": "user@enterprise.com",
  "EMAIL_PASSWORD": "your-enterprise-auth-code",
  "EMAIL_TYPE": "netease-enterprise"
}
```
<!--- 暂时注释掉网易企业邮箱配置
- 邮箱地址: `user@enterprise.com`（企业域名）
- 实际服务器: `smtphz.qiye.163.com`（网易企业邮箱）
- 必须设置: `EMAIL_TYPE: "netease-enterprise"`
--->

### 3. 复制到MCP-X或其他MCP客户端
将配置内容复制到您的MCP-X或其他MCP客户端配置文件中。

### 4. 重启MCP-X或其他MCP客户端
保存配置后重启MCP-X或其他MCP客户端应用。

## 🔑 获取授权码指南

### Gmail 详细配置教程

根据[Google官方文档](https://support.google.com/a/answer/105694)，Gmail配置需要特别注意OAuth认证要求：

#### ⚠️ 重要提醒
- **2025年5月1日后**: Google Workspace账号不再支持"less secure apps"
- **必须使用OAuth**: 第三方邮件客户端必须支持OAuth认证
- **不支持密码**: Microsoft Outlook和iOS/macOS邮件应用需要OAuth

#### 1. 个人Gmail账号配置
1. 登录Gmail，点击右上角设置图标 → "查看所有设置"
2. 选择"转发和POP/IMAP"标签页
3. 启用"IMAP访问"（推荐）或"POP下载"
4. 前往[Google账户安全设置](https://myaccount.google.com/security)
5. 启用"两步验证"（必需）
6. 生成"应用专用密码"
7. 使用应用专用密码进行邮件客户端认证

#### 2. Google Workspace企业账号
**管理员配置**:
1. 登录Google Admin Console
2. 转到"应用" → "Google Workspace" → "Gmail" → "最终用户访问"
3. 启用"POP和IMAP访问"
4. 可选择"允许所有邮件客户端"或"限制OAuth客户端"

**支持的OAuth客户端ID**:
- Apple iOS Mail: `450232826690-0rm6bs9d2fps9tifvk2oodh3tasd7vl7.apps.googleusercontent.com`
- Apple Mac Mail: `946018238758-bi6ni53dfoddlgn97pk3b8i7nphige40.apps.googleusercontent.com`

#### 3. Gmail服务器设置
| 协议 | 服务器地址 | 端口 | 加密方式 |
|------|------------|------|----------|
| SMTP | smtp.gmail.com | 587 | TLS |
| IMAP | imap.gmail.com | 993 | SSL |
| POP3 | pop.gmail.com | 995 | SSL |

#### 使用示例
```json
{
  "EMAIL_USER": "username@gmail.com",
  "EMAIL_PASSWORD": "your-app-specific-password",
  "EMAIL_TYPE": "gmail"
}
```

💡 **注意**: Gmail推荐使用IMAP协议，提供更好的同步体验。

### 网易邮箱 (163/126/yeah) 详细配置教程

根据[网易邮箱官方指南](https://help.mail.163.com/faqDetail.do?code=d7a5dc8471cd0c0e8b4b8f4f8e49998b374173cfe9171305fa1ce630d7f67ac2a5feb28b66796d3b)，请按以下步骤操作：

#### 1. 登录网页版邮箱
访问 [https://email.163.com/](https://email.163.com/)，进入邮箱首页。

#### 2. 开启客户端协议
点击上方**设置**，选择**POP/SMTP/IMAP**选项。

#### 3. 选择协议类型
在客户端协议界面，选择开启对应的协议：
- **IMAP协议**: 推荐使用，可以和网页版完全同步
- **POP3协议**: 适用于单一设备收信
- **SMTP协议**: 用于发送邮件

💡 **推荐**: 同时开启IMAP和SMTP协议，获得最佳体验。

#### 4. 验证身份
在新弹出的弹窗中，点击**继续开启**，扫码发送短信或点击**手动发送短信**。

#### 5. 获取授权码
发送短信后，系统会生成**16位字母组合**的唯一授权码。
- ⚠️ **重要**: 授权码在网页上只显示一次，请立即保存
- 💡 **建议**: 一个授权码可以同时设置多个客户端

#### 6. 服务器设置
网易邮箱服务器配置信息：

| 协议 | 服务器地址 | 端口 | 加密方式 |
|------|------------|------|----------|
| SMTP | smtp.163.com | 465 | SSL/TLS |
| SMTP | smtp.163.com | 25 | STARTTLS |
| IMAP | imap.163.com | 993 | SSL/TLS |
| POP3 | pop.163.com | 995 | SSL/TLS |

#### 使用示例
```json
{
  "EMAIL_USER": "username@163.com",
  "EMAIL_PASSWORD": "your-16-digit-auth-code"
}
```

### QQ邮箱配置
1. 登录QQ邮箱网页版
2. 设置 → 账户 → POP3/IMAP/SMTP
3. 开启服务并获取授权码

### 微信企业邮箱配置指南

基于[企业微信官方文档](https://open.work.weixin.qq.com/help2/pc/19886?person_id=1)的配置说明：

#### 1. 登录企业邮箱管理后台
访问 [https://exmail.qq.com/](https://exmail.qq.com/)

#### 2. 开启客户端服务
进入**邮箱管理** → **安全** → **客户端专用密码**

#### 3. 生成客户端专用密码
生成**客户端专用密码**（即授权码），用于第三方客户端登录

#### 4. 开启POP/IMAP/SMTP服务
进入 **"设置"** → **"收发信设置"** → **"设置方法"**
开启相应的邮件协议服务

#### 5. 服务器配置
微信企业邮箱服务器设置：

| 协议 | 服务器地址 | 端口 | 加密方式 | 推荐 |
|------|------------|------|----------|------|
| SMTP | smtp.exmail.qq.com | 465 | SSL/TLS | ⭐ |
| SMTP | smtp.exmail.qq.com | 587 | STARTTLS | ✅ |
| IMAP | imap.exmail.qq.com | 993 | SSL/TLS | ⭐ |
| POP3 | pop.exmail.qq.com | 995 | SSL/TLS | ✅ |

#### 使用示例
```json
{
  "EMAIL_USER": "username@yourcompany.com",
  "EMAIL_PASSWORD": "your-enterprise-auth-code"
}
```

### 网易邮箱 (163/126/yeah) 补充说明
根据官方指南补充配置说明：
1. 登录邮箱网页版
2. 设置 → POP/SMTP/IMAP
3. 开启IMAP/SMTP服务
4. 发送验证短信获取授权码

### Gmail
1. 开启两步验证
2. 生成应用专用密码
3. 使用应用密码而非账户密码

### Outlook/Hotmail
1. 登录Outlook网页版
2. 安全设置 → 高级安全选项
3. 生成应用密码

## 🛠️ 支持的邮箱类型

| 邮箱类型 | 域名 | 推荐协议 | 状态 |
|---------|------|----------|------|
| QQ邮箱 | qq.com | IMAP | ✅ |
| 网易邮箱 | 163.com, 126.com, yeah.net | POP3 | ✅ |
| Gmail | gmail.com, googlemail.com | IMAP | ✅ |
| Outlook | outlook.com, hotmail.com, live.com | IMAP | ✅ |
| 企业邮箱 | exmail.qq.com | IMAP | ✅ |
| 阿里云邮箱 | aliyun.com | IMAP | ✅ |
| 新浪邮箱 | sina.com, sina.cn | IMAP | ✅ |
| 搜狐邮箱 | sohu.com | IMAP | ✅ |

## 🎯 MCP工具功能

### 基础功能
- `send_email` - 发送邮件
- `get_recent_emails` - 获取最近邮件列表
- `get_email_content` - 查看邮件详情

### 配置与诊断
- `list_supported_providers` - 列出支持的邮箱类型
- `test_email_connection` - 测试连接

账号、授权码与服务器地址由本机启动环境或 `.env` 提供；修改后重启服务。自动配置使用 `EMAIL_USER`、`EMAIL_PASSWORD` 和可选的 `EMAIL_TYPE`，自定义服务器使用 `EMAIL_SMTP_HOST`、`EMAIL_IMAP_HOST` 等环境变量。`setup_email_account` 和 `configure_email_server` 已从 MCP 工具接口移除。

SMTP 强制加密并验证证书；IMAP/POP3 使用隐式 TLS，请配置 TLS 端口。文件附件需设置 `EMAIL_ATTACHMENTS_DIR`，文件的实际路径须位于该批准目录内；Base64 附件可直接使用。整封邮件的附件总大小上限为 25 MiB。邮件库的直接文件读取和 URL 获取已关闭。完整迁移说明见 [README 安全边界与迁移](README.md#-安全边界与迁移)。

## ⚠️ 注意事项

### 网易邮箱特别说明
1. **授权码安全**: 16位授权码在网页上只显示一次，请立即保存到安全位置
2. **协议选择**: 推荐同时开启IMAP和SMTP协议，确保收发功能完整
3. **短信验证**: 如果5分钟后系统仍提示未收到短信，请联系移动运营商核实
4. **一码多用**: 一个授权码可以同时在多个客户端使用

### 微信企业邮箱特别说明
1. **管理权限**: 需要企业邮箱管理员权限才能生成客户端专用密码
2. **域名配置**: 确保企业域名已正确配置并激活
3. **安全策略**: 企业可能有特殊的安全策略，请咨询管理员

### 通用注意事项
1. **安全性**: 请确保配置文件安全，不要泄露授权码
2. **权限**: 确保已在邮箱中开启POP3/IMAP/SMTP服务
3. **网络**: 某些网络环境可能需要特殊配置
4. **更新**: 定期检查并更新授权码

## 🆘 故障排除

### 网易邮箱常见问题

#### 问题1: "Unsafe Login" 错误
```
Error: [IMAP] EXAMINE Unsafe Login. Please contact our customer service.
```
**解决方案**:
1. 确认已正确开启IMAP服务
2. 使用最新生成的16位授权码
3. 尝试使用POP3协议代替IMAP
4. 检查是否有异地登录限制

#### 问题2: SMTP发送失败
```
Error: 535 Error: authentication failed
```
**解决方案**:
1. 确认已开启SMTP服务
2. 检查授权码是否正确（16位字母组合）
3. 确认使用的是smtp.163.com:465端口
4. 验证邮箱地址格式正确

#### 问题3: 授权码获取失败
**解决方案**:
1. 确保手机能正常接收短信
2. 检查是否已开启客户端协议
3. 尝试手动发送短信方式
4. 联系网易客服支持

### 微信企业邮箱常见问题

#### 问题1: 无法生成客户端专用密码
**解决方案**:
1. 确认具有企业邮箱管理员权限
2. 检查企业域名是否已激活
3. 联系企业微信管理员
4. 确认邮箱账号状态正常

#### 问题2: SMTP连接超时
**解决方案**:
1. 使用推荐的465端口+SSL
2. 检查网络防火墙设置
3. 尝试587端口+STARTTLS
4. 确认企业网络策略

### 通用故障排除

如果遇到问题，请按以下顺序检查：
1. **基础检查**: 邮箱地址和授权码是否正确
2. **服务状态**: 确认已开启对应的邮箱服务
3. **网络连接**: 使用 `test_email_connection` 工具诊断
4. **配置验证**: 使用 `list_supported_providers` 查看支持的邮箱类型
5. **详细诊断**: 查看控制台错误信息进行具体分析

### 调试命令
```bash
# 测试自动配置功能
node test-auto-config.js

# 测试163邮箱POP3连接
node test-163-pop3.js

# 查看详细错误信息
DEBUG=* node index.js
```

## ✅ 配置检查清单

### 网易邮箱 (163/126/yeah) 配置检查
- [ ] 已登录网页版邮箱 [https://email.163.com/](https://email.163.com/)
- [ ] 已开启POP/SMTP/IMAP协议
- [ ] 已获取16位授权码并妥善保存
- [ ] 配置文件中使用正确的邮箱地址
- [ ] 配置文件中使用16位授权码（不是登录密码）
- [ ] 已重启Claude Desktop应用

### 微信企业邮箱配置检查
- [ ] 具有企业邮箱管理员权限
- [ ] 已登录企业邮箱管理后台 [https://exmail.qq.com/](https://exmail.qq.com/)
- [ ] 已开启客户端专用密码功能
- [ ] 已生成客户端专用密码
- [ ] 配置文件中使用企业邮箱地址
- [ ] 配置文件中使用专用密码（不是登录密码）
- [ ] 已重启Claude Desktop应用

### 通用配置检查
- [ ] 路径配置正确（指向项目的index.js文件）
- [ ] 环境变量名称正确（EMAIL_USER、EMAIL_PASSWORD）
- [ ] JSON格式正确（无语法错误）
- [ ] 配置文件保存在正确位置
- [ ] 已重启Claude Desktop应用

## 📞 技术支持

- 查看详细故障排除指南（本文档🆘部分）
- 运行 `test-auto-config.js` 进行功能测试
- 使用 `list_supported_providers` 查看支持的邮箱类型
- 参考官方文档：
  - [网易邮箱客户端协议设置](https://help.mail.163.com/faqDetail.do?code=d7a5dc8471cd0c0e8b4b8f4f8e49998b374173cfe9171305fa1ce630d7f67ac2a5feb28b66796d3b)
  - [企业微信邮箱配置](https://open.work.weixin.qq.com/help2/pc/19886?person_id=1) 