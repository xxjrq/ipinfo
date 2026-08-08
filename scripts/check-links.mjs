/**
 * check-links.mjs — 构建产物内链检查
 *
 * 遍历 dist 目录下的 .html 文件，提取内部链接（href/src，含 a[href]、img[src]、link[href]），
 * 校验目标文件是否存在于 dist。外部链接、锚点、mailto、data/javascript 跳过。
 *
 * 用法：npm run build 之后执行 npm run links（或 npm run ci 一并执行）
 */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, dirname, extname, normalize } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const base = process.env.BASE_PATH || '/';

function walk(dir) {
	const out = [];
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		const st = statSync(p);
		if (st.isDirectory()) out.push(...walk(p));
		else if (st.isFile() && (p.endsWith('.html') || p.endsWith('.xml'))) out.push(p);
	}
	return out;
}

function existsAsFile(p) {
	try {
		return statSync(p).isFile();
	} catch {
		return false;
	}
}

/** 返回应存在的候选绝对路径列表（目录 → 补 index.html） */
function candidatePaths(pageFile, href) {
	const clean = href.split('#')[0].split('?')[0];
	if (!clean) return [];
	if (/^(?:[a-z]+:|mailto:|tel:|data:|javascript:|\/\/)/i.test(clean)) return [];
	const rootRelative = clean.startsWith(base) || clean.startsWith('/');
	let path = clean.startsWith(base) ? clean.slice(base.length) : clean;
	if (!path) return [];
	let absolute;
	if (rootRelative) {
		absolute = join(DIST, path.replace(/^\//, ''));
	} else {
		absolute = normalize(join(dirname(pageFile), path));
	}
	const out = [absolute];
	if (extname(absolute) === '') out.push(join(absolute, 'index.html'));
	return out;
}

const pages = walk(DIST).filter((p) => p.endsWith('.html'));
const broken = [];

for (const page of pages) {
	const html = readFileSync(page, 'utf8');
	const relPage = page.replace(DIST + '/', '');
	const re = /(?:href|src)\s*=\s*["']([^"']+)["']/g;
	let m;
	while ((m = re.exec(html)) !== null) {
		const href = m[1];
		if (!href || href.startsWith('#')) continue;
		const candidates = candidatePaths(page, href);
		if (candidates.length === 0) continue;
		if (!candidates.some((c) => existsAsFile(c))) {
			broken.push(`${relPage} → ${href}`);
		}
	}
}

if (broken.length) {
	console.error(`发现 ${broken.length} 个失效内链:`);
	for (const b of broken) console.error(`   ✗ ${b}`);
	process.exit(1);
}
console.log(`✓ 内链检查通过（${pages.length} 个页面）`);