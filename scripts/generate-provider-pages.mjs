/**
 * generate-provider-pages.mjs — 由 providers.json 批量生成服务商文章（providers/<slug>.md）
 *
 * 与历史草稿生成器不同，本版本按最终数据生成正式页面（与 src/data/providers.json 对齐）：
 *   - status 取自数据文件（published / inactive / outdated），不做草稿
 *   - 覆盖式生成：已存在的同名文件会被重新生成
 *   - frontmatter 严格匹配 src/content.config.ts 的 docs 集合 schema
 *     （sources 数组 / regions 字符串 / updatedAt 日期 / 无 features 等扩展字段）
 *
 * 用法：npm run gen:providers        # 全部非 draft 服务商
 *       npm run gen:providers -- netnut bright-data   # 指定 slug
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DATA = join(ROOT, 'src/data/providers.json');
const OUT_DIR = join(ROOT, 'src/content/docs/providers');

const { providers } = JSON.parse(readFileSync(DATA, 'utf8'));
const requested = process.argv.slice(2);

const targets = providers.filter(
	(p) => (requested.length === 0 || requested.includes(p.slug)) && p.status !== 'draft'
);

/** YAML 安全格式化 */
function yaml(str) {
	return JSON.stringify(String(str ?? ''));
}

/** 列表 → YAML 序列（缩进 2） */
function yamlList(items, indent = 2) {
	return (items || [])
		.map((t) => `${' '.repeat(indent)}- ${t}`)
		.join('\n');
}

/** sources 列表 → YAML 序列（无来源时返回空串，不生成 example.com 假来源） */
function yamlSources(sources) {
	if (!sources || !sources.length) return '';
	return sources
		.map((s) => `  - title: ${yaml(s.title)}\n    url: ${yaml(s.url)}`)
		.join('\n');
}

/** sources 完整块（含 sources: 头；无来源时返回空串，避免空 sources 触发 schema 校验） */
function sourcesBlock(sources) {
	const body = yamlSources(sources);
	return body ? `sources:\n${body}` : '';
}

let created = 0;

for (const p of targets) {
	const file = join(OUT_DIR, `${p.slug}.md`);
	const types = p.proxyTypes || [];
	const protocols = p.protocols || [];
	const auth = p.authentication || [];
	const pricing = p.pricingModels || [];
	const regions = Array.isArray(p.regions) ? p.regions.join('、') : p.regions || '';
	const isCn = (p.regionServed || []).includes('cn');
	const disabled =
		p.status === 'inactive'
			? '本服务商已停止（或停止提供）代理 IP 服务，本页保留作为历史参考；请以其他在营服务商为准。'
			: '资料整理自服务商官方公开页面，可能随服务商调整而变化，实际能力以官方当前页面为准。';

	const content = `---
title: ${p.name} 代理服务情况与使用参考
description: 面向 ${isCn ? '国内' : '全球'}用户的 ${p.name} 代理服务资料整理：提供 ${
		types.join('、') || '待核实'
	} 代理，覆盖 ${regions || '多地区'}，支持 ${
		protocols.join('、') || '待核实'
	}。资料源于官方公开信息。
pageType: providers
provider: ${p.name}
status: ${p.status}
officialUrl: ${p.officialUrl ? yaml(p.officialUrl) : yaml('待核实')}
proxyTypes:
${yamlList(types)}
protocols:
${yamlList(protocols)}
authentication:
${yamlList(auth)}
pricingModels:
${yamlList(pricing)}
regions: ${yaml(regions)}
summary: ${p.name} 提供 ${types.join('/') || '多类'}代理，主要面向${
		(p.targetUsers || []).join('、') || '待核实的用户群体'
	}，覆盖 ${regions || '待核实'}；本文基于官方公开资料整理，具体能力以官方页面为准。
takeaway: ${p.name} 是否适合你的场景，需结合覆盖区域、认证方式与计费模式综合判断；具体以下单页面为准。
author: EasyBR 团队
updatedAt: ${p.updatedAt || '2026-08-08'}
disclosure: ${disabled}
${sourcesBlock(p.sourceUrls)}
---

> ${disabled}

## 一句话结论

${p.name} 是面向${isCn ? '国内' : '全球'}用户的${types.includes('residential') ? '住宅' : '数据中心'}代理服务商${
		types.includes('static-residential') ? '，并有静态住宅产品线' : ''
	}${
		regions ? `，覆盖 ${regions}` : ''
	}。资料基于官方公开页面整理，未做主观评分。

## 基本信息

- 官网：${p.officialUrl || '待核实'}
- 更新日期：${p.updatedAt || '2026-08-08'}
- 状态：${p.status === 'inactive' ? '已停止服务（历史条目）' : '在营（根据公开资料整理）'}

## 提供哪些代理产品

${types.length ? types.map((t) => `- ${t}`).join('\n') : '- 待核实'}

## 覆盖区域

${regions || '待核实，以官方页面为准'}

## 认证和连接方式

${auth.length ? auth.map((a) => `- ${a}`).join('\n') : '- 待核实'}

## 计费方式

${pricing.length ? pricing.map((t) => `- ${t}`).join('\n') : '官方未公开，或需登录后台查看；无证据不写具体价格。'}

## 主要优点

- 官方公开资料中的能力描述以官方页面为准；本页不做主观评分与夸大宣称。

## 需要注意的限制

- 限制信息以官方说明为准；使用前建议阅读服务条款与适用地区说明。

## 官方入口与文档

- 官网入口：${p.officialUrl || '待核实'}
${(p.sourceUrls || []).map((s) => `- ${s.title}：${s.url}`).join('\n')}

## 信息来源

${(p.sourceUrls || []).map((s) => `- ${s.title}（${s.url}）`).join('\n') || '- 暂无外部来源记录'}

## 同类服务商

可在本栏目浏览其他服务商对比（仅链已发布页面）。

## 使用代理的配套工具

EasyBR 指纹浏览器支持 HTTP/HTTPS/SOCKS5 代理配置，可将本页列出的代理按其认证方式配置后使用；更多说明见「EasyBR 工具」栏目。
`;

	writeFileSync(file, content);
	console.log(`生成 ${p.slug}.md（status=${p.status}）`);
	created++;
}

console.log(`\n生成 ${created} 篇正式页面（目标 ${targets.length}）`);
