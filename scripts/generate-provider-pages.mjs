/**
 * generate-provider-pages.mjs — 由 providers.json 批量生成供应商文章占位
 *
 * 为 src/data/providers.json 中每个尚无文章的供应商创建 providers/<slug>.md 占位，
 * frontmatter 用虚构数据预填、正文标注待核实。已存在的文章不会覆盖。
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
	const file = join(OUT_DIR, `${p.slug}.md`);
	if (existsSync(file)) {
		skipped++;
		continue;
	}
	const types = (p.proxyTypes || []).map((t) => `  - ${t}`).join('\n');
	const auth = (p.authentication || []).map((a) => `  - ${a}`).join('\n');
	const content = `---
title: ${p.name} 代理导入 EasyBR 教程
description: 在 EasyBR 中添加 ${p.name} 代理的完整步骤：注册购买、获取 host:port 参数、配置 HTTP/SOCKS5、批量导入与常见错误排查（待核实补写）。
pageType: providers
provider: ${p.name}
providerUrl: ${p.url || '待核实'}
supportedProxyTypes:
${types}
authentication:
${auth}
regions: 待核实
supportsApi: ${p.supportsApi ?? false}
supportsWhitelist: ${p.supportsWhitelist ?? false}
officialDocs: 待核实
verified: false
summary: ${p.name} 代理导入 EasyBR 的使用说明（待撰写）。
takeaway: 待撰写
author: EasyBR 团队
updatedAt: 2026-08-08
disclosure: 本篇为教程占位，参数为虚构示例；实际套餐与接口以服务商官方页面为准，资料核实后请填写 lastVerified。
---

> 教程待撰写。核实 ${p.name} 官方资料后，参考 [NetNut 教程](../netnut/) 的 13 段结构完成本文，并设置 \`lastVerified\` 与 \`verified: true\`。
`;
	writeFileSync(file, content);
	created++;
}

console.log(`生成 ${created} 篇，跳过已有 ${skipped} 篇（目标 ${targets.length}）`);
if (created === 0 && skipped === 0) console.warn('未匹配任何供应商，请检查 slug 或 providers.json');