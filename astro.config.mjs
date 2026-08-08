// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

/**
 * 部署配置（由 CI 注入或本地默认值）：
 * - SITE_URL: 站点根域名，如 https://username.github.io
 * - BASE_PATH: 子路径。GitHub Pages 项目页为 /<repo>/；绑定自定义域名后为 /
 *   本地开发默认使用 /，与自定义域名部署时一致。
 */
const site = process.env.SITE_URL || 'https://example.github.io';
const base = process.env.BASE_PATH || '/';

const downloadUrl =
	'https://www.ebrower.com/down.html?utm_source=ipinfo&utm_medium=sidebar&utm_campaign=download';

export default defineConfig({
	site,
	base,
	integrations: [
		starlight({
			title: 'EasyBR IP 资源中心',
			description:
				'代理 IP 选型、配置、检测与指纹浏览器使用指南。住宅 IP、数据中心 IP、SOCKS5 配置教程与 EasyBR 免费指纹浏览器导入说明。',
			defaultLocale: 'root',
			locales: {
				root: { label: '简体中文', lang: 'zh-CN' },
			},
			logo: {
				src: './src/assets/eb-logo.svg',
				alt: 'EasyBR 标志',
				replacesTitle: false,
			},
			// 部署后请改为实际仓库地址（见 README）
			editLink: {
				baseUrl: 'https://github.com/xxjrq/ipinfo/edit/main/',
			},
			lastUpdated: true,
			pagination: false,
			credits: false,
			customCss: ['./src/styles/custom.css'],
			sidebar: [
				{ label: '首页', link: '/' },
				{
					label: '开始使用',
					items: [{ autogenerate: { directory: 'getting-started' } }],
				},
				{
					label: 'IP 基础',
					items: [{ autogenerate: { directory: 'basics' } }],
				},
				{
					label: '代理类型',
					items: [{ autogenerate: { directory: 'proxy-types' } }],
				},
				{
					label: 'IP 服务商',
					items: [{ autogenerate: { directory: 'providers' } }],
				},
				{
					label: 'EasyBR 配置',
					items: [{ autogenerate: { directory: 'easybr' } }],
				},
				{
					label: '排查工具',
					items: [{ autogenerate: { directory: 'troubleshooting' } }],
				},
				{
					label: '选型对比',
					items: [{ autogenerate: { directory: 'comparisons' } }],
				},
				{
					label: '常见问题',
					items: [{ autogenerate: { directory: 'faq' } }],
				},
				{ label: '免费下载 EasyBR', link: downloadUrl },
			],
			head: [
				{
					tag: 'script',
					attrs: { type: 'application/ld+json' },
					content: JSON.stringify({
						'@context': 'https://schema.org',
						'@graph': [
							{
								'@type': 'Organization',
								name: 'EasyBR',
								url: site,
								logo: `${site}${base}favicon.svg`,
								sameAs: [],
							},
							{
								'@type': 'WebSite',
								name: 'EasyBR IP 资源中心',
								url: site,
								inLanguage: 'zh-CN',
								potentialAction: {
									'@type': 'SearchAction',
									target: {
										'@type': 'EntryPoint',
										urlTemplate: `${site}${base}search/?q={search_term_string}`,
									},
									'query-input': 'required name=search_term_string',
								},
							},
						],
					}),
				},
			],
		}),
		sitemap(),
	],
});
