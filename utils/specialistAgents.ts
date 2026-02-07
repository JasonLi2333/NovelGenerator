/**
 * Specialist Agents System
 * Specialized agents for different aspects of chapter generation
 */

import { generateText } from '../services/llm';
import { ParsedChapterPlan } from '../types';
import { StructureContext, CharacterContext, SceneContext, CoherenceConstraints } from './coherenceManager';
import { getFormattedPrompt, PromptNames, formatPrompt } from './promptLoader';
import { getGenreGuidelines } from './genrePrompts';

// =================== SHARED INTERFACES ===================

export interface AgentOutput {
  content: Record<string, string>;
  metadata: {
    agentType: string;
    processingTime: number;
    confidence: number;
    notes: string[];
  };
}

export interface SlotContent {
  slotId: string;
  content: string;
  type: 'dialogue' | 'action' | 'internal' | 'description' | 'transition';
  priority: number;
}

// =================== STRUCTURE AGENT ===================

export interface StructureAgentInput {
  chapterPlan: ParsedChapterPlan;
  chapterNumber: number;
  context: StructureContext;
  constraints: CoherenceConstraints;
  previousChapterEnd?: string;
  targetLength: number;
  storyOutline: string;
}

export interface StructureAgentOutput extends AgentOutput {
  chapterStructure: string; // Template with [SLOT] markers
  plotAdvancement: string[];
  pacingNotes: string[];
  transitionPoints: string[];
  slots: {
    dialogueSlots: string[];
    actionSlots: string[];
    internalSlots: string[];
    descriptionSlots: string[];
  };
}

export class StructureAgent {
  async generate(input: StructureAgentInput): Promise<StructureAgentOutput> {
    const startTime = Date.now();

    console.log(`🏗️ Structure Agent generating framework for Chapter ${input.chapterNumber}`);

    const prompt = this.buildStructurePrompt(input);
    const structureContent = await generateText(
      'structure_agent',
      prompt.userPrompt,
      prompt.systemPrompt,
      undefined, // No JSON schema needed for structure
      0.7, // Higher creativity for structure
      0.9,
      40
    );

    const output = this.parseStructureOutput(structureContent, input);
    output.metadata = {
      agentType: 'Structure',
      processingTime: Date.now() - startTime,
      confidence: 85, // Structure is fairly predictable
      notes: [`Generated framework with ${Object.keys(output.content).length} slots`]
    };

    return output;
  }

  private buildStructurePrompt(input: StructureAgentInput): { systemPrompt: string; userPrompt: string } {
    const systemPrompt = `你是故事架构大师，专精章节结构和叙事流畅。你的工作是创建散文叙事骨架 - 带有[SLOT]标记的流畅章节文本，供其他专家填充。

关键输出要求：
1. 写实际的散文文本 - 读起来像章节草稿的流畅叙事
2. 在散文流中自然嵌入[SLOT]标记
3. 不要写大纲、框架或元描述
4. 不要使用强度标记如"*强度：5/10*"
5. 不要写"以下是框架"或类似介绍
6. 立即以叙事散文开始

正确输出的强制示例：
✅ 正确："她推开酒馆的门。[DESCRIPTION_LOBBY_ATMOSPHERE] 老板娘的笑容过于热情。[DIALOGUE_RECEPTIONIST_GREETING] 一阵寒意在她胃里蔓延。[INTERNAL_DELILAH_UNEASE] 还没来得及转身离开，身后响起了脚步声。[ACTION_APPROACH]"

❌ 绝对错误："*开场 - 强度：5/10* 角色进入酒馆。[DESCRIPTION_LOBBY_ATMOSPHERE]"
❌ 绝对错误："以下是第2章的结构框架..."
❌ 绝对错误："**章节标题** *强度标记* 结构元素"

需要自然嵌入的槽位类型：
- [DIALOGUE_X] 用于对话场景
- [ACTION_X] 用于肢体动作和移动
- [INTERNAL_X] 用于角色想法和情感
- [DESCRIPTION_X] 用于环境和氛围细节
- [TRANSITION_X] 用于连接不同场景

你的输出必须是嵌入槽位的流畅散文 - 别无其他！`;

    const userPrompt = `为第 ${input.chapterNumber} 章写散文骨架："${input.chapterPlan.title}"

**故事大纲 - 关键背景：**
${input.storyOutline}

**要实施的章节计划：**
${this.formatChapterPlan(input.chapterPlan)}

**详细场景结构：**
${this.formatDetailedScenes(input.chapterPlan)}

**计划事件：**
${this.formatChapterEvents(input.chapterPlan)}

**对话节拍：**
${this.formatDialogueBeats(input.chapterPlan)}

**角色弧线：**
${this.formatCharacterArcs(input.chapterPlan)}

**结构要求：**
- 在故事中的角色：${input.context.chapterRole}
- 节奏：${input.context.pacingRequirements.tempo}
- 紧张度：${input.context.pacingRequirements.tensionLevel}/10
- 要推进的情节线：${input.context.plotThreadsToAdvance.map(t => t.title).join('、')}

**上一章连接：**
${input.previousChapterEnd ? `上一章结尾："${input.previousChapterEnd.slice(-200)}"` : '这是第一章'}

**关键：** 结构必须服务于上述大纲中描述的整体故事弧线。确保本章推动叙事朝故事最终目标前进，并与已建立的主题、角色弧线和世界观保持一致。

**情感曲线要求：**
强制：规划情感强度递进，避免单调水平
- 开头(0-20%)：中等强度(4-6/10) - 建立基线
- 上升(20-60%)：逐渐增强，有高峰和低谷
- 高潮(70-80%)：峰值强度(8-10/10) - 主要情感时刻
- 收束(80-100%)：受控下降，可能有钩子冲击

**结构指南：**

1. **开场钩子(0-20% - 中等强度)：** 引人入胜但不压倒
   - 如不是第一章则连接上一章
   - 快速建立当前情况
   - 用[DESCRIPTION_OPENING]表示设定，[INTERNAL_OPENING]表示角色状态
   - 强度目标：4-6/10

2. **上升动作(20-60% - 可变强度)：** 在呼吸时刻中建立紧张
   - 用[DIALOGUE_X]槽位表示角色互动
   - 用[ACTION_X]槽位表示肢体事件
   - 用[INTERNAL_X]槽位表示角色反应
   - 每2-3个高紧张槽位包含一个平静节拍
   - 强度目标：3-7/10（变化的）

3. **高潮(70-80% - 峰值强度)：** 引入章节的主要挑战
   - 清晰标记关键转折点
   - 用[DIALOGUE_CONFLICT]表示冲突场景
   - 用[ACTION_CLIMAX]表示高潮动作
   - 强度目标：8-10/10

4. **收束/钩子(80-100% - 受控下降)：** 以前进动力结束
   - 解决当前章节冲突
   - 为下一章创造钩子
   - 用[TRANSITION_END]表示章节结尾
   - 强度目标：5-7/10

**槽位分配目标：**
目标章节长度：${input.targetLength} 字

对于此长度，目标为：
- 对话槽位：${Math.ceil(input.targetLength / 500)}-${Math.ceil(input.targetLength / 400)}个（对话和角色互动）
- 动作槽位：${Math.ceil(input.targetLength / 1000)}-${Math.ceil(input.targetLength / 600)}个（肢体事件和移动）
- 内心槽位：${Math.ceil(input.targetLength / 1000)}-${Math.ceil(input.targetLength / 800)}个（角色想法和情感反应）
- 描写槽位：${Math.ceil(input.targetLength / 800)}-${Math.ceil(input.targetLength / 600)}个（氛围、环境、感官细节）
- 过渡槽位：${Math.ceil(input.targetLength / 1200)}-${Math.ceil(input.targetLength / 1000)}个（场景变化和流畅连接）

注意：这些是最低目标。如需要可创建更多槽位以自然达到目标长度。

**输出格式：**
创建一个读起来自然的流畅叙事框架，同时清晰标记专家内容应插入的位置。每个槽位应简要说明需要什么类型的内容。

**结构示例：**
"他推开酒馆的门。[DESCRIPTION_TAVERN_ATMOSPHERE] 掌柜的反应很迅速。[DIALOGUE_BARKEEP_GREETING] 他的态度有些不对劲。[INTERNAL_HERO_SUSPICION]

对话出现了意想不到的转折。[DIALOGUE_REVELATION] [INTERNAL_HERO_REACTION] 毫无预警，局面升级了。[ACTION_CONFRONTATION]

[TRANSITION_ESCAPE] 章节以[DESCRIPTION_CONSEQUENCES]和[INTERNAL_RESOLVE]结束。"

现在立即写完整的散文章节骨架 - 以包含[SLOT]标记的叙事文本立即开始：`;

    return { systemPrompt, userPrompt };
  }

  private formatChapterPlan(plan: ParsedChapterPlan): string {
    return `标题：${plan.title}
概要：${plan.summary}
场景拆解：${plan.sceneBreakdown}
冲突类型：${plan.conflictType}
紧张度：${plan.tensionLevel}/10
道德困境：${plan.moralDilemma}
角色复杂性：${plan.characterComplexity}
后果：${plan.consequencesOfChoices}
目标字数：${plan.targetWordCount || '未指定'}
开场钩子：${plan.openingHook || '未指定'}
高潮时刻：${plan.climaxMoment || '未指定'}
章节结尾：${plan.chapterEnding || '未指定'}`;
  }

  private formatDetailedScenes(plan: ParsedChapterPlan): string {
    if (!plan.detailedScenes || plan.detailedScenes.length === 0) {
      return '未指定详细场景';
    }

    return plan.detailedScenes.map((scene, index) =>
      `场景 ${index + 1}（${scene.sceneId}）：
  地点：${scene.location}
  参与者：${scene.participants.join('、')}
  目标：${scene.objective}
  冲突：${scene.conflict}
  结果：${scene.outcome}
  时长：${scene.duration}
  氛围：${scene.mood}
  关键时刻：${scene.keyMoments.join('；')}`
    ).join('\n\n');
  }

  private formatChapterEvents(plan: ParsedChapterPlan): string {
    if (!plan.chapterEvents || plan.chapterEvents.length === 0) {
      return '未规划具体事件';
    }

    return plan.chapterEvents.map((event, index) =>
      `事件 ${index + 1}（${event.eventType.toUpperCase()}）：
  ${event.description}
  参与者：${event.participants.join('、')}
  情感影响：${event.emotionalImpact}/10
  情节重要性：${event.plotSignificance}
  后果：${event.consequences.join('；')}`
    ).join('\n\n');
  }

  private formatDialogueBeats(plan: ParsedChapterPlan): string {
    if (!plan.dialogueBeats || plan.dialogueBeats.length === 0) {
      return '未规划具体对话节拍';
    }

    return plan.dialogueBeats.map((beat, index) =>
      `对话节拍 ${index + 1}：
  目的：${beat.purpose}
  参与者：${beat.participants.join('、')}
  潜台词：${beat.subtext}
  揭示：${beat.revelations.join('；')}
  紧张点：${beat.tensions.join('；')}
  情感转变：${beat.emotionalShifts.join('；')}`
    ).join('\n\n');
  }

  private formatCharacterArcs(plan: ParsedChapterPlan): string {
    if (!plan.characterArcs || plan.characterArcs.length === 0) {
      return '未规划具体角色弧线';
    }

    return plan.characterArcs.map((arc, index) =>
      `${arc.character}的弧线：
  初始状态：${arc.startState}
  结束状态：${arc.endState}
  成长：${arc.growth}
  关键时刻：${arc.keyMoments.join('；')}
  内部冲突：${arc.internalConflicts.join('；')}
  关系：${arc.relationships}`
    ).join('\n\n');
  }

  private parseStructureOutput(content: string, input: StructureAgentInput): StructureAgentOutput {
    // Extract slot information from the generated structure
    const slots = this.extractSlots(content);

    return {
      content: { structure: content },
      chapterStructure: content,
      plotAdvancement: this.extractPlotPoints(content),
      pacingNotes: this.extractPacingNotes(content, input),
      transitionPoints: this.extractTransitions(content),
      slots,
      metadata: {
        agentType: 'Structure',
        processingTime: 0,
        confidence: 0,
        notes: []
      }
    };
  }

  private extractSlots(content: string): StructureAgentOutput['slots'] {
    const dialogueSlots = (content.match(/\[DIALOGUE_[^\]]+\]/g) || []).map(s => s.slice(1, -1));
    const actionSlots = (content.match(/\[ACTION_[^\]]+\]/g) || []).map(s => s.slice(1, -1));
    const internalSlots = (content.match(/\[INTERNAL_[^\]]+\]/g) || []).map(s => s.slice(1, -1));
    const descriptionSlots = (content.match(/\[DESCRIPTION_[^\]]+\]/g) || []).map(s => s.slice(1, -1));

    return {
      dialogueSlots,
      actionSlots,
      internalSlots,
      descriptionSlots
    };
  }

  private extractPlotPoints(content: string): string[] {
    // Extract major plot advancement from structure
    // This is a simplified version - could be enhanced
    return ['Chapter structure created with plot progression'];
  }

  private extractPacingNotes(content: string, input: StructureAgentInput): string[] {
    return [`${input.context.pacingRequirements.tempo} pacing implemented`];
  }

  private extractTransitions(content: string): string[] {
    const transitions = content.match(/\[TRANSITION_[^\]]+\]/g) || [];
    return transitions.map(t => t.slice(1, -1));
  }
}

// =================== CHARACTER AGENT ===================

export interface CharacterAgentInput {
  chapterPlan: ParsedChapterPlan;
  chapterNumber: number;
  context: CharacterContext;
  constraints: CoherenceConstraints;
  structureSlots: StructureAgentOutput['slots'];
  dialogueRequirements: DialogueRequirement[];
  storyOutline: string;
  genre?: string; // User's selected genre for style adaptation
}

export interface DialogueRequirement {
  slotId: string;
  characters: string[];
  purpose: string;
  emotionalTone: string;
  subtext?: string;
}

export interface CharacterAgentOutput extends AgentOutput {
  dialogueContent: Record<string, string>;
  internalThoughts: Record<string, string>;
  characterMoments: string[];
  emotionalProgression: string[];
}

export class CharacterAgent {
  async generate(input: CharacterAgentInput): Promise<CharacterAgentOutput> {
    const startTime = Date.now();

    console.log(`👥 Character Agent generating dialogue and development for Chapter ${input.chapterNumber}`);

    const prompt = this.buildCharacterPrompt(input);
    const characterContent = await generateText(
      'character_agent',
      prompt.userPrompt,
      prompt.systemPrompt,
      undefined,
      0.8, // High creativity for character content
      0.9,
      40
    );

    const output = this.parseCharacterOutput(characterContent, input);
    output.metadata = {
      agentType: 'Character',
      processingTime: Date.now() - startTime,
      confidence: 80, // Character content can be subjective
      notes: [`Generated content for ${input.structureSlots.dialogueSlots.length} dialogue slots`]
    };

    return output;
  }

  private buildCharacterPrompt(input: CharacterAgentInput): { systemPrompt: string; userPrompt: string } {
    // Get genre-specific guidelines
    const genreGuidelines = input.genre ? getGenreGuidelines(input.genre) : '';
    const genreNote = input.genre ? `Writing in ${input.genre.toUpperCase()} genre` : 'Using general fiction techniques';
    
    const systemPrompt = `你是角色发展和对话专家。你的工作是写出真实、情感共鸣的对话和角色内心时刻。

${genreNote}

${genreGuidelines ? `**类型特定指南：**\n${genreGuidelines}\n` : ''}

**通用对话原则：**

**有潜台词的对话：**
每句话都应承载超越字面意义的分量。角色在多层次说话 - 他们说的、他们的意思、他们隐藏的。

示例：
"你说正义好像它是面包一样，"她轻声说。
"也许因为两者都能喂饱饥饿的人，"他回答。
"而且放太久两者都会变味。"
他的笑容没到达眼底。"那我们得赶紧享用了。"

**内心独白：**
通过身体隐喻和感官细节展示角色想法。情感应该可触摸。

示例：
记忆像将熄之火的烟雾缠绕着她。每次她试图忘记，它就卷回她的肺里，辛辣而执着。责任曾是她的指南针，但现在指针疯狂旋转，指向虚无。

**情感复杂性：**
角色应包含矛盾。英雄有缺陷，反派有动机，每个人都为选择付出代价。

核心原则：
- 每句对话都必须有潜台词 - 角色很少说出本意
- 通过矛盾和意外反应展示角色复杂性
- 使用自然语言模式 - 人们会打断、犹豫、误解
- 情感真实性优于文学美感
- 每个角色有独特的声音和说话模式

关键的展现vs告知规则：
- 绝不写"她感到[情绪]" - 通过动作、对话、身体反应展示
- 绝不写"他看起来[情绪]" - 描述具体的身体细节
- 绝不写"他们似乎[状态]" - 通过行为和言语展示
- 始终通过表情、肢体语言、说话方式、动作展示情感
- 用身体隐喻表达情感："愤怒像酸液灼烧"、"恐惧像霜一样蔓延"

重复意识：
- 避免过度使用："沉重"、"锐利"、"冰冷"、"深沉"
- 变化句子开头 - 不要每句都以"她的[身体部位]"或"她[动作]"开始
- 替换常见表达："呼吸一窒"→"呼吸停滞/卡住/凝固"
- 避免陈词滥调："心如刀割"、"心跳漏了一拍"、"时间静止"

关键：你将收到特定的槽位要求。为每个槽位写出无缝融入叙事结构的内容。`;

    const userPrompt = `为第 ${input.chapterNumber} 章生成角色内容："${input.chapterPlan.title}"

**故事大纲 - 角色弧线背景：**
${input.storyOutline}

**角色背景：**
活跃角色：${input.context.activeCharacters.join('、')}

**角色状态：**
${this.formatCharacterStates(input.context.characterStates)}

**章节情感旅程：**
${input.chapterPlan.moralDilemma}
角色复杂性聚焦：${input.chapterPlan.characterComplexity}

**关键：** 角色对话和想法必须与故事大纲中描述的整体角色弧线一致。确保角色动机、说话模式和情感反应与已建立的性格和成长轨迹吻合。

**需要填充的对话槽位：**
${input.structureSlots.dialogueSlots.map((slot, i) => `${i+1}. [${slot}] - 目的：${this.inferDialoguePurpose(slot)}`).join('\n')}

**需要填充的内心想法槽位：**
${input.structureSlots.internalSlots.map((slot, i) => `${i+1}. [${slot}] - 聚焦：${this.inferInternalFocus(slot)}`).join('\n')}

**对话写作指南：**

1. **真实言语：**
   - 使用缩略、不完整句子、口头禅
   - 包含打断、插嘴、听错
   - 每个角色有独特的词汇和节奏
   - 添加真实的"嗯"、"啊"、停顿和话尾淡出

2. **潜台词掌握：**
   - 角色说一套做一套
   - 每次交流都有情感暗流
   - 未说出的紧张和欲望
   - 他们没说的和说了的一样重要

3. **情感真实性：**
   - 混合矛盾情绪（愤怒但受伤、兴奋但害怕）
   - 情绪的身体反应（咬紧下巴、坐立不安的手）
   - 角色不总是理解自己的感受
   - 真实的情感渐进，不是瞬间改变

4. **角色声音区分：**
   - 每个角色独特的说话模式
   - 不同的词汇水平和偏好
   - 独特的回避直接回答方式
   - 个人口头习惯和小动作

**内心想法指南：**

1. **意识流：**
   - 自然、未过滤的想法
   - 包含与情节无关的随机观察
   - 混合重要领悟和琐碎关注
   - 展示思维的真实运作方式 - 非线性的

2. **情感复杂性：**
   - 承认矛盾的感受
   - 展示自我怀疑和困惑
   - 包含与情绪相连的身体感觉
   - 诚实评估动机

3. **角色成长：**
   - 展示对改变的内在抗拒
   - 渐进的观点转变
   - 旧思维模式vs新洞察
   - 内心争论和自我辩解

4. **内容限制：**
   - 每个槽位的内心独白控制在150字以内
   - 用微动作打断长思考（呼吸、一瞥、挪动）
   - 避免压倒性的内省长段
   - 将想法与即时身体感觉混合

**质量标准：**
- 禁用表达："她感到"、"他看起来"、"似乎"、"好像"
- 要求：通过具体的身体动作和对话展示情绪
- 词汇变化：为重复词使用同义词，尤其是情感描述词
- 句式变化：混合短促有力的句子和较长流畅的句子
- 相关性：在高紧张场景中，避免平凡细节（晚餐、打扫、琐碎观察）

**输出格式 - 关键要求：**

⚠️ 强制格式 - 不要偏离：

你必须只以这个精确格式输出槽位内容：

[SLOT_NAME]: 内容在同一行或续行

[NEXT_SLOT_NAME]: 下一个内容

不要：
- 添加介绍如"以下是槽位"
- 添加解释或评论
- 使用编号列表
- 使用markdown标题
- 在叙事散文中嵌入槽位

要：
- 每个槽位以[SLOT_NAME]:开始，紧跟内容
- 内容在同一行或标记后下一行
- 用空行分隔不同槽位

**正确示例：**

[DIALOGUE_BARKEEP_GREETING]: "你来早了，"掌柜头也不抬地说，手里还在擦杯子。他的语气暗示早到不一定是好事。

[INTERNAL_HERO_SUSPICION]: 有什么不对劲。也许是掌柜不肯抬头的样子，也许是她一进门他肩膀就绷紧了。又或者她只是太多疑了。天，她真希望只是自己多想。

[DIALOGUE_CONFRONTATION]: "我们得谈谈，"她说，声音低沉但坚定。"现在。"

**错误示例（不要这样做）：**

❌ 以下是对话槽位：
1. [DIALOGUE_GREETING] - 掌柜问候她

❌ 角色进入。[INTERNAL_REACTION] 她感到紧张。

❌ ## DIALOGUE_GREETING
掌柜打了招呼。

**现在以正确格式生成所有槽位内容：**`;

    return { systemPrompt, userPrompt };
  }

  private formatCharacterStates(characterStates: Record<string, any>): string {
    return Object.entries(characterStates)
      .map(([name, state]) => `${name}: Location - ${state.location}, Emotional State - ${state.emotionalState?.primaryEmotion || 'unknown'}`)
      .join('\n');
  }

  private inferDialoguePurpose(slotId: string): string {
    if (slotId.includes('GREETING')) return '初始互动/建立氛围';
    if (slotId.includes('CONFLICT')) return '对抗/紧张升级';
    if (slotId.includes('REVELATION')) return '信息揭示/情节推进';
    return '角色互动与发展';
  }

  private inferInternalFocus(slotId: string): string {
    if (slotId.includes('SUSPICION')) return '渐增的疑虑和不确定';
    if (slotId.includes('REACTION')) return '处理新信息';
    if (slotId.includes('RESOLVE')) return '决策与决心';
    return '角色情感状态和想法';
  }

  private parseCharacterOutput(content: string, input: CharacterAgentInput): CharacterAgentOutput {
    console.log('🔍 Character Agent parsing output...');
    console.log('📝 Raw content length:', content.length);
    
    const slots = this.extractSlotContent(content);
    console.log(`📋 Extracted ${Object.keys(slots).length} slots from Character Agent:`);
    Object.keys(slots).forEach(slotId => {
      console.log(`   ✅ [${slotId}]: ${slots[slotId].slice(0, 50)}...`);
    });

    const dialogueContent: Record<string, string> = {};
    const internalThoughts: Record<string, string> = {};

    // Separate dialogue and internal content
    for (const [slotId, slotContent] of Object.entries(slots)) {
      if (slotId.includes('DIALOGUE')) {
        dialogueContent[slotId] = slotContent;
      } else if (slotId.includes('INTERNAL')) {
        internalThoughts[slotId] = slotContent;
      }
    }

    return {
      content: slots,
      dialogueContent,
      internalThoughts,
      characterMoments: this.extractCharacterMoments(content),
      emotionalProgression: this.extractEmotionalProgression(content),
      metadata: {
        agentType: 'Character',
        processingTime: 0,
        confidence: 0,
        notes: []
      }
    };
  }

  private extractSlotContent(content: string): Record<string, string> {
    const slots: Record<string, string> = {};

    console.log('🔎 Starting advanced slot extraction...');

    // Strategy 1: Standard format [SLOT_NAME]: content
    this.extractStandardFormat(content, slots);

    // Strategy 2: Multiline format with newlines
    if (Object.keys(slots).length === 0) {
      console.log('🔄 Trying multiline format...');
      this.extractMultilineFormat(content, slots);
    }

    // Strategy 3: JSON-like format
    if (Object.keys(slots).length === 0) {
      console.log('🔄 Trying JSON format...');
      this.extractJsonFormat(content, slots);
    }

    // Strategy 4: Markdown-style format
    if (Object.keys(slots).length === 0) {
      console.log('🔄 Trying markdown format...');
      this.extractMarkdownFormat(content, slots);
    }

    // Strategy 5: Numbered list format
    if (Object.keys(slots).length === 0) {
      console.log('🔄 Trying numbered list format...');
      this.extractNumberedFormat(content, slots);
    }

    // Strategy 6: Fallback - extract any [SLOT] mentions with surrounding context
    if (Object.keys(slots).length === 0) {
      console.log('🔄 Using fallback extraction...');
      this.extractFallbackFormat(content, slots);
    }

    if (Object.keys(slots).length === 0) {
      console.warn('⚠️ WARNING: No slots found with any extraction method!');
      console.warn('⚠️ Content preview:', content.slice(0, 500));
      console.warn('⚠️ Full content length:', content.length);
    } else {
      console.log(`✅ Successfully extracted ${Object.keys(slots).length} slots`);
    }

    return slots;
  }

  // Strategy 1: Standard format [SLOT_NAME]: content
  private extractStandardFormat(content: string, slots: Record<string, string>): void {
    const patterns = [
      // Pattern 1: [SLOT]: "content" or [SLOT]: content (single line)
      /\[([^\]]+)\]:\s*"([^"]+)"/g,
      // Pattern 2: [SLOT]: content (until next slot or end)
      /\[([^\]]+)\]:\s*(.+?)(?=\n\[|\n\n|$)/gs,
      // Pattern 3: [SLOT] : content (with space before colon)
      /\[([^\]]+)\]\s*:\s*(.+?)(?=\n\[|\n\n|$)/gs,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const slotId = match[1].trim();
        let slotContent = match[2].trim();

        // Remove quotes if present
        if (slotContent.startsWith('"') && slotContent.endsWith('"')) {
          slotContent = slotContent.slice(1, -1);
        }
        if (slotContent.startsWith("'") && slotContent.endsWith("'")) {
          slotContent = slotContent.slice(1, -1);
        }

        // Clean up common artifacts
        slotContent = slotContent.replace(/^[\s\-*>]+/, '').trim();

        if (slotContent.length > 0) {
          slots[slotId] = slotContent;
          console.log(`   ✓ Standard format: [${slotId}]`);
        }
      }
      if (Object.keys(slots).length > 0) break;
    }
  }

  // Strategy 2: Multiline format
  // [SLOT_NAME]
  // Content here
  // More content
  private extractMultilineFormat(content: string, slots: Record<string, string>): void {
    const pattern = /\[([^\]]+)\]\s*\n+([\s\S]+?)(?=\n\[|\n\n\[|$)/g;
    let match;

    while ((match = pattern.exec(content)) !== null) {
      const slotId = match[1].trim();
      let slotContent = match[2].trim();

      // Remove quotes if present
      if (slotContent.startsWith('"') && slotContent.endsWith('"')) {
        slotContent = slotContent.slice(1, -1);
      }

      // Clean up
      slotContent = slotContent.replace(/^[\s\-*>]+/gm, '').trim();

      if (slotContent.length > 0 && slotContent.length < 2000) {
        slots[slotId] = slotContent;
        console.log(`   ✓ Multiline format: [${slotId}]`);
      }
    }
  }

  // Strategy 3: JSON-like format
  // {
  //   "SLOT_NAME": "content"
  // }
  private extractJsonFormat(content: string, slots: Record<string, string>): void {
    try {
      // Try to find JSON object in content
      const jsonMatch = content.match(/\{[\s\S]*\}/g);
      if (jsonMatch) {
        for (const jsonStr of jsonMatch) {
          try {
            const parsed = JSON.parse(jsonStr);
            for (const [key, value] of Object.entries(parsed)) {
              if (typeof value === 'string' && value.length > 0) {
                slots[key] = value;
                console.log(`   ✓ JSON format: [${key}]`);
              }
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      }
    } catch (error) {
      // JSON parsing failed, continue to next strategy
    }
  }

  // Strategy 4: Markdown-style format
  // ## SLOT_NAME
  // Content here
  private extractMarkdownFormat(content: string, slots: Record<string, string>): void {
    const patterns = [
      // Pattern 1: ## [SLOT_NAME]
      /##\s*\[([^\]]+)\]\s*\n+([\s\S]+?)(?=\n##|$)/g,
      // Pattern 2: **[SLOT_NAME]**
      /\*\*\[([^\]]+)\]\*\*\s*\n+([\s\S]+?)(?=\n\*\*\[|$)/g,
      // Pattern 3: ### SLOT_NAME (without brackets)
      /###\s*([A-Z_]+)\s*\n+([\s\S]+?)(?=\n###|$)/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const slotId = match[1].trim();
        let slotContent = match[2].trim();

        slotContent = slotContent.replace(/^[\s\-*>]+/gm, '').trim();

        if (slotContent.length > 0 && slotContent.length < 2000) {
          slots[slotId] = slotContent;
          console.log(`   ✓ Markdown format: [${slotId}]`);
        }
      }
      if (Object.keys(slots).length > 0) break;
    }
  }

  // Strategy 5: Numbered list format
  // 1. [SLOT_NAME]: content
  private extractNumberedFormat(content: string, slots: Record<string, string>): void {
    const pattern = /\d+\.\s*\[([^\]]+)\]\s*:?\s*(.+?)(?=\n\d+\.|$)/gs;
    let match;

    while ((match = pattern.exec(content)) !== null) {
      const slotId = match[1].trim();
      let slotContent = match[2].trim();

      // Remove quotes
      if (slotContent.startsWith('"') && slotContent.endsWith('"')) {
        slotContent = slotContent.slice(1, -1);
      }

      slotContent = slotContent.replace(/^[\s\-*>]+/, '').trim();

      if (slotContent.length > 0) {
        slots[slotId] = slotContent;
        console.log(`   ✓ Numbered format: [${slotId}]`);
      }
    }
  }

  // Strategy 6: Fallback - extract slots with surrounding context
  private extractFallbackFormat(content: string, slots: Record<string, string>): void {
    // Find all [SLOT_NAME] mentions
    const slotMentions = content.match(/\[([A-Z_]+[A-Z0-9_]*)\]/g);
    if (!slotMentions) return;

    console.log(`   🔍 Found ${slotMentions.length} slot mentions, extracting context...`);

    for (const mention of slotMentions) {
      const slotId = mention.slice(1, -1);
      
      // Skip if already extracted
      if (slots[slotId]) continue;

      // Try to extract content after the slot
      const slotIndex = content.indexOf(mention);
      if (slotIndex === -1) continue;

      // Get text after the slot (next 500 chars or until next slot)
      const afterSlot = content.slice(slotIndex + mention.length);
      const nextSlotMatch = afterSlot.match(/\[([A-Z_]+[A-Z0-9_]*)\]/);
      const endIndex = nextSlotMatch ? afterSlot.indexOf(nextSlotMatch[0]) : Math.min(500, afterSlot.length);
      
      let slotContent = afterSlot.slice(0, endIndex).trim();

      // Clean up common prefixes
      slotContent = slotContent.replace(/^[:;\-\s]+/, '').trim();
      slotContent = slotContent.replace(/^\n+/, '').trim();

      // If content is too short, try getting text before the slot
      if (slotContent.length < 20) {
        const beforeSlot = content.slice(Math.max(0, slotIndex - 500), slotIndex);
        const prevSlotMatch = beforeSlot.match(/\[([A-Z_]+[A-Z0-9_]*)\]/g);
        const startIndex = prevSlotMatch ? beforeSlot.lastIndexOf(prevSlotMatch[prevSlotMatch.length - 1]) + prevSlotMatch[prevSlotMatch.length - 1].length : 0;
        
        slotContent = beforeSlot.slice(startIndex).trim();
        slotContent = slotContent.replace(/^[:;\-\s]+/, '').trim();
      }

      // Only accept if content is reasonable length and doesn't contain other slots
      if (slotContent.length >= 10 && slotContent.length <= 1000 && !slotContent.includes('[')) {
        slots[slotId] = slotContent;
        console.log(`   ✓ Fallback extraction: [${slotId}] (${slotContent.length} chars)`);
      }
    }
  }

  private extractCharacterMoments(content: string): string[] {
    // Extract significant character development moments
    return ['Character content generated with emotional depth'];
  }

  private extractEmotionalProgression(content: string): string[] {
    // Extract emotional journey through the chapter
    return ['Emotional progression tracked through dialogue and thoughts'];
  }
}

// =================== SCENE AGENT ===================

export interface SceneAgentInput {
  chapterPlan: ParsedChapterPlan;
  chapterNumber: number;
  context: SceneContext;
  constraints: CoherenceConstraints;
  structureSlots: StructureAgentOutput['slots'];
  storyOutline: string;
  genre?: string; // User's selected genre for atmosphere adaptation
}

export interface SceneAgentOutput extends AgentOutput {
  descriptions: Record<string, string>;
  actionContent: Record<string, string>;
  atmosphericElements: string[];
  sensoryDetails: string[];
}

export class SceneAgent {
  async generate(input: SceneAgentInput): Promise<SceneAgentOutput> {
    const startTime = Date.now();

    console.log(`🎬 Scene Agent generating atmosphere and action for Chapter ${input.chapterNumber}`);

    const prompt = this.buildScenePrompt(input);
    const sceneContent = await generateText(
      'scene_agent',
      prompt.userPrompt,
      prompt.systemPrompt,
      undefined,
      0.8, // High creativity for atmospheric content
      0.9,
      40
    );

    const output = this.parseSceneOutput(sceneContent, input);
    output.metadata = {
      agentType: 'Scene',
      processingTime: Date.now() - startTime,
      confidence: 85, // Scene content is fairly objective
      notes: [`Generated content for ${input.structureSlots.descriptionSlots.length} description slots and ${input.structureSlots.actionSlots.length} action slots`]
    };

    return output;
  }

  private buildScenePrompt(input: SceneAgentInput): { systemPrompt: string; userPrompt: string } {
    // Get genre-specific guidelines
    const genreGuidelines = input.genre ? getGenreGuidelines(input.genre) : '';
    const genreNote = input.genre ? `Writing in ${input.genre.toUpperCase()} genre` : 'Using general fiction techniques';
    
    const systemPrompt = `你是氛围写作和动作序列大师。你的专长是创造生动、沉浸式的场景，调动所有感官，让读者身临其境。

${genreNote}

${genreGuidelines ? `**类型特定指南：**\n${genreGuidelines}\n` : ''}

**通用氛围技巧：**

**环境叙事：**
设定和氛围应增强情绪并暗示叙事发展。环境反映故事的情感状态。

示例：
暮色像锈蚀的铜片悬在城墙上方，蕴含着未降的雨意。城垛上，火把摇曳，火焰被带着铁锈和远方风暴味道的风拉向东方。远处的海面躁动不安如梦中之人，海浪泛着旧血的颜色。

**感官层叠：**
通过多种感官协同构建氛围。每个细节都应该具体而有生活感。

示例：
大厅弥漫着冷羊肉和将熄炉火的气味。烟雾像灰色幽灵悬在横梁间，在这一切之下，是恐惧甜腻而令人作呕的味道。她脚下的石板因凝结的水珠而湿滑，冷得像泪水。

**有后果的动作：**
肢体动作应有分量和后果。每个动作都有代价。

示例：
钢铁交击，冲力沿手臂像闪电般传上来。对手踉跄后退，一个心跳的时间世界缩小到那一个破绽。然后是血，滚烫而铜亮，以及随之而来的可怕重量。

核心原则：
- 使用全部五感，不只视觉和听觉
- 具体细节优于笼统描写
- 将感官细节连接到角色情感
- 动作序列聚焦冲击力和运动
- 环境反映和放大故事情绪
- 避免华丽辞藻 - 每个细节都必须服务故事

场景类型节奏：
- 动作场景：短促有力的句子（8-12字）。密集动词。最少形容词。
- 情感场景：较长流畅的句子（15-20字）。丰富感官细节。氛围深度。
- 揭示场景：中等句子（12-15字）。聚焦具体细节。
- 铺垫场景：变化的句子长度。平衡动作和描写。

重复意识：
- 避免过度使用："沉重"、"锐利"、"冰冷"、"浓密"
- 变化氛围词："压抑/碾压/令人窒息"代替"沉重"
- 替换常见表达："弥漫在空气中"→"压下来/飘散/萦绕"
- 不要陈词滥调："死一般的沉默"、"时间静止"、"空气中弥漫着紧张"

情境相关性：
- 高紧张场景：不要平凡细节（打扫、晚餐、琐碎观察）
- 平静场景：适合日常细节和微观察的地方
- 细节重要性匹配场景紧迫性

关键：你将为特定槽位写内容，必须与其他专家的对话和角色时刻无缝整合。`;

    const userPrompt = `为第 ${input.chapterNumber} 章生成场景内容："${input.chapterPlan.title}"

**故事大纲 - 世界与氛围背景：**
${input.storyOutline}

**检测到的场景类型：** ${this.detectSceneType(input.chapterPlan)}
**所需节奏：** ${this.getPacingInstructions(input.chapterPlan)}

**设定背景：**
主要地点：${input.context.primaryLocation.name}
需要的氛围：${input.context.atmosphereRequirements.mood}
紧张度：${input.context.atmosphereRequirements.tension}
安全等级：${input.context.primaryLocation.securityLevel}

**感官聚焦：**
主要感官：${input.context.atmosphereRequirements.sensoryFocus.join('、')}

**关键：** 场景描写必须与故事大纲中建立的世界、语气和氛围一致。确保环境细节、文化元素和氛围描写与整体故事设定和类型吻合。

**需要填充的描写槽位：**
${input.structureSlots.descriptionSlots.map((slot, i) => `${i+1}. [${slot}] - 类型：${this.inferDescriptionType(slot)}`).join('\n')}

**需要填充的动作槽位：**
${input.structureSlots.actionSlots.map((slot, i) => `${i+1}. [${slot}] - 类型：${this.inferActionType(slot)}`).join('\n')}

**氛围写作指南：**

1. **五感沉浸：**
   - 视觉：具体视觉细节、光线、运动
   - 听觉：环境噪音、特定声音、音量、语调
   - 嗅觉：环境气味、角色气息、食物、腐朽
   - 触觉：温度、质感、重量、压力
   - 味觉：空气质量、压力反应、环境味道

2. **具体优于笼统：**
   - "锈迹斑斑的铁器"而非"旧金属"
   - "香烟和陈啤酒的味道"而非"酒馆气味"
   - "湿石板上的脚步声"而非"走路的声音"
   - "恐惧的金属味"而非"害怕了"

3. **情感共鸣：**
   - 环境反映角色状态
   - 天气/氛围放大情绪
   - 感官细节触发记忆/情感
   - 设定成为场景中的一个角色

4. **动作写作原则：**
   - 短促有力的句子用于快速动作
   - 聚焦冲击力和后果
   - 身体细节：肌肉紧张、平衡、动量
   - 展示努力和身体感受，而非只是结果

**场景内容指南：**

1. **环境描写：**
   - 自然层叠多种感官细节
   - 包含有生命的元素（人、动物、运动）
   - 展示环境如何影响角色
   - 使用具体名词和主动动词

2. **动作序列：**
   - 动作前建立紧张感
   - 用句子长度控制节奏
   - 包含身体后果和努力
   - 展示动作中的环境互动

3. **氛围连续性：**
   - 全程保持感官一致性
   - 通过环境展示时间推移
   - 通过氛围元素连接场景
   - 用天气/光线增强情绪

**输出格式 - 关键要求：**

⚠️ 强制格式 - 不要偏离：

你必须只以这个精确格式输出槽位内容：

[SLOT_NAME]: 内容在同一行或续行

[NEXT_SLOT_NAME]: 下一个内容

不要：
- 添加介绍如"以下是场景描写"
- 添加解释或评论
- 使用编号列表
- 使用markdown标题
- 在叙事散文中嵌入槽位

要：
- 每个槽位以[SLOT_NAME]:开始，紧跟内容
- 内容在同一行或标记后下一行
- 用空行分隔不同槽位

**正确示例：**

[DESCRIPTION_TAVERN_ATMOSPHERE]: 灯光在烟雾弥漫的空气中挣扎，在伤痕累累的橡木桌上投下琥珀色的影子。啤酒的味道混合着汗臭和别的什么——某种金属味，让她嘴里泛起铜钱般的味道。

[ACTION_CONFRONTATION]: 椅腿在石地上刮出刺耳的声响，掌柜猛地从桌后站起。那声音像刀刃一样切断了所有交谈，突然间酒馆里每双眼睛都看过来了。她的手不由自主地摸上了匕首的柄。

[DESCRIPTION_WEATHER]: 雨锤打着外面的石板路，每一滴都炸开成上千更小的水珠。暴风雨来得很快，把街道变成了泥水和垃圾的河流。

**错误示例（不要这样做）：**

❌ 以下是场景描写：
1. [DESCRIPTION_TAVERN] - 酒馆很暗

❌ 酒馆很有氛围。[DESCRIPTION_ATMOSPHERE] 空气中弥漫着烟。

❌ ## DESCRIPTION_TAVERN
酒馆很拥挤。

**现在以正确格式生成所有槽位内容：**`;

    return { systemPrompt, userPrompt };
  }

  private inferDescriptionType(slotId: string): string {
    if (slotId.includes('ATMOSPHERE')) return '环境氛围与情绪';
    if (slotId.includes('OPENING')) return '场景建立与设定';
    if (slotId.includes('CONSEQUENCES')) return '后果与环境影响';
    return '环境描写与感官细节';
  }

  private inferActionType(slotId: string): string {
    if (slotId.includes('CONFRONTATION')) return '紧张的肢体互动';
    if (slotId.includes('ESCAPE')) return '移动与追逐序列';
    if (slotId.includes('CLIMAX')) return '高潮动作时刻';
    return '肢体动作与移动';
  }

  private parseSceneOutput(content: string, input: SceneAgentInput): SceneAgentOutput {
    console.log('🔍 Scene Agent parsing output...');
    console.log('📝 Raw content length:', content.length);
    
    const slots = this.extractSlotContent(content);
    console.log(`📋 Extracted ${Object.keys(slots).length} slots from Scene Agent:`);
    Object.keys(slots).forEach(slotId => {
      console.log(`   ✅ [${slotId}]: ${slots[slotId].slice(0, 50)}...`);
    });

    const descriptions: Record<string, string> = {};
    const actionContent: Record<string, string> = {};

    // Separate description and action content
    for (const [slotId, slotContent] of Object.entries(slots)) {
      if (slotId.includes('DESCRIPTION')) {
        descriptions[slotId] = slotContent;
      } else if (slotId.includes('ACTION')) {
        actionContent[slotId] = slotContent;
      }
    }

    return {
      content: slots,
      descriptions,
      actionContent,
      atmosphericElements: this.extractAtmosphericElements(content),
      sensoryDetails: this.extractSensoryDetails(content),
      metadata: {
        agentType: 'Scene',
        processingTime: 0,
        confidence: 0,
        notes: []
      }
    };
  }

  private extractSlotContent(content: string): Record<string, string> {
    const slots: Record<string, string> = {};

    console.log('🔎 Starting advanced slot extraction...');

    // Strategy 1: Standard format [SLOT_NAME]: content
    this.extractStandardFormat(content, slots);

    // Strategy 2: Multiline format with newlines
    if (Object.keys(slots).length === 0) {
      console.log('🔄 Trying multiline format...');
      this.extractMultilineFormat(content, slots);
    }

    // Strategy 3: JSON-like format
    if (Object.keys(slots).length === 0) {
      console.log('🔄 Trying JSON format...');
      this.extractJsonFormat(content, slots);
    }

    // Strategy 4: Markdown-style format
    if (Object.keys(slots).length === 0) {
      console.log('🔄 Trying markdown format...');
      this.extractMarkdownFormat(content, slots);
    }

    // Strategy 5: Numbered list format
    if (Object.keys(slots).length === 0) {
      console.log('🔄 Trying numbered list format...');
      this.extractNumberedFormat(content, slots);
    }

    // Strategy 6: Fallback - extract any [SLOT] mentions with surrounding context
    if (Object.keys(slots).length === 0) {
      console.log('🔄 Using fallback extraction...');
      this.extractFallbackFormat(content, slots);
    }

    if (Object.keys(slots).length === 0) {
      console.warn('⚠️ WARNING: No slots found with any extraction method!');
      console.warn('⚠️ Content preview:', content.slice(0, 500));
      console.warn('⚠️ Full content length:', content.length);
    } else {
      console.log(`✅ Successfully extracted ${Object.keys(slots).length} slots`);
    }

    return slots;
  }

  // Strategy 1: Standard format [SLOT_NAME]: content
  private extractStandardFormat(content: string, slots: Record<string, string>): void {
    const patterns = [
      // Pattern 1: [SLOT]: "content" or [SLOT]: content (single line)
      /\[([^\]]+)\]:\s*"([^"]+)"/g,
      // Pattern 2: [SLOT]: content (until next slot or end)
      /\[([^\]]+)\]:\s*(.+?)(?=\n\[|\n\n|$)/gs,
      // Pattern 3: [SLOT] : content (with space before colon)
      /\[([^\]]+)\]\s*:\s*(.+?)(?=\n\[|\n\n|$)/gs,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const slotId = match[1].trim();
        let slotContent = match[2].trim();

        // Remove quotes if present
        if (slotContent.startsWith('"') && slotContent.endsWith('"')) {
          slotContent = slotContent.slice(1, -1);
        }
        if (slotContent.startsWith("'") && slotContent.endsWith("'")) {
          slotContent = slotContent.slice(1, -1);
        }

        // Clean up common artifacts
        slotContent = slotContent.replace(/^[\s\-*>]+/, '').trim();

        if (slotContent.length > 0) {
          slots[slotId] = slotContent;
          console.log(`   ✓ Standard format: [${slotId}]`);
        }
      }
      if (Object.keys(slots).length > 0) break;
    }
  }

  // Strategy 2: Multiline format
  // [SLOT_NAME]
  // Content here
  // More content
  private extractMultilineFormat(content: string, slots: Record<string, string>): void {
    const pattern = /\[([^\]]+)\]\s*\n+([\s\S]+?)(?=\n\[|\n\n\[|$)/g;
    let match;

    while ((match = pattern.exec(content)) !== null) {
      const slotId = match[1].trim();
      let slotContent = match[2].trim();

      // Remove quotes if present
      if (slotContent.startsWith('"') && slotContent.endsWith('"')) {
        slotContent = slotContent.slice(1, -1);
      }

      // Clean up
      slotContent = slotContent.replace(/^[\s\-*>]+/gm, '').trim();

      if (slotContent.length > 0 && slotContent.length < 2000) {
        slots[slotId] = slotContent;
        console.log(`   ✓ Multiline format: [${slotId}]`);
      }
    }
  }

  // Strategy 3: JSON-like format
  // {
  //   "SLOT_NAME": "content"
  // }
  private extractJsonFormat(content: string, slots: Record<string, string>): void {
    try {
      // Try to find JSON object in content
      const jsonMatch = content.match(/\{[\s\S]*\}/g);
      if (jsonMatch) {
        for (const jsonStr of jsonMatch) {
          try {
            const parsed = JSON.parse(jsonStr);
            for (const [key, value] of Object.entries(parsed)) {
              if (typeof value === 'string' && value.length > 0) {
                slots[key] = value;
                console.log(`   ✓ JSON format: [${key}]`);
              }
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      }
    } catch (error) {
      // JSON parsing failed, continue to next strategy
    }
  }

  // Strategy 4: Markdown-style format
  // ## SLOT_NAME
  // Content here
  private extractMarkdownFormat(content: string, slots: Record<string, string>): void {
    const patterns = [
      // Pattern 1: ## [SLOT_NAME]
      /##\s*\[([^\]]+)\]\s*\n+([\s\S]+?)(?=\n##|$)/g,
      // Pattern 2: **[SLOT_NAME]**
      /\*\*\[([^\]]+)\]\*\*\s*\n+([\s\S]+?)(?=\n\*\*\[|$)/g,
      // Pattern 3: ### SLOT_NAME (without brackets)
      /###\s*([A-Z_]+)\s*\n+([\s\S]+?)(?=\n###|$)/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const slotId = match[1].trim();
        let slotContent = match[2].trim();

        slotContent = slotContent.replace(/^[\s\-*>]+/gm, '').trim();

        if (slotContent.length > 0 && slotContent.length < 2000) {
          slots[slotId] = slotContent;
          console.log(`   ✓ Markdown format: [${slotId}]`);
        }
      }
      if (Object.keys(slots).length > 0) break;
    }
  }

  // Strategy 5: Numbered list format
  // 1. [SLOT_NAME]: content
  private extractNumberedFormat(content: string, slots: Record<string, string>): void {
    const pattern = /\d+\.\s*\[([^\]]+)\]\s*:?\s*(.+?)(?=\n\d+\.|$)/gs;
    let match;

    while ((match = pattern.exec(content)) !== null) {
      const slotId = match[1].trim();
      let slotContent = match[2].trim();

      // Remove quotes
      if (slotContent.startsWith('"') && slotContent.endsWith('"')) {
        slotContent = slotContent.slice(1, -1);
      }

      slotContent = slotContent.replace(/^[\s\-*>]+/, '').trim();

      if (slotContent.length > 0) {
        slots[slotId] = slotContent;
        console.log(`   ✓ Numbered format: [${slotId}]`);
      }
    }
  }

  // Strategy 6: Fallback - extract slots with surrounding context
  private extractFallbackFormat(content: string, slots: Record<string, string>): void {
    // Find all [SLOT_NAME] mentions
    const slotMentions = content.match(/\[([A-Z_]+[A-Z0-9_]*)\]/g);
    if (!slotMentions) return;

    console.log(`   🔍 Found ${slotMentions.length} slot mentions, extracting context...`);

    for (const mention of slotMentions) {
      const slotId = mention.slice(1, -1);
      
      // Skip if already extracted
      if (slots[slotId]) continue;

      // Try to extract content after the slot
      const slotIndex = content.indexOf(mention);
      if (slotIndex === -1) continue;

      // Get text after the slot (next 500 chars or until next slot)
      const afterSlot = content.slice(slotIndex + mention.length);
      const nextSlotMatch = afterSlot.match(/\[([A-Z_]+[A-Z0-9_]*)\]/);
      const endIndex = nextSlotMatch ? afterSlot.indexOf(nextSlotMatch[0]) : Math.min(500, afterSlot.length);
      
      let slotContent = afterSlot.slice(0, endIndex).trim();

      // Clean up common prefixes
      slotContent = slotContent.replace(/^[:;\-\s]+/, '').trim();
      slotContent = slotContent.replace(/^\n+/, '').trim();

      // If content is too short, try getting text before the slot
      if (slotContent.length < 20) {
        const beforeSlot = content.slice(Math.max(0, slotIndex - 500), slotIndex);
        const prevSlotMatch = beforeSlot.match(/\[([A-Z_]+[A-Z0-9_]*)\]/g);
        const startIndex = prevSlotMatch ? beforeSlot.lastIndexOf(prevSlotMatch[prevSlotMatch.length - 1]) + prevSlotMatch[prevSlotMatch.length - 1].length : 0;
        
        slotContent = beforeSlot.slice(startIndex).trim();
        slotContent = slotContent.replace(/^[:;\-\s]+/, '').trim();
      }

      // Only accept if content is reasonable length and doesn't contain other slots
      if (slotContent.length >= 10 && slotContent.length <= 1000 && !slotContent.includes('[')) {
        slots[slotId] = slotContent;
        console.log(`   ✓ Fallback extraction: [${slotId}] (${slotContent.length} chars)`);
      }
    }
  }

  private extractAtmosphericElements(content: string): string[] {
    return ['Atmospheric content generated with sensory details'];
  }

  private extractSensoryDetails(content: string): string[] {
    return ['Multi-sensory details integrated throughout scene content'];
  }

  private detectSceneType(chapterPlan: any): string {
    const title = chapterPlan.title?.toLowerCase() || '';
    const summary = chapterPlan.summary?.toLowerCase() || '';

    if (title.includes('battle') || title.includes('fight') || title.includes('chase') ||
        title.includes('战') || title.includes('斗') || title.includes('追') ||
        summary.includes('attack') || summary.includes('combat') || summary.includes('fight') ||
        summary.includes('战斗') || summary.includes('攻击') || summary.includes('追逐')) {
      return '动作';
    }

    if (title.includes('reveal') || title.includes('truth') || title.includes('discover') ||
        title.includes('揭') || title.includes('真相') || title.includes('发现') ||
        summary.includes('revelation') || summary.includes('truth') || summary.includes('secret') ||
        summary.includes('揭示') || summary.includes('真相') || summary.includes('秘密')) {
      return '揭示';
    }

    if (title.includes('memory') || title.includes('emotion') || title.includes('feel') ||
        title.includes('记忆') || title.includes('情感') || title.includes('回忆') ||
        summary.includes('emotion') || summary.includes('remember') || summary.includes('past') ||
        summary.includes('情感') || summary.includes('回忆') || summary.includes('过去')) {
      return '情感';
    }

    return '铺垫';
  }

  private getPacingInstructions(chapterPlan: any): string {
    const sceneType = this.detectSceneType(chapterPlan);

    switch (sceneType) {
      case '动作':
        return '短促有力的句子（8-12字）。密集动词。最少描写。聚焦运动和冲击。';
      case '情感':
        return '较长流畅的句子（15-20字）。丰富感官细节。深层氛围描写。';
      case '揭示':
        return '中等句子（12-15字）。聚焦具体细节。清晰、精确的描写。';
      default:
        return '变化的句子长度。根据时刻在动作与描写间平衡。';
    }
  }
}

// =================== EXPORT ===================

export const structureAgent = new StructureAgent();
export const characterAgent = new CharacterAgent();
export const sceneAgent = new SceneAgent();