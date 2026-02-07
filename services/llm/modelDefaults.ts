/**
 * 模型默认参数映射表
 * 
 * 根据 model-handbook.md 中各模型的官方规格配置
 * 每个模型有不同的最大输出 token 限制，不能一刀切
 */

/**
 * 模型最大输出 token 数映射表
 * 
 * 格式：模型名 → 推荐 maxTokens（不超过官方最大输出限制）
 * 
 * 设计原则：
 * - 使用 model-handbook.md 中"当前配置"列的值
 * - 绝不超过模型官方最大输出限制
 * - 对于创作类任务需要较长输出的模型，配置较大值
 */
const MODEL_MAX_TOKENS: Record<string, number> = {
  // ===== OpenAI GPT-5 系列（最大输出 128K）=====
  'gpt-5-2025-08-07':         32768,   // 官方最大 128,000，配置 32K 平衡质量和成本
  'gpt-5-chat-latest':        16384,   // 官方最大 16,384，已达上限

  // ===== OpenAI GPT-4 系列 =====
  'gpt-4.1-2025-04-14':       16384,   // 官方最大 32,768
  'gpt-4o-2024-11-20':        16384,   // 官方最大 16,384，已达上限
  'gpt-4o-2024-08-06':        16384,   // 官方最大 16,384
  'gpt-4o-2024-05-13':        16384,   // 官方最大 16,384

  // ===== OpenAI O 系列推理模型（最大输出 100K）=====
  'o3-2025-04-16':            32768,   // 官方最大 100,000
  'o1-2024-12-17':            32768,   // 官方最大 100,000

  // ===== OpenAI Mini/Nano 轻量模型 =====
  'gpt-5-mini-2025-08-07':    16384,   // 官方最大 128,000
  'gpt-5-nano-2025-08-07':    16384,   // 官方最大 128,000
  'gpt-4.1-mini-2025-04-14':  16384,   // 官方最大 32,768
  'gpt-4.1-nano-2025-04-14':  16384,   // 官方最大 32,768
  'o4-mini-2025-04-16':       16384,   // 官方最大 100,000
  'gpt-4o-mini-2024-07-18':   16384,   // 官方最大 16,384，已达上限

  // ===== Google Gemini 3 系列（最大输出 65K）=====
  'gemini-3-pro-preview':     65536,   // 官方最大 65,536
  'gemini-3-flash-preview':   65536,   // 官方最大 65,536

  // ===== Google Gemini 2.5 系列（最大输出 65K）=====
  'gemini-2.5-pro':           65536,   // 官方最大 65,536
  'gemini-2.5-flash':         65536,   // 官方最大 65,536
  'gemini-2.5-flash-preview-09-2025': 65536,
  'gemini-2.5-flash-lite':    65536,   // 官方最大 65,536
  'gemini-2.5-flash-lite-preview-09-2025': 65536,

  // ===== Google Gemini 2.0 系列（最大输出 8K，已弃用）=====
  'gemini-2.0-flash':         8192,    // 官方最大 8,192
  'gemini-2.0-flash-lite':    8192,    // 官方最大 8,192

  // ===== xAI Grok 系列（最大输出 8K）=====
  'grok-4-1-fast-reasoning':      8192,    // 官方最大 8,192
  'grok-4-1-fast-non-reasoning':  8192,    // 官方最大 8,192
  'grok-4-latest':                8192,    // 别名，指向 grok-4 最新版
  'grok-4-1-fast':                8192,    // 别名
  'grok-code-fast-1':             8192,    // 官方未公开，保守估计

  // ===== DeepSeek 系列 =====
  'deepseek-chat':            8192,    // 官方默认 4,096，最大 8,192
  'deepseek-reasoner':        32768,   // 官方默认 32,768，最大 65,536
};

/**
 * 各提供商的全局默认 maxTokens
 * 当模型不在映射表中时使用
 */
const PROVIDER_DEFAULT_MAX_TOKENS: Record<string, number> = {
  'openai':   16384,
  'gemini':   65536,
  'deepseek': 8192,
  'xai':      8192,
};

/**
 * 全局兜底默认值
 */
const GLOBAL_DEFAULT_MAX_TOKENS = 8192;

/**
 * 获取模型的推荐 maxTokens
 * 
 * 优先级：
 * 1. 调用方显式传入的 maxTokens（最高优先级）
 * 2. 策略配置中 ModelAssignment 的 maxTokens
 * 3. 模型映射表中的默认值
 * 4. 提供商级别的默认值
 * 5. 全局兜底默认值 8192
 * 
 * @param model 模型名称
 * @param provider 提供商类型（可选，用于提供商级别默认值）
 * @returns 推荐的 maxTokens 值
 */
export function getModelMaxTokens(model: string, provider?: string): number {
  // 精确匹配
  if (MODEL_MAX_TOKENS[model] !== undefined) {
    return MODEL_MAX_TOKENS[model];
  }

  // 前缀匹配（处理未列出的快照版本，如 gpt-5-2025-xx-xx）
  for (const [key, value] of Object.entries(MODEL_MAX_TOKENS)) {
    // 提取模型系列名（去掉日期后缀）
    const baseKey = key.replace(/-\d{4}-\d{2}-\d{2}$/, '');
    const baseModel = model.replace(/-\d{4}-\d{2}-\d{2}$/, '');
    if (baseKey === baseModel) {
      return value;
    }
  }

  // 提供商默认值
  if (provider && PROVIDER_DEFAULT_MAX_TOKENS[provider] !== undefined) {
    return PROVIDER_DEFAULT_MAX_TOKENS[provider];
  }

  // 全局兜底
  console.warn(`⚠️ Unknown model "${model}" (provider: ${provider || 'unknown'}), using default maxTokens: ${GLOBAL_DEFAULT_MAX_TOKENS}`);
  return GLOBAL_DEFAULT_MAX_TOKENS;
}

/**
 * 获取模型的官方最大输出限制
 * 用于验证配置是否超限
 */
export function getModelOfficialMaxOutput(model: string): number | undefined {
  return MODEL_MAX_TOKENS[model];
}

/**
 * 解析最终使用的 maxTokens
 * 
 * @param explicitMaxTokens 调用方显式传入的值
 * @param assignmentMaxTokens 策略配置中的值
 * @param model 模型名称
 * @param provider 提供商类型
 * @returns 最终使用的 maxTokens
 */
export function resolveMaxTokens(
  explicitMaxTokens?: number,
  assignmentMaxTokens?: number,
  model?: string,
  provider?: string
): number {
  // 优先级 1：调用方显式传入
  if (explicitMaxTokens !== undefined) {
    return explicitMaxTokens;
  }

  // 优先级 2：策略配置
  if (assignmentMaxTokens !== undefined) {
    return assignmentMaxTokens;
  }

  // 优先级 3-5：模型映射 → 提供商默认 → 全局兜底
  if (model) {
    return getModelMaxTokens(model, provider);
  }

  return GLOBAL_DEFAULT_MAX_TOKENS;
}

// ================================================================
// 模型能力检测
// ================================================================

/**
 * 不支持自定义 temperature 的模型列表（推理模型）
 * 
 * 这些模型只接受 temperature=1（默认值），传入其他值会报 400 错误：
 * "Unsupported value: 'temperature' does not support X with this model."
 * 
 * 规则：所有 OpenAI 推理模型（GPT-5 全系列、O 系列）都不支持自定义 temperature
 * 非推理模型（GPT-4.1、GPT-4o 系列）支持自定义 temperature
 */
const MODELS_NO_TEMPERATURE: Set<string> = new Set([
  // GPT-5 全系列（推理模型）
  'gpt-5-2025-08-07',
  'gpt-5-chat-latest',
  'gpt-5-mini-2025-08-07',
  'gpt-5-nano-2025-08-07',

  // O 系列推理模型
  'o3-2025-04-16',
  'o1-2024-12-17',
  'o4-mini-2025-04-16',
]);

/**
 * 推理模型前缀列表
 * 用于前缀匹配未列出的新快照版本
 */
const REASONING_MODEL_PREFIXES = [
  'gpt-5',        // GPT-5 全系列
  'o1',           // O1 系列
  'o3',           // O3 系列
  'o4',           // O4 系列
];

/**
 * 检查模型是否支持自定义 temperature 参数
 * 
 * @param model 模型名称
 * @returns true 表示支持自定义 temperature，false 表示不支持（推理模型）
 */
export function modelSupportsTemperature(model: string): boolean {
  // 精确匹配
  if (MODELS_NO_TEMPERATURE.has(model)) {
    return false;
  }

  // 前缀匹配：以推理模型前缀开头的都不支持
  for (const prefix of REASONING_MODEL_PREFIXES) {
    if (model.startsWith(prefix)) {
      return false;
    }
  }

  // 默认支持（GPT-4.1、GPT-4o、DeepSeek、Gemini、Grok 等）
  return true;
}
