/**
 * validate-content.mjs — 内容质量校验（开源资源库 CI 防线）
 *
 * 校验 src/content/docs 目录下的 .md 文件 frontmatter 与正文结构性要求。
 * 供本地（npm run validate）与 CI（npm run ci）使用：
 *   1. title/description 必填，description 长度 50~170
 *   2. updatedAt 合法日期且不晚于今天
 *   3. 供应商文章必须携带 provider/slug/status/officialUrl/proxyTypes/authentication/sources/disclosure
 *   4. 正文 H1 数量（Starlight 以 frontmatter title 渲染 H1，正文不应重复）
 *   5. 代码块禁止出现疑似公网 IP:port 凭证；user/password 赋值应为 demo 虚构
 *   6. 全文真实凭证泄漏扫描（IP:port:user:pass 四段式，生产模式命中即错）
 *   7. 旧字段零出现：verified/providerUrl/supportedProxyTypes/lastVerified/officialDocs/supportsApi/supportsWhitelist
 *   8. 服务商数据状态机校验：draft/published/outdated/inactive，published 必须 updatedAt + sources
 *   9. providers.json 自身校验：slug/name 全局唯一、status 在枚举内、published 必须 sourceUrls + updatedAt
 *  10. 供应商文章 frontmatter 与 providers.json 一致性（slug/provider/status 对齐，数据层是唯一事实源）
 *  11. 禁止品牌残留（花漾/szdamai）
 *  12. 相对 markdown 内链存在性
 * 违反规则 → 退出码 1；警告不影响退出码。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname, normalize, basename } from 'node:path';
import matter from 'gray-matter';

const DOCS_DIR = join(process.cwd(), 'src/content/docs');
const PROVIDERS_JSON = join(process.cwd(), 'src/data/providers.json');

/** 生产模式：ALLOW_DRAFTS 未设为 true 时，未核验/占位内容直接判错 */
const PROD = process.env.ALLOW_DRAFTS !== 'true';
const PLACEHOLDER = /内容建设中|教程待撰写/;

const REAL_IP_PORT = /\b(\d{1,3}\.){3}\d{1,3}:\d{2,5}\b/g;
const CRED_ASSIGN = /(?:user|username|password)\s*[:=]\s*([^\s,"']+)/gi;
// IP:port:user:pass 完整凭证形态（如 1.2.3.4:8080:alice:p@ss），命中即视为真实凭证泄漏
const REAL_CREDENTIAL = /\b\d{1,3}(\.\d{1,3}){3}:\d{2,5}:[^\s:]+:[^\s:]+/g;
const PRIVATE_IP_PREFIX = ['192.168.', '10.', '127.', '0.0.0.0'];

// 服务商状态机枚举（与 src/data/providers.schema.json 保持一致）
const PROVIDER_STATUS_ENUM = ['draft', 'published', 'outdated', 'inactive'];

// 已废弃旧字段（出现即 CI 失败）
const LEGACY_FIELDS = [
	'verified',
	'providerUrl',
	'supportedProxyTypes',
	'lastVerified',
	'officialDocs',
	'supportsApi',
	'supportsWhitelist',
];

// 禁止品牌残留（第三方指纹浏览器/代理平台）
const FORBIDDEN_BRAND = ['花漾', '花漾指纹', 'szdamai'];

const errors = [];
const warnings = [];

/** 服务商数据缓存（懒加载自 src/data/providers.json） */
let PROVIDERS = null;

function loadProviders() {
	if (PROVIDERS === null) {
		try {
			PROVIDERS = JSON.parse(readFileSync(PROVIDERS_JSON, 'utf8')).providers || [];
		} catch (e) {
			errors.push(`providers.json 读取失败: ${e.message}`);
			PROVIDERS = [];
		}
	}
	return PROVIDERS;
}

function rel(file) {
	return relative(process.cwd(), file);
}

function collectMarkdownFiles(dir) {
	const files = [];
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) files.push(...collectMarkdownFiles(p));
		else if (name.endsWith('.md')) files.push(p);
	}
	return files;
}

function existsAsFile(p) {
	try {
		return statSync(p).isFile();
	} catch {
		return false;
	}
}

function validateFile(file) {
	const raw = readFileSync(file, 'utf8');
	const { data, content } = matter(raw);

	const section = file.replace(DOCS_DIR + '/', '').split('/')[0];
	const pageType = data.pageType || section;
	const isDraftFile = basename(file).startsWith('_');

	// 7. 旧字段零出现
	for (const legacy of LEGACY_FIELDS) {
		if (legacy in data) {
			errors.push(`${rel(file)}: 废弃字段 ${legacy} 出现（已迁移，请改用新字段）`);
		}
	}

	// 1. title 必填
	if (!data.title) errors.push(`${rel(file)}: 缺少 title`);

	// 2. description 存在且长度合理（SEO 50~170）
	if (!data.description) {
		errors.push(`${rel(file)}: 缺少 description`);
	} else if (data.description.length < 50 || data.description.length > 170) {
		warnings.push(`${rel(file)}: description 长度 ${data.description.length}（建议 50~170）`);
	}

	// 3. updatedAt 合法性
	if (data.updatedAt) {
		const d = new Date(data.updatedAt);
		if (Number.isNaN(d.getTime())) {
			errors.push(`${rel(file)}: updatedAt 不是合法日期 (${data.updatedAt})`);
		} else if (d.getTime() > Date.now() + 86400000) {
			errors.push(`${rel(file)}: updatedAt 疑似未来日期 (${data.updatedAt})`);
		}
	}

	// 4. 供应商文章完整性（index.md 为栏目页，不适用）
	if ((pageType === 'providers' || section === 'providers') && basename(file) !== 'index.md') {
		// 注：frontmatter 不得再声明 slug —— Astro 将 slug 视为内容集合保留键，会覆盖文件路径路由；
	// 页面与数据文件的一致性改由 provider 名称匹配判定（见下方第 10 条）
	const required = ['provider', 'status', 'officialUrl', 'proxyTypes', 'authentication', 'disclosure'];
		for (const field of required) {
			if (!data[field]) errors.push(`${rel(file)}: 供应商文章缺少 ${field}`);
		}
		// 状态机约束：草稿文件必须 status=draft；生产页不得为 draft
		if (isDraftFile && data.status && data.status !== 'draft') {
			errors.push(`${rel(file)}: 草稿文件（_ 前缀）status 必须为 draft，当前为 ${data.status}`);
		}
		if (!isDraftFile && data.status === 'draft') {
			errors.push(`${rel(file)}: 生产页面 status=draft 未核实，必须先核实并改 status=published`);
		}
		// published 必须 updatedAt + sources ≥1
		if (data.status === 'published') {
			if (!data.updatedAt) errors.push(`${rel(file)}: status=published 必须填写 updatedAt`);
			if (!Array.isArray(data.sources) || data.sources.length < 1) {
				errors.push(`${rel(file)}: status=published 必须填写 sources（≥1 条来源）`);
			}
		}
	}

	// 4.5 生产页面正文/description 不得含占位短语
	if (PROD && !isDraftFile) {
		if (PLACEHOLDER.test(content) || PLACEHOLDER.test(data.description || '')) {
			errors.push(`${rel(file)}: 生产页面含占位短语（${PLACEHOLDER}）`);
		}
	}

	// 10. 供应商文章与 providers.json 一致性（页面用文件名推导 slug 匹配数据文件，不依赖展示名称）
	if ((pageType === 'providers' || section === 'providers') && basename(file) !== 'index.md') {
		const providers = loadProviders();
		// 文件名 <slug>.md → slug；不依赖 frontmatter 的 provider 展示名称（名称会变，如 Smartproxy → Decodo）
		const fileSlug = basename(file).replace(/\.md$/, '');
		const entry = providers.find((p) => p.slug === fileSlug);

		if (!entry) {
			errors.push(`${rel(file)}: 文件 ${basename(file)} 推导的 slug「${fileSlug}」在 providers.json 中无对应条目`);
		} else {
			// status 与数据文件不一致 → 报错（数据层是唯一事实源）
			if (data.status && entry.status && data.status !== entry.status) {
				errors.push(`${rel(file)}: status「${data.status}」与 providers.json 中「${entry.slug}」的「${entry.status}」不一致`);
			}
			// 文章声明 published 但数据文件不是 published → 报错
			if (data.status === 'published' && entry.status !== 'published') {
				errors.push(`${rel(file)}: 文章声明 published 但 providers.json 中「${entry.slug}」仍是「${entry.status}」，请先核实数据文件`);
			}
			// 未核验（status≠published）的已发布页面不得出现“推荐”措辞
			if (!isDraftFile && data.status && data.status !== 'published') {
				if (/推荐/.test(content)) {
					warnings.push(`${rel(file)}: 未核验（status=${data.status}）页面含“推荐”措辞，需核实后再发布或改为中性表述`);
				}
			}
		}
	}

	// 11. 禁止品牌残留（正文 + description + provider）
	if (data.provider && FORBIDDEN_BRAND.some((w) => data.provider.includes(w))) {
		errors.push(`${rel(file)}: provider 字段含禁止品牌词`);
	}
	const brandHit = FORBIDDEN_BRAND.filter((w) => content.includes(w) || (data.description || '').includes(w));
	if (brandHit.length) {
		errors.push(`${rel(file)}: 内容含禁止品牌残留（${brandHit.join('、')}）`);
	}

	// 5. 正文 H1 数量（排除代码块）
	const bodyNoFence = content.replace(/```[\s\S]*?```/g, '');
	const h1Count = bodyNoFence.split('\n').filter((l) => /^# [^#]/.test(l)).length;
	if (h1Count > 1) errors.push(`${rel(file)}: 正文 H1 数量 ${h1Count}（应为 0 或 1）`);
	else if (h1Count === 1) warnings.push(`${rel(file)}: 正文含 H1，建议使用 frontmatter title 作为唯一 H1`);

	// 6. 代码块内凭证检查
	const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).join('\n');
	const realIps = (codeBlocks.match(REAL_IP_PORT) || []).filter(
		(m) => !PRIVATE_IP_PREFIX.some((p) => m.startsWith(p))
	);
	if (realIps.length) {
		errors.push(`${rel(file)}: 代码块含疑似公网 IP:port 凭证: ${[...new Set(realIps)].slice(0, 5).join(', ')}`);
	}
	const creds = (codeBlocks.match(CRED_ASSIGN) || []).filter(
		(m) => !/demo_/i.test(m) && !/example\.com/i.test(m)
	);
	if (creds.length) {
		warnings.push(`${rel(file)}: 代码块疑似真实凭证（非 demo 前缀）: ${[...new Set(creds)].slice(0, 5).join(', ')}`);
	}

	// 6.5 全文真实凭证泄漏扫描：IP:port:user:pass 四段式（生产模式命中即报错）
	const fullCreds = (content.match(REAL_CREDENTIAL) || []).filter(
		(m) => !PRIVATE_IP_PREFIX.some((p) => m.startsWith(p))
	);
	if (fullCreds.length) {
		const msg = `${rel(file)}: 正文疑似真实代理凭证泄漏（IP:port:user:pass）: ${[...new Set(fullCreds)].slice(0, 5).join(', ')}`;
		if (PROD) errors.push(msg);
		else warnings.push(msg);
	}

	// 12. 相对 markdown 内链存在性
	const linkRe = /\[[^\]]*\]\(([^)]+)\)/g;
	let m;
	while ((m = linkRe.exec(content)) !== null) {
		const href = m[1].split(' ')[0];
		if (!href || href.startsWith('#') || href.startsWith('/') || /^[a-z]+:/i.test(href)) continue;
		if (href.endsWith('.md')) {
			const target = normalize(join(dirname(file), href));
			if (!existsAsFile(target)) {
				errors.push(`${rel(file)}: 失效内链 ${href}（→ ${relative(process.cwd(), target)}）`);
			}
		}
	}
}

// ---- 主流程 ----
const files = collectMarkdownFiles(DOCS_DIR);
if (files.length === 0) {
	console.error('未发现任何内容文件：' + DOCS_DIR);
	process.exit(1);
}

console.log(`校验 ${files.length} 篇内容...`);
for (const f of files) validateFile(f);

// ---- providers.json 自身校验（状态机、唯一性）----
try {
	const providersData = JSON.parse(readFileSync(PROVIDERS_JSON, 'utf8'));
	const providers = providersData.providers || [];

	const seenSlug = new Map();
	const seenName = new Map();
	for (const p of providers) {
		// slug 全局唯一
		if (seenSlug.has(p.slug)) {
			errors.push(`providers.json: slug「${p.slug}」重复（${seenSlug.get(p.slug)} 与 ${p.name}）`);
		} else {
			seenSlug.set(p.slug, p.name);
		}
		// name 全局唯一
		if (seenName.has(p.name)) {
			errors.push(`providers.json: name「${p.name}」重复`);
		} else {
			seenName.set(p.name, p.slug);
		}
		// status 必须在状态机枚举内
		if (!PROVIDER_STATUS_ENUM.includes(p.status)) {
			errors.push(`providers.json: 「${p.slug}」status「${p.status}」不在枚举 [${PROVIDER_STATUS_ENUM.join(', ')}] 内`);
		}
		// published 必须 updatedAt + sourceUrls ≥1 + officialUrl 合法
		if (p.status === 'published') {
			if (!p.updatedAt) errors.push(`providers.json: 「${p.slug}」status=published 必须填写 updatedAt`);
			if (!Array.isArray(p.sourceUrls) || p.sourceUrls.length < 1) {
				errors.push(`providers.json: 「${p.slug}」status=published 必须填写 sourceUrls（≥1 条）`);
			}
			if (!p.officialUrl || !/^https?:\/\//.test(p.officialUrl)) {
				errors.push(`providers.json: 「${p.slug}」status=published 必须填写合法 officialUrl`);
			}
			if (!Array.isArray(p.suitableFor) || p.suitableFor.length < 2) {
				errors.push(`providers.json: 「${p.slug}」status=published 必须填写 suitableFor（≥2 条适用场景）`);
			}
			if (!Array.isArray(p.limitations) || p.limitations.length < 1) {
				errors.push(`providers.json: 「${p.slug}」status=published 必须填写 limitations（≥1 条）`);
			}
			if (!Array.isArray(p.features) || p.features.length < 1) {
				errors.push(`providers.json: 「${p.slug}」status=published 必须填写 features（≥1 条特点）`);
			}
		}
		// 旧字段零出现
		for (const legacy of ['verified', 'providerUrl', 'supportedProxyTypes', 'lastVerified', 'officialDocs', 'supportsApi', 'supportsWhitelist', 'pricingModel']) {
			if (legacy in p) errors.push(`providers.json: 「${p.slug}」含废弃字段 ${legacy}`);
		}
	}

	// 供应商 JSON 与供应商文档一致性（数据层是唯一事实源）
	const publishedProviderPages = new Set(
		readdirSync(join(DOCS_DIR, 'providers'))
			.filter((f) => f.endsWith('.md') && !f.startsWith('_'))
			.map((f) => f.replace(/\.md$/, ''))
	);
	for (const p of providers) {
		if (p.status === 'published' && !publishedProviderPages.has(p.slug)) {
			errors.push(`providers.json: 「${p.name}」status=published 但缺少正式页面 providers/${p.slug}.md`);
		}
	}
} catch (e) {
	warnings.push(`providers.json 读取失败: ${e.message}`);
}

for (const w of warnings) console.warn(`   ⚠ ${w}`);
for (const e of errors) console.error(`   ✗ ${e}`);

console.log(`\n结果：${errors.length} 错误，${warnings.length} 警告`);
if (errors.length) process.exit(1);
