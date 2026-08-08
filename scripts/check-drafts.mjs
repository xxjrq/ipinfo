/**
 * check-drafts.mjs — 草稿/发布不变量校验
 *
 * 生产构建通过文件名排除草稿（docsLoader 忽略 _ 前缀文件），本脚本强制两条不变量：
 *   1. 文件名以 _ 开头的文件，frontmatter 必须处于草稿态：status: draft 或 isDraft: true
 *      （status 为新的状态机字段，isDraft 为迁移期兼容标记）
 *   2. 非草稿文件（无 _ 前缀）不得声明 draft 状态 / isDraft: true，否则会被构建并公开
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
	// 状态机字段：草稿态仅以显式 status: draft 判定（缺省字段 = 未声明，不视为草稿）
	const isDraftStatus = data.status === 'draft';
	const rel = relative(process.cwd(), file);

	if (isDraftFile && !isDraftFlag && !isDraftStatus) {
		errors.push(`${rel}: 文件名 _ 前缀表示草稿，但 frontmatter 未声明草稿态（需 status: draft 或 isDraft: true）`);
	}
	if (!isDraftFile && (isDraftFlag || isDraftStatus)) {
		errors.push(`${rel}: 已发布文件不得声明草稿态（status: draft / isDraft: true），会被生产构建公开，请重命名为 _ 前缀`);
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
