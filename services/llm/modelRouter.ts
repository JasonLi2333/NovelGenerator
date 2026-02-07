/**
 * 模型路由器
 * 
 * 根据任务类型和当前策略，将请求路由到对应的模型提供商
 */

import { TaskType, LLMProvider, GenerateTextParams, ProviderType } from './types';
import { getStrategy, STRATEGY_DEFAULT } from './strategies';
import { GeminiProvider, createGeminiProvider } from './geminiProvider';
import { OpenAICompatProvider, createOpenAICompatProvider } from './openaiCompatProvider';
import { resolveMaxTokens } from './modelDefaults';

/**
 * Provider 单例管理
 */
class ProviderManager {
  private providers: Map<ProviderType, LLMProvider> = new Map();

  getProvider(providerType: ProviderType): LLMProvider {
    if (!this.providers.has(providerType)) {
      const provider = this.createProvider(providerType);
      this.providers.set(providerType, provider);
    }
    return this.providers.get(providerType)!;
  }

  private createProvider(providerType: ProviderType): LLMProvider {
    switch (providerType) {
      case 'gemini':
        return createGeminiProvider();
      case 'openai':
      case 'deepseek':
      case 'xai':
        return createOpenAICompatProvider(providerType);
      default:
        throw new Error(`Unknown provider type: ${providerType}`);
    }
  }

  clearCache(): void {
    this.providers.clear();
  }
}

const providerManager = new ProviderManager();

/**
 * 当前使用的策略 ID
 */
let currentStrategyId: string = 'default';

/**
 * 设置当前策略
 */
export function setStrategy(strategyId: string): void {
  const strategy = getStrategy(strategyId);
  if (!strategy) {
    throw new Error(`Strategy not found: ${strategyId}`);
  }
  currentStrategyId = strategyId;
  console.log(`✅ Strategy set to: ${strategyId} - ${strategy.name}`);
}

/**
 * 获取当前策略 ID
 */
export function getCurrentStrategyId(): string {
  return currentStrategyId;
}

/**
 * 获取当前策略配置
 */
export function getCurrentStrategy() {
  return getStrategy(currentStrategyId) || STRATEGY_DEFAULT;
}

/**
 * 核心路由函数：根据任务类型生成文本
 * 
 * @param taskType 任务类型（13个创作环节之一）
 * @param prompt 用户提示词
 * @param systemInstruction 系统指令（可选）
 * @param responseSchema JSON Schema（可选，用于结构化输出）
 * @param temperature 温度参数（可选）
 * @param topP Top-P 参数（可选）
 * @param topK Top-K 参数（可选）
 * @returns 生成的文本
 */
export async function generateText(
  taskType: TaskType,
  prompt: string,
  systemInstruction?: string,
  responseSchema?: object,
  temperature?: number,
  topP?: number,
  topK?: number
): Promise<string> {
  // 获取当前策略
  const strategy = getCurrentStrategy();
  
  // 获取该任务类型的模型配置
  const assignment = strategy.assignments[taskType];
  if (!assignment) {
    throw new Error(`No model assignment found for task type: ${taskType}`);
  }

  // 解析 maxTokens：调用方参数 > 策略配置 > 模型默认值
  const maxTokens = resolveMaxTokens(undefined, assignment.maxTokens, assignment.model, assignment.provider);

  console.log(`🎯 Task: ${taskType} | Strategy: ${strategy.name} | Provider: ${assignment.provider} | Model: ${assignment.model} | MaxTokens: ${maxTokens}`);

  // 获取对应的 Provider
  const provider = providerManager.getProvider(assignment.provider);

  // 构建生成参数
  const params: GenerateTextParams = {
    model: assignment.model,
    prompt,
    systemInstruction,
    responseSchema,
    temperature,
    topP,
    topK,
    maxTokens
  };

  // 调用 Provider
  return provider.generateText(params);
}

/**
 * 直接指定提供商和模型生成文本（高级用法）
 * 
 * @param provider 提供商类型
 * @param model 模型名称
 * @param prompt 用户提示词
 * @param systemInstruction 系统指令（可选）
 * @param responseSchema JSON Schema（可选）
 * @param temperature 温度参数（可选）
 * @param topP Top-P 参数（可选）
 * @param topK Top-K 参数（可选）
 * @returns 生成的文本
 */
export async function generateTextDirect(
  provider: ProviderType,
  model: string,
  prompt: string,
  systemInstruction?: string,
  responseSchema?: object,
  temperature?: number,
  topP?: number,
  topK?: number,
  maxTokens?: number
): Promise<string> {
  // 解析 maxTokens：调用方参数 > 模型默认值
  const resolvedMaxTokens = resolveMaxTokens(maxTokens, undefined, model, provider);

  console.log(`🎯 Direct call | Provider: ${provider} | Model: ${model} | MaxTokens: ${resolvedMaxTokens}`);

  const llmProvider = providerManager.getProvider(provider);

  const params: GenerateTextParams = {
    model,
    prompt,
    systemInstruction,
    responseSchema,
    temperature,
    topP,
    topK,
    maxTokens: resolvedMaxTokens
  };

  return llmProvider.generateText(params);
}

/**
 * 清除 Provider 缓存（用于测试或重新初始化）
 */
export function clearProviderCache(): void {
  providerManager.clearCache();
  console.log('✅ Provider cache cleared');
}
