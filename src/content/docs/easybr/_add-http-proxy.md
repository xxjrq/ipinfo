---
isDraft: true
title: 在 EasyBR 添加 HTTP/HTTPS 代理
description: 在 EasyBR 指纹浏览器中新建环境并添加 HTTP/HTTPS 代理的完整操作步骤，含连通性检测与常见失败排查。
pageType: easybr-guide
summary: 打开 EasyBR 新建环境，进入代理设置选择 HTTP/HTTPS，填入主机、端口、用户名、密码，点击检测代理通过后保存即可。
takeaway: 添加 HTTP/HTTPS 代理一共五步：新建环境 → 代理设置 → 选择协议 → 填参数 → 检测并保存。
author: EasyBR 团队
reviewer: EasyBR 团队
updatedAt: 2026-08-08
lastVerified: 2026-08-08
appliesTo: EasyBR 2.x（Windows / macOS）
---

> 这是一篇示例草稿文章，用于验证操作教程模板，正式截图由素材制作环节补齐并脱敏。

## 一句话结论

在 EasyBR 中，代理在一键「新建环境」里配置。填对 `主机 + 端口 (+ 用户名 + 密码)`，点击「检测代理」返回成功即可使用。

## 前置条件

- 已安装 [EasyBR](https://www.ebrower.com/down.html?utm_source=ipinfo&utm_medium=docs&utm_campaign=download)（Windows 或 macOS）
- 已取得代理参数（`host:port`，可选 `user:password`）
- 尚无参数？先看 [NetNut 教程](../../providers/netnut/)，或 [其他服务商目录](../../providers/netnut/)
- 尚未理解协议差异？阅读 [HTTP、HTTPS、SOCKS5 区别](../../basics/http-https-proxy/)

## 操作步骤

### 1. 新建环境

打开 EasyBR，点击「新建环境」，输入环境名称（例如「店铺 A - 美区」）。

### 2. 打开代理设置

在环境编辑页找到「代理设置」分区，代理方式默认「不使用代理」。

### 3. 选择 HTTP / HTTPS

代理协议选择 **HTTP / HTTPS**。如果你的参数是 `socks5://...`，请选 SOCKS5 并参考 [SOCKS5 配置教程](../add-socks5-proxy/)。

### 4. 填入参数

| 字段 | 示例 | 说明 |
|---|---|---|
| 主机 Host | `proxy.example.com` | 服务商提供的服务器地址 |
| 端口 Port | `10000` | 服务商提供的端口 |
| 用户名 Username | `demo_user` | 有认证时填写 |
| 密码 Password | `demo_password` | 有认证时填写 |

:::note[虚构数据]
以上为虚构示例。正式使用请用你向服务商购买的参数，仓库和文档中禁止出现真实凭证。
:::

支持 `host:port:user:pass` 快速粘贴导入，格式见 [批量导入代理](../batch-import-proxy/)。

### 5. 检测连接

点击「检测代理」，EasyBR 会尝试连接并显示出口 IP、归属地与时延：

- 绿色 + 地理信息 → 可用，保存环境
- 红色 / 超时 → 参考下方排查表

### 6. 保存并启动

保存后点击「启动」，环境将使用该代理打开独立浏览器窗口。可在环境内访问 `ipinfo.io` 之类站点二次确认出口 IP 与 [时区、语言、经纬度是否匹配](../../troubleshooting/proxy-region-mismatch/)。

## 常见问题排查

| 现象 | 原因 | 修复 |
|---|---|---|
| 检测超时 | 端口或协议选错 | 核对参数，确认协议 HTTP vs SOCKS5 |
| 401 / 407 认证失败 | 用户名密码错误 | 重新复制服务商的子代理账号 |
| 连接被拒绝 | 主机不可达 | 确认套餐未过期、流量未耗尽 |
| 启动后是本地 IP | 代理未生效 | 检查是否选择了该环境代理设置 |

更多排查见 [代理失败错误排查](../../troubleshooting/proxy-connect-failed/)。

## 下一步

- 学习 [SOCKS5 代理添加](../add-socks5-proxy/) 或 [批量导入代理](../batch-import-proxy/)
- 了解 [WebRTC 泄漏检查](../../troubleshooting/webrtc-leak/) 与 [DNS 泄漏检查](../../troubleshooting/dns-leak/)
- 确认连接安全后，[为不同环境分配不同 IP](../assign-different-ip/)

## 免责声明

本文最后验证于 2026-08-08。EasyBR 各版本菜单名称可能略有差异，以你安装的版本为准。