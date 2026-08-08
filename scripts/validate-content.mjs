/**
 * validate-content.mjs — 内容质量校验
 *
 * 校验 src/content/docs 目录下的 .md 文件 的 frontmatter 与正文结构性要求。
 * 供本地（npm run validate）与 CI（npm run ci）使用：
 *   - title/description 必填，description 长度 50~170
 *   - lastVerified/updatedAt 必须是合法日期且不晚于今天
 *   - 供应商文章必须携带 provider 相关字段
 *   - 正文 H1 数量（Starlight 以 frontmatter title 渲染 H1，正文不应重复）
 *   - 代码块禁止出现疑似公网 IP:port 凭证；user/password 赋值应为 demo 虚构
 *   - 供应商 JSON 与供应商文档一致性
 * 违反规则 → 退出码 1；警告不影响退出码。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname, normalize } from 'node:path';
import matter from 'gray-matter';

const DOCS_DIR = join(process.cwd(), 'src/content/docs');
const PROVIDERS_JSON = join(process.cwd(), 'src/data/providers.json');

const REAL_IP_PORT = /\b(\d{1,3}\.){3}\d{1,3}:\d{2,5}\b/g;
const CRED_ASSIGN = /(?:user|username|password)\s*[:=]\s*([^\s,"']+)/gi;
const PRIVATE_IP_PREFIX = ['192.168.', '10.', '127.', '0.0.0.0'];

const errors = [];
const warnings = [];

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

function validateFile(file) {
	const raw = readFileSync(file, 'utf8');
	const { data, content } = matter(raw);

	const section = file.replace(DOCS_DIR + '/', '').split('/')[0];
	const pageType = data.pageType || section;

	// 1. title 必填
	if (!data.title) errors.push(`${rel(file)}: 缺少 title`);

	// 2. description 存在且长度合理（SEO 50~170）
	if (!data.description) {
		errors.push(`${rel(file)}: 缺少 description`);
	} else if (data.description.length < 50 || data.description.length > 170) {
		warnings.push(`${rel(file)}: description 长度 ${data.description.length}（建议 50~170）`);
	}

	// 3. 日期字段合法性（lastVerified 必填于供应商文章）
	for (const key of ['lastVerified', 'updatedAt']) {
		if (data[key]) {
			const d = new Date(data[key]);
			if (Number.isNaN(d.getTime())) {
				errors.push(`${rel(file)}: ${key} 不是合法日期 (${data[key]})`);
			} else if (d.getTime() > Date.now() + 86400000) {
				errors.push(`${rel(file)}: ${key} 疑似未来日期 (${data[key]})`);
			}
		}
	}

	// 4. 供应商文章完整性（verified:false 表示占位/待核实，允许缺 lastVerified）
	if (pageType === 'providers' || section === 'providers') {
		const required = ['provider', 'providerUrl', 'supportedProxyTypes', 'authentication', 'disclosure'];
		for (const field of required) {
			if (!data[field]) errors.push(`${rel(file)}: 供应商文章缺少 ${field}`);
		}
		if (data.verified === false) {
			warnings.push(`${rel(file)}: 供应商文章处于待核实占位状态（verified:false），发布前需核实并填写 lastVerified`);
		} else if (!data.lastVerified) {
			errors.push(`${rel(file)}: 供应商文章缺少 lastVerified（核实日期）`);
		}
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

	// 7. provider 字段禁含第三方品牌词
	if (data.provider && FORBIDDEN_BRAND.some((w) => data.provider.includes(w))) {
		errors.push(`${rel(file)}: provider 字段含禁止品牌词`);
	}

	// 8. 相对 markdown 内链存在性
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

const FORBIDDEN_BRAND = ['花漾', '花漾指纹', 'szdamai'];

function existsAsFile(p) {
	try {
		return statSync(p).isFile();
	} catch {
		return false;
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

// 供应商 JSON 与供应商文档一致性
try {
	const { providers } = JSON.parse(readFileSync(PROVIDERS_JSON, 'utf8'));
	const providerPages = new Set(
		readdirSync(join(DOCS_DIR, 'providers'))
			.filter((f) => f.endsWith('.md'))
			.map((f) => f.replace(/\.md$/, ''))
	);
	for (const p of providers) {
		if (!providerPages.has(p.slug)) {
			warnings.push(`providers.json 中「${p.name}」缺少对应文档 providers/${p.slug}.md（可用 npm run gen:providers 生成）`);
		}
	}
} catch (e) {
	warnings.push(`providers.json 读取失败: ${e.message}`);
}

for (const w of warnings) console.warn(`   ⚠ ${w}`);
for (const e of errors) console.error(`   ✗ ${e}`);

console.log(`\n结果：${errors.length} 错误，${warnings.length} 警告`);
if (errors.length) process.exit(1);