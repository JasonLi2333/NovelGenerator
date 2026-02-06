/**
 * 中文网文写作风格和语气配置
 */

import { StorySettings } from '../types';

export interface NarrativeVoiceConfig {
  name: string;
  description: string;
  guidelines: string;
  examples: string;
}

export const NARRATIVE_VOICES: Record<string, NarrativeVoiceConfig> = {
  'first-person': {
    name: "第一人称",
    description: "以'我'的视角讲述故事",
    guidelines: `
**第一人称写作指南：**
- 使用"我"来叙述主角的所见所想
- 局限于主角的认知和视角
- 需要强烈的角色声音和个性
- 内心独白自然流畅
- 不能直接描述其他人的想法（除非被告知）
- 更具代入感和真实感
- 读者通过主角视角体验一切`,
    examples: `"我踏入房间，心跳加速。阴影似乎在移动，但我不敢确定。"`
  },
  
  'third-limited': {
    name: "第三人称限制",
    description: "以'他/她'视角，限定在一个角色的视角",
    guidelines: `
**第三人称限制写作指南：**
- 使用"他/她/它"来称呼视角角色
- 每个场景/章节保持在一个角色视角中
- 可以描述角色的外貌（与第一人称不同）
- 限定于视角角色所知道和感知的内容
- 可以直接或间接展示角色想法
- 比第一人称灵活，仍保持亲密感
- 需要时可在不同章节切换视角`,
    examples: `"林萧踏入房间，心跳加速。阴影似乎在移动，但他不敢确定。"`
  },
  
  'third-omniscient': {
    name: "第三人称全知",
    description: "全知视角，可以看到任何角色的内心",
    guidelines: `
**第三人称全知写作指南：**
- 叙述者了解所有角色的一切
- 可以揭示任何角色的想法和感受
- 可以提供角色不知道的信息
- 叙述者可以对事件进行评论
- 更具距离感但视野更广
- 可以预示未来事件
- 需要小心处理避免视角混乱`,
    examples: `"林萧踏入房间，没有察觉到暗处的张伟正握紧匕首，杀意凛然。"`
  }
};

export interface ToneConfig {
  name: string;
  description: string;
  guidelines: string;
  vocabularyGuidance: string;
}

export const TONE_CONFIGS: Record<string, ToneConfig> = {
  dark: {
    name: "暗黑/黑暗",
    description: "严肃、阴郁、常涉及艰难主题",
    guidelines: `
**暗黑风格指南：**
- 使用冷峻、凌厉的语言
- 不回避残酷现实
- 氛围压抑或紧张
- 幽默如果存在，是苦涩或讽刺的
- 结局可能是悲剧或模糊的
- 聚焦后果和道德复杂性`,
    vocabularyGuidance: "使用如：暗影、冰冷、锋利、苦涩、虚空、腐朽、破碎"
  },
  
  humorous: {
    name: "轻松/搞笑",
    description: "轻快、幽默、娱乐性强",
    guidelines: `
**轻松搞笑风格指南：**
- 使用机智、双关和喜剧时机
- 角色可以自嘲或荒诞
- 情节可以夸张以达到效果
- 对话充满俏皮和玩笑
- 即使严肃时刻也能有轻松感
- 时机就是一切 - 铺垫和笑点`,
    vocabularyGuidance: "使用幽默语言、出人意料的比喻、机智的观察"
  },
  
  serious: {
    name: "正剧/严肃",
    description: "认真、真挚、踏实",
    guidelines: `
**严肃风格指南：**
- 对主题严肃对待
- 角色面对真实后果
- 避免夸张或戏谑
- 情感时刻要赚得，不能操控
- 聚焦真实的人性体验
- 可以有希望但不轻飘`,
    vocabularyGuidance: "使用精确、深思熟虑的语言；避免轻浮"
  },
  
  epic: {
    name: "热血/史诗",
    description: "宏大、壮阔、气势磅礴",
    guidelines: `
**热血史诗风格指南：**
- 巨大的赌注，改变世界的事件
- 高亢、有力的语言
- 跨越时空的宏大范围
- 多条故事线和多视角
- 历史感和命运感
- 壮丽和壮观的时刻`,
    vocabularyGuidance: "使用强大、激昂的语言；宏伟的意象"
  },
  
  intimate: {
    name: "细腻/温馨",
    description: "私密、情感化、角色为中心",
    guidelines: `
**细腻温馨风格指南：**
- 聚焦内在体验
- 小而私密的时刻很重要
- 情感真诚是关键
- 细微的观察有分量
- 关系是核心
- 脆弱是力量`,
    vocabularyGuidance: "使用精确的情感语言；聚焦感官细节"
  }
};

export function getStylePrompt(settings: StorySettings): string {
  let prompt = "";
  
  // 核心：加入中文网文禁用词和反AI规则
  prompt += `
### 禁用词列表（绝对不要使用）：

**中文AI生成常见套话：**
- "不禁" "竟然"（避免过度使用）→ 改用具体动作和反应
- "一股强大的气息"、"浑身一震" → 用具体感受描写
- "心中暗道"、"暗自思忖" → 直接写想法或用行为表现
- "缓缓说道"、"淡淡地说" → 用对话内容和语气表现
- "目光如炬"、"宛如天神" → 用具体描写
- "竟是如此"、"果然不凡" → 更自然的反应
- 过度使用四字成语堆砌 → 精简使用，讲究自然
- "只见"、"但见"、"却见" → 直接描写，无需多余引导

### 中文网文核心写作规则：

1. **语言精简化：**
   - 减少70-80%的形容词
   - 用动作和对话替代心理描写的抽象词
   - 将复杂句拆分为短句
   - 加入简单直白的句子："他走进来。" "天很冷。" "她在等。"

2. **消灭重复模式：**
   - 绝不用："在这一刻" "就在这时" "在这种情况下"
   - 绝不用："不是X，而是Y" → 直接选一个或换说法
   - 绝不用：三连形容词（"可怕的、恐怖的、深刻的"）→ 单一词汇
   - 绝不用："某种X的感觉" → 具体说明或承认不知道
   - 多用"说"而非"低语/嘟囔"
   - 避免："紧压着"、"粘着"、"如同实质般的打击"

3. **用动作展现内心：**
   - 不写："她很害怕" → 改为："她的手在门把手上滑了两次"
   - 不写："他筋疲力尽" → 改为："他坐下时连外套都没脱"

4. **创造不均衡感：**
   - 长短段落交替
   - 加入平淡时刻：等待、日常、琐碎细节
   - 节奏变化：高潮 → 停顿 → 高潮
   - 不是每句话都要漂亮

5. **加入随机性：**
   - 无关紧要的细节（墙上的裂缝、外面的声音）
   - 笨拙的对话：停顿、重复、未完成的句子
   - 不理性的角色行为
   - 不为情节服务的细节

6. **将抽象具体化：**
   - 不写："寒意蔓延" → 改为："她的手指麻木了。刀子从手中滑落。"
   - 不写："压力在她周围聚集" → 改为："空气中有股铜味。她的耳朵嗡嗡作响。"

7. **道德复杂化：**
   - 去掉方便的正当理由
   - 受害者要有具体特征、历史、遗言
   - 在行动前（不是后）展现犹豫
   - 不替读者判断谁对谁错

8. **动摇确定性：**
   - 展现幻象中的矛盾
   - 角色怀疑自己的理解
   - 其他人看到不同的东西

**记住：** 不是每句话都要文学化。好的文笔要会呼吸。不要怕写得平淡。相信读者。

`;
  
  // 添加叙事视角指南
  if (settings.narrativeVoice) {
    const voiceConfig = NARRATIVE_VOICES[settings.narrativeVoice];
    if (voiceConfig) {
      prompt += `\n**叙事视角：${voiceConfig.name}**\n${voiceConfig.guidelines}\n`;
    }
  }
  
  // 添加语气风格指南
  if (settings.tone) {
    const toneConfig = TONE_CONFIGS[settings.tone];
    if (toneConfig) {
      prompt += `\n**风格语气：${toneConfig.name}**\n${toneConfig.guidelines}\n${toneConfig.vocabularyGuidance}\n`;
    }
  }
  
  // 添加目标受众考虑
  if (settings.targetAudience) {
    prompt += `\n**目标读者：${settings.targetAudience}**\n`;
    
    if (settings.targetAudience === 'YA') {
      prompt += `- 主角通常15-18岁
- 成长主题
- 语气要符合青少年真实感受
- 可以探讨严肃问题但保持希望
- 节奏往往更快\n`;
    } else if (settings.targetAudience === 'adult') {
      prompt += `- 更复杂的主题和道德模糊性
- 可以探索更黑暗的题材
- 角色面对成人后果
- 节奏可根据故事需要变化\n`;
    }
  }
  
  // 添加写作风格指导
  if (settings.writingStyle) {
    prompt += `\n**写作风格：${settings.writingStyle}**\n`;
    
    switch (settings.writingStyle) {
      case 'descriptive':
        prompt += `- 丰富的感官细节
- 生动的意象和氛围
- 花时间描绘场景
- 平衡描写与动作\n`;
        break;
      case 'minimalist':
        prompt += `- 简洁、精练的文笔
- 每个字都要赚取它的位置
- 隐喻优于解释
- 短句、具体细节\n`;
        break;
      case 'lyrical':
        prompt += `- 诗意、音乐性的语言
- 注重节奏和声音
- 隐喻和意象
- 文笔本身之美\n`;
        break;
      case 'fast-paced':
        prompt += `- 短句和短段落
- 聚焦动作和对话
- 最少描写
- 保持高动力\n`;
        break;
    }
  }
  
  return prompt;
}

export function getNarrativeVoiceList(): string[] {
  return Object.keys(NARRATIVE_VOICES);
}

export function getToneList(): string[] {
  return Object.keys(TONE_CONFIGS);
}
