/**
 * Google Gemini 提供商
 * 
 * 重构自 geminiService.ts，实现 LLMProvider 接口
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMProvider, GenerateTextParams } from './types';
import { getModelMaxTokens } from './modelDefaults';

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

let ai: GoogleGenerativeAI | null = null;

if (API_KEY) {
  ai = new GoogleGenerativeAI(API_KEY);
} else {
  console.error("CRITICAL: Gemini API_KEY environment variable is not set.");
}

/**
 * 错误处理
 */
const handleApiError = (error: unknown): Error => {
  console.error("❌ Error calling Gemini API:", error);
  if (error instanceof Error) {
    let message = `Gemini API Error: ${error.message}`;
    if (error.message.includes("API key not valid")) {
      message = "Gemini API Error: The provided API key is not valid. Please check your configuration.";
    } else if (error.message.includes("quota")) {
      message = "Gemini API Error: You have exceeded your API quota. Please check your Google AI Studio account.";
    } else if (error.message.includes("UNAVAILABLE") || error.message.includes("503") || error.message.includes("overloaded")) {
      message = "Gemini API Error: Service is temporarily overloaded. Retrying...";
    } else if (error.message.includes("RESOURCE_EXHAUSTED") || error.message.includes("429")) {
      message = "Gemini API Error: Rate limit exceeded. Waiting before retry...";
    } else if (error.message.includes("RECITATION") || error.message.includes("blocked")) {
      message = "Gemini API Error: Content was blocked due to safety filters or copyright concerns. Try adjusting your prompt.";
      console.error("⚠️ Content blocked - this may indicate the prompt triggered safety filters");
    } else if (error.message.includes("timeout") || error.message.includes("DEADLINE_EXCEEDED")) {
      message = "Gemini API Error: Request timed out. The generation may be too complex. Retrying...";
    } else if (error.message.includes("invalid") && error.message.includes("schema")) {
      message = "Gemini API Error: The response schema is invalid or too complex. Simplifying request...";
      console.error("⚠️ Schema validation error - the model couldn't generate valid JSON for the requested schema");
    }
    return new Error(message);
  }
  return new Error("Unknown Gemini API Error occurred.");
};

/**
 * 重试逻辑（增强的指数退避）
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 2000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 不重试永久性错误
      if (lastError.message.includes("API key not valid") ||
          lastError.message.includes("quota exceeded")) {
        throw lastError;
      }

      // 最后一次尝试
      if (attempt === maxRetries) {
        console.error(`Failed after ${maxRetries + 1} attempts:`, lastError);
        throw lastError;
      }

      // 智能延迟计算
      let delay = baseDelay * Math.pow(2, attempt);

      // 针对不同错误类型调整延迟
      if (lastError.message.includes("UNAVAILABLE") ||
          lastError.message.includes("overloaded") ||
          lastError.message.includes("503")) {
        delay = Math.max(delay, 5000 + (attempt * 3000));
      } else if (lastError.message.includes("RESOURCE_EXHAUSTED") ||
                 lastError.message.includes("429")) {
        delay = Math.max(delay, 10000 + (attempt * 5000));
      }

      // 添加抖动防止雷鸣群效应
      const jitter = Math.random() * 1000;
      delay += jitter;

      console.warn(`🔄 Attempt ${attempt + 1}/${maxRetries + 1} failed: ${lastError.message}`);
      console.warn(`⏳ Waiting ${Math.round(delay/1000)}s before retry...`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Retry failed");
}

/**
 * Gemini 提供商实现
 */
export class GeminiProvider implements LLMProvider {
  async generateText(params: GenerateTextParams): Promise<string> {
    if (!ai) {
      throw new Error("Gemini API client is not initialized. API_KEY might be missing.");
    }

    // 对复杂 schema 请求使用更多重试
    const maxRetries = params.responseSchema ? 7 : 5;
    const baseDelay = params.responseSchema ? 3000 : 2000;

    return retryWithBackoff(async () => {
      try {
        const generationConfig: any = {};
        
        if (params.temperature !== undefined) {
          generationConfig.temperature = params.temperature;
        }
        if (params.topP !== undefined) {
          generationConfig.topP = params.topP;
        }
        if (params.topK !== undefined) {
          generationConfig.topK = params.topK;
        }

        // 设置 maxOutputTokens（Gemini 使用 maxOutputTokens 参数名）
        const maxTokens = params.maxTokens || getModelMaxTokens(params.model, 'gemini');
        generationConfig.maxOutputTokens = maxTokens;
        console.log(`📊 maxOutputTokens: ${maxTokens} (model: ${params.model}, provider: gemini)`);
        
        // Gemini 原生支持 responseSchema
        if (params.responseSchema) {
          generationConfig.responseMimeType = "application/json";
          generationConfig.responseSchema = params.responseSchema;
        }

        const model = ai!.getGenerativeModel({
          model: params.model,
          generationConfig,
          ...(params.systemInstruction && { systemInstruction: params.systemInstruction })
        });

        console.log(`🔄 Sending request to Gemini API (model: ${params.model})...`);
        const result = await model.generateContent(params.prompt);
        const response = await result.response;
        const text = response.text();
        console.log(`✅ Received response from Gemini API (${text.length} chars)`);
        
        return text;
      } catch (error) {
        throw handleApiError(error);
      }
    }, maxRetries, baseDelay);
  }
}

/**
 * 创建 Gemini 提供商实例的工厂函数
 */
export function createGeminiProvider(): GeminiProvider {
  return new GeminiProvider();
}
