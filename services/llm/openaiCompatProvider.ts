/**
 * OpenAI 兼容 API 提供商
 * 
 * 使用浏览器原生 fetch 调用 OpenAI 兼容的 API
 * 支持：OpenAI、DeepSeek、xAI Grok
 */

import { 
  LLMProvider, 
  GenerateTextParams, 
  ProviderType,
  OpenAICompatRequest,
  OpenAICompatResponse 
} from './types';
import { geminiSchemaToStandard, schemaToPromptDescription } from './schemaAdapter';
import { getModelMaxTokens, modelSupportsTemperature } from './modelDefaults';

/**
 * 获取提供商的 API 配置
 */
function getProviderConfig(provider: ProviderType): { baseUrl: string; apiKey: string } {
  switch (provider) {
    case 'openai':
      return {
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY || ''
      };
    case 'deepseek':
      return {
        baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY || ''
      };
    case 'xai':
      return {
        baseUrl: process.env.XAI_BASE_URL || 'https://api.x.ai/v1',
        apiKey: process.env.XAI_API_KEY || ''
      };
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * 错误处理
 */
function handleApiError(error: any, provider: ProviderType): Error {
  console.error(`❌ Error calling ${provider} API:`, error);
  
  if (error instanceof Error) {
    let message = `${provider} API Error: ${error.message}`;
    
    // 解析具体错误
    if (error.message.includes('401') || error.message.includes('Invalid API key')) {
      message = `${provider} API Error: Invalid API key. Please check your configuration.`;
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      message = `${provider} API Error: Rate limit exceeded. Waiting before retry...`;
    } else if (error.message.includes('503') || error.message.includes('overloaded')) {
      message = `${provider} API Error: Service temporarily unavailable. Retrying...`;
    } else if (error.message.includes('timeout')) {
      message = `${provider} API Error: Request timed out. Retrying...`;
    }
    
    return new Error(message);
  }
  
  return new Error(`Unknown ${provider} API Error occurred.`);
}

/**
 * 重试逻辑（与 Gemini 的一致）
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  provider: ProviderType,
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
      if (lastError.message.includes('Invalid API key') || 
          lastError.message.includes('401')) {
        throw lastError;
      }

      // 最后一次尝试
      if (attempt === maxRetries) {
        console.error(`Failed after ${maxRetries + 1} attempts:`, lastError);
        throw lastError;
      }

      // 计算延迟
      let delay = baseDelay * Math.pow(2, attempt);

      // 针对不同错误调整延迟
      if (lastError.message.includes('503') || lastError.message.includes('overloaded')) {
        delay = Math.max(delay, 5000 + (attempt * 3000));
      } else if (lastError.message.includes('429') || lastError.message.includes('rate limit')) {
        delay = Math.max(delay, 10000 + (attempt * 5000));
      }

      // 添加随机抖动
      const jitter = Math.random() * 1000;
      delay += jitter;

      console.warn(`🔄 Attempt ${attempt + 1}/${maxRetries + 1} failed: ${lastError.message}`);
      console.warn(`⏳ Waiting ${Math.round(delay/1000)}s before retry...`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * OpenAI 兼容提供商实现
 */
export class OpenAICompatProvider implements LLMProvider {
  private provider: ProviderType;

  constructor(provider: ProviderType) {
    if (provider === 'gemini') {
      throw new Error('Use GeminiProvider for Gemini API');
    }
    this.provider = provider;
  }

  async generateText(params: GenerateTextParams): Promise<string> {
    const { baseUrl, apiKey } = getProviderConfig(this.provider);

    if (!apiKey) {
      throw new Error(`${this.provider} API key is not configured. Please set the appropriate environment variable.`);
    }

    const maxRetries = params.responseSchema ? 7 : 5;
    const baseDelay = params.responseSchema ? 3000 : 2000;

    return retryWithBackoff(async () => {
      try {
        // 构建请求
        const request: OpenAICompatRequest = {
          model: params.model,
          messages: [],
        };

        // 推理模型（GPT-5 全系列、O 系列）不支持 temperature 和 top_p
        // 传入会报 400: "Unsupported value: 'temperature' does not support X with this model"
        const supportsTemp = modelSupportsTemperature(params.model);
        if (supportsTemp) {
          request.temperature = params.temperature;
          request.top_p = params.topP;
        } else if (params.temperature !== undefined || params.topP !== undefined) {
          console.warn(`⚠️ Model "${params.model}" is a reasoning model and does not support temperature/top_p. Skipping these parameters.`);
        }

        // 根据模型查询正确的 maxTokens（不再写死 16384）
        const maxTokens = params.maxTokens || getModelMaxTokens(params.model, this.provider);

        // OpenAI 新模型使用 max_completion_tokens，其他提供商使用 max_tokens
        if (this.provider === 'openai') {
          request.max_completion_tokens = maxTokens;
        } else {
          request.max_tokens = maxTokens;
        }

        console.log(`📊 maxTokens: ${maxTokens} | temperature: ${supportsTemp ? (params.temperature ?? 'default') : 'N/A (reasoning model)'} (model: ${params.model}, provider: ${this.provider})`);

        // 添加 system instruction
        if (params.systemInstruction) {
          request.messages.push({
            role: 'system',
            content: params.systemInstruction
          });
        }

        // 添加用户提示词
        request.messages.push({
          role: 'user',
          content: params.prompt
        });

        // 处理 JSON Schema
        if (params.responseSchema) {
          const standardSchema = geminiSchemaToStandard(params.responseSchema);

          if (this.provider === 'deepseek') {
            // DeepSeek 仅支持 json_object + prompt 说明
            request.response_format = { type: 'json_object' };
            
            // 在 prompt 中添加 schema 说明
            const schemaDescription = schemaToPromptDescription(standardSchema);
            request.messages[request.messages.length - 1].content += `\n\n${schemaDescription}`;
          } else {
            // OpenAI 和 xAI 支持完整的 json_schema
            request.response_format = {
              type: 'json_schema',
              json_schema: {
                name: 'response',
                schema: standardSchema,
                strict: true
              }
            };
          }
        }

        console.log(`🔄 Sending request to ${this.provider} API (model: ${params.model})...`);

        // 发送请求
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(request)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data: OpenAICompatResponse = await response.json();

        if (!data.choices || data.choices.length === 0) {
          throw new Error('No response from API');
        }

        const text = data.choices[0].message.content;
        console.log(`✅ Received response from ${this.provider} API (${text.length} chars)`);

        return text;
      } catch (error) {
        throw handleApiError(error, this.provider);
      }
    }, this.provider, maxRetries, baseDelay);
  }
}

/**
 * 创建 OpenAI 兼容提供商实例的工厂函数
 */
export function createOpenAICompatProvider(provider: ProviderType): OpenAICompatProvider {
  return new OpenAICompatProvider(provider);
}
