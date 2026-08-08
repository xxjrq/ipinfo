// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import { sponsor } from './src/config/sponsor.ts';

/**
 * 部署配置（由 CI 注入或本地默认值）：
 * - SITE_URL: 站点根域名，如 https://username.github.io
 * - BASE_PATH: 子路径。GitHub Pages 项目页为 /<repo>/；绑定自定义域名后为 /
 *   本地开发默认使用 /，与自定义域名部署时一致。
 */
const site = process.env.SITE_URL || 'https://example.github.io';
const base = process.env.BASE_PATH || '/';

// 结构化数据脚本：sponsor.enabled 时声明 EasyBR 为站点发布者；关闭后仅保留 WebSite 自身信息
const jsonLdScript = sponsor.enabled
	? {
			tag: 'script',
			attrs: { type: 'application/ld+json' },
			content: JSON.stringify({
				'@context': 'https://schema.org',
				'@graph': [
					{
						'@type': 'Organization',
						'@id': 'https://www.ebrower.com/#organization',
						name: 'EasyBR',
						url: 'https://www.ebrower.com/',
						logo: {
							'@type': 'ImageObject',
							url: `${site}${base}favicon.svg`,
						},
						sameAs: [],
					},
					{
						'@type': 'WebSite',
						'@id': `${site}${base}#website`,
						name: 'IP 资源中心',
						url: `${site}${base}`,
						inLanguage: 'zh-CN',
						publisher: { '@id': 'https://www.ebrower.com/#organization' },
					},
				],
			}),
		}
	: {
			tag: 'script',
			attrs: { type: 'application/ld+json' },
			content: JSON.stringify({
				'@context': 'https://schema.org',
				'@type': 'WebSite',
				'@id': `${site}${base}#website`,
				name: 'IP 资源中心',
				url: `${site}${base}`,
				inLanguage: 'zh-CN',
			}),
		};

/** @type {any[]} */
const headConfig = [jsonLdScript];

export default defineConfig({
	site,
	base,
	integrations: [
		starlight({
			title: 'IP 资源中心',
			description:
				'代理 IP 服务商资源导航与选型指南：住宅代理、静态住宅、数据中心代理、移动代理服务商整理，特点、覆盖范围、认证方式与使用场景参考。',
			defaultLocale: 'root',
			locales: {
				root: { label: '简体中文', lang: 'zh-CN' },
			},
			logo: {
				src: './src/assets/eb-logo.svg',
				alt: 'IP 资源中心标志',
				replacesTitle: false,
			},
			editLink: {
				baseUrl: 'https://github.com/xxjrq/ipinfo/edit/main/',
			},
			lastUpdated: true,
			pagination: false,
			credits: false,
			customCss: ['./src/styles/custom.css'],
			components: {
				PageTitle: './src/components/PageTitle.astro',
			},
			// 一级导航：服务商资源/选型在前，EasyBR 工具降级放后；新手指南不占一级导航
			sidebar: [
				{ label: '首页', link: '/' },
				{
					label: 'IP 服务商',
					items: [{ autogenerate: { directory: 'providers' } }],
				},
				{
					label: '代理类型',
					items: [{ autogenerate: { directory: 'proxy-types' } }],
				},
				{
					label: '使用场景',
					items: [{ autogenerate: { directory: 'use-cases' } }],
				},
				{
					label: '选型对比',
					items: [{ autogenerate: { directory: 'comparisons' } }],
				},
				{
					label: '基础知识',
					items: [{ autogenerate: { directory: 'basics' } }],
				},
				{
					label: '避坑指南',
					items: [{ autogenerate: { directory: 'troubleshooting' } }],
				},
				{
					label: '常见问题',
					items: [{ autogenerate: { directory: 'faq' } }],
				},
				{
					label: 'EasyBR 工具',
					items: [{ autogenerate: { directory: 'easybr' } }],
				},
				{
					label: '关于',
					items: [{ autogenerate: { directory: 'about' } }],
				},
				// 新手指南不进入顶部一级导航，入口在首页/页脚
				...(sponsor.enabled
					? [
							{
								label: `免费下载 ${sponsor.name}`,
								link: sponsor.downloadUrl + '?utm_source=ipinfo&utm_medium=sidebar&utm_campaign=download',
							},
						]
					: []),
			],
			head: headConfig,
		}),
		sitemap(),
	],
});
