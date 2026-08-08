---
title: NetNut 代理导入 EasyBR 教程
description: NetNut 住宅与数据中心代理如何注册、获取参数、导入 EasyBR 指纹浏览器的完整步骤，含批量导入格式与常见错误。
pageType: providers
provider: NetNut
providerUrl: https://netnut.io
supportedProxyTypes:
  - residential
  - static-residential
  - datacenter
authentication:
  - username-password
  - api
regions: 待核实（预计 190+ 国家）
supportsApi: true
supportsWhitelist: true
officialDocs: https://docs.netnut.io
summary: NetNet 提供住宅与数据中心代理，支持用户名密码认证。在 Dashboard 生成子用户与代理参数后，即可在 EasyBR 中添加 HTTP/SOCKS5 代理并导入独立环境。
takeaway: 从 NetNut Dashboard 复制 host:port 与账号密码，在 EasyBR 代理设置中填入并检测连通即可。
author: EasyBR 团队
reviewer: EasyBR 团队
updatedAt: 2026-08-08
lastVerified: 2026-08-08
disclosure: 本文为合作演示，参数为虚构示例，不对套餐与价格负责。实际套餐以 NetNut 官方页面为准。
---

> 这是一篇示例草稿文章，用于验证供应商模板。字段与实际数据需经人工核实后替换，示例参数为虚构。

## 一句话结论

NetNut 的代理参数由 **host:port + 用户名:密码** 组成，先到 Dashboard 创建子代理，再在 EasyBR 新建环境并填入即可连接。

## 1. 服务商简介

NetNut 是提供住宅代理与数据中心代理的服务商，主打低延迟自建骨楼架构，常见于数据采集与账号运营场景。以下流程适用于其住宅代理与数据中心代理产品。

## 2. 支持的代理类型

| 产品 | 出口 IP | 认证方式 | 备注 |
|---|---|---|---|
| 住宅代理 | 轮换住宅 IP | 用户名密码 / IP 白名单 | 按流量计费 |
| 静态住宅代理 | 固定住宅 IP | 用户名密码 | 指定国家地区 |
| 数据中心代理 | 机房 IP | 用户名密码 | 按带宽或 IP 计费 |

## 3. 适合场景

- 跨境电商多店铺运营
- Facebook / TikTok 多账号隔离
- 数据采集与 API 接入

## 4. 注册与购买说明

1. 前往 [NetNut 官网](https://netnut.io) 注册账号
2. 在工作台（Dashboard）选择住宅代理并购买套餐
3. 套餐开通后，进入 "Members" 或 "Proxies" 页创建子用户（子代理）

:::note
套餐价格、流量单位与计费周期经常调整，本文价格不承诺任何套餐，一切以官方页面为准（核实日期：2026-08-08）。
:::

## 5. 在供应商后台获取代理参数

在 Dashboard 创建子代理后，系统会生成形如以下结构的参数：

- **Host（主机）**：`proxy.example.com`
- **Port（端口）**：`10000`
- **Username（用户名）**：`demo_user`
- **Password（密码）**：`demo_password`

:::caution[示例数据]
以上均为虚构数据。请勿将真实账号、密码、代理端口写入代码或公开文档。
:::

## 6. EasyBR 手工导入步骤

1. 打开 EasyBR → 点击「新建环境」
2. 切换到「代理设置」页签
3. 选择代理类型 **HTTP/HTTPS** 或 **SOCKS5**
4. 填入主机、端口、用户名、密码
5. 点击「检测代理」，等待连通性结果
6. 保存并打开环境，验证出口 IP 与归属地

完整图文步骤见 [在 EasyBR 添加 HTTP/HTTPS 代理](../../easybr/add-http-proxy/)。

## 7. 批量导入格式

一行一个代理，格式为 `host:port:user:pass`：

```text
proxy.example.com:10000:demo_user:demo_password
proxy.example.com:10001:demo_user2:demo_password2
```

:::caution
批量导入前，请勿复制真实账号。生产环境使用实际参数，仓库内一律使用以上虚构格式。
:::

## 8. API / IP 池配置方式

NetNut 支持 API 获取代理与随机切换出口，具体以 [官方文档](https://docs.netnut.io) 为准。EasyBR 中若服务商提供"API 方式取 IP"，可在代理设置中选择对应获取方式。

## 9. 参数示例（虚构）

```text
proxy.example.com:10000:demo_user:demo_password
```

## 10. 常见错误

| 错误现象 | 可能原因 | 修复 |
|---|---|---|
| 连接超时 | 端口写错 / 未购买可用套餐 | 核对 Dashboard 中的主机端口 |
| 用户名密码错误 | 子代理被删或密码修改 | 重建子代理并重新复制 |
| 国家不对 | 未指定区域或套餐无此区域 | 在 Dashboard 购买静态区域 |

## 11. 安全注意事项

- 任何文档 / 截图 / 仓库中，禁止出现真实账号、密码与代理凭证
- 购物时用自己的账号密码，付款后及时修改

## 12. 官方资料来源

- [NetNut 官网](https://netnut.io)
- [NetNut 文档](https://docs.netnut.io)

## 13. 最后验证日期

本文最后验证于 2026-08-08。价格、覆盖国家、接口地址可能变动。

## 14. 下载 EasyBR

已取得代理参数？[免费下载 EasyBR](https://www.ebrower.com/down.html?utm_source=ipinfo&utm_medium=provider&utm_campaign=netnut)，创建 5 个独立环境并导入代理。