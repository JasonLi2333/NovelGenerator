/**
 * 模型策略配置
 * 
 * 根据 model-strategy.md 定义的三套方案：
 * - 方案 A (economic): 经济实惠，性价比最优
 * - 方案 B (free): 全免费方案
 * - 方案 C (premium): 顶级质量方案
 */

import { StrategyConfig, TaskType, ModelAssignment } from './types';

/**
 * 方案 A：经济实惠方案（推荐）
 * 
 * 核心理念：规划用免费，创作用 DeepSeek（中文最佳），分析用免费
 * 成本：$0.48/本（10章）
 */
export const STRATEGY_ECONOMIC: StrategyConfig = {
  name: '方案A：经济实惠',
  description: '性价比最优，规划用免费 GPT-5，创作用 DeepSeek，成本 $0.48/本',
  assignments: {
    // 1. 故事大纲生成 - 使用 GPT-5（顶级创意，250K/天免费）
    outline: {
      provider: 'openai',
      model: 'gpt-5-2025-08-07'
    },
    
    // 2-4. 提取环节 - 使用 GPT-4.1-mini（25M/天免费，1M上下文）
    character_extraction: {
      provider: 'openai',
      model: 'gpt-4.1-mini-2025-04-14'
    },
    world_extraction: {
      provider: 'openai',
      model: 'gpt-4.1-mini-2025-04-14'
    },
    motif_extraction: {
      provider: 'openai',
      model: 'gpt-4.1-mini-2025-04-14'
    },
    
    // 5. 章节计划生成 - 使用 GPT-5-mini（25M/天免费，JSON Schema 稳定）
    chapter_planning: {
      provider: 'openai',
      model: 'gpt-5-mini-2025-08-07'
    },
    
    // 6. 三个 Agent - 使用 DeepSeek（中文最佳）
    structure_agent: {
      provider: 'deepseek',
      model: 'deepseek-chat'
    },
    character_agent: {
      provider: 'deepseek',
      model: 'deepseek-chat'
    },
    scene_agent: {
      provider: 'deepseek',
      model: 'deepseek-chat'
    },
    
    // 7. 内容整合 - 使用 DeepSeek（中文连贯性最佳）
    synthesis: {
      provider: 'deepseek',
      model: 'deepseek-chat'
    },
    
    // 8. 章节分析 - 使用 GPT-4.1-mini（25M/天免费，JSON 提取准确）
    chapter_analysis: {
      provider: 'openai',
      model: 'gpt-4.1-mini-2025-04-14'
    },
    
    // 9. 自我批评 - 使用 GPT-4.1-mini（25M/天免费）
    self_critique: {
      provider: 'openai',
      model: 'gpt-4.1-mini-2025-04-14'
    },
    
    // 10. 编辑打磨 - 使用 DeepSeek（中文文笔润色最佳）
    editing: {
      provider: 'deepseek',
      model: 'deepseek-chat'
    },
    
    // 11. 书名生成 - 使用 GPT-5-mini（25M/天免费，创意营销能力强）
    title_generation: {
      provider: 'openai',
      model: 'gpt-5-mini-2025-08-07'
    }
  }
};

/**
 * 方案 B：全免费方案
 * 
 * 核心理念：零预算，充分利用 OpenAI 和 Gemini 免费额度
 * 成本：$0
 */
export const STRATEGY_FREE: StrategyConfig = {
  name: '方案B：全免费',
  description: '零成本方案，全部使用 OpenAI 免费额度（Mini 系列），每天可生成 1-2 本',
  assignments: {
    // 1. 故事大纲生成 - 使用 GPT-5-mini（25M/天免费，质量最好）
    outline: {
      provider: 'openai',
      model: 'gpt-5-mini-2025-08-07'
    },
    
    // 2-4. 提取环节 - 使用 GPT-4.1-mini（25M/天免费，1M上下文）
    character_extraction: {
      provider: 'openai',
      model: 'gpt-4.1-mini-2025-04-14'
    },
    world_extraction: {
      provider: 'openai',
      model: 'gpt-4.1-mini-2025-04-14'
    },
    motif_extraction: {
      provider: 'openai',
      model: 'gpt-4.1-mini-2025-04-14'
    },
    
    // 5. 章节计划生成 - 使用 GPT-5-mini
    chapter_planning: {
      provider: 'openai',
      model: 'gpt-5-mini-2025-08-07'
    },
    
    // 6. 三个 Agent - 使用 GPT-5-mini（128K输出，质量好）
    structure_agent: {
      provider: 'openai',
      model: 'gpt-5-mini-2025-08-07'
    },
    character_agent: {
      provider: 'openai',
      model: 'gpt-5-mini-2025-08-07'
    },
    scene_agent: {
      provider: 'openai',
      model: 'gpt-5-mini-2025-08-07'
    },
    
    // 7. 内容整合 - 使用 GPT-5-mini
    synthesis: {
      provider: 'openai',
      model: 'gpt-5-mini-2025-08-07'
    },
    
    // 8. 章节分析 - 使用 GPT-4.1-mini（1M上下文）
    chapter_analysis: {
      provider: 'openai',
      model: 'gpt-4.1-mini-2025-04-14'
    },
    
    // 9. 自我批评 - 使用 GPT-4.1-mini
    self_critique: {
      provider: 'openai',
      model: 'gpt-4.1-mini-2025-04-14'
    },
    
    // 10. 编辑打磨 - 使用 GPT-5-mini（润色能力好）
    editing: {
      provider: 'openai',
      model: 'gpt-5-mini-2025-08-07'
    },
    
    // 11. 书名生成 - 使用 GPT-5-mini（创意强）
    title_generation: {
      provider: 'openai',
      model: 'gpt-5-mini-2025-08-07'
    }
  }
};

/**
 * 方案 C：顶级质量方案
 * 
 * 核心理念：需要顶级创意的用 GPT-5，读者阅读体验用 DeepSeek
 * 成本：$0.48/本（10章）
 */
export const STRATEGY_PREMIUM: StrategyConfig = {
  name: '方案C：顶级质量',
  description: '出版级品质，创意用 GPT-5，创作用 DeepSeek，成本 $0.48/本',
  assignments: {
    // 1. 故事大纲生成 - 使用 GPT-5（顶级创意构思）
    outline: {
      provider: 'openai',
      model: 'gpt-5-2025-08-07'
    },
    
    // 2-4. 提取环节 - 使用 GPT-4.1-mini（工具性任务，免费+质量好）
    character_extraction: {
      provider: 'openai',
      model: 'gpt-4.1-mini-2025-04-14'
    },
    world_extraction: {
      provider: 'openai',
      model: 'gpt-4.1-mini-2025-04-14'
    },
    motif_extraction: {
      provider: 'openai',
      model: 'gpt-4.1-mini-2025-04-14'
    },
    
    // 5. 章节计划生成 - 使用 GPT-5（顶级结构设计）
    chapter_planning: {
      provider: 'openai',
      model: 'gpt-5-2025-08-07'
    },
    
    // 6. 三个 Agent - 使用 DeepSeek（中文阅读体验最佳）
    structure_agent: {
      provider: 'deepseek',
      model: 'deepseek-chat'
    },
    character_agent: {
      provider: 'deepseek',
      model: 'deepseek-chat'
    },
    scene_agent: {
      provider: 'deepseek',
      model: 'deepseek-chat'
    },
    
    // 7. 内容整合 - 使用 DeepSeek（中文连贯流畅）
    synthesis: {
      provider: 'deepseek',
      model: 'deepseek-chat'
    },
    
    // 8. 章节分析 - 使用 GPT-4.1-mini（工具任务）
    chapter_analysis: {
      provider: 'openai',
      model: 'gpt-4.1-mini-2025-04-14'
    },
    
    // 9. 自我批评 - 使用 GPT-5（顶级质量把控）
    self_critique: {
      provider: 'openai',
      model: 'gpt-5-2025-08-07'
    },
    
    // 10. 编辑打磨 - 使用 DeepSeek（中文文笔打磨）
    editing: {
      provider: 'deepseek',
      model: 'deepseek-chat'
    },
    
    // 11. 书名生成 - 使用 GPT-5（顶级营销创意）
    title_generation: {
      provider: 'openai',
      model: 'gpt-5-2025-08-07'
    }
  }
};

/**
 * TEST 方案：测试方案
 * 
 * 核心理念：复刻 FREE 版本，但用 nano 替代 mini（成本优先）
 * 成本：超额后更便宜（nano 价格是 mini 的 1/5）
 */
export const STRATEGY_TEST: StrategyConfig = {
  name: 'TEST：测试方案',
  description: '成本最低，全部使用 OpenAI Nano 系列（便宜 5 倍）',
  assignments: {
    // 1. 故事大纲生成 - 使用 GPT-5-nano（25M/天免费，成本敏感）
    outline: {
      provider: 'openai',
      model: 'gpt-5-nano-2025-08-07'
    },
    
    // 2-4. 提取环节 - 使用 GPT-4.1-nano（25M/天免费）
    character_extraction: {
      provider: 'openai',
      model: 'gpt-4.1-nano-2025-04-14'
    },
    world_extraction: {
      provider: 'openai',
      model: 'gpt-4.1-nano-2025-04-14'
    },
    motif_extraction: {
      provider: 'openai',
      model: 'gpt-4.1-nano-2025-04-14'
    },
    
    // 5. 章节计划生成 - 使用 GPT-5-nano
    chapter_planning: {
      provider: 'openai',
      model: 'gpt-5-nano-2025-08-07'
    },
    
    // 6. 三个 Agent - 使用 GPT-5-nano
    structure_agent: {
      provider: 'openai',
      model: 'gpt-5-nano-2025-08-07'
    },
    character_agent: {
      provider: 'openai',
      model: 'gpt-5-nano-2025-08-07'
    },
    scene_agent: {
      provider: 'openai',
      model: 'gpt-5-nano-2025-08-07'
    },
    
    // 7. 内容整合 - 使用 GPT-5-nano
    synthesis: {
      provider: 'openai',
      model: 'gpt-5-nano-2025-08-07'
    },
    
    // 8. 章节分析 - 使用 GPT-4.1-nano
    chapter_analysis: {
      provider: 'openai',
      model: 'gpt-4.1-nano-2025-04-14'
    },
    
    // 9. 自我批评 - 使用 GPT-4.1-nano
    self_critique: {
      provider: 'openai',
      model: 'gpt-4.1-nano-2025-04-14'
    },
    
    // 10. 编辑打磨 - 使用 GPT-5-nano
    editing: {
      provider: 'openai',
      model: 'gpt-5-nano-2025-08-07'
    },
    
    // 11. 书名生成 - 使用 GPT-5-nano
    title_generation: {
      provider: 'openai',
      model: 'gpt-5-nano-2025-08-07'
    }
  }
};

/**
 * 默认策略（保持兼容性）
 * 使用原有的 Gemini 配置
 */
export const STRATEGY_DEFAULT: StrategyConfig = {
  name: '默认（Gemini）',
  description: '保持向后兼容，全部使用 Gemini 2.5 Flash',
  assignments: {
    outline: { provider: 'gemini', model: 'gemini-2.5-flash' },
    character_extraction: { provider: 'gemini', model: 'gemini-2.5-flash' },
    world_extraction: { provider: 'gemini', model: 'gemini-2.5-flash' },
    motif_extraction: { provider: 'gemini', model: 'gemini-2.5-flash' },
    chapter_planning: { provider: 'gemini', model: 'gemini-2.5-flash' },
    structure_agent: { provider: 'gemini', model: 'gemini-2.5-flash' },
    character_agent: { provider: 'gemini', model: 'gemini-2.5-flash' },
    scene_agent: { provider: 'gemini', model: 'gemini-2.5-flash' },
    synthesis: { provider: 'gemini', model: 'gemini-2.5-flash' },
    chapter_analysis: { provider: 'gemini', model: 'gemini-2.5-flash' },
    self_critique: { provider: 'gemini', model: 'gemini-2.5-flash' },
    editing: { provider: 'gemini', model: 'gemini-2.5-flash' },
    title_generation: { provider: 'gemini', model: 'gemini-2.5-flash' }
  }
};

/**
 * 所有预定义策略
 */
export const PREDEFINED_STRATEGIES: Record<string, StrategyConfig> = {
  'default': STRATEGY_DEFAULT,
  'economic': STRATEGY_ECONOMIC,
  'free': STRATEGY_FREE,
  'premium': STRATEGY_PREMIUM,
  'test': STRATEGY_TEST
};

/**
 * 自定义策略注册表
 */
const customStrategies: Map<string, StrategyConfig> = new Map();

/**
 * 注册自定义策略
 */
export function registerStrategy(id: string, config: StrategyConfig): void {
  if (PREDEFINED_STRATEGIES[id]) {
    throw new Error(`Cannot override predefined strategy: ${id}`);
  }
  customStrategies.set(id, config);
  console.log(`✅ Registered custom strategy: ${id} - ${config.name}`);
}

/**
 * 获取策略配置
 */
export function getStrategy(id: string): StrategyConfig | undefined {
  return PREDEFINED_STRATEGIES[id] || customStrategies.get(id);
}

/**
 * 获取所有可用策略
 */
export function getAllStrategies(): Array<{ id: string; config: StrategyConfig }> {
  const all: Array<{ id: string; config: StrategyConfig }> = [];
  
  // 预定义策略
  for (const [id, config] of Object.entries(PREDEFINED_STRATEGIES)) {
    all.push({ id, config });
  }
  
  // 自定义策略
  for (const [id, config] of customStrategies.entries()) {
    all.push({ id, config });
  }
  
  return all;
}

/**
 * 取消注册自定义策略
 */
export function unregisterStrategy(id: string): boolean {
  return customStrategies.delete(id);
}
