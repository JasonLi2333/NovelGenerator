/**
 * 最终编辑阶段 - 一起审查所有章节的一致性和润色
 * 这会在所有章节生成并单独编辑后运行
 */

import { generateText } from '../services/llm';
import { ParsedChapterPlan, AgentLogEntry, ChapterData } from '../types';
import { agentEditChapter, EditingContext } from './editingAgent';

export interface FinalPassResult {
  editedChapters: ChapterData[];
  totalChanges: number;
  logs: AgentLogEntry[];
}

/**
 * Performs a final editing pass on all chapters
 * This is more aggressive than individual chapter editing because we have full context
 */
export async function performFinalEditingPass(
  chapters: ChapterData[],
  parsedChapterPlans: ParsedChapterPlan[],
  onProgress?: (current: number, total: number) => void,
  onLog?: (entry: AgentLogEntry) => void
): Promise<FinalPassResult> {
  
  const editedChapters: ChapterData[] = [];
  let totalChanges = 0;
  
  console.log('🔄 Starting final editing pass on all chapters...');
  
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const chapterNum = i + 1;
    const plan = parsedChapterPlans[i];
    
    if (onProgress) {
      onProgress(chapterNum, chapters.length);
    }
    
    console.log(`\n📝 Final pass: Chapter ${chapterNum}/${chapters.length}`);
    
    // 从周围章节构建上下文以获得更好的连续性
    const previousChapter = i > 0 ? chapters[i - 1] : null;
    const nextChapter = i < chapters.length - 1 ? chapters[i + 1] : null;
    
    // 为最终阶段生成全面的批评
    const finalCritique = await generateFinalCritique(
      chapter.content,
      plan,
      chapterNum,
      previousChapter?.content,
      nextChapter?.content
    );
    
    // 构建章节计划文本
    const chapterPlanText = buildChapterPlanText(plan);
    
    // 使用最终阶段上下文运行代理编辑
    const context: EditingContext = {
      chapterContent: chapter.content,
      chapterPlan: plan,
      chapterPlanText: chapterPlanText,
      critiqueNotes: finalCritique,
      chapterNumber: chapterNum,
      onLog: onLog
    };
    
    const result = await agentEditChapter(context, (prompt, system, schema, temp, topP, topK) => generateText('editing', prompt, system, schema, temp, topP, topK));
    
    // 使用编辑后的内容更新章节
    const editedChapter: ChapterData = {
      ...chapter,
      content: result.refinedContent
    };
    
    editedChapters.push(editedChapter);
    totalChanges += result.changesApplied.length;
    
    console.log(`✅ Chapter ${chapterNum} final pass complete (${result.changesApplied.length} changes)`);
  }
  
  console.log(`\n🎉 Final editing pass complete! Total changes: ${totalChanges}`);
  
  return {
    editedChapters,
    totalChanges,
    logs: [] // Logs are sent via callback
  };
}

/**
 * 为最终阶段生成全面的批评
 * 这比单独章节批评更彻底
 */
async function generateFinalCritique(
  chapterContent: string,
  plan: ParsedChapterPlan,
  chapterNumber: number,
  previousChapterContent?: string | null,
  nextChapterContent?: string | null
): Promise<string> {
  
  const previousContext = previousChapterContent 
    ? `\n**上一章（最后1000字）：**\n${previousChapterContent.slice(-1000)}\n`
    : '';
  
  const nextContext = nextChapterContent
    ? `\n**下一章（前1000字）：**\n${nextChapterContent.slice(0, 1000)}\n`
    : '';
  
  const critiquePrompt = `你正在对本章进行最终编辑审核。这是出版前修复问题的最后机会。

**第 ${chapterNumber} 章：**
${chapterContent.substring(0, 6000)}${chapterContent.length > 6000 ? '...(内容继续)' : ''}

**章节计划：**
- 道德困境：${plan.moralDilemma || '未指定'}
- 角色复杂性：${plan.characterComplexity || '未指定'}
- 后果：${plan.consequencesOfChoices || '未指定'}
${previousContext}${nextContext}

**最终审核重点：**

**0. 禁用词汇（绝对优先）：**
   - 绝不允许"一股强大的气息""浑身一震""心中暗道""缓缓说道""目光如炬"等AI套话
   - 不要堆砌四字成语
   - 这是关键 - 立即标记任何实例

1. **连贯性问题（关键）：**
   - 本章是否从上一章自然流畅？
   - 是否有刺耳的过渡或无法解释的跳跃？
   - 角色状态/位置在前一章的基础上是否合理？

2. **过度写作（关键）：**
   - 堆砌的比喻（每段超过一个）
   - 过多的形容词（每个名词超过2个）
   - 华丽文笔或过于花哨的语言
   - 冗余描述

3. **展现 VS 告知：**
   - 情绪是被告知而非展现？
   - 太多"她感到"、"他看到"、"他们听到"？

4. **计划遵循：**
   - 道德困境是否存在且清晰？
   - 角色复杂性是否体现？
   - 选择的后果是否可见？

5. **节奏：**
   - 是否有缓慢点或信息倾倒？
   - 章节是否保持动力？

6. **对话：**
   - 对话听起来自然吗？
   - 角色声音是否独特？
   - 对话中是否有太多说明？

7. **章节结尾：**
   - 是否创造了向前的动力？
   - 是否有下一章的钩子？

**回应：**
- 如果章节强劲："章节强劲" + 哪些效果好
- 如果发现问题：列出3-5个具体问题及示例
- 聚焦于读者会注意到的问题
- 直接且可操作

记住：这是最终审核。只标记值得修复的问题。`;

  const systemPrompt = "你是资深编辑，在出版前进行最终质量控制。";
  
  try {
    const critique = await generateText('self_critique', critiquePrompt, systemPrompt, undefined, 0.4, 0.7, 20);
    return critique;
  } catch (e) {
    console.warn(`为第${chapterNumber}章生成最终批评失败：`, e);
    return "执行标准质量检查。";
  }
}

/**
 * 从解析的计划对象构建章节计划文本
 */
function buildChapterPlanText(plan: ParsedChapterPlan): string {
  return `标题: ${plan.title || '未命名'}
概要: ${plan.summary || '无概要'}
场景分解: ${plan.sceneBreakdown || '无分解'}
角色发展重点: ${plan.characterDevelopmentFocus || '未指定'}
情节推进: ${plan.plotAdvancement || '未指定'}
时间线指示: ${plan.timelineIndicators || '未指定'}
情感基调/张力: ${plan.emotionalToneTension || '未指定'}
与下一章的连接: ${plan.connectionToNextChapter || '未指定'}
冲突类型: ${plan.conflictType || '未指定'}
张力等级: ${plan.tensionLevel || '未指定'}/10
节奏/步调: ${plan.rhythmPacing || '未指定'}
文字经济重点: ${plan.wordEconomyFocus || '未指定'}

**道德与角色深度:**
道德困境: ${plan.moralDilemma || '未指定'}
角色复杂性: ${plan.characterComplexity || '未指定'}
选择后果: ${plan.consequencesOfChoices || '未指定'}`.trim();
}

/**
 * 快速检查是否需要最终阶段
 * 如果章节可能需要最终润色则返回true
 */
export function shouldPerformFinalPass(chapters: ChapterData[]): boolean {
  // 对于3章或以上的书籍，始终执行最终阶段
  if (chapters.length >= 3) {
    return true;
  }
  
  return false;
}
