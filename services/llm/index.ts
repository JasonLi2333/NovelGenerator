/**
 * 多模型提供商系统统一导出
 * 
 * 这是新系统的主入口，提供：
 * - generateText: 主要的文本生成函数
 * - 策略管理函数
 * - 向后兼容的别名
 */

// ============ 核心类型导出 ============
export type {
  TaskType,
  ProviderType,
  StrategyType,
  ModelAssignment,
  StrategyConfig,
  GenerateTextParams,
  LLMProvider
} from './types';

// ============ 路由器函数导出 ============
export {
  generateText,
  generateTextDirect,
  setStrategy,
  getCurrentStrategyId,
  getCurrentStrategy,
  clearProviderCache
} from './modelRouter';

// ============ 策略管理导出 ============
export {
  STRATEGY_DEFAULT,
  STRATEGY_ECONOMIC,
  STRATEGY_FREE,
  STRATEGY_PREMIUM,
  PREDEFINED_STRATEGIES,
  registerStrategy,
  getStrategy,
  getAllStrategies,
  unregisterStrategy
} from './strategies';

// ============ Schema 适配器导出 ============
export {
  geminiSchemaToStandard,
  standardSchemaToGemini,
  schemaToPromptDescription,
  isGeminiSchema
} from './schemaAdapter';

// ============ 模型默认参数导出 ============
export {
  getModelMaxTokens,
  getModelOfficialMaxOutput,
  resolveMaxTokens,
  modelSupportsTemperature
} from './modelDefaults';

// ============ 内部导入（用于便捷函数） ============
import { generateText, setStrategy as _setStrategy } from './modelRouter';
import { getAllStrategies as _getAllStrategies } from './strategies';

/**
 * 兼容旧的 generateGeminiText 函数签名
 * 默认使用 'outline' 任务类型（保守选择）
 * 
 * @deprecated 请使用 generateText(taskType, ...) 代替
 */
export async function generateGeminiText(
  prompt: string,
  systemInstruction?: string,
  responseSchema?: object,
  temperature?: number,
  topP?: number,
  topK?: number
): Promise<string> {
  console.warn('⚠️ generateGeminiText is deprecated. Please use generateText(taskType, ...) instead.');
  // 默认使用 outline 类型
  return generateText('outline', prompt, systemInstruction, responseSchema, temperature, topP, topK);
}

// ============ 便捷函数 ============

/**
 * 获取所有可用策略的简单列表
 */
export function getAvailableStrategies(): Array<{ id: string; name: string; description: string }> {
  const all = _getAllStrategies();
  return all.map(({ id, config }) => ({
    id,
    name: config.name,
    description: config.description
  }));
}

/**
 * 快速设置为预定义策略
 */
export function useEconomicStrategy(): void {
  _setStrategy('economic');
}

export function useFreeStrategy(): void {
  _setStrategy('free');
}

export function usePremiumStrategy(): void {
  _setStrategy('premium');
}

export function useDefaultStrategy(): void {
  _setStrategy('default');
}

// ============ 版本信息 ============
export const VERSION = '1.0.0';
export const SYSTEM_NAME = 'Multi-LLM Provider System';

console.log(`✅ ${SYSTEM_NAME} v${VERSION} initialized`);
