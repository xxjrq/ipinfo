/**
 * check-dist.mjs — 构建产物（dist）验收检查
 *
 * 检查项：
 *   1. 关键 URL 均生成（首页 + 栏目根 + 编辑政策）
 *   2. 每个页面 HTML：恰好 1 个 H1、存在唯一 title、存在 description、存在 canonical
 *   3. robots.txt 非模板（无 YOUR_USERNAME）、含正确 Sitemap
 *   4. llms.txt 中所有站点 URL 在 dist 中真实存在
 *   5. sitemap 中所有 URL 在 dist 中真实存在（无死链）
 *   6. 所有 HTML 不含占位短语（内容建设中/教程待撰写）
 *   7. 品牌残留（花漾/szdamai）零出现
 *   8. 公开数据文件存在且格式正确（providers.json 带包裹结构 / providers.csv 同范围）
 *   9. dist 中不存在 draft 服务商页面（草稿被排除出构建）
 *
 * 依赖 SITE_URL / BASE_PATH 环境变量（与构建一致）。
 * 违反任意一条 → 退出码 1。
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const SITE_URL = process.env.SITE_URL || 'https://example.github.io';
const BASE_PATH = process.env.BASE_PATH || '/';
const siteBase = SITE_URL + BASE_PATH.replace(/\/$/, '');
const PLACEHOLDER = /内容建设中|教程待撰写/;
const FORBIDDEN_BRAND = ['花漾', '花漾指纹', 'szdamai'];

const errors = [];

const KEY_URLS = [
	'/',
	'/basics/',
	'/proxy-types/',
	'/use-cases/',
	'/providers/',
	'/easybr/',
	'/comparisons/',
	'/troubleshooting/',
	'/faq/',
	'/about/editorial-policy/',
	'/about/how-we-review/',
	'/about/affiliate-disclosure/',
	'/about/corrections/',
];

function urlToDistPath(url) {
	// 站点 URL = SITE_URL + BASE_PATH + 页面路径；dist 产物位于 base 根目录
	let p = url.replace(SITE_URL, '');
	const baseNoSlash = BASE_PATH.replace(/\/$/, '');
	if (baseNoSlash && p.startsWith(baseNoSlash)) p = p.slice(baseNoSlash.length);
	p = p.replace(/^\/+/, '');
	if (!p) return join(DIST, 'index.html');
	if (p.endsWith('/')) return join(DIST, p, 'index.html');
	return join(DIST, p);
}

function collectHtml(dir) {
	const files = [];
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) files.push(...collectHtml(p));
		else if (name.endsWith('.html')) files.push(p);
	}
	return files;
}

// 1. 关键 URL
for (const u of KEY_URLS) {
	const full = SITE_URL + BASE_PATH.replace(/\/$/, '') + u;
	if (!existsSync(urlToDistPath(full))) errors.push(`关键 URL 未生成: ${full}`);
}

// 2. 页面级 HTML 检查
for (const file of collectHtml(DIST)) {
	if (file.endsWith('404.html')) continue;
	const html = readFileSync(file, 'utf8');
	const rel = file.replace(DIST + '/', '');

	if (PLACEHOLDER.test(html)) errors.push(`${rel}: 产物 HTML 含占位短语`);

	const brandHit = FORBIDDEN_BRAND.filter((w) => html.includes(w));
	if (brandHit.length) errors.push(`${rel}: 产物 HTML 含禁止品牌残留（${brandHit.join('、')}）`);

	const h1s = html.match(/<h1[\s>]/g) || [];
	if (h1s.length !== 1) errors.push(`${rel}: H1 数量 ${h1s.length}（应为 1）`);

	const title = html.match(/<title>([^<]*)<\/title>/);
	if (!title || !title[1].trim()) errors.push(`${rel}: 缺少 title`);
	else if (title[1].includes(title[1].trim()) && (title[1].match(/\|/g) || []).length > 1) {
		errors.push(`${rel}: title 疑似品牌重复: ${title[1].trim()}`);
	}

	if (!/<meta name="description" content="[^"]+"/.test(html)) {
		errors.push(`${rel}: 缺少 meta description`);
	}

	const canon = html.match(/<link rel="canonical" href="([^"]+)"/);
	if (!canon) errors.push(`${rel}: 缺少 canonical`);
	else if (!canon[1].startsWith(siteBase)) {
		errors.push(`${rel}: canonical 前缀错误: ${canon[1]}（期望 ${siteBase}）`);
	}
}

// 3. robots.txt
const robotsPath = join(DIST, 'robots.txt');
if (!existsSync(robotsPath)) {
	errors.push('dist 缺少 robots.txt');
} else {
	const robots = readFileSync(robotsPath, 'utf8');
	if (robots.includes('YOUR_USERNAME')) errors.push('robots.txt 仍是模板（含 YOUR_USERNAME）');
	if (!robots.includes(`Sitemap: ${siteBase}/sitemap-index.xml`)) {
		errors.push(`robots.txt 缺少正确的 Sitemap 声明`);
	}
}

// 4. llms.txt URL 存在性
const llmsPath = join(DIST, 'llms.txt');
if (!existsSync(llmsPath)) {
	errors.push('dist 缺少 llms.txt');
} else {
	const llms = readFileSync(llmsPath, 'utf8');
	for (const m of llms.matchAll(/https:\/\/[^\s)]+/g)) {
		const url = m[0].replace(/[),.;。]$/, '');
		const pathPart = url.replace(new RegExp('^' + SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), '');
		if (!pathPart.startsWith(BASE_PATH)) continue;
		if (!existsSync(urlToDistPath(pathPart))) errors.push(`llms.txt 死链: ${url}`);
	}
}

// 5. sitemap URL 存在性
const sitemapFiles = readdirSync(DIST).filter((f) => f.startsWith('sitemap') && f.endsWith('.xml'));
for (const sf of sitemapFiles) {
	const xml = readFileSync(join(DIST, sf), 'utf8');
	for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
		const url = m[1];
		const pathPart = url.replace(new RegExp('^' + SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), '');
		if (!existsSync(urlToDistPath(pathPart))) errors.push(`sitemap(${sf}) 死链: ${url}`);
	}
}

// 6. 公开数据文件存在且格式正确
const dataJsonPath = join(DIST, 'data/providers.json');
const dataCsvPath = join(DIST, 'data/providers.csv');
if (!existsSync(dataJsonPath)) {
	errors.push('dist 缺少 data/providers.json（公开数据未导出）');
} else {
	try {
		const payload = JSON.parse(readFileSync(dataJsonPath, 'utf8'));
		if (!payload.generatedAt || !payload.license || !payload.project || !Array.isArray(payload.providers)) {
			errors.push('data/providers.json 结构不符合规范（缺 generatedAt/license/project/providers）');
		}
		for (const p of payload.providers) {
			if (p.status !== 'published') errors.push(`data/providers.json: 「${p.name}」含非 published 条目（公开数据只允许 published）`);
			if (!p.slug || !p.officialUrl) errors.push(`data/providers.json: 「${p.name}」缺 slug/officialUrl`);
		}
	} catch (e) {
		errors.push(`data/providers.json 解析失败: ${e.message}`);
	}
}
if (!existsSync(dataCsvPath)) {
	errors.push('dist 缺少 data/providers.csv（公开数据未导出）');
} else {
	const csv = readFileSync(dataCsvPath, 'utf8');
	const csvRows = csv.trim().split('\n');
	if (csvRows.length < 1 || !csvRows[0]) errors.push('data/providers.csv 缺少表头');
	// 允许 0 数据行（当前无 published 服务商时为合法状态），但行数必须与 JSON 一致
	// CSV 条目与 JSON 一致：JSON providers 数 = CSV 数据行数
	const jsonCount = existsSync(dataJsonPath) ? (JSON.parse(readFileSync(dataJsonPath, 'utf8')).providers || []).length : -1;
	if (jsonCount >= 0 && csvRows.length - 1 !== jsonCount) {
		errors.push(`data/providers.csv 条目数（${csvRows.length - 1}）与 providers.json（${jsonCount}）不一致`);
	}
}

// 7. dist 中不存在 draft 服务商页面（草稿排除出构建；_ 前缀文件不产生产物，此处防御检查）
const draftSlugHits = [];
for (const p of readdirSync(join(DIST, 'providers'), { withFileTypes: true })) {
	if (p.isDirectory() && p.name.startsWith('_')) draftSlugHits.push(p.name);
}
if (draftSlugHits.length) errors.push(`dist/providers 含草稿目录（${draftSlugHits.join(', ')}）`);

for (const e of errors) console.error(`   ✗ ${e}`);
console.log(`\n结果：${errors.length} 错误`);
if (errors.length) process.exit(1);
