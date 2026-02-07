/**
 * 保留作为向后兼容
 * @deprecated 使用 services/llm 中的策略系统代替
 */
export const GEMINI_MODEL_NAME = 'gemini-2.5-flash';

export const MIN_CHAPTERS = 3;

/**
 * 默认模型策略
 * 可选值: 'default' | 'economic' | 'free' | 'premium'
 * - default: 使用 Gemini（向后兼容）
 * - economic: 方案A - 经济实惠（推荐）
 * - free: 方案B - 全免费
 * - premium: 方案C - 顶级质量
 */
export const DEFAULT_MODEL_STRATEGY = 'default';