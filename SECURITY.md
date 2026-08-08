# Security Policy

## 安全声明（中文）

本项目是代理 IP 服务商资源导航与选型平台（静态站点 + 结构化数据）。

**本项目不包含、也不应包含：**

- 任何真实账号、密码或代理凭据
- 真实的公网 IP:port:user:pass 形式代理节点
- 客户的隐私数据或未经授权的第三方资料

正文中的参数示例一律为虚构数据（如 `proxy.example.com:10000:demo_user:demo_password`）。

## 报告漏洞

如果发现本仓库存在安全相关问题（例如误提交的真实凭证、代理凭据泄漏、
外部链接指向恶意站点、供应链依赖风险等），请通过以下方式报告：

- GitHub Issue（建议使用 bug 报告模板）：
  <https://github.com/xxjrq/ipinfo/issues>
- 邮件：请在 Issue 中留言获取安全联系人邮箱

请勿在公开 Issue 中直接粘贴真实凭据或敏感数据，请先脱敏。

## 处理流程

1. 收到报告后 7 个工作日内确认并评估
2. 若确认问题，修复并发布到 main 分支
3. 真实凭据类问题：立即清除并轮换涉及信息

## 安全最佳实践（给贡献者）

- 提交前运行 `npm run validate`，CI 会自动扫描真实凭证（IP:port:user:pass）
- 示例参数必须虚构：`proxy.example.com:10000:demo_user:demo_password`
- 不提交服务商后台截图、客户信息、内部文档
- 图片与 Logo 只使用官方公开素材，且遵守各自授权
