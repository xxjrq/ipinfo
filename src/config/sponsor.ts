/**
 * 站点推广配置（EasyBR）
 *
 * 站点主体是开放的代理 IP 资源库，EasyBR 是其中推荐的代理环境管理工具。
 * 本文件集中控制全站 EasyBR 推广模块（首页推广区、内容页推广入口、导航下载链接）。
 *
 * Fork 用户若不需要展示 EasyBR 推广：
 *   1. 将下方 enabled 改为 false；或
 *   2. 构建时设置环境变量 SPONSOR_ENABLED=false（CI 用于自动验证）
 * 关闭后构建结果中不出现 EasyBR 推广模块与下载链接，不影响站点核心资源目录与公开数据。
 */
export const sponsor = {
	/** 是否启用 EasyBR 推广模块；SPONSOR_ENABLED=false 环境变量可覆盖 */
	enabled: process.env.SPONSOR_ENABLED !== 'false',
	/** 推广品牌名称 */
	name: 'EasyBR',
	/** 官网地址 */
	websiteUrl: 'https://www.ebrower.com/',
	/** 下载页地址 */
	downloadUrl: 'https://www.ebrower.com/down.html',
	/** 一句话产品说明 */
	description: '免费指纹浏览器与代理环境管理工具',
};
