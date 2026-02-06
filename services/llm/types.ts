/**
 * 多模型提供商系统的核心类型定义
 */

// 13 个创作环节
export type TaskType =
  | 'outline'               // 故事大纲生成
  | 'character_extraction'  // 角色提取
  | 'world_extraction'      // 世界观提取
  | 'motif_extraction'      // 主题元素提取
  | 'chapter_planning'      // 章节计划生成 (JSON)
  | 'structure_agent'       // 结构Agent
  | 'character_agent'       // 角色Agent
  | 'scene_agent'           // 场景Agent
  | 'synthesis'             // 内容整合
  | 'chapter_analysis'      // 章节分析 (JSON)
  | 'self_critique'         // 自我批评
  | 'editing'               // 编辑打磨
  | 'title_generation';     // 书名生成

// 提供商类型
export type ProviderType = 'gemini' | 'openai' | 'deepseek' | 'xai';

// 策略方案
export type StrategyType = 'economic' | 'free' | 'premium' | string; // string 支持自定义

// 模型配置
export interface ModelAssignment {
  provider: ProviderType;
  model: string;
  maxTokens?: number;  // 可选：覆盖该模型的默认 maxTokens
}

// 策略配置
export interface StrategyConfig {
  name: string;
  description: string;
  assignments: Record<TaskType, ModelAssignment>;
}

// 生成文本参数
export interface GenerateTextParams {
  model: string;
  prompt: string;
  systemInstruction?: string;
  responseSchema?: object;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;  // 最大输出 token 数，不设置则使用模型默认值
}

// 提供商接口
export interface LLMProvider {
  generateText(params: GenerateTextParams): Promise<string>;
}

// Provider 配置
export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
}

// OpenAI 兼容 API 的请求格式
export interface OpenAICompatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAICompatRequest {
  model: string;
  messages: OpenAICompatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  max_completion_tokens?: number;
  response_format?: {
    type: 'json_object' | 'json_schema';
    json_schema?: {
      name: string;
      schema: object;
      strict?: boolean;
    };
  };
}

export interface OpenAICompatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
