/**
 * 智能章节编辑的LLM代理架构
 *
 * 此代理使用多步推理过程来分析和改进章节
 */

import { ParsedChapterPlan, AgentLogEntry } from '../types';
import { getFormattedPrompt, PromptNames } from './promptLoader';
import { generateText } from '../services/llm';

// LLM生成函数的类型
type LLMGenerateFunction = (
  prompt: string,
  systemInstruction?: string,
  responseSchema?: object,
  temperature?: number,
  topP?: number,
  topK?: number
) => Promise<string>;

export interface EditingContext {
  chapterContent: string;
  chapterPlan: ParsedChapterPlan;
  chapterPlanText: string;
  critiqueNotes: string;
  chapterNumber: number;
  onLog?: (entry: AgentLogEntry) => void; // UI日志的回调函数
}

export interface AgentDecision {
  strategy: 'targeted-edit' | 'regenerate' | 'polish' | 'skip';
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  estimatedChanges: string;
  confidence: number; // 0-100，代理对此决策的置信度
}

export interface EditingResult {
  refinedContent: string;
  decision: AgentDecision;
  changesApplied: string[];
  qualityScore: number;
  logs: AgentLogEntry[]; // All logs from this editing session
}

/**
 * 创建并发出日志条目的辅助函数
 */
function log(context: EditingContext, type: AgentLogEntry['type'], message: string, details?: any) {
  const entry: AgentLogEntry = {
    timestamp: Date.now(),
    chapterNumber: context.chapterNumber,
    type,
    message,
    details
  };
  
  // Console log
  const emoji = {
    decision: '🤖',
    execution: '⚙️',
    evaluation: '📊',
    iteration: '🔄',
    warning: '⚠️',
    success: '✅'
  }[type];
  
  console.log(`${emoji} ${message}`, details || '');
  
  // UI callback
  if (context.onLog) {
    context.onLog(entry);
  }
}

/**
 * 步骤1：代理分析情况并决定策略
 */
export async function analyzeAndDecide(context: EditingContext): Promise<AgentDecision> {
  const { systemPrompt, userPrompt: analysisPrompt } = getFormattedPrompt(PromptNames.EDITING_AGENT_ANALYSIS, {
    chapter_number: context.chapterNumber,
    critique_notes: context.critiqueNotes || '未发现问题',
    chapter_plan_text: context.chapterPlanText,
    chapter_length: context.chapterContent.length
  });
  
  try {
    const responseSchema = {
      type: 'object' as const,
      additionalProperties: false,
      properties: {
        strategy: { type: 'string' as const, enum: ['targeted-edit', 'regenerate', 'polish', 'skip'] },
        reasoning: { type: 'string' as const },
        priority: { type: 'string' as const, enum: ['high', 'medium', 'low'] },
        estimatedChanges: { type: 'string' as const },
        confidence: { type: 'number' as const, description: '置信度0-100。高置信度(80+)表示决策明确。低置信度(<60)表示不确定。' }
      },
      required: ['strategy', 'reasoning', 'priority', 'estimatedChanges', 'confidence']
    };
    
    const response = await generateText('editing', analysisPrompt, systemPrompt, responseSchema, 0.3, 0.7, 20);
    const decision = JSON.parse(response);
    
    // Log decision
    log(context, 'decision', `Strategy: ${decision.strategy} - ${decision.reasoning}`, {
      strategy: decision.strategy,
      confidence: decision.confidence,
      priority: decision.priority,
      estimatedChanges: decision.estimatedChanges
    });
    
    if (decision.confidence < 60) {
      log(context, 'warning', `LOW CONFIDENCE (${decision.confidence}%) - Agent is uncertain`, {
        confidence: decision.confidence
      });
    }
    
    return decision;
  } catch (e) {
    console.warn('Agent decision failed, falling back to heuristics:', e);
    return fallbackDecision(context);
  }
}

/**
 * Fallback decision logic if agent fails
 */
function fallbackDecision(context: EditingContext): AgentDecision {
  const critique = context.critiqueNotes.toLowerCase();

  if (!context.critiqueNotes || context.critiqueNotes.includes('章节很棒') || context.critiqueNotes.includes('章节强劲')) {
    return {
      strategy: 'skip',
      reasoning: '未发现问题或章节标记为强劲',
      priority: 'low',
      estimatedChanges: '0%',
      confidence: 90
    };
  }

  if (critique.includes('道德简单') || critique.includes('平淡') || critique.includes('原型化') || critique.includes('刻板印象')) {
    return {
      strategy: 'regenerate',
      reasoning: '检测到严重的结构性问题',
      priority: 'high',
      estimatedChanges: '40-60%',
      confidence: 75
    };
  }

  if (critique.includes('比喻') || critique.includes('形容词') || critique.includes('副词') || critique.includes('过度写作')) {
    return {
      strategy: 'targeted-edit',
      reasoning: '检测到语言层面的问题',
      priority: 'medium',
      estimatedChanges: '10-20%',
      confidence: 70
    };
  }

  return {
    strategy: 'polish',
      reasoning: '需要小幅改进',
    priority: 'low',
    estimatedChanges: '5-10%',
    confidence: 65
  };
}

/**
 * 步骤2：代理执行所选策略
 */
export async function executeStrategy(
  context: EditingContext,
  decision: AgentDecision,
  generateText: LLMGenerateFunction
): Promise<string> {
  
  const originalContent = context.chapterContent;
  
  switch (decision.strategy) {
    case 'skip':
      log(context, 'execution', 'Skipping edits - chapter is strong');
      return context.chapterContent;
      
    case 'targeted-edit':
      log(context, 'execution', 'Applying targeted edits');
      const targetedResult = await executeTargetedEdit(context, generateText);
      // Log diff for targeted edits
      if (targetedResult !== originalContent) {
        logDiff(context, originalContent, targetedResult, 'targeted-edit');
      }
      return targetedResult;
      
    case 'regenerate':
      log(context, 'execution', '按照计划重新生成章节');
      const regenerateResult = await executeRegeneration(context, generateText);
      // 记录重新生成的差异
      if (regenerateResult !== originalContent) {
        logDiff(context, originalContent, regenerateResult, 'regenerate');
      }
      return regenerateResult;
      
    case 'polish':
      log(context, 'execution', 'Polishing chapter');
      const polishResult = await executePolish(context, generateText);
      // Log diff for polish
      if (polishResult !== originalContent) {
        logDiff(context, originalContent, polishResult, 'polish');
      }
      return polishResult;
      
    default:
      return context.chapterContent;
  }
}

/**
 * 记录文本差异以便可视化的辅助函数
 */
function logDiff(context: EditingContext, before: string, after: string, strategy: string) {
  const entry: AgentLogEntry = {
    timestamp: Date.now(),
    chapterNumber: context.chapterNumber,
    type: 'diff',
    message: `Text changes applied via ${strategy}`,
    beforeText: before,
    afterText: after,
    strategy: strategy
  };
  
  console.log(`📝 Diff captured for Chapter ${context.chapterNumber} (${strategy})`);
  
  // UI callback
  if (context.onLog) {
    context.onLog(entry);
  }
}

/**
 * Strategy: Targeted Edit - Surgical fixes for specific issues
 */
async function executeTargetedEdit(
  context: EditingContext,
  generateText: LLMGenerateFunction
): Promise<string> {
  
  const { systemPrompt, userPrompt: prompt } = getFormattedPrompt(PromptNames.EDITING_AGENT_TARGETED, {
    critique_notes: context.critiqueNotes,
    chapter_content: context.chapterContent
  });
  
  return await generateText(prompt, systemPrompt, undefined, 0.5, 0.8, 40);
}

/**
 * 策略：重新生成 - 按照计划完全重写
 */
async function executeRegeneration(
  context: EditingContext,
  generateText: LLMGenerateFunction
): Promise<string> {
  
  const { systemPrompt, userPrompt: prompt } = getFormattedPrompt(PromptNames.EDITING_AGENT_REGENERATE, {
    chapter_plan_text: context.chapterPlanText,
    moral_dilemma: context.chapterPlan.moralDilemma || '未指定',
    character_complexity: context.chapterPlan.characterComplexity || '未指定',
    consequences_of_choices: context.chapterPlan.consequencesOfChoices || '未指定',
    conflict_type: context.chapterPlan.conflictType || '未指定',
    tension_level: context.chapterPlan.tensionLevel || 5,
    chapter_content_preview: context.chapterContent.substring(0, 8000) + (context.chapterContent.length > 8000 ? '...（已截断）' : ''),
    critique_notes: context.critiqueNotes
  });
  
  return await generateText(prompt, systemPrompt, undefined, 0.7, 0.9, 60);
}

/**
 * 策略：润色 - 在计划验证基础上的轻度改进
 */
async function executePolish(
  context: EditingContext,
  generateText: LLMGenerateFunction
): Promise<string> {
  
  const { systemPrompt, userPrompt: prompt } = getFormattedPrompt(PromptNames.EDITING_AGENT_POLISH, {
    moral_dilemma: context.chapterPlan.moralDilemma || '未指定',
    character_complexity: context.chapterPlan.characterComplexity || '未指定',
    consequences_of_choices: context.chapterPlan.consequencesOfChoices || '未指定',
    critique_notes: context.critiqueNotes || '无特定问题',
    chapter_content: context.chapterContent
  });
  
  return await generateText(prompt, systemPrompt, undefined, 0.4, 0.8, 30);
}

/**
 * 步骤3：代理评估结果
 */
export async function evaluateResult(
  original: string,
  refined: string,
  context: EditingContext,
  generateText: LLMGenerateFunction
): Promise<{ qualityScore: number; changesApplied: string[] }> {
  
  const { systemPrompt: evaluationSystemPrompt, userPrompt: evaluationPrompt } = getFormattedPrompt(PromptNames.EDITING_AGENT_EVALUATION, {
    original_length: original.length,
    refined_length: refined.length,
    moral_dilemma: context.chapterPlan.moralDilemma || '未指定',
    character_complexity: context.chapterPlan.characterComplexity || '未指定',
    refined_chapter_preview: refined.substring(0, 3000) + '...'
  });

  try {
    const evaluationSchema = {
      type: 'object' as const,
      additionalProperties: false,
      properties: {
        qualityScore: { type: 'number' as const, description: '质量评分0-100' },
        changesApplied: { type: 'array' as const, items: { type: 'string' as const }, description: '已做的改进列表' },
        planElementsPresent: { type: 'boolean' as const, description: '计划元素是否存在？' },
        remainingIssues: { type: 'array' as const, items: { type: 'string' as const }, description: '剩余问题' }
      },
      required: ['qualityScore', 'changesApplied', 'planElementsPresent', 'remainingIssues']
    };
    
    const response = await generateText(evaluationPrompt, evaluationSystemPrompt, evaluationSchema, 0.3, 0.7, 20);
    const evaluation = JSON.parse(response);
    
    log(context, 'evaluation', `Quality Score: ${evaluation.qualityScore}/100`, {
      qualityScore: evaluation.qualityScore,
      planElementsPresent: evaluation.planElementsPresent,
      changesApplied: evaluation.changesApplied,
      remainingIssues: evaluation.remainingIssues
    });
    
    return {
      qualityScore: evaluation.qualityScore,
      changesApplied: evaluation.changesApplied || []
    };
  } catch (e) {
    log(context, 'warning', `Evaluation failed: ${e}. Using default score.`);
    return {
      qualityScore: 75, // Default score
      changesApplied: ['Edits applied']
    };
  }
}

/**
 * Main Agent Workflow - Orchestrates the entire editing process with iterative refinement
 */
export async function agentEditChapter(
  context: EditingContext,
  generateText: LLMGenerateFunction
): Promise<EditingResult> {
  
  log(context, 'iteration', `Agent starting work on Chapter ${context.chapterNumber}`);
  
  const MAX_ITERATIONS = 2;
  let iteration = 1;
  let currentContent = context.chapterContent;
  let lastDecision: AgentDecision;
  let lastQualityScore = 0;
  let allChangesApplied: string[] = [];
  
  while (iteration <= MAX_ITERATIONS) {
    log(context, 'iteration', `Iteration ${iteration}/${MAX_ITERATIONS}`);
    
    // Step 1: Analyze and decide strategy
    const iterationContext = { ...context, chapterContent: currentContent };
    const decision = await analyzeAndDecide(iterationContext);
    lastDecision = decision;
    
    // If agent says skip, we're done
    if (decision.strategy === 'skip') {
      log(context, 'success', 'Chapter is strong, no changes needed');
      break;
    }
    
    // Step 2: Execute strategy
    const refinedContent = await executeStrategy(iterationContext, decision, generateText);
    
    // Step 3: Evaluate result
    const { qualityScore, changesApplied } = await evaluateResult(
      currentContent,
      refinedContent,
      context,
      generateText
    );
    
    lastQualityScore = qualityScore;
    allChangesApplied.push(...changesApplied);
    
    // Check if we need another iteration
    const needsRefinement = qualityScore < 70;
    const hasConfidence = decision.confidence >= 60;
    
    if (!needsRefinement) {
      log(context, 'success', `Quality threshold met (${qualityScore}/100)`, { qualityScore });
      currentContent = refinedContent;
      break;
    }
    
    if (iteration >= MAX_ITERATIONS) {
      log(context, 'warning', `Max iterations reached (${qualityScore}/100)`, { qualityScore });
      currentContent = refinedContent;
      break;
    }
    
    // Decide on next iteration strategy
    if (!hasConfidence && decision.strategy !== 'regenerate') {
      log(context, 'iteration', 'Low confidence + low quality → trying regeneration');
      context.critiqueNotes += '\n\n前次尝试失败。需要按照计划完全重新生成。';
    } else if (decision.strategy === 'targeted-edit') {
      log(context, 'iteration', 'Targeted edit insufficient → trying regeneration');
      context.critiqueNotes += '\n\n针对性编辑不够。需要更深层的结构性修改。';
    } else {
      log(context, 'warning', `Quality still low after ${decision.strategy}`);
    }
    
    currentContent = refinedContent;
    iteration++;
  }
  
  log(context, 'success', `Agent completed Chapter ${context.chapterNumber} after ${iteration} iteration(s)`, {
    finalQuality: lastQualityScore,
    totalChanges: allChangesApplied.length
  });
  
  return {
    refinedContent: currentContent,
    decision: lastDecision,
    changesApplied: allChangesApplied,
    qualityScore: lastQualityScore,
    logs: [] // 日志通过回调发送，不在此存储
  };
}
