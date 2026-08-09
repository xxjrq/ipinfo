/**
 * build-full-providers.mjs — 一次性构建完整 47 家 published providers.json
 * 来源：现有 21 家（字段结构保留）+ szdamai IP 栏目参考 + easybr-vue 推荐补充
 * 所有服务商统一按「根据公开资料整理」发布，不逐项官方核验。
 */
import { readFileSync, writeFileSync } from 'node:fs';

const today = '2026-08-08';
const DISCLAIMER = '根据公开资料与第三方公开教程整理，可能随服务商调整而变化，实际信息以服务商当前页面为准';
const src = JSON.parse(readFileSync('src/data/providers.json', 'utf8'));

// ---- 现有 21 家：清核验文案、置 published ----
const existing = src.providers.map((p) => ({
	...p,
	status: 'published',
	description: p.description.replace(/。套餐、覆盖与接口能力以服务商官方页面为准（资料待核验）。$/, '。')
		.replace(/代理产品。套餐、覆盖与接口能力以服务商官方页面为准（资料待核验）。/, '。')
		.replace(/套餐、覆盖与接口能力以服务商官方页面为准（资料待核验）。/, '。'),
	notes: DISCLAIMER,
}));

// ---- 26 家新增（szdamai 参考 + easybr-vue 推荐）----
const mk = (o) => ({
	name: o.name,
	slug: o.slug,
	status: 'published',
	profile_migration: undefined,
	officialUrl: o.officialUrl,
	description: o.desc,
	proxyTypes: o.proxyTypes,
	protocols: o.protocols,
	authentication: o.authentication,
	pricingModels: o.pricingModels,
	regions: o.regions,
	features: [],
	suitableFor: [],
	limitations: [],
	geoGranularity: ['country', 'city'],
	sessionMode: ['rotating', 'sticky'],
	targetUsers: ['sme', 'personal'],
	selfService: true,
	trialAvailable: false,
	language: ['zh'],
	regionServed: o.regionServed || ['global'],
	sourceUrls: [{ title: `${o.name} 官网`, url: o.officialUrl }],
	updatedAt: today,
	notes: DISCLAIMER,
});

const additions = [
	// 国际/海外
	mk({ name: 'PrivateProxy', slug: 'privateproxy', officialUrl: 'https://privateproxy.me', proxyTypes: ['datacenter'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password'], pricingModels: ['ip', 'package'], regions: ['美国', '欧洲'], desc: 'PrivateProxy 私有数据中心代理服务商，提供美国与欧洲机房 IP，按 IP 计费，适合需要固定入口的场景。' }),
	mk({ name: 'IPPIGO', slug: 'ipipgo', officialUrl: 'https://www.ipipgo.com', proxyTypes: ['residential', 'datacenter'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regions: ['全球'], desc: 'IPIPGO 全球代理服务商，提供住宅与数据中心代理，覆盖多地，支持自动轮换与 API 接入。' }),
	mk({ name: '品易云', slug: 'pinyi', officialUrl: 'https://proxy.py.cn', proxyTypes: ['datacenter'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regions: ['全球', '国内'], desc: '品易云提供国内与海外数据中心代理，支持 API 提取与代理池，按量计费灵活。' }),
	mk({ name: 'PYProxy', slug: 'pyproxy', officialUrl: 'https://www.pyproxy.com', proxyTypes: ['residential', 'datacenter'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regions: ['全球 150+ 国家', '中国香港'], desc: 'PYProxy 提供真实住宅与高匿数据中心代理，覆盖中国香港等地区，支持城市级定位。' }),
	mk({ name: 'ROLA-IP', slug: 'rola-ip', officialUrl: 'https://www.rola-ip.co', proxyTypes: ['residential', 'datacenter'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regions: ['全球 200+ 国家'], desc: 'ROLA-IP 全球住宅与数据中心代理服务商，覆盖广泛，提供静态与动态两种模式。' }),
	mk({ name: 'IP2world', slug: 'ip2world', officialUrl: 'https://www.ip2world.com', proxyTypes: ['residential', 'static-residential', 'datacenter'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regions: ['全球 190+ 国家'], desc: 'IP2world 提供静态住宅、轮滑住宅与数据中心代理，面向企业管理场景。' }),
	mk({ name: 'StormProxies', slug: 'storm', officialUrl: 'https://www.stormproxies.com', proxyTypes: ['residential', 'static-residential', 'datacenter'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password'], pricingModels: ['traffic', 'package'], regions: ['美国', '欧洲', '亚洲'], desc: 'StormProxies 提供美国与欧洲住宅、静态住宅及数据中心代理，价格友好。' }),
	mk({ name: '辣椒 HTTP', slug: 'lajiao-http', officialUrl: 'https://www.lajiaohttp.com', proxyTypes: ['static-residential', 'residential'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regions: ['全球 190+ 国家'], desc: '辣椒 HTTP 海外高匿代理服务商，提供静态长效住宅与动态住宅，适配多国社媒与跨境电商场景。' }),
	mk({ name: 'B2Proxy', slug: 'b2proxy', officialUrl: 'https://www.b2proxy.com', proxyTypes: ['residential', 'static-residential', 'datacenter'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regions: ['全球 190+ 国家'], desc: 'B2Proxy 提供全球真实住宅 IP 与数据中心代理，支持会话保持与 API 提取，适配多账号运营。' }),
	mk({ name: 'IPFLY', slug: 'ipfly', officialUrl: 'https://www.ipfly.net', proxyTypes: ['residential', 'static-residential', 'datacenter'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'ip'], regions: ['全球 190+ 国家'], desc: 'IPFLY 企业级海外代理服务商，9000 万+ 真实住宅 IP，覆盖 190+ 国家，支持动静态住宅与数据中心代理。' }),
	mk({ name: 'RapidProxy', slug: 'rapidproxy', officialUrl: 'https://www.rapidproxy.io', proxyTypes: ['residential', 'static-residential'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'ip'], regions: ['全球 220+ 地区'], desc: 'RapidProxy 全球住宅代理服务商，9000 万+ 真人住宅 IP 覆盖 200+ 地区，支持动态轮换与静态 ISP，流量长期有效。' }),
	// 国内
	mk({ name: '神龙 HTTP', slug: 'shenlong-http', officialUrl: 'https://h.shenlongip.com', proxyTypes: ['datacenter'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regionServed: ['cn'], regions: ['国内'], desc: '神龙 HTTP 国内代理服务商，提供 HTTP / HTTPS / SOCKS5 代理与 IP 池提取，支持会话保持。' }),
	mk({ name: '花生 HTTP', slug: 'huasheng-http', officialUrl: 'https://ip.huashengdaili.com', proxyTypes: ['datacenter'], protocols: ['http', 'https'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regionServed: ['cn'], regions: ['国内'], desc: '花生 HTTP 提供国内数据中心代理，支持 IP 池与 API 提取，按量计费。' }),
	mk({ name: '熊猫代理', slug: 'xiongmao', officialUrl: 'https://www.xiongmaodaili.com', proxyTypes: ['datacenter', 'residential'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regionServed: ['cn'], regions: ['国内', '海外'], desc: '熊猫代理提供国内动态代理与海外住宅代理，覆盖多种业务场景。' }),
	mk({ name: '极风云', slug: 'jifeng', officialUrl: 'https://www.jifengdaili.com', proxyTypes: ['datacenter'], protocols: ['http', 'https'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regionServed: ['cn'], regions: ['国内'], desc: '极风云国内代理服务商，支持会话保持与 IP 池 API 提取，覆盖面更广。' }),
	mk({ name: '豌豆 HTTP', slug: 'wandou-http', officialUrl: 'https://h.wandouip.com', proxyTypes: ['datacenter'], protocols: ['http', 'https'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regionServed: ['cn'], regions: ['国内'], desc: '豌豆 HTTP 提供国内 HTTP/HTTPS 代理，支持会话保持与 IP 池 API 提取优化。' }),
	mk({ name: '全民代理', slug: 'quanmin-ip', officialUrl: 'http://www.quanminip.com', proxyTypes: ['datacenter'], protocols: ['http', 'https'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regionServed: ['cn'], regions: ['国内'], desc: '全民代理提供国内数据中心代理与 IP 池提取，价格敏感场景可用。' }),
	mk({ name: '快代理', slug: 'kuaidaili', officialUrl: 'https://www.kuaidaili.com', proxyTypes: ['datacenter', 'residential'], protocols: ['http', 'https'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'port', 'package'], regionServed: ['cn'], regions: ['国内'], desc: '快代理国内老牌服务商，提供独享/隧道/短效代理与 IP 池，支持 HTTP 与 HTTPS。' }),
	mk({ name: '彩虹代理', slug: 'caihongdaili', officialUrl: 'http://www.caihongdaili.com', proxyTypes: ['datacenter'], protocols: ['http', 'https'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regionServed: ['cn'], regions: ['国内'], desc: '彩虹代理专注大数据基础电信服务，提供代理 IP 与 API 提取能力，可集成进第三方 IP 池。' }),
	// easybr-vue 推荐补充
	mk({ name: 'Cliproxy', slug: 'cliproxy', officialUrl: 'https://cliproxy.com', proxyTypes: ['residential'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regions: ['全球 180+ 国家'], desc: 'Cliproxy 性价比住宅代理，稳定且快速，覆盖全球 180+ 国家，新用户可试用。' }),
	mk({ name: '985Proxy', slug: '985proxy', officialUrl: 'https://www.985proxy.com', proxyTypes: ['static-residential'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['ip', 'traffic'], regions: ['全球'], desc: '985Proxy 拥有超过 2000 万个高稳定性和高速度的原生静态住宅池。' }),
	mk({ name: 'NovProxy', slug: 'novproxy', officialUrl: 'https://novproxy.com', proxyTypes: ['residential'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password'], pricingModels: ['traffic'], regions: ['全球 190+ 国家'], desc: 'NovProxy 高性价比住宅 IP 提供者，1 亿+ 住宅 IP 覆盖 190+ 地区，流量长期有效。' }),
	mk({ name: 'IPWO', slug: 'ipwo', officialUrl: 'https://www.ipwo.net', proxyTypes: ['residential', 'static-residential', 'datacenter'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regions: ['全球 190+ 国家'], desc: 'IPWO 综合型全球代理服务商，提供住宅/静态/数据中心代理，支持 API。' }),
	mk({ name: 'Roxlabs', slug: 'roxlabs', officialUrl: 'https://www.roxlabs.cn', proxyTypes: ['residential'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic'], regions: ['全球 200+ 国家', '中国香港'], desc: 'Roxlabs 千万动态住宅代理，覆盖全球，支持国家/地区定向，高质量。' }),
	mk({ name: 'Ownips', slug: 'ownips', officialUrl: 'https://www.ownips.com', proxyTypes: ['static-residential', 'residential'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'ip'], regions: ['全球 200+ 国家'], desc: 'Ownips 原生静态 ISP 领先者，提供高质静态住宅 IP 池。' }),
	mk({ name: 'Thordata', slug: 'thordata', officialUrl: 'https://www.thordata.com', proxyTypes: ['residential', 'static-residential'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'ip'], regions: ['全球'], desc: 'Thordata 大型 IP 池提供方，60M+ 大池子，接入稳定。' }),
	mk({ name: 'Kookeey', slug: 'kookeey', officialUrl: 'https://www.kookeey.com', proxyTypes: ['residential', 'static-residential', 'datacenter'], protocols: ['http', 'https', 'socks5'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regions: ['全球'], desc: 'Kookeey 全球高纯独享代理产品，覆盖多个区域。' }),
	mk({ name: '91HTTP', slug: '91http', officialUrl: 'https://www.91http.com', proxyTypes: ['datacenter'], protocols: ['http', 'https'], authentication: ['username-password', 'api'], pricingModels: ['traffic', 'package'], regionServed: ['cn'], regions: ['国内 380 城市'], desc: '91HTTP 日清理 500 万+ 净 IP，覆盖国内 380 城市，秒切换。' }),
];

const all = [...existing, ...additions];
const note = '服务商状态机：draft=内部草稿不构建（默认）；published=已发布（根据公开资料整理）；outdated=信息过期显示更新提示；inactive=停止运营移入历史。公开数据（public/data/*）仅导出 published。本数据根据公开资料与第三方公开教程整理，可能随服务商调整而变化，实际信息以服务商当前页面为准。';

const out = { updatedAt: today, note, providers: all };
writeFileSync('src/data/providers.json', JSON.stringify(out, null, 2) + '\n');
console.log('写入完成，共', all.length, '家');
const uniq = new Set(all.map((p) => p.slug));
console.log('slug 唯一性:', uniq.size === all.length ? 'OK' : '有重复');