/**
 * 中文网文专业编辑通道 - 针对散文不同方面的专业化编辑
 */

export interface EditingPass {
  name: string;
  systemPrompt: string;
  userPromptTemplate: (content: string, context?: any) => string;
}

/**
 * 对话润色通道 - 聚焦让对话自然且有目的性
 */
export const DIALOGUE_POLISH_PASS: EditingPass = {
  name: "对话润色",
  systemPrompt: "你是对话专家。你的专长是让对话听起来自然、揭示角色性格、通过言语推进情节。",
  userPromptTemplate: (content: string) => `审查本章的对话。对每段对话：

**对话原则：**
1. **潜台词优于说明** - 人们很少直接说出本意
2. **独特声音** - 每个角色应该听起来不同
3. **目的性** - 每句话都应揭示角色、推进情节或增加紧张感
4. **自然节奏** - 人们会打断、话说到一半、使用口语
5. **削减废话** - 除非用于塑造角色，否则删除"嗯"、"那个"、"你知道的"

**需要修复的：**
- 说明式对话（"你知道的，我们之前……"）
- 过于直白的对话（直接说出感受）
- 千人一面的声音（所有人听起来一样）
- 不服务故事的不必要客套

返回改进对话后的章节。保持所有非对话文本完全不变。

章节：
${content}`
};

/**
 * 动作序列紧缩通道 - 使动作清晰、快速、有冲击力
 */
export const ACTION_TIGHTENING_PASS: EditingPass = {
  name: "动作紧缩",
  systemPrompt: "你是动作序列专家。你让战斗场景、追逐和肢体对抗变得有血有肉且清晰。",
  userPromptTemplate: (content: string) => `紧缩本章的动作序列。

**动作原则：**
1. **短句** - 创造紧迫感和速度
2. **强动词** - "扑向"而非"快速移动"
3. **感官细节** - 感觉/声音/气味是什么样的？
4. **清晰编排** - 读者应能在脑中形成画面
5. **削减多余动作** - 跳过"他站起来走到门口"

**需要修复的：**
- 冗长的动作描写
- 弱动词+副词的组合
- 不清晰的空间关系
- 过度解释明显的动作

返回紧缩动作后的章节。保持所有非动作文本完全不变。

章节：
${content}`
};

/**
 * 描写精炼通道 - 平衡氛围与经济性
 */
export const DESCRIPTION_REFINEMENT_PASS: EditingPass = {
  name: "描写精炼",
  systemPrompt: "你是描写专家。你用最少的文字创造生动意象，平衡氛围与叙事动力。",
  userPromptTemplate: (content: string, context?: { focus: string }) => `精炼本章的描写段落。

**描写原则：**
1. **具体优于笼统** - "橡木桌"胜于"桌子"
2. **感官多样** - 不只视觉，包含声音、气味、触觉
3. **经济性** - 一个完美的细节胜过三个平庸的
4. **情绪匹配** - 描写应匹配场景的情感语气
5. **避免华丽辞藻** - 不要"辉煌壮丽"地描写任何东西

**聚焦：** ${context?.focus || '平衡 - 保持氛围同时不减慢节奏'}

**需要修复的：**
- 笼统描写（"很美"、"很好"、"不错"）
- 华丽辞藻（过度花哨的语言）
- 信息倾倒（大段设定描写）
- 过滤词（"她看到"、"他注意到"）

返回精炼描写后的章节。保持对话和动作完全不变。

章节：
${content}`
};

/**
 * 节奏调整通道 - 按需加速或减速
 */
export const PACING_ADJUSTMENT_PASS: EditingPass = {
  name: "节奏调整",
  systemPrompt: "你是节奏专家。你通过句子结构、段落长度和场景过渡来控制叙事韵律。",
  userPromptTemplate: (content: string, context?: { targetPacing: string }) => `调整本章的节奏。

**目标节奏：** ${context?.targetPacing || '中等'}

**节奏技巧：**
- **快节奏：** 短句。简短段落。削减描写。聚焦动作和对话。
- **中节奏：** 变化的句子长度。平衡动作、对话和描写。
- **慢节奏：** 较长句子。更多内省。氛围细节。角色反思。

**需要调整的：**
- 句子长度变化
- 段落分隔
- 动作与反思的平衡
- 场景间的过渡速度

返回调整节奏后的章节。保持所有情节点和角色时刻。

章节：
${content}`
};

/**
 * 对内容应用专业化编辑通道
 */
export async function applyEditingPass(
  content: string,
  pass: EditingPass,
  context: any,
  llmFunction: (prompt: string, system: string, schema?: object, temp?: number, topP?: number, topK?: number) => Promise<string>
): Promise<string> {
  try {
    const userPrompt = pass.userPromptTemplate(content, context);
    const edited = await llmFunction(userPrompt, pass.systemPrompt, undefined, 0.6, 0.85, 30);
    
    // 基本验证 - 编辑后内容应长度相近（30%范围内）
    const lengthRatio = edited.length / content.length;
    if (lengthRatio < 0.5 || lengthRatio > 1.5) {
      console.warn(`${pass.name} 显著改变了内容长度（${lengthRatio.toFixed(2)}倍）。使用原文。`);
      return content;
    }
    
    return edited;
  } catch (error) {
    console.warn(`${pass.name} 失败：`, error);
    return content;
  }
}

/**
 * 按顺序应用多个编辑通道
 */
export async function applyMultipleEditingPasses(
  content: string,
  passes: { pass: EditingPass; context?: any }[],
  llmFunction: (prompt: string, system: string, schema?: object, temp?: number, topP?: number, topK?: number) => Promise<string>
): Promise<string> {
  let editedContent = content;
  
  for (const { pass, context } of passes) {
    console.log(`正在应用 ${pass.name}...`);
    editedContent = await applyEditingPass(editedContent, pass, context, llmFunction);
    // 小延迟避免速率限制
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return editedContent;
}
