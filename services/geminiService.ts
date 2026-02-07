/**
 * ⚠️ 兼容层 - 保留旧的 Gemini Service API
 * 
 * 这个文件现在作为兼容层，将旧的 API 调用代理到新的多模型系统。
 * 新代码应该使用 services/llm/index.ts 中的函数。
 */

import { withResilienceTracking } from '../utils/apiResilienceUtils';
import { generateText } from './llm';

/**
 * 兼容旧的 generateGeminiText 函数
 * 
 * @deprecated 请使用 generateText(taskType, ...) 从 services/llm 代替
 */
export async function generateGeminiText(
  prompt: string,
  systemInstruction?: string,
  responseSchema?: object,
  temperature?: number,
  topP?: number,
  topK?: number
): Promise<string> {
  console.warn('⚠️ Using legacy geminiService.ts. Consider migrating to services/llm/generateText()');
  
  return withResilienceTracking(() => 
    // 默认使用 'outline' 任务类型作为 fallback
    generateText('outline', prompt, systemInstruction, responseSchema, temperature, topP, topK)
  );
}

/**
 * 流式生成（暂未实现多模型支持）
 * 
 * @deprecated 新系统暂不支持流式生成
 */
export async function generateGeminiTextStream(
  prompt: string,
  onChunk: (chunk: string) => void,
  systemInstruction?: string,
  temperature?: number,
  topP?: number,
  topK?: number
): Promise<string> {
  console.error('❌ Streaming is not yet supported in the new multi-model system');
  throw new Error('Streaming not implemented in new system. Please use generateGeminiText() instead.');
}

/**
 * 队列版本（暂未实现多模型支持）
 * 
 * @deprecated 新系统暂不支持队列
 */
export async function generateGeminiTextQueued(
  prompt: string,
  systemInstruction?: string,
  responseSchema?: object,
  temperature?: number,
  topP?: number,
  topK?: number,
  priority: 'high' | 'medium' | 'low' = 'medium'
): Promise<string> {
  console.warn('⚠️ Queue system not implemented in new system. Falling back to direct call.');
  return generateGeminiText(prompt, systemInstruction, responseSchema, temperature, topP, topK);
}

/**
 * 获取队列状态（兼容性存根）
 * 
 * @deprecated 新系统暂不支持队列
 */
export function getQueueStatus() {
  return {
    size: 0,
    processing: false
  };
}