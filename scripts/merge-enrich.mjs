/**
 * merge-enrich.mjs — 合并 scripts/enrich/batches/batchN.json 的内容富化补丁到 providers.json
 *
 * 每个补丁条目: { slug: { suitableFor[], limitations[], features[], regions[], related[] } }
 * 只覆盖存在的字段；缺失字段不覆盖 providers.json 原值。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DATA_FILE = join(ROOT, 'src/data/providers.json');
const BATCH_DIR = join(ROOT, 'scripts/enrich/batches');

const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
const bySlug = new Map(data.providers.map((p) => [p.slug, p]));

let merged = 0;
let skipped = [];

for (let i = 1; i <= 4; i++) {
	const f = join(BATCH_DIR, `batch${i}.json`);
	let patch;
	try {
		patch = JSON.parse(readFileSync(f, 'utf8'));
	} catch (e) {
		console.error(`   ✗ 读取 ${f} 失败: ${e.message}`);
		process.exit(1);
	}
	for (const [slug, eff] of Object.entries(patch)) {
		const p = bySlug.get(slug);
		if (!p) {
			skipped.push(slug);
			continue;
		}
		for (const field of ['suitableFor', 'limitations', 'features', 'regions', 'related']) {
			if (Array.isArray(eff[field])) p[field] = eff[field];
		}
		merged++;
	}
}

// 统一 updatedAt 与 note
data.updatedAt = '2026-08-09';
data.note =
	'服务商状态机：draft（默认，未人工核实）→ published（已完成内容整理并发布）→ outdated（信息过期）/ inactive（停止运营）。旧字段（verified/providerUrl/supportedProxyTypes/lastVerified/officialDocs）已废弃。';

writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n');
console.log(`合并完成：${merged} 条目已更新；跳过未匹配 ${skipped.length}（${skipped.join(', ')}）`);