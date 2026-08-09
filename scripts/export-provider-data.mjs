/**
 * export-provider-data.mjs — 服务商公开数据导出
 *
 * 读取 src/data/providers.json，仅导出 status=published 的服务商，
 * 生成两个公开可消费的数据产物（字段与条目范围完全一致）：
 *   - public/data/providers.json    JSON（带 generatedAt/license/project 包裹）
 *   - public/data/providers.csv     扁平化表格（数组字段分号连接，含表头，CSV 转义正确）
 *
 * draft 保留在仓库源数据，不进入公开数据；outdated/inactive 同样排除。
 * 用法：npm run export-data   （CI 链中位于 validate/check-drafts 之后、build 之前）
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src/data/providers.json');
const OUT_DIR = join(ROOT, 'public/data');

// 公开数据标准字段（规范固定，勿随意增删）
const PUBLIC_FIELDS = [
	'name',
	'slug',
	'officialUrl',
	'description',
	'proxyTypes',
	'protocols',
	'authentication',
	'pricingModels',
	'regions',
	'features',
	'suitableFor',
	'limitations',
	'related',
	'sourceUrls',
	'updatedAt',
	'status',
];

/**
 * CSV 字段转义：含逗号/引号/换行的字段必须用双引号包裹，内部引号翻倍。
 * null/undefined 输出为空串。
 */
function csvCell(value) {
	if (value === null || value === undefined) return '';
	const text = Array.isArray(value)
		? value.map((v) => (typeof v === 'object' && v !== null ? `${v.title}: ${v.url}` : String(v))).join(';')
		: String(value);
	if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
	return text;
}

function pickPublic(provider) {
	const out = {};
	for (const f of PUBLIC_FIELDS) out[f] = provider[f] ?? (Array.isArray(provider[f]) ? [] : '');
	return out;
}

function toCsv(providers) {
	const header = PUBLIC_FIELDS.join(',');
	const rows = providers.map((p) => PUBLIC_FIELDS.map((col) => csvCell(p[col])).join(','));
	return [header, ...rows].join('\n') + '\n';
}

let raw;
try {
	raw = JSON.parse(readFileSync(SRC, 'utf8'));
} catch (e) {
	console.error(`✗ 读取/解析 providers.json 失败: ${e.message}`);
	process.exit(1);
}

const published = raw.providers.filter((p) => p.status === 'published');
const publicProviders = published.map(pickPublic);

const payload = {
	generatedAt: new Date().toISOString(),
	license: 'CC BY 4.0',
	project: 'https://github.com/xxjrq/ipinfo',
	providers: publicProviders,
};

mkdirSync(OUT_DIR, { recursive: true });

const pretty = JSON.stringify(payload, null, 2) + '\n';
const csv = toCsv(publicProviders);

writeFileSync(join(OUT_DIR, 'providers.json'), pretty, 'utf8');
writeFileSync(join(OUT_DIR, 'providers.csv'), csv, 'utf8');

console.log(`导出完成（published ${published.length} 家 / 总 ${raw.providers.length} 家）:`);
console.log(`   public/data/providers.json    ${Buffer.byteLength(pretty)} bytes`);
console.log(`   public/data/providers.csv      ${Buffer.byteLength(csv)} bytes`);
