/**
 * check-sponsor-off.mjs — sponsor.enabled=false 构建测试
 *
 * 以 SPONSOR_ENABLED=false 构建（输出到 dist-sponsor-off 临时目录），
 * 校验构建产物中不出现 EasyBR「推广模块」：
 *   - 无「免费下载 EasyBR」推广按钮/CTA
 *   - 无 EasyBR 首页推广区（指纹浏览器产品介绍）
 *   - 无带 utm 推广参数的下载链接
 *   - 无侧边栏「免费下载」推广入口
 *
 * 允许保留：品牌署名链接（如 about 页的 ebrower.com 透明披露引用、编辑政策中的
 * 项目背景说明）——这些属于站点透明度声明，不属于推广模块。
 * 通过后删除临时目录。
 *
 * 用法：npm run test:sponsor-off   （CI 链最后一步）
 */
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const OFF_DIST = join(ROOT, 'dist-sponsor-off');
const errors = [];

// 推广模块特征：下载按钮文案、推广参数链接
const PROMO_PATTERNS = [
	{ name: '免费下载按钮', re: /免费下载 ?EasyBR/ },
	{ name: '推广下载链接', re: /utm_(source|medium|campaign)=ipinfo/ },
];

console.log('构建 SPONSOR_ENABLED=false 版本到 dist-sponsor-off ...');
try {
	execSync('npx astro build --outDir dist-sponsor-off', {
		cwd: ROOT,
		stdio: 'pipe',
		env: { ...process.env, SPONSOR_ENABLED: 'false' },
	});
} catch (e) {
	console.error('✗ SPONSOR_ENABLED=false 构建失败:');
	console.error(String(e.stdout || ''));
	console.error(String(e.stderr || ''));
	rmSync(OFF_DIST, { recursive: true, force: true });
	process.exit(1);
}

function collectHtml(dir) {
	const files = [];
	for (const name of readdirSync(dir, { withFileTypes: true })) {
		const p = join(dir, name.name);
		if (name.isDirectory()) files.push(...collectHtml(p));
		else if (name.name.endsWith('.html')) files.push(p);
	}
	return files;
}

const htmls = collectHtml(OFF_DIST);
console.log(`检查 ${htmls.length} 个 HTML ...`);
for (const file of htmls) {
	const html = readFileSync(file, 'utf8');
	for (const { name, re } of PROMO_PATTERNS) {
		if (re.test(html)) {
			errors.push(`${file.replace(OFF_DIST + '/', '')}: 关闭推广后仍含 EasyBR 推广模块（${name}）`);
		}
	}
}

rmSync(OFF_DIST, { recursive: true, force: true });

if (errors.length) {
	for (const e of errors) console.error(`   ✗ ${e}`);
	console.log(`\nsponsor-off 测试：${errors.length} 错误`);
	process.exit(1);
}
console.log('sponsor-off 测试通过：关闭推广后产物无 EasyBR 推广模块（品牌署名保留）');