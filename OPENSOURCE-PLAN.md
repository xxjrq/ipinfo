# OPENSOURCE-PLAN — 开源改造：文件清单、数据 Schema、内容迁移

> 状态：待确认（2026-08-08）
> 依据：`CONTENT-DIRECTION.md` v2 拍板决策 + 开源形态要求（仓库可 Fork、数据可复用、内容可协作、EasyBR 可关闭）。
> 目标交付：**网页能访问、仓库能 Fork、数据能复用、内容能协作维护、EasyBR 推广可关闭**。

---

## 一、开源改造文件清单

### 1.1 新增文件

| # | 文件 | 内容 |
|---|---|---|
| 1 | `LICENSE`（替换现有 MIT） | **代码 MIT**。版权行改为 `Copyright (c) 2026 EasyBR`，范围限定"网站程序代码" |
| 2 | `LICENSE-CONTENT.md` | **原创 Markdown 内容 CC BY-SA 4.0** 声明 + 指向 https://creativecommons.org/licenses/by-sa/4.0/ |
| 3 | `LICENSE-DATA.md` | **结构化服务商数据 CC BY 4.0** 声明 + 指向 https://creativecommons.org/licenses/by/4.0/ |
| 4 | `README.md`（重写） | 项目介绍（开源资源库定位）/ 在线演示地址 / 功能说明 / 收录范围 / 本地运行 / 构建 / Pages 部署 / **如何新增服务商** / 如何提交纠错 / 数据下载（/data/*）/ 内容免责声明 / **EasyBR 关系透明说明**（团队发起+维护，推广可关闭）。建议项目描述句采纳用户原文 |
| 5 | `CONTRIBUTING.md` | 如何新增服务商 / 修改服务商资料 / 文章格式规范 / 来源记录规范 / 禁止提交真实代理凭据 / 禁止复制受版权保护内容 / 图片 Logo 使用规则 / PR 验收规则 / 状态机说明（draft→verified→outdated→inactive） |
| 6 | `.github/ISSUE_TEMPLATE/add-provider.yml` | 表单：名称、slug、官网、代理类型、协议、认证、计费、区域、来源 URL、联系方式（可选）。校验提示：须满足收录条件 ≥2 项 |
| 7 | `.github/ISSUE_TEMPLATE/incorrect-information.yml` | 表单：页面 URL、错误字段、正确信息、证据来源 URL |
| 8 | `.github/ISSUE_TEMPLATE/broken-link.yml` | 表单：页面 URL、失效链接、期望地址 |
| 9 | `.github/pull_request_template.md` | 改动类型 checkbox / 关联 Issue / 核验状态 / 来源记录 / 自查清单（无真实凭据、无版权复制、格式合规、已跑 ci） |
| 10 | `src/config/sponsor.ts` | EasyBR 推广配置：`{ enabled, name, url, downloadUrl, tagline }`，`enabled:false` 时首页模块/侧边栏下载/文章末尾入口全部隐藏 |
| 11 | `scripts/export-provider-data.mjs` | 读 `src/data/providers.json` → 生成 `public/data/providers.json`（完整）/ `providers.min.json`（压缩）/ `providers.csv`（扁平化） |
| 12 | `src/data/providers.schema.json` | JSON Schema（草案 2020-12），供编辑器提示 + 校验脚本复用 |
| 13 | `public/data/README.md` | 说明数据字段含义、status 语义、更新频率、CC BY 4.0 授权 |
| 14 | `src/content/docs/about/how-we-review.md` | 服务商如何入选、核验流程、更新频率、状态机说明 |
| 15 | `src/content/docs/about/affiliate-disclosure.md` | 推广关系声明、是否接受付费收录、佣金与排序无关声明 |
| 16 | `src/content/docs/about/corrections.md` | 纠错反馈渠道（GitHub Issue 模板入口）、处理流程、修订记录 |
| 17 | `src/content/docs/use-cases/index.md` | 使用场景栏目根页（真实概述：跨境电商/社媒多账号/数据采集/广告验证等，非占位词） |

### 1.2 修改文件

| # | 文件 | 改动 |
|---|---|---|
| 1 | `src/data/providers.json` | **按新 Schema 全量重构**（见第二节），21 家服务商补字段，国内服务商补 officialUrl 后状态置 draft |
| 2 | `src/content.config.ts` | schema 扩展：新增 `status` 枚举（draft/verified/outdated/inactive）、`protocols`、`pricingModel`、`geoGranularity`、`sessionMode`、`selfService`、`trialAvailable`；`verified:boolean` 与 `providerUrl` 保留兼容并标注 deprecated（迁移期后移除） |
| 3 | `scripts/validate-content.mjs` | 新增规则：重复 slug/name、status 枚举、verified 必须含 lastVerified+sources、服务商必填字段、**md frontmatter 与 providers.json 一致性**（slug/name/status 对齐）、真实凭据泄漏正则（`ip:port:user:pass` 模式）、每篇非草稿文章 sources ≥1 |
| 4 | `scripts/check-drafts.mjs` | 同步新状态机：`_` 前缀文件 = `status: draft`（保留 isDraft 兼容）；已发布文件 status ∈ {verified, outdated, inactive} 且不得含占位词 |
| 5 | `scripts/generate-provider-pages.mjs` | 生成模板改为**新评测结构**：标题 `{name} 代理怎么样？产品类型、适用场景与使用参考`，frontmatter 按新 Schema，正文生成 13 节骨架（一句话结论/基本信息/产品/适用用户/优点/限制/覆盖定位/认证连接/价格试用/官方入口/同类服务商/来源核验/配套工具） |
| 6 | `scripts/check-dist.mjs` | 关键 URL 清单更新（新增 use-cases；deals 不检查）；校验 `/data/providers.json` 等公开文件存在于 dist |
| 7 | `package.json` | `ci` 链插入 `export-data`；`gen:providers` 说明更新；description 更新为资源库定位 |
| 8 | `astro.config.mjs` | sidebar 重构为 8 栏目（见迁移清单）；description 改为资源导航定位；"免费下载 EasyBR"改为读 `sponsor.ts`（enabled:false 时不渲染）；标题不变 |
| 9 | `src/pages/index.astro` | 首页重构（Hero/筛选/推荐卡/目录表/选型入口/EasyBR 模块读 sponsor/页脚规则链接），H1「代理 IP 资源导航与选型指南」 |
| 10 | `.github/workflows/deploy.yml` | 无结构改动；确认 ci 链含 export-data 即可（环境变量不变） |

### 1.3 删除/不创建

- `deals/` 目录：**不创建**（不占导航、不进 sitemap；≥3 条官方核验活动再开放）
- `getting-started` 文章不删除，但**移出顶部一级导航**（见迁移清单）
- `src/layouts/`（空目录）不动

---

## 二、数据 Schema

### 2.1 `providers.json` 统一条目（规范）

```json
{
  "name": "NetNut",
  "slug": "netnut",
  "status": "draft",
  "officialUrl": "https://netnut.io/",
  "officialDocs": "",
  "pricingUrl": "",
  "trialUrl": "",
  "proxyTypes": ["residential", "static-residential", "datacenter"],
  "protocols": ["http", "https", "socks5"],
  "authentication": ["username-password"],
  "pricingModel": ["traffic"],
  "regions": [],
  "geoGranularity": ["country", "state", "city", "asn"],
  "sessionMode": ["rotating", "sticky", "fixed"],
  "targetUsers": ["enterprise", "sme", "personal"],
  "selfService": true,
  "trialAvailable": false,
  "language": ["en"],
  "regionServed": ["global", "cn"],
  "sourceUrls": [
    { "title": "官方定价页", "url": "https://netnut.io/pricing" },
    { "title": "官方文档", "url": "https://docs.netnut.io" }
  ],
  "lastVerified": "2026-08-08",
  "updatedAt": "2026-08-08",
  "notes": ""
}
```

**枚举字典**（写入 providers.schema.json 与 CONTRIBUTING.md）：

| 字段 | 枚举 |
|---|---|
| status | `draft` 内部草稿不构建 / `verified` 核验上线 / `outdated` 过期显示更新提示 / `inactive` 停运或无法确认移历史 |
| proxyTypes | residential, static-residential, datacenter, mobile, isp |
| protocols | http, https, socks5 |
| authentication | username-password, ip-whitelist, api |
| pricingModel | traffic, port, ip, package |
| geoGranularity | country, state, city, asn |
| sessionMode | rotating, sticky, fixed |
| targetUsers | enterprise, sme, personal |
| regionServed | global, cn, eu, na, asia |
| language | en, zh |

**必填字段（校验强制）**：`name`、`slug`、`officialUrl`（国内服务商经核验后必须有）、`proxyTypes`（≥1）、`sourceUrls`（≥1）、`updatedAt`。`status: verified` 额外强制：`lastVerified`、`pricingUrl 或 officialDocs`。

### 2.2 服务商文章 frontmatter（新模板）

```yaml
---
title: NetNut 代理怎么样？产品类型、适用场景与使用参考
description: 一句话 SEO 描述（50~170 字）
pageType: providers
provider: NetNut
slug: netnut
status: verified          # draft|verified|outdated|inactive
lastVerified: 2026-08-08
updatedAt: 2026-08-08
officialUrl: https://netnut.io/
officialDocs: https://docs.netnut.io
pricingUrl: https://netnut.io/pricing
proxyTypes: [residential, static-residential, datacenter]
protocols: [http, https, socks5]
authentication: [username-password]
pricingModel: [traffic]
regions: 190+ 国家（官方声明）
geoGranularity: [country, city]
sessionMode: [rotating, sticky]
selfService: true
trialAvailable: false
sources:
  - title: 官方定价页
    url: https://netnut.io/pricing
  - title: 官方文档
    url: https://docs.netnut.io
summary: 40~80 字直接回答（GEO/AI 可引用）
takeaway: 一句话结论
disclosure: 本篇基于服务商官方公开资料整理，具体能力以官方页面为准；本页可能包含推广链接。
---
```

### 2.3 公开数据导出（构建产物）

| 文件 | 内容 |
|---|---|
| `public/data/providers.json` | 全部服务商（含 status 字段，下游自行过滤 draft） |
| `public/data/providers.min.json` | 同上，压缩 |
| `public/data/providers.csv` | 扁平化表格（数组字段分号连接）：name,slug,status,officialUrl,proxyTypes,protocols,authentication,pricingModel,regions,geoGranularity,sessionMode,targetUsers,selfService,trialAvailable,language,regionServed,lastVerified,updatedAt |

**生成策略**：`export-data` 脚本运行于 `astro build` 之前，写入 `public/data/`，随构建一并打包。数据文件含全部服务商但保留 `status` 字段——**页面展示只渲染非 draft**，数据文件保留全量供开发者复用（README 说明过滤规则）。

### 2.4 校验规则（validate-content.mjs 新增）

1. `slug` 全局唯一、`name` 全局唯一（去重）
2. `status` 必须在枚举内；`_` 前缀文件 ⇔ status=draft（或 isDraft:true）双向一致
3. `status=verified` 必须：lastVerified 有值、sourceUrls ≥1、pricingUrl 或 officialDocs 有值
4. providers 文章 frontmatter 与 providers.json 对应条目一致（name/slug/status 至少一致）
5. 真实凭据泄漏扫描：`\d+\.\d+\.\d+\.\d+:\d+:[^:]+:[^:]+`（IP:port:user:pass）命中即报错
6. 非草稿文章必须含 `sources` ≥1 条且 URL 为 http(s)
7. 占位词扫描沿用（待核实/教程待撰写/建设中）

---

## 三、内容迁移清单

### 3.1 现状盘点（47 篇文件）

| 目录 | 现有 | 去向 |
|---|---|---|
| getting-started/ | index.md（正式）+ `_intro.md` | index 改写为**新手指南**（第一次接触代理 IP 快速入门/如何使用本站/按需求筛选服务商/官方声明 vs 本站核验 vs 编辑推荐区别）；**不写成 EasyBR 指南**；移出顶部导航，入口在首页模块+页脚+基础知识 |
| basics/ | index.md（正式）+ 3 草稿 | index 保留；`_http-https-proxy.md`→转正候选（首发 #8）；`_socks5-proxy.md`→转正候选（首发 #7）；`_what-is-proxy-ip.md` 草稿保留 |
| proxy-types/ | index.md（正式）+ 4 草稿 | index 改写选型导向；`_residential-proxy.md`→转正候选（首发 #1）；`_static-residential-proxy.md`→转正候选（首发 #2）；`_datacenter-vs-residential.md`→转正候选（首发 #3）；`_mobile-proxy.md` 草稿保留 |
| providers/ | index.md（正式）+ 21 家草稿 | index 改写为收录机制+目录说明；21 家草稿按批次核验转正（见 3.2），其余留在 draft |
| easybr/ | index.md（正式）+ 4 草稿 | index 保留（栏目降级"EasyBR 工具"）；4 篇草稿合并保留 **1 篇通用配置教程**《如何在指纹浏览器中配置 HTTP/SOCKS5 代理》，其余归档 |
| comparisons/ | index.md（正式）+ 1 草稿 | 保留；`_proxy-with-fingerprint-browser.md` 草稿保留 |
| troubleshooting/ | index.md（正式）+ 4 草稿 | index 保留（栏目名改"避坑指南"）；`_dns-leak.md`、`_webrtc-leak.md`→转正候选（首发 #9 纯净度素材）；`_proxy-connect-failed.md`、`_proxy-region-mismatch.md` 草稿保留 |
| faq/ | index.md（正式） | 保留 |
| about/ | editorial-policy.md（正式） | 保留并扩展；新增 how-we-review / affiliate-disclosure / corrections（清单一 1.14~1.16） |
| use-cases/ | 无 | 新建 index.md（清单一 1.17） |
| deals/ | 无 | **不创建** |

### 3.2 服务商核验批次（12 家重点，每批 3~4 家核验后上线一次）

| 批次 | 服务商 | 目标 |
|---|---|---|
| A | Bright Data、NetNut、青果网络、巨量 IP | 国际企业级 + 国内两家 |
| B | Oxylabs、SOAX、IPIDEA、IPFoxy | 国际 + 中文用户常用 |
| C | Decodo（Smartproxy）、IPRoyal、Webshare、Proxy302 | 中小团队 + 国内 |

第二批扩展（NodeMaven、Rayobyte、PacketStream、922 S5、芝麻、品赞、携趣、天启、太阳）进入待核验池，经核验仍正常运营者按同规则转正。**国内服务商（青果/巨量/芝麻等）目前 officialUrl 为空，核验步骤第一步即补齐官网与来源，无法确认则保持 draft 并记录原因。**

### 3.3 首发文章生产顺序

| 阶段 | 产出 | 依赖 |
|---|---|---|
| 1 | 服务商模板 + 生成器改造 | 无 |
| 2 | 核验批次 A（4 家）→ 上线 | 模板就绪 |
| 3 | 首发 #1~3（住宅选型/静态动态/数据中心住宅）+ #6 低价代理风险 | 批次 A 上线 |
| 4 | 核验批次 B → 上线；首发 #7~12 陆续转正 | — |
| 5 | 核验批次 C → 上线；EasyBR 通用配置教程 | 资源内容稳定后 |

### 3.4 导航结构（astro.config.mjs sidebar 目标态）

```text
首页 /
IP 服务商       providers/        ← 一级
代理类型        proxy-types/      ← 一级
使用场景        use-cases/        ← 一级（新）
选型对比        comparisons/      ← 一级
基础知识        basics/           ← 一级
避坑指南        troubleshooting/  ← 一级（原"排查工具"）
EasyBR 工具     easybr/           ← 一级（降级，放后）
常见问题        faq/              ← 一级
关于            about/            ← 一级（含 how-we-review 等 4 页）
── 不占一级导航 ──────────────────────
新手指南        getting-started/  ← 首页"第一次使用代理 IP？"模块 + 页脚 + 基础知识内链
免费下载 EasyBR                    ← 读 sponsor.ts，enabled:false 不渲染
```

---

## 四、执行顺序（确认后批量实施）

```text
阶段 0  开源骨架：LICENSE 拆分 + README 重写 + CONTRIBUTING + Issue/PR 模板 + sponsor.ts
阶段 1  数据层：providers.json 重构 + providers.schema.json + export-provider-data.mjs + schema/校验脚本升级
阶段 2  内容层：about 新增 3 页 + use-cases 根页 + getting-started 改写 + 导航/首页重构 + 生成器改造
阶段 3  核验发布：批次 A 核验 → 上线 → 首发 #1~3/#6 → 批次 B/C → 后续文章
阶段 4  验收：npm run ci 全绿 + 线上验证（新 URL 200、deals 404、/data/* 可下载、sponsor 关闭测试）
```

## 五、验收标准（开源改造部分）

- [ ] README 含：在线地址、本地运行、构建、部署、贡献方式、数据下载、免责声明、EasyBR 关系说明
- [ ] 三份 LICENSE 就位（MIT 代码 / CC BY-SA 4.0 内容 / CC BY 4.0 数据），仓库无第三方原文/原图/HTML 冒充原创
- [ ] CONTRIBUTING + 3 个 Issue 模板 + PR 模板就位
- [ ] `providers.json` 全部 21 家符合新 Schema，schema 校验通过
- [ ] 构建产出 `/data/providers.json`、`providers.min.json`、`providers.csv` 且内容正确
- [ ] 校验脚本覆盖：重复 slug/name、status 枚举、verified 必填来源、凭据泄漏、md-JSON 一致性
- [ ] `sponsor.enabled=false` 时首页模块/侧边栏下载/文章入口消失，构建正常
- [ ] 导航为目标态 8 栏目，getting-started 不在一级导航，deals 不存在
- [ ] `npm run ci` 全绿，线上新增页面 200、deals 404

## 六、待确认决策点

1. **`verified:boolean` / `providerUrl` / `supportedProxyTypes` 旧字段**：迁移期保留兼容（建议）还是直接删除强制新字段（更干净但一次性改动大）？
2. **公开数据文件是否含 draft 条目**：建议含（带 status 字段供下游过滤，数据完整）；如需"只公开已核验"可改为导出时过滤。
3. **README 项目描述句**：直接采用你给的原文（"一个开源的代理 IP 服务商导航与使用指南……"）？
