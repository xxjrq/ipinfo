import { defineCollection } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';
import { docsLoader } from '@astrojs/starlight/loaders';
import { z } from 'astro/zod';

/**
 * 内容集合 Schema。
 * 在 Starlight 默认字段（title/description/hero/sidebar 等）之上扩展本站专属字段。
 *
 * 服务商状态机（与 src/data/providers.json 对齐，唯一合法值）：
 *   draft    内部草稿，不构建、不进 sitemap/公开数据
 *   published 完成核验，正式发布
 *   outdated 信息过期，页面显示更新提示，不进推荐列表与公开数据
 *   inactive 停止运营，进历史服务商栏目
 *
 * 旧字段（verified/providerUrl/supportedProxyTypes/lastVerified/officialDocs）已废弃移除，
 * 由 status / officialUrl / proxyTypes / updatedAt / sources 取代，CI 发现旧字段直接失败。
 */
const docs = defineCollection({
	loader: docsLoader(),
	schema: docsSchema({
		extend: z.object({
			/** 草稿标记：true = 未核验/占位，文件需 _ 前缀排除出生产构建（draft 为 Astro 保留键名，勿用） */
			isDraft: z.boolean().optional(),
			/** 文章类型，用于内容校验与分类 */
			pageType: z
				.enum([
					'getting-started',
					'basics',
					'proxy-types',
					'providers',
					'easybr-guide',
					'troubleshooting',
					'comparisons',
					'faq',
					'use-cases',
					'about',
				])
				.optional(),
			/** GEO/AI 可引用：开头 40~80 字直接回答 */
			summary: z.string().optional(),
			/** GEO/AI 可引用：一句话结论 */
			takeaway: z.string().optional(),
			/** 作者 / 审核人 */
			author: z.string().optional(),
			reviewer: z.string().optional(),
			/** 本文更新时间（写作/修改；易变信息核验日也记录于此） */
			updatedAt: z.date().optional(),
			/** 适用版本，如 "EasyBR 2.x"、"Chromium 119" */
			appliesTo: z.string().optional(),
			/** 数据来源（官方页面/文档等），published 必须 ≥1 条 */
			sources: z
				.array(z.object({ title: z.string(), url: z.url() }))
				.optional(),
			/** 披露声明（推广关系、信息来源等） */
			disclosure: z.string().optional(),
			/** ---- 服务商文章专属字段（与 src/data/providers.json 对齐） ---- */
			/** 服务商名称，如 "NetNut" */
			provider: z.string().optional(),
			/** 服务商 slug，与 providers.json 一致 */
			slug: z.string().optional(),
			/** 服务商数据状态：draft=未核实 / published=已核实发布 / outdated=待复查 / inactive=已停止运营 */
			status: z.enum(['draft', 'published', 'outdated', 'inactive']).optional(),
			/** 服务商官网 */
			officialUrl: z.union([z.url(), z.literal('待核实')]).optional(),
			/** 支持的代理类型，如 ["residential","datacenter","mobile","static-residential","isp"] */
			proxyTypes: z.array(z.string()).optional(),
			/** 支持的代理协议（http/https/socks5） */
			protocols: z.array(z.string()).optional(),
			/** 认证方式 */
			authentication: z
				.array(z.enum(['username-password', 'ip-whitelist', 'api']))
				.optional(),
			/** 计费模式（traffic/port/ip/package） */
			pricingModels: z.array(z.string()).optional(),
			/** 覆盖国家/地区，如 "190+ 国家" */
			regions: z.string().optional(),
		}),
	}),
});

export const collections = { docs };
