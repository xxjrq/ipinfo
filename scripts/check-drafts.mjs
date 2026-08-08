/**
 * check-drafts.mjs — 草稿/发布不变量校验
 *
 * 生产构建通过文件名排除草稿（docsLoader 忽略 _ 前缀文件），本脚本强制两条不变量：
 *   1. 文件名以 _ 开头的文件，frontmatter 必须携带 isDraft: true（语义一致）
 *   2. 存在 isDraft: true 但文件名不以 _ 开头 → 该文件会被构建并公开，必须报错
 *   3. 非草稿文件（生产页）正文与 description 不得含占位短语（内容建设中/教程待撰写）
 *
 * 违反任意一条 → 退出码 1。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import matter from 'gray-matter';

const DOCS_DIR = join(process.cwd(), 'src/content/docs');
const PLACEHOLDER = /内容建设中|教程待撰写/;
const errors = [];

function collect(dir) {
	const files = [];
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) files.push(...collect(p));
		else if (name.endsWith('.md')) files.push(p);
	}
	return files;
}

for (const file of collect(DOCS_DIR)) {
	const { data, content } = matter(readFileSync(file, 'utf8'));
	const name = basename(file);
	const isDraftFile = name.startsWith('_');
	const isDraftFlag = data.isDraft === true;
	const rel = relative(process.cwd(), file);

	if (isDraftFile && !isDraftFlag) {
		errors.push(`${rel}: 文件名 _ 前缀表示草稿，但 frontmatter 缺少 isDraft: true`);
	}
	if (!isDraftFile && isDraftFlag) {
		errors.push(`${rel}: isDraft: true 但文件名无 _ 前缀，会被生产构建公开，请重命名为 _ 前缀`);
	}
	if (!isDraftFile) {
		if (PLACEHOLDER.test(content) || PLACEHOLDER.test(data.description || '')) {
			errors.push(`${rel}: 生产页面正文/description 含占位短语（${PLACEHOLDER}）`);
		}
	}
}

for (const e of errors) console.error(`   ✗ ${e}`);
console.log(`\n结果：${errors.length} 错误`);
if (errors.length) process.exit(1);
