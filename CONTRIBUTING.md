# 贡献指南（CONTRIBUTING.md）

感谢你愿意参与维护这个开源的代理 IP 资源库。本仓库以「中立、可追溯、诚实」为原则：每条服务商资料都必须有来源、有核验时间，不写未经确认的营销话术。

阅读 [README.md](README.md) 了解项目定位与目录结构后再开始。

## 一、如何新增服务商

### 方式 A：提 Issue（推荐新手）

在仓库 Issues 页选择 **「新增服务商」** 模板（[add-provider.yml](.github/ISSUE_TEMPLATE/add-provider.yml)）填写：

- `name`（服务商官方名称）
- `slug`（全小写连字符英文标识，用于 URL）
- `officialUrl`（官方网址）
- `proxyTypes`（支持的代理类型，可多选）
- `protocols`（协议，可多选）
- `authentication`（认证方式，可多选）
- `pricingModel`（计费模式，可多选）
- `regions`（覆盖区域）
- `sourceUrls`（信息来源，至少 1 条官方页面链接）
- 备注（可填：试用信息、注意事项、接入教程链接等）

维护者核验后录入数据并生成占位文章。

### 方式 B：直接提交 PR

1. 在 `src/data/providers.json` 新增一条记录，**最小字段**：

```yaml
name: 服务商名称
slug: 服务商英文标识
status: draft
officialUrl: https://...
proxyTypes: [residential]
protocols: [http, socks5]
authentication: [username-password]
pricingModels: [traffic]
regions: [美国, 欧洲]
sourceUrls:
  - https://.../pricing
updatedAt: 2026-08-08
```

2. 运行 `npm run gen:providers` 生成草稿文章，或手动创建 `src/content/docs/providers/_<slug>.md`（草稿以 `_` 前缀，排除出生产构建）
3. 补充正文：服务商介绍、支持类型、计费说明、使用流程、注意事项
4. 每篇文章必须填写 `sources`（来源）与 `updatedAt`（核验/更新时间）；人工核验无误后将 `status` 改为 `published`
5. 运行 `npm run validate`，提交前运行 `npm run ci`

> 字段取值请参考 `src/data/providers.json` 中已有条目，保持枚举风格一致（如 `residential` / `static-residential` / `datacenter` / `mobile` / `isp`）。

## 二、如何修改服务商资料

- 修改 `src/data/providers.json` 中对应条目，以及 `providers/_<slug>.md` 正文
- 每次修改必须**更新 `updatedAt`**（数据与文章同步），并补充或更新 `sourceUrls` / `sources` 指向的信息来源
- 价格、覆盖区域、功能等易变信息，正文中注明「以官方页面为准」
- 如果无法确认最新信息，请把状态改为 `outdated` 而不是删除内容，等待他人补充核验

## 三、文章格式规范

1. **frontmatter 必填**：`title`、`description`（50~170 字）、`pageType`（见 `src/content.config.ts` schema）
2. **供应商文章必填**：`provider`、`slug`、`status`、`officialUrl`、`proxyTypes`、`authentication`、`sources`、`updatedAt`、`disclosure`（旧字段 `providerUrl` / `supportedProxyTypes` / `officialDocs` / `lastVerified` 已废弃，CI 发现即失败）
3. **GEO/AI 可引用**：`summary`（开头 40~80 字直接回答问题）+ `takeaway`（一句话结论）+ `sources` + `updatedAt`
4. 每篇供应商文章需内链到：代理类型解释、使用场景、IP 泄漏排查、两篇相关供应商文章（避免孤立页）
5. 新增文章后运行 `npm run validate`，提交前运行 `npm run ci`

## 四、来源记录规范（sources 必填）

- 任何事实性信息（价格、区域、协议支持、功能）**必须有来源**：官方页面、官方文档或官方公告，写入 `sources` / `sourceUrls`
- 不写来源的信息只允许出现在「个人使用体验」段落，并明确标注为个人观点
- 来源链接需要真实可访问；无法访问的来源请在 PR 中说明

## 五、禁止事项（红线）

- **禁止提交任何真实代理凭据**：真实 IP:port、真实账号密码、用户提供的登录凭据、服务商测试账号一律不得出现。参数示例一律虚构：`proxy.example.com:10000:demo_user:demo_password`
- **禁止复制受版权保护的内容**：不得大段复制服务商官网文案、其他博客文章或付费内容。引用官方文档允许，但需简写 + 注明出处（原文版权归原作者）
- **禁止**出现第三方品牌元素（如其他指纹浏览器的文案、Logo）及复制其文案
- **禁止**在资料中添加未经核验的推广话术（「全网最低价」「最佳服务商」等主观绝对化表述）
- 截图只能来自 EasyBR 自有产品或服务商官方公开素材，发布前脱敏（隐藏账号、密钥、IP）

## 六、图片和 Logo 使用规则

- 服务商 **Logo 默认不收录**。若确需使用，仅限服务商官网公开提供且明确允许引用的素材，并在 PR 中注明来源 URL
- 截图需标注来源（页面 URL），涉及账号信息的必须脱敏
- 不得上传版权不明的素材；无法确认来源的图片一律不放

## 七、PR 验收规则

### 服务商状态机

| 状态 | 含义 | 构建行为 |
|---|---|---|
| `draft` | 内部草稿，尚未核验 | 不参与构建，线上不可见 |
| `published` | 已人工核验，信息与官方一致 | 正常上线，进入公开数据导出 |
| `outdated` | 信息可能过期，待重新核验 | 保留并显示过期提示 |
| `inactive` | 服务商停运 / 移入历史 | 数据中不再展示 |

**关键规则：未核验不得标 `published`。** 新提交的服务商资料默认 `draft`，维护者核对官方页面确认信息后才会改为 `published`。

### 验收清单

PR 合并前必须全部通过：

- [ ] `npm run ci` 全绿（validate → check-drafts → export-data → check → build → check-dist → links → sponsor-off）
- [ ] 新增/修改的服务商条目字段完整，`sourceUrls` / `sources` 有真实来源
- [ ] `updatedAt` 已更新为本次提交日期；数据与文章状态一致
- [ ] 无旧字段残留（`verified` / `providerUrl` / `supportedProxyTypes` / `lastVerified` / `officialDocs`）
- [ ] 无真实凭据、无虚构不存在的功能与命令
- [ ] 无版权问题素材，无未授权 Logo
- [ ] 提交信息清晰（说明改动内容与核验情况）
