// 小说生成各阶段的参数配置
// Temperature 控制随机性：0.0 = 确定性，1.0 = 高创意
// TopP 控制多样性：较低 = 更聚焦，较高 = 更多样

export interface GenerationParams {
  temperature: number;
  topP: number;
  topK?: number;
}

// 故事大纲生成参数 - 更具创造性
export const OUTLINE_PARAMS: GenerationParams = {
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
};

// 章节内容生成参数 - 平衡创造性
export const CHAPTER_CONTENT_PARAMS: GenerationParams = {
  temperature: 0.8,
  topP: 0.9,
  topK: 40,
};

// 分析和提取参数 - 更具确定性
export const ANALYSIS_PARAMS: GenerationParams = {
  temperature: 0.3,
  topP: 0.7,
  topK: 20,
};

// 编辑和优化参数 - 中等创造性
export const EDITING_PARAMS: GenerationParams = {
  temperature: 0.6,
  topP: 0.85,
  topK: 30,
};

// 角色/世界观提取参数 - 确定性
export const EXTRACTION_PARAMS: GenerationParams = {
  temperature: 0.2,
  topP: 0.6,
  topK: 10,
};

// 标题生成参数 - 创造性
export const TITLE_PARAMS: GenerationParams = {
  temperature: 0.85,
  topP: 0.9,
  topK: 40,
};
