/**
 * generate-provider-pages.mjs — 由 providers.json 批量生成供应商文章草稿
 *
 * 为 src/data/providers.json 中每个尚无文章的供应商创建 providers/<slug>.md 草稿，
 * frontmatter 使用新 Schema（status: draft）、正文生成 13 节评测骨架。
 * 已存在的文章不会覆盖。
 *
 * 用法：npm run gen:providers        # 所有供应商
 *       npm run gen:providers -- netnut bright-data   # 指定 slug
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DATA = join(ROOT, 'src/data/providers.json');
const OUT_DIR = join(ROOT, 'src/content/docs/providers');

const { providers } = JSON.parse(readFileSync(DATA, 'utf8'));
const requested = process.argv.slice(2);

const targets = providers.filter((p) => requested.length === 0 || requested.includes(p.slug));

let created = 0;
let skipped = 0;

for (const p of targets) {
	const file = join(OUT_DIR, `_${p.slug}.md`);
	if (existsSync(file)) {
		skipped++;
		continue;
	}
	const types = (p.proxyTypes || []).map((t) => `  - ${t}`).join('\n');
	const protocols = (p.protocols || []).map((t) => `  - ${t}`).join('\n');
	const auth = (p.authentication || []).map((a) => `  - ${a}`).join('\n');
	const pricing = (p.pricingModels || []).map((t) => `  - ${t}`).join('\n');
	const sources = (p.sourceUrls || [])
		.map((s) => `  - title: ${s.title}\n    url: ${s.url}`)
		.join('\n');
	const content = `---
title: ${p.name} 代理怎么样？产品类型、适用场景与使用参考
description: ${p.name} 代理服务商整理：支持 ${types.split('\n').join(', ')}，协议与认证方式、适用场景、优点与限制。资料核验中，以官方页面为准。
pageType: providers
provider: ${p.name}
slug: ${p.slug}
status: draft
officialUrl: ${p.officialUrl || '待核实'}
proxyTypes:
${types}
protocols:
${protocols}
authentication:
${auth}
pricingModels:
${pricing}
regions: 待核实
sources:
${sources || '  - title: ${p.name} 官网\n    url: ${p.officialUrl || "待核实"}'}
summary: ${p.name} 提供 ${types.split('\n').join('/')} 代理，主要适合${(p.targetUsers || []).join('、') || '待核实的用户群体'}，本文整理其产品类型、适用场景与注意事项（资料核验中）。
takeaway: ${p.name} 的适用结论待核实后补充。
author: EasyBR 团队
updatedAt: 2026-08-08
disclosure: 本文基于服务商官方公开资料整理，具体能力以官方页面为准；资料核实完成后将 status 改为 published 并补充 updatedAt 对应信息。
---

> 资料核验中（status: draft）。核实 ${p.name} 官方资料后，按下方 13 节结构补全正文，
> 并在 \`src/data/providers.json\` 中将其 status 改为 published、补充 sourceUrls 与核验信息后发布。

## 一句话结论

（待核实后填写）

## 基本信息

- 官网：${p.officialUrl || '待核实'}

## 提供哪些代理产品

${types}

## 适合哪些用户

（待核实后填写）

## 主要优点

（待核实后填写）

## 需要注意的限制

（待核实后填写）

## 覆盖国家与定位粒度

（待核实后填写）

## 认证和连接方式

${auth}

## 价格与试用说明

（仅官方公布信息，无证据不写）

## 官方入口与文档

${p.officialUrl || '待核实'}

## 同类服务商

（待核实后填写，仅链已发布页）

## 信息来源与核验日期

（待核实后补充 sources 与核验日期）

## 使用代理的配套工具

（EasyBR 一行简介 + 入口）
`;
	writeFileSync(file, content);
	created++;
}

console.log(`生成 ${created} 篇，跳过已有 ${skipped} 篇（目标 ${targets.length}）`);
if (created === 0 && skipped === 0) console.warn('未匹配任何供应商，请检查 slug 或 providers.json');
