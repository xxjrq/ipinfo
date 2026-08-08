# IP 资源与代理配置中心（ipinfo）

一个开源的代理 IP 服务商导航与使用指南，整理住宅代理、静态住宅、数据中心代理、移动代理和 IP 池资源，支持静态部署与社区协作维护。

- 在线演示：<https://xxjrq.github.io/ipinfo/>
- 技术栈：Astro 7 + Starlight + Pagefind 站内搜索 + @astrojs/sitemap
- 部署：GitHub Pages（静态站点，`dist/` 可直接上传任意静态托管）
- 定位：中立资源库。服务商信息客观整理，不售卖代理、不导流付费链接

> 本仓库只做内容与站点工程，不含任何真实账号密码、代理凭据。示例参数一律为虚构数据。

## 收录内容范围

- **服务商目录**：住宅代理、静态住宅、数据中心代理、移动代理、IP 池等类型的服务商基本信息（官网、支持协议、认证方式、计费模式、覆盖区域）
- **选型知识**：代理类型对比、使用场景、选购避坑、SOCKS5/HTTP 等协议说明
- **使用指南**：从服务商购买到客户端配置的完整流程
- **排查工具**：IP 泄漏、代理连接失败等常见问题

每一条服务商资料都附带来源记录（`sourceUrls`）与更新时间（`updatedAt`），未核验的资料不会标记为 `published`。

## 本地开发

```bash
npm install        # 安装依赖（大陆网络建议先配置 npmmirror 镜像）
npm run dev        # http://localhost:4321
```

## 常用命令

| 命令 | 作用 |
|---|---|
| `npm run dev` | 本地开发服务器 |
| `npm run build` | 构建静态产物到 `dist/` |
| `npm run preview` | 本地预览构建产物 |
| `npm run validate` | 内容质量校验（frontmatter/日期/凭证/内链） |
| `npm run check` | TypeScript + Astro 类型检查 |
| `npm run check-dist` | 构建产物验收（H1/title/canonical/占位词/品牌残留/公开数据） |
| `npm run links` | 构建产物内链检查（需先 build） |
| `npm run export-data` | 导出公开数据（仅 published 服务商，JSON/CSV） |
| `npm run test:sponsor-off` | 验证 SPONSOR_ENABLED=false 时推广模块消失 |
| `npm run gen:providers` | 由 `src/data/providers.json` 批量生成供应商文章草稿 |
| `npm run ci` | 完整流水线：validate → check-drafts → export-data → check → build → check-dist → links → sponsor-off |

## 目录结构

```text
src/
├── content/
│   ├── content.config.ts      # 内容集合 Schema（服务商/GEO/status 状态机）
│   └── docs/                  # 全部文章（Markdown）
│       ├── providers/         # IP 服务商资料（每供应商一篇，草稿以 _ 前缀）
│       ├── proxy-types/       # 代理类型
│       ├── use-cases/         # 使用场景
│       ├── comparisons/       # 选型对比
│       ├── basics/            # IP 基础知识
│       ├── troubleshooting/   # 避坑指南/排查
│       ├── faq/               # 常见问题
│       ├── easybr/            # EasyBR 工具（sponsor.enabled=false 时栏目可移除）
│       ├── getting-started/   # 新手指南（不占一级导航，入口在首页/页脚）
│       └── about/             # 关于：推荐规则/编辑政策/推广披露/内容纠错
├── data/providers.json        # 服务商全量数据源（含草稿，公开导出只含 published）
├── config/sponsor.ts          # 站点推广模块配置（enabled/name/websiteUrl/downloadUrl）
├── pages/index.astro          # 自定义落地首页（Hero/筛选/目录/选型/EasyBR 软推广）
└── styles/custom.css          # 品牌主题（主色 #722ed1）
public/                        # 静态资源：robots.txt / llms.txt / favicon / 截图素材
scripts/                       # validate-content / check-drafts / check-dist / check-links /
                               # export-provider-data / check-sponsor-off / generate-provider-pages
.github/
├── workflows/deploy.yml       # GitHub Pages 自动部署（完整 CI 流水线）
├── ISSUE_TEMPLATE/            # 新增服务商 / 纠错 / 死链 的 Issue 表单
├── CODE_OF_CONDUCT.md         # 贡献者行为准则
└── pull_request_template.md   # PR 提交模板
```

## 如何新增服务商

1. 在 [src/data/providers.json](src/data/providers.json) 中新增一条记录，**最小字段**如下：

```yaml
name: 服务商名称            # 必填，官方品牌名
slug: 服务商英文标识         # 必填，用于 URL，全小写连字符
status: draft               # 必填，draft / published / outdated / inactive
officialUrl: https://...    # 必填，官方网址
description: 一句话简介      # 必填
proxyTypes:                 # 必填，数组，如 residential / static-residential / datacenter / mobile / isp
  - residential
protocols:                  # 必填，数组，如 http / https / socks5
  - http
  - socks5
authentication:             # 必填，数组，如 username-password / ip-whitelist / api
  - username-password
pricingModels:              # 必填，数组，如 traffic / port / ip / package
  - traffic
regions:                    # 必填，覆盖区域，如 ["美国", "欧洲", "亚洲"]
  - 美国
sourceUrls:                 # 必填，信息来源（官方页面链接），至少 1 条
  - title: 官网
    url: https://.../pricing
updatedAt: 2026-08-08       # 必填，本次核验/更新时间（YYYY-MM-DD）
```

2. 运行 `npm run gen:providers` 生成草稿文章（或手动创建 `src/content/docs/providers/_<slug>.md`）
3. 补充正文内容，填写 `sourceUrls` 与 `updatedAt`，经人工核验后将 `status` 改为 `published`
4. 运行 `npm run validate` 校验，提交前运行 `npm run ci`

也可以直接提交 [新增服务商 Issue](.github/ISSUE_TEMPLATE/add-provider.yml)（选择仓库 Issues 页的 "新增服务商" 模板），由维护者录入。

## 如何提交纠错

发现信息有误、链接失效或想补充资料，欢迎提 Issue：

- [信息纠错](.github/ISSUE_TEMPLATE/incorrect-information.yml)：页面 URL、错误内容、正确信息、证据来源
- [失效链接](.github/ISSUE_TEMPLATE/broken-link.yml)：页面 URL、失效链接、期望地址
- [新增服务商](.github/ISSUE_TEMPLATE/add-provider.yml)：按最小字段填写

详细的贡献流程（文章规范、来源记录、PR 验收规则）见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 数据下载

构建产物 `dist/data/` 下提供结构化数据（仅 `status: published` 的服务商），方便二次使用：

| 文件 | 说明 |
|---|---|
| `data/providers.json` | 已发布服务商数据（含包裹结构：`generatedAt` / `license` / `project` / `providers`） |
| `data/providers.csv` | 表格格式，便于 Excel/Sheets 打开（与 JSON 同范围） |

> 导出由 CI 中的 `npm run export-data` 执行；`src/data/providers.json` 为全量数据源（含草稿），公开产物只含已核验发布的服务商。

**status 字段过滤规则**：

- `published` — 已人工核验并发布，参与构建与公开数据导出
- `draft` — 内部草稿，**不参与构建**，仅存在于仓库数据源中
- `outdated` — 信息可能过期，数据中保留并附过期提示
- `inactive` — 服务商停运或已移入历史，数据中不再展示

## 内容免责声明

- 本仓库所有服务商信息（价格、覆盖区域、功能）均为**社区整理**，可能随时间变化，**一切以服务商官方页面为准**
- 本仓库**不包含任何真实账号、密码、代理凭据或付款信息**；示例参数一律虚构（如 `proxy.example.com:10000:demo_user:demo_password`）
- 第三方品牌名称、Logo 归各权利人所有，本仓库不对任何服务商做质量背书
- 使用任何代理服务产生的费用、合规与安全风险，由使用者自行承担

## 与 EasyBR 的关系（透明说明）

- 本项目由 **EasyBR 团队发起并维护**，但项目主体是**开放的代理 IP 资源整理与导航**，不依赖任何特定产品
- EasyBR 是推荐的代理环境管理工具（免费指纹浏览器，支持 HTTP/HTTPS/SOCKS5 代理，5 个永久免费环境），站点内有少量 EasyBR 入口（约占比 10%）
- **社区贡献无需推广 EasyBR**：接受纯资源整理类 PR，不要求附带任何 EasyBR 内容
- 若你是 Fork 用户且不希望站点展示 EasyBR 推广模块，将 [src/config/sponsor.ts](src/config/sponsor.ts) 中的 `enabled` 改为 `false` 即可隐藏全站推广（首页 CTA、侧边栏下载链接、EasyBR 栏目）

## 许可

- 网站程序代码：MIT（[LICENSE](LICENSE)）
- 原创文章内容：CC BY-SA 4.0（[LICENSE-CONTENT](LICENSE-CONTENT)）
- 结构化服务商数据：CC BY 4.0（[LICENSE-DATA](LICENSE-DATA)）

## 部署到 GitHub Pages

1. 首次在仓库 `Settings → Pages → Source` 选择 **GitHub Actions**
2. 推送 `main` 分支，`deploy.yml` 自动执行 `npm run ci` 并发布到 Pages
3. 站点地址：`https://xxjrq.github.io/ipinfo/`

### 自定义域名（可选）

1. 将域名 CNAME 记录指向 `xxjrq.github.io`
2. 仓库 Settings → Pages → Custom domain 填入域名
3. 修改 `astro.config.mjs`：`BASE_PATH` 改为 `/`（CI 中或删除环境变量），并更新 `public/robots.txt` 中的 Sitemap
4. 提交后重新部署

### 国内访问（可选）

GitHub Pages 在国内不稳定。如面向百度流量，建议后续迁移到：
腾讯云 EdgeOne Pages / 阿里云 OSS+CDN / 腾讯云 COS+CDN（均需备案域名）。
工程产物为纯静态文件，`dist/` 直接上传即可，无需改动代码。

## 更新供应商信息

- 编辑 `src/data/providers.json`（全量数据源）+ 对应 `providers/_<slug>.md` 正文（草稿前缀）
- 修改 `updatedAt`，核验后将 `status` 改为 `published`（公开数据与站点构建同步生效）
- 跑 `npm run ci` 确认无失效内链后提交
