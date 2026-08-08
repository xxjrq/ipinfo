import { defineCollection } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';
import { docsLoader } from '@astrojs/starlight/loaders';
import { z } from 'astro/zod';

/**
 * 内容集合 Schema。
 * 在 Starlight 默认字段（title/description/hero/sidebar 等）之上扩展本站专属字段。
 *
 * 供应商文章必需字段见 scripts/validate-content.mjs 中的校验规则。
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
				])
				.optional(),
			/** GEO/AI 可引用：开头 40~80 字直接回答 */
			summary: z.string().optional(),
			/** GEO/AI 可引用：一句话结论 */
			takeaway: z.string().optional(),
			/** 作者 / 审核人 */
			author: z.string().optional(),
			reviewer: z.string().optional(),
			/** 信息核实日期（供应商价格、覆盖、API 等易变信息） */
			lastVerified: z.date().optional(),
			/** 本文更新时间（写作/修改） */
			updatedAt: z.date().optional(),
			/** 适用版本，如 "EasyBR 2.x"、"Chromium 119" */
			appliesTo: z.string().optional(),
			/** 数据来源 */
			sources: z
				.array(z.object({ title: z.string(), url: z.url() }))
				.optional(),
			/** ---- 供应商文章专属字段 ---- */
			/** 服务商名称，如 "NetNut" */
			provider: z.string().optional(),
			/** 服务商官网 */
			providerUrl: z.union([z.url(), z.literal('待核实')]).optional(),
			/** 支持的代理类型，如 ["residential","datacenter","mobile","static-residential","isp"] */
			supportedProxyTypes: z.array(z.string()).optional(),
			/** 认证方式 */
			authentication: z
				.array(z.enum(['username-password', 'ip-whitelist', 'api']))
				.optional(),
			/** 覆盖国家/地区，如 "190+ 国家" */
			regions: z.string().optional(),
			/** 是否支持 API */
			supportsApi: z.boolean().optional(),
			/** 是否支持 IP 白名单 */
			supportsWhitelist: z.boolean().optional(),
			/** 官方文档地址 */
			officialDocs: z.union([z.url(), z.literal('待核实')]).optional(),
			/** 是否已人工核实（false = 占位/待核实，供应商文章用） */
			verified: z.boolean().optional(),
			/** 披露声明（推广关系、信息来源等） */
			disclosure: z.string().optional(),
		}),
	}),
});

export const collections = { docs };
