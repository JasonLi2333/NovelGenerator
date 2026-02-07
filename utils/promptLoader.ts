/**
 * 提示加载和模板化工具
 */

export interface PromptTemplate {
  systemPrompt: string;
  userPrompt: string;
}

// 由于这在浏览器中运行，我们将提示直接嵌入代码中
// 这对打包应用程序更有效
const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {};

/**
 * 从嵌入的模板中加载提示模板
 */
export function loadPromptTemplate(promptName: string): PromptTemplate {
  const template = PROMPT_TEMPLATES[promptName];
  if (!template) {
    console.error(`Prompt template not found: ${promptName}`);
    throw new Error(`Could not load prompt template: ${promptName}`);
  }
  return template;
}

/**
 * 注册提示模板（用于初始化）
 */
export function registerPromptTemplate(name: string, template: PromptTemplate) {
  PROMPT_TEMPLATES[name] = template;
}

/**
 * 替换提示字符串中的模板变量
 */
export function formatPrompt(template: string, variables: Record<string, any>): string {
  let formatted = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    formatted = formatted.replace(regex, String(value || ''));
  }

  return formatted;
}

/**
 * 获取格式化的提示，准备与AI一起使用
 */
export function getFormattedPrompt(promptName: string, variables: Record<string, any> = {}): PromptTemplate {
  const template = loadPromptTemplate(promptName);

  return {
    systemPrompt: formatPrompt(template.systemPrompt, variables),
    userPrompt: formatPrompt(template.userPrompt, variables)
  };
}

/**
 * 提示名称枚举，用于类型安全
 */
export enum PromptNames {
  STORY_OUTLINE = 'story-outline-generation',
  CHAPTER_PLANNING = 'chapter-planning',
  CHAPTER_WRITING = 'chapter-writing',
  CHAPTER_ANALYSIS = 'chapter-analysis',
  SELF_CRITIQUE = 'self-critique',
  CHARACTER_UPDATES = 'character-updates',
  TRANSITION_WRITING = 'transition-writing',
  TITLE_GENERATION = 'title-generation',
  EDITING_AGENT_ANALYSIS = 'editing-agent-analysis',
  EDITING_AGENT_TARGETED = 'editing-agent-targeted',
  EDITING_AGENT_REGENERATE = 'editing-agent-regenerate',
  EDITING_AGENT_POLISH = 'editing-agent-polish',
  EDITING_AGENT_EVALUATION = 'editing-agent-evaluation',
  CONSISTENCY_CHECKER = 'consistency-checker',
  PROFESSIONAL_POLISH = 'professional-polish',
  FINAL_EDITING_PASS = 'final-editing-pass',
  SPECIALIZED_EDITORS = 'specialized-editors',
  // Hybrid Multi-Agent System
  STRUCTURE_AGENT = 'structure-agent',
  CHARACTER_AGENT = 'character-agent',
  SCENE_AGENT = 'scene-agent',
  SYNTHESIS_AGENT = 'synthesis-agent'
}