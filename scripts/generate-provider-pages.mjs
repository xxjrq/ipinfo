/**
 * generate-provider-pages.mjs — 由 providers.json 批量生成服务商文章（providers/<slug>.md）
 *
 * 与历史草稿生成器不同，本版本按最终数据生成正式页面（与 src/data/providers.json 对齐）：
 *   - status 取自数据文件（published / inactive / outdated），不做草稿
 *   - 覆盖式生成：已存在的同名文件会被重新生成
 *   - frontmatter 严格匹配 src/content.config.ts 的 docs 集合 schema
 *     （sources 数组 / regions 字符串 / updatedAt 日期，无 features 等扩展字段）
 *   - 正文按 providers.json 的 suitableFor/limitations/features/related 渲染
 *     「适合人群 / 需要注意的限制 / 主要特点 / 同类服务商」小节
 *   - regions 为空时使用「覆盖多个国家和地区，具体以官网当前列表为准」，避免“待核实”占位
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

/** regions 容错：数组→顿号字符串；空/待核实 → 中性表述 */
function regionText(regions) {
	const raw = Array.isArray(regions) ? regions.join('、') : regions || '';
	const cleaned = raw.replace(/待核实/g, '').trim();
	return cleaned || '多个国家和地区（具体以官网当前列表为准）';
}

/** 相关的 slug → 列表（跳过自身、缺失、非 published？保留历史链接） */
function relatedSlugs(provider, all) {
	const rel = provider.related || [];
	// 只在全集中存在且非自身，最多取 4 个避免过长
	return rel.filter((s) => s && s !== provider.slug && all.some((x) => x === s)).slice(0, 4);
}

const allBySlug = new Map(providers.map((p) => [p.slug, p]));

let created = 0;

for (const p of targets) {
	const file = join(OUT_DIR, `${p.slug}.md`);
	const types = p.proxyTypes || [];
	const protocols = p.protocols || [];
	const auth = p.authentication || [];
	const pricing = p.pricingModels || [];
	const regions = regionText(p.regions);
	const suitable = p.suitableFor || [];
	const limits = p.limitations || [];
	const features = p.features || [];
	const isCn = (p.regionServed || []).includes('cn');
const disabled =
		p.status === 'inactive'
			? '本服务商已停止（或停止提供）代理 IP 服务，本页保留作为历史记录；请以其他在营服务商为准。'
			: '资料整理自服务商官方公开页面，可能随服务商调整而变化，实际能力以官方当前页面为准。';
	// inactive 停运历史页：移出侧边栏导航（仅保留直链访问），避免误导为在营服务商
	const sidebarHidden = p.status === 'inactive' ? 'sidebar:\n  hidden: true\n' : '';

	const related = relatedSlugs(p, providers.map((x) => x.slug));

	const relatedSection = related.length
		? related
				.map((s) => {
					const rp = allBySlug.get(s);
					return rp ? `- [${rp.name}](../${s}/)` : '';
				})
				.filter(Boolean)
				.join('\n')
		: '可在本栏目浏览其他服务商对比（仅链接已发布页面）。';

	const content = `---
title: ${p.name} 代理服务情况与使用参考
description: 面向 ${isCn ? '国内' : '全球'}用户的 ${p.name} 代理服务资料整理：提供 ${
		types.join('、') || '多类'
	} 代理，覆盖 ${regions}，支持 ${
		protocols.join('、') || '多种协议'
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
		(p.targetUsers || []).join('、') || '各类用户'
	}，覆盖 ${regions}；本文基于官方公开资料整理，具体能力以官方页面为准。
takeaway: ${p.name} 是否适合你的场景，需结合覆盖区域、认证方式与计费模式综合判断；具体以下单页面为准。
author: EasyBR 团队
updatedAt: ${p.updatedAt || '2026-08-08'}
disclosure: ${disabled}
${sidebarHidden}${sourcesBlock(p.sourceUrls)}
---

> ${disabled}

## 一句话结论

${p.name} 是面向${isCn ? '国内' : '全球'}用户的${
		types.includes('residential') ? '住宅' : '数据中心'
	}代理服务商${
		types.includes('static-residential') ? '，并有静态住宅产品线' : ''
	}${regions ? `，覆盖 ${regions}` : ''}。资料基于官方公开页面整理，未做主观评分。

## 基本信息

- 官网：${p.officialUrl || '未公开（以官方页面为准）'}
- 更新日期：${p.updatedAt || '2026-08-08'}
- 状态：${p.status === 'inactive' ? '已停止（历史记录）' : '在营（根据公开资料整理）'}

## 提供哪些代理产品

${types.length ? types.map((t) => `- ${t}`).join('\n') : '- 以官方公开资料为准'}

## 覆盖区域

${regions}

## 认证和连接方式

${auth.length ? auth.map((a) => `- ${a}`).join('\n') : '- 以官方公开资料为准'}

## 计费方式

${pricing.length ? pricing.map((t) => `- ${t}`).join('\n') : '官方未公开详细价格，以服务商页面为准。'}

## 适合哪些用户

${suitable.length ? suitable.map((s) => `- ${s}`).join('\n') : '- 以官方公开能力为准'}

## 主要特点

${features.length ? features.map((f) => `- ${f}`).join('\n') : '- 以官方公开能力为准'}

## 需要注意的限制

${limits.length ? limits.map((l) => `- ${l}`).join('\n') : '- 具体限制以官方当前说明为准'}

## 官方入口与文档

- 官网入口：${p.officialUrl || '未公开（以官方页面为准）'}
${(p.sourceUrls || []).map((s) => `- ${s.title}：${s.url}`).join('\n')}

## 信息来源

${(p.sourceUrls || []).map((s) => `- ${s.title}（${s.url}）`).join('\n') || '- 暂无外部来源记录'}

## 同类服务商

${relatedSection}

## 使用代理的配套工具

EasyBR 指纹浏览器支持 HTTP/HTTPS/SOCKS5 代理配置，可将本页列出的代理按其认证方式配置后使用；更多说明见「EasyBR 工具」栏目。
`;

	writeFileSync(file, content);
	console.log(`生成 ${p.slug}.md（status=${p.status}）`);
	created++;
}

console.log(`\n生成 ${created} 篇正式页面（目标 ${targets.length}）`);