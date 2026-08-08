# EasyBR IP 资源中心 (ipinfo)

代理 IP 选型、配置、检测与指纹浏览器使用指南。

- 面向：跨境电商、社媒多账号、数据采集、Web3 用户
- 产品：EasyBR 免费指纹浏览器（5 个永久免费环境，HTTP/HTTPS/SOCKS5，Windows/macOS）
- 技术栈：Astro 7 + Starlight + Pagefind 站内搜索 + @astrojs/sitemap
- 部署：GitHub Pages（`https://xxjrq.github.io/ipinfo/`）

> 本仓库只做内容与站点工程，不含任何真实账号密码、代理凭证。示例参数一律为虚构数据。

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
| `npm run links` | 构建产物内链检查（需先 build） |
| `npm run gen:providers` | 由 `src/data/providers.json` 批量生成供应商文章占位 |
| `npm run ci` | 完整流水线：validate → check → build → links |

## 目录结构

```text
src/
├── content/
│   ├── content.config.ts      # 内容集合 Schema（供应商/GEO 字段）
│   └── docs/                  # 全部文章（Markdown）
│       ├── getting-started/   # 开始使用
│       ├── basics/            # IP 基础
│       ├── proxy-types/       # 代理类型
│       ├── providers/         # IP 服务商教程（每供应商一篇）
│       ├── easybr/            # EasyBR 配置教程
│       ├── troubleshooting/   # 排查工具
│       ├── comparisons/       # 选型对比
│       └── faq/               # 常见问题
├── data/providers.json        # 供应商目录数据（首页卡片数据源）
├── pages/index.astro          # 自定义落地首页（Hero/搜索/服务商卡片/CTA）
└── styles/custom.css          # 品牌主题（主色 #722ed1）
public/                        # 静态资源：robots.txt / llms.txt / favicon / 截图素材
scripts/                       # validate-content / check-links / generate-provider-pages
.github/workflows/deploy.yml   # GitHub Pages 自动部署
```

## 内容写作规范

1. **frontmatter 必填**：`title`、`description`（50~170 字）、`pageType`（见 schema）
2. **供应商文章必填**：`provider`、`providerUrl`、`supportedProxyTypes`、`authentication`、`officialDocs`、`disclosure`、`lastVerified`
3. **GEO/AI 可引用**：`summary`（开头 40~80 字直接回答）+ `takeaway`（一句话结论）+ `sources` + `lastVerified`
4. **禁止事项**：
   - 禁止出现真实 IP:port、真实账号密码、用户提供的登录凭据
   - 参数示例一律虚构：`proxy.example.com:10000:demo_user:demo_password`
   - 禁止出现第三方品牌元素（花漾等）及复制其文案
   - 截图只能来自 EasyBR 自有产品，发布前脱敏
5. **时间声明**：易变信息（价格、覆盖国家、API 地址）必须写 `lastVerified`，正文注明"以官方页面为准"
6. 每篇供应商教程需内链到：代理类型解释、EasyBR 导入教程、IP 泄漏排查、EasyBR 下载页、两篇相关供应商文章（避免孤立页）
7. 新增文章后运行 `npm run validate`，提交前运行 `npm run ci`

## 供应商文章生成

```bash
# 为 providers.json 中所有尚无文章的供应商生成占位
npm run gen:providers
# 或指定 slug
npm run gen:providers -- netnut soax
```

占位文章需人工核实后补全正文并设置 `lastVerified`，未核实前保持 `status: pending`。

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

- 编辑 `src/data/providers.json`（首页卡片数据）+ 对应 `providers/<slug>.md` 正文
- 修改 `updatedAt` 与 `lastVerified`
- 跑 `npm run ci` 确认无失效内链后提交
