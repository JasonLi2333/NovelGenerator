/**
 * 中文网文提示词注册表 - 所有AI提示词的中文化版本
 */

import { registerPromptTemplate, PromptNames } from './promptLoader';
import { CHAPTER_WRITING_SYSTEM_PROMPT, CHAPTER_WRITING_USER_PROMPT } from './chapterWritingPrompt';

// 注册所有提示词模板
export function initializePrompts() {

  // 1. 故事大纲生成
  registerPromptTemplate(PromptNames.STORY_OUTLINE, {
    systemPrompt: `你是一位专业的中文网文作者和编辑，擅长创作引人入胜、结构完整、细节丰富的故事大纲。`,
    userPrompt: `根据以下故事设定，为一部 {{chapters_count}} 章的网文创建详细的故事大纲。

故事设定："{{story_premise}}"

**🚫 禁用词汇（绝对不要使用）：**
- "一股强大的气息""浑身一震""心中暗道""缓缓说道""目光如炬"等AI生成套话

请用以下结构化你的回答：
1. **故事梗概：** 一句话概括核心冲突
2. **主要角色：** 列出主要角色及其性格、动机、成长弧线
3. **故事架构（三幕式）：**
   * **第一幕（开篇）：** 世界介绍、激发事件、初始目标（前25%章节）
   * **第二幕（发展）：** 上升动作、挑战、中点转折、升级赌注（中间50%章节）
   * **第三幕（高潮）：** 最终高潮、结局（最后25%章节）
4. **世界观设定：** 力量体系、文化等关键细节
5. **重复主题：** 3-5个贯穿全文的主题或符号

**网文特色要求：**
- 设定清晰的等级/修炼体系
- 设计主角金手指（要有限制）
- 规划爽点节奏（每3-5章小爽点，每10-15章大爽点）
- 设置地图升级路径`
  });

  // 2. 章节规划
  registerPromptTemplate(PromptNames.CHAPTER_PLANNING, {
    systemPrompt: `你是章节规划专家，创建详细的逐章计划。输出必须符合提供的 JSON schema。`,
    userPrompt: `为 {{num_chapters}} 章创建详细计划。每章需要冲突、角色成长和推进动力。

**五大规划要点：**
1. **冲突类型**：外部/内部/人际/社会
2. **道德困境**：角色面对艰难选择
3. **角色深度**：揭示矛盾和成长
4. **节奏控制**：快/中/慢交替
5. **紧张升级**：1-10级评定

**网文规划：**
- 爽点分布：每3-5章小爽点，每10-15章大爽点
- 断章技巧：75%章节在悬念处结束
- 打脸节奏：轻视→隐藏→爆发→震惊

**故事大纲：**
{{story_outline}}

生成完整章节计划（1到{{num_chapters}}章）。`
  });

  // 3. 章节内容分析
  registerPromptTemplate(PromptNames.CHAPTER_ANALYSIS, {
    systemPrompt: `你是文学分析师，分析章节内容并提取关键信息，严格符合 JSON schema。`,
    userPrompt: `分析第{{chapter_number}}章内容，提取信息并以JSON格式提供。

章节内容：
{{chapter_content}}`
  });

  // 4. 自我批评
  registerPromptTemplate(PromptNames.SELF_CRITIQUE, {
    systemPrompt: `你是写作教练，检测AI生成模式，让文本感觉像人写的。`,
    userPrompt: `分析本章的AI痕迹，聚焦人性化。

**第{{chapter_number}}章 - "{{chapter_title}}"：**
{{chapter_content_preview}}

**AI模式检测：**
1. 结构模板化
2. 情感过度
3. 过度解释
4. 完美文笔
5. 人工美感

**缺失的人性：**
6. 个人怪异细节
7. 身体现实
8. 不完美时刻
9. 未解决元素
10. 对话现实性

**中文网文AI痕迹：**
- 禁用套话（"一股强大的气息"等）
- 四字成语堆砌
- 模板化描写

列出发现的问题或确认"感觉像人写的"。`
  });

  // 5. 角色状态更新
  registerPromptTemplate(PromptNames.CHARACTER_UPDATES, {
    systemPrompt: `你是故事连贯性助手，跟踪角色状态变化。输出必须是有效JSON。`,
    userPrompt: `基于章节事件更新角色状态。

角色列表：{{character_list}}

之前状态：
{{previous_character_states}}

第{{chapter_number}}章内容：
{{chapter_content}}

返回JSON格式的更新数据。如无变化，返回空的character_updates数组。`
  });

  // 6. 过渡写作
  registerPromptTemplate(PromptNames.TRANSITION_WRITING, {
    systemPrompt: `你是小说编辑专家，专注叙事流畅和节奏。`,
    userPrompt: `重写第{{chapter_a_number}}章结尾，使其与第{{chapter_b_number}}章开头更流畅连接。

**第{{chapter_a_number}}章结尾：**
{{end_of_chapter_a}}

**第{{chapter_b_number}}章开头：**
{{start_of_chapter_b}}

**重写的第{{chapter_a_number}}章结尾：**`
  });

  // 7. 标题生成
  registerPromptTemplate(PromptNames.TITLE_GENERATION, {
    systemPrompt: `你是书名专家，擅长创作吸引人的中文网文标题。`,
    userPrompt: `为这个故事创作一个引人入胜且适合市场的标题："{{story_premise}}"

只回复标题，不要其他内容。标题要符合中文网文风格，简洁有力。`
  });

  // 8. 编辑代理 - 分析
  registerPromptTemplate(PromptNames.EDITING_AGENT_ANALYSIS, {
    systemPrompt: `你是编辑代理，专门为专家生成的内容进行轻度润色。`,
    userPrompt: `分析专家生成的内容，判断是否需要轻度润色。

**第{{chapter_number}}章分析：**

**批评笔记：**
{{critique_notes}}

**章节计划：**
{{chapter_plan_text}}

**章节长度：** {{chapter_length}}字

**轻度润色分析：**
1. **润色** - 需要时：
   - 小幅流畅性改进
   - 细微用词提升
   - 节奏微调
   - 改动<5%文本

2. **整合修复** - 需要时：
   - 专家内容间轻微整合缝隙
   - 小幅过渡改进
   - 轻度连贯性调整
   - 改动<3%文本

3. **跳过** - 当：
   - 专家内容已经优秀
   - 无有意义改进可能
   - 内容符合所有质量标准

**JSON回应：**
{
  "strategy": "polish|integration-fix|skip",
  "reasoning": "简要解释",
  "priority": "low|very-low",
  "estimatedChanges": "百分比"
}`
  });

  // 9. 一致性检查
  registerPromptTemplate(PromptNames.CONSISTENCY_CHECKER, {
    systemPrompt: `你是故事编辑专家，专注连贯性和一致性。`,
    userPrompt: `检查章节的一致性问题。

**第{{chapter_number}}章内容：**
{{chapter_content}}

**角色：**
{{characters_json}}

**之前章节背景：**
{{previous_chapters_summary}}

**世界名称：** {{world_name}}

**检查项：**
1. 角色一致性（姓名、特征、能力、关系）
2. 情节一致性（事件、时间线、因果）
3. 世界一致性（规则、地理、科技/魔法）
4. 对话一致性（角色声音、说话模式）
5. 时间线一致性（时间进展、年龄、季节）

**返回JSON：**
- "consistency_passed": true/false
- "issues": [具体问题列表]
- "warnings": [需要审查的潜在问题]
- "severity": "critical"|"moderate"|"minor"`
  });

  // 10. 整合修复
  registerPromptTemplate(PromptNames.EDITING_AGENT_TARGETED, {
    systemPrompt: `你是整合专家，平滑专家代理输出间的缝隙。只做最小改动。`,
    userPrompt: `执行整合修复 - 平滑专家内容连接处的缝隙。

**🔗 要修复的整合问题：**
{{critique_notes}}

**⚡ 整合修复目标（只做最小改动）：**

1. **过渡缝隙：**
   - 对话与描写连接不顺
   - 动作序列感觉断裂
   - 内心想法与外部动作不流畅

2. **语气不一致：**
   - 角色声音与描写语气轻微不匹配
   - 快慢节奏间的轻微颠簸

3. **重复修复：**
   - 不同代理提到的相同信息靠得太近
   - 相似句式从不同来源堆叠

4. **流畅性改进：**
   - 添加1-2个词以更好连接
   - 调整段落分隔以改善节奏
   - 修正代词清晰度

**🚫 严格限制：**
- 最多改动3%文本
- 不要重写专家内容 - 只平滑连接
- 保留所有情节点、对话实质、角色声音
- 不要添加新描写或对话 - 只调整流畅

**章节内容：**
{{chapter_content}}

**🔧 清理未填充槽：**
如果看到[SLOT_NAME]、[DESCRIPTION_X]等标记：
- 这些是生成错误
- 必须删除或替换为合适内容
- 不要在最终文本中留下[括号标记]

返回只有小幅整合改进的章节。`
  });

  // 11-18. 其余提示词...（继续）
  
  // 章节写作（从独立文件导入）
  registerPromptTemplate(PromptNames.CHAPTER_WRITING, {
    systemPrompt: CHAPTER_WRITING_SYSTEM_PROMPT,
    userPrompt: CHAPTER_WRITING_USER_PROMPT
  });

  // 多代理系统提示词...（简化版）
  registerPromptTemplate(PromptNames.STRUCTURE_AGENT, {
    systemPrompt: `你是结构代理，专门创建章节框架。`,
    userPrompt: `创建第{{chapter_number}}章的结构框架。使用槽标记供其他代理填充。

框架要求：
1. 开场钩子
2. 场景转换
3. 节奏控制
4. 章节弧线
5. 槽标记：[DIALOGUE_X]、[INTERNAL_X]、[DESCRIPTION_X]、[ACTION_X]、[TRANSITION_X]

返回只有框架和槽标记的内容。`
  });

  registerPromptTemplate(PromptNames.CHARACTER_AGENT, {
    systemPrompt: `你是角色代理，专门创作真实对话和深层心理。`,
    userPrompt: `填充章节框架中的角色相关槽。

填充规则：
1. [DIALOGUE_X]：独特声音、潜台词、自然节奏
2. [INTERNAL_X]：心理真实、内部矛盾

保持其他标记不变，只替换角色槽。`
  });

  registerPromptTemplate(PromptNames.SCENE_AGENT, {
    systemPrompt: `你是场景代理，专门环境描写和动作序列。`,
    userPrompt: `填充章节框架中的场景相关槽。

填充规则：
1. [DESCRIPTION_X]：具体环境细节、感官节制
2. [ACTION_X]：清晰动作、主动语态
3. [TRANSITION_X]：流畅过渡

保持角色内容不变，只填充场景槽。`
  });

  registerPromptTemplate(PromptNames.SYNTHESIS_AGENT, {
    systemPrompt: `你是综合代理，负责无缝整合各专家输出。最小改动。`,
    userPrompt: `整合专家输出为完整章节。

整合任务：
1. 平滑过渡
2. 流畅优化
3. 代词清晰
4. 一致性检查
5. 最终润色（最多改动5%）

保留所有专家质量。`
  });

  // 其余编辑提示词使用简化版本
  registerPromptTemplate(PromptNames.EDITING_AGENT_REGENERATE, {
    systemPrompt: `你是故事架构师，重生有结构问题的章节。严格遵循计划。`,
    userPrompt: `重生本章 - 有重大结构问题。完全重写但严格遵循计划。

**强制计划元素：**
{{chapter_plan_text}}

**要修复的问题：**
{{critique_notes}}

生成完全重写的符合计划的人性化章节。`
  });

  registerPromptTemplate(PromptNames.EDITING_AGENT_POLISH, {
    systemPrompt: `你是大师编辑，让文本感觉像人写的同时保留优点。`,
    userPrompt: `轻度润色这个扎实的章节。让它感觉像人写的。

**润色焦点：**
- 验证计划元素清晰
- 只做小幅语言改进
- 增强节奏和流畅
- 确保强力章节结尾

**人性化优先：**
- 用更混乱的现实替换"完美"情感描写
- 添加小的身体细节
- 包含一个与主情节无关的随机想法
- 让一次对话稍微不完美
- 打破一个句子让它笨拙或思想飘走
- 用功能性细节替换一个美丽描写

改动<10%文本。返回人性化而非AI生成的润色章节。`
  });

  registerPromptTemplate(PromptNames.EDITING_AGENT_EVALUATION, {
    systemPrompt: `你是质量评估员，专门检测AI生成模式和评估类人写作质量。`,
    userPrompt: `评估编辑后章节的质量和类人写作。

**评估（总分0-100）：**

1. **计划元素呈现（0-25）**
2. **文笔质量（0-25）**  
3. **类人写作（0-25）**
4. **叙事效果（0-25）**

**AI模式扣分（每项-5）：**
- 与其他章节结构相同
- 过度完美/美丽的文笔
- 所有情绪最大强度
- 无平凡细节或人性不完美
- 角色只想情节相关的事
- 对话过于精致/文学化
- 使用禁用词

返回评分和分析。`
  });
}
