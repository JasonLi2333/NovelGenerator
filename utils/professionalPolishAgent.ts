/**
 * Professional Polish Agent - Final pass focused on making text read like a professional novel
 * This is the last editing step before compilation
 */

import { generateText } from '../services/llm';
import { ChapterData, AgentLogEntry } from '../types';

export interface ProfessionalPolishResult {
  polishedChapters: ChapterData[];
  totalChanges: number;
}

/**
 * Applies professional polish to all chapters
 * Focuses on rhythm, subtext, motivation, variety, emotional anchors, and perception layers
 */
export async function applyProfessionalPolish(
  chapters: ChapterData[],
  onProgress?: (current: number, total: number) => void,
  onLog?: (entry: AgentLogEntry) => void
): Promise<ProfessionalPolishResult> {
  
  const polishedChapters: ChapterData[] = [];
  let totalChanges = 0;
  
  console.log('✨ Starting professional polish pass...');
  
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const chapterNum = i + 1;
    
    if (onProgress) {
      onProgress(chapterNum, chapters.length);
    }
    
    console.log(`\n✨ Professional polish: Chapter ${chapterNum}/${chapters.length}`);
    
    // Log start
    if (onLog) {
      onLog({
        timestamp: Date.now(),
        chapterNumber: chapterNum,
        type: 'execution',
        message: `Applying professional polish to Chapter ${chapterNum}`,
        details: { phase: 'professional-polish' }
      });
    }
    
    const originalContent = chapter.content;
    
    // Apply professional polish
    const polishedContent = await polishChapterProfessionally(
      originalContent,
      chapterNum,
      chapters.length
    );
    
    // Check if changes were made
    const hasChanges = polishedContent !== originalContent;
    
    if (hasChanges) {
      totalChanges++;
      
      // Log diff
      if (onLog) {
        onLog({
          timestamp: Date.now(),
          chapterNumber: chapterNum,
          type: 'diff',
          message: `Professional polish applied to Chapter ${chapterNum}`,
          beforeText: originalContent,
          afterText: polishedContent,
          strategy: 'professional-polish'
        });
      }
    }
    
    const polishedChapter: ChapterData = {
      ...chapter,
      content: polishedContent
    };
    
    polishedChapters.push(polishedChapter);
    
    console.log(`✅ Chapter ${chapterNum} professionally polished ${hasChanges ? '(changes applied)' : '(no changes needed)'}`);
  }
  
  console.log(`\n🎉 Professional polish complete! ${totalChanges} chapters modified.`);
  
  return {
    polishedChapters,
    totalChanges
  };
}

/**
 * Applies professional-level polish to a single chapter
 */
async function polishChapterProfessionally(
  content: string,
  chapterNumber: number,
  totalChapters: number
): Promise<string> {
  
  const polishPrompt = `你是一位专业编辑和文体大师。你的任务是对已完成的章节进行润色，使其读起来像专业网文小说。

**第 ${chapterNumber} 章，共 ${totalChapters} 章：**

${content}

---

**你的润色指令：**

**1. 节奏与韵律**
- 拆分长段落（超过5-6句）
- 描写与短情感节拍（1-2句）交替
- 变化句子长度以创造韵律
- 紧张时刻使用短段落

**2. 有潜台词的对话**
- 消除对话中的直接解释
- 添加停顿、手势、欲言又止
- 角色很少直接说出一切
- 展示非语言线索：眼神、沉默、语气
- 从对话中移除说明（"如你所知，鲍勃..."）

**3. 动机与怀疑**
- 在关键决定中插入内心挣扎
- 在选择前展示怀疑、记忆、恐惧
- 不要立即跳到行动 — 让角色思考
- 在做出决定之前展示决定的代价

**4. 反重复**
- 移除相邻段落中的相同词汇
- 对于反复出现的概念（黑暗、火焰、恐惧）使用变化的比喻
- 变化同义词
- 不要连续重复相同的句子结构

**5. 情感锚点**
- 在每个重要场景中，留下一个小的"人性时刻"
- 一个记忆、气味、手势、细节，连接读者与角色
- 感官细节：不只是视觉，还有声音、气味、触觉
- 一个具体意象胜过三个抽象意象

**6. 感知层次**
- 展示角色所见与他们如何诠释之间的差异
- 轻微的自我欺骗或偏见
- 感知的主观性：一个人看到威胁，另一个看到机会
- 内心独白可以与行动矛盾

**7. 最终润色**
- 选择更丰富、更多样的词汇
- 避免陈词滥调和常用短语
- 全章保持一致的风格
- 使文本流畅，场景间无刺耳的过渡
- 检查段落间的过渡是否符合逻辑

**关键禁用词：**
- 绝不使用"一股强大的气息""浑身一震""心中暗道""缓缓说道""目光如炬"等AI套话
- 避免四字成语堆砌
- 扫描全文并移除所有提及

**🔧 关键：未填充槽位清理：**
如果你在文本中看到任何未填充的标记，如 [SLOT_NAME]、[DESCRIPTION_X]、[DIALOGUE_X]、[ACTION_X]、[INTERNAL_X]：
- 这些是生成过程中的错误
- 你必须：
  a) 如果文本流畅，完全移除它们
  b) 用适合上下文的简短内容替换它们
- 不要在最终文本中留下任何 [方括号标记]
- 这是强制性的 - 扫描整章查找所有剩余标记

**重要：**
- 保留所有情节事件和对话
- 不要改变场景的含义
- 不要添加新场景或角色
- 聚焦交付质量，不是内容
- 这是最终润色，不是重写

**返回：**
章节的润色版本。只有章节文本，不要评论。`;

  const systemPrompt = `你是精通小说最终润色的大师级编辑。你的任务是通过韵律、潜台词、情感锚点和感知层次的工作，将好文本转化为专业网文小说。`;

  try {
    const polished = await generateText(
      'editing',
      polishPrompt,
      systemPrompt,
      undefined,
      0.7, // Higher temperature for creative polish
      0.9,
      40
    );
    
    // Validation: polished text should be similar length (within 40%)
    const lengthRatio = polished.length / content.length;
    if (lengthRatio < 0.6 || lengthRatio > 1.4) {
      console.warn(`Professional polish changed length significantly (${lengthRatio.toFixed(2)}x) for chapter ${chapterNumber}. Using original.`);
      return content;
    }
    
    return polished;
  } catch (e) {
    console.warn(`Professional polish failed for chapter ${chapterNumber}:`, e);
    return content;
  }
}
