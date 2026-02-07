// 角色信息接口
export interface Character {
  name: string; // 角色姓名
  description: string; // 角色描述
  first_appearance: number; // 首次出现的章节编号
  status: string; // 状态，例如：alive（存活）、injured（受伤）、unknown（未知）
  development: Array<{ chapter: number; description: string }>; // 角色发展历程，按章节记录
  relationships: Record<string, string>; // 人际关系，例如：{ "CharacterName": "Ally" }
  relationships_text?: string; // 存储LLM原始文本关系描述（如果需要）
  location: string; // 最后已知位置
  emotional_state: string; // 情感状态
}

// 章节生成阶段枚举
export enum ChapterGenerationStage {
  NotStarted = "not_started", // 未开始
  StructureGeneration = "structure_generation", // 结构生成
  CharacterGeneration = "character_generation", // 角色生成
  SceneGeneration = "scene_generation", // 场景生成
  Synthesis = "synthesis", // 内容整合
  FirstDraft = "first_draft", // 初稿
  LightPolish = "light_polish", // 轻度润色
  ConsistencyCheck = "consistency_check", // 一致性检查
  FinalDraft = "final_draft", // 终稿
  Complete = "complete" // 完成
}

// 章节数据接口
export interface ChapterData {
  title?: string; // 章节标题
  content: string; // 章节内容
  summary?: string; // 章节摘要
  timelineEntry?: string; // 时间线条目（LLM原始文本）
  emotionalArcEntry?: string; // 情感弧线条目（LLM原始文本）
  plan?: string; // 单个章节计划
  // 扩展分析指标
  pacingScore?: number; // 节奏评分（1-10分）
  dialogueRatio?: number; // 对话占比（0-100%）
  wordCount?: number; // 字数统计
  keyEvents?: string[]; // 关键事件
  characterMoments?: string[]; // 角色时刻
  foreshadowing?: string[]; // 伏笔设置
  // 生成进度跟踪
  generationStage?: ChapterGenerationStage; // 生成阶段
  draftVersions?: { // 草稿版本历史
    stage: ChapterGenerationStage; // 阶段
    content: string; // 内容
    timestamp: number; // 时间戳
  }[];
  lastSavedAt?: number; // 最后保存时间（Unix时间戳）
}

// 生成步骤枚举
export enum GenerationStep {
  Idle = "Idle", // 空闲状态
  UserInput = "Waiting for User Input", // 等待用户输入
  GeneratingOutline = "Generating Story Outline...", // 生成故事大纲...
  WaitingForOutlineApproval = "Waiting for Outline Approval", // 等待大纲批准
  ExtractingCharacters = "Extracting Characters from Outline...", // 从大纲提取角色...
  ExtractingWorldName = "Extracting World Name from Outline...", // 从大纲提取世界名称...
  ExtractingMotifs = "Extracting Recurring Motifs from Outline...", // 从大纲提取重复主题...
  GeneratingChapterPlan = "Generating Detailed Chapter-by-Chapter Plan...", // 生成详细的章节计划...
  GeneratingChapters = "Generating Chapters...", // 生成章节...
  FinalEditingPass = "Final Editing Pass - Polishing All Chapters...", // 最终编辑阶段 - 润色所有章节...
  ProfessionalPolish = "Professional Polish - Final Refinement...", // 专业润色 - 最终完善...
  FinalizingTransitions = "Finalizing Chapter Transitions & Openings...", // 完善章节过渡和开头...
  CompilingBook = "Compiling Final Book...", // 编译最终书籍...
  Done = "Book Generation Complete!", // 书籍生成完成！
  Error = "An Error Occurred" // 发生错误
}

// 详细场景结构，用于全面的章节规划
export interface DetailedScene {
  sceneId: string; // 场景唯一标识符
  location: string; // 场景发生地点
  participants: string[]; // 参与此场景的角色
  objective: string; // 场景试图达成的目标
  conflict: string; // 场景中的主要张力或障碍
  outcome: string; // 场景如何解决
  duration: string; // 预计时间跨度（例如："10分钟"、"几个小时"）
  mood: string; // 场景的情感氛围
  keyMoments: string[]; // 场景中的具体节奏点或事件
}

// 推动叙事前进的特定事件
export interface ChapterEvent {
  eventId: string; // 事件唯一标识符
  eventType: 'dialogue' | 'action' | 'revelation' | 'conflict' | 'internal' | 'transition'; // 事件类型：对话、行动、揭示、冲突、内心、过渡
  description: string; // 此事件中发生的事情
  participants: string[]; // 涉及的人员
  consequences: string[]; // 此事件导致的结果
  emotionalImpact: number; // 情感影响程度（1-10分）
  plotSignificance: string; // 此事件如何推进整体故事
  sceneId?: string; // 此事件所属的场景
}

// 计划的对话时刻，包含潜台词和目的
export interface DialogueBeat {
  beatId: string; // 节奏点唯一标识符
  purpose: string; // 此对话达成的目的
  participants: string[]; // 说话的人
  subtext: string; // 字里行间真正传达的内容
  revelations: string[]; // 通过此对话揭示的信息
  tensions: string[]; // 暴露的冲突或张力
  emotionalShifts: string[]; // 角色情感如何变化
  sceneId?: string; // 此对话所属的场景
}

// 角色在本章节中的情感历程
export interface CharacterEmotionalArc {
  character: string; // 角色姓名
  startState: string; // 章节开始时的情感状态
  keyMoments: string[]; // 影响此角色的具体时刻
  endState: string; // 章节结束时的情感状态
  internalConflicts: string[]; // 角色面临的内心挣扎
  growth: string; // 角色如何变化或发展
  relationships: string; // 与其他角色的关系如何演变（逗号分隔列表）
}

// 动作序列和物理事件
export interface ActionSequence {
  sequenceId: string; // 序列唯一标识符
  description: string; // 发生的物理动作
  participants: string[]; // 参与此动作的人员
  stakes: string; // 此动作期间的风险
  outcome: string; // 动作如何解决
  pacing: 'slow' | 'medium' | 'fast' | 'frantic'; // 动作速度：慢、中、快、疯狂
  sceneId?: string; // 此动作所属的场景
}

// 用于存储从主要章节计划块解析出的章节计划
export interface ParsedChapterPlan {
  title: string; // 标题
  summary: string; // 摘要
  sceneBreakdown: string; // 场景分解（可以更结构化）
  characterDevelopmentFocus: string; // 角色发展重点
  plotAdvancement: string; // 情节推进
  timelineIndicators: string; // 时间线指标
  emotionalToneTension: string; // 情感基调张力
  connectionToNextChapter: string; // 与下一章节的连接
  conflictType?: string; // 冲突类型：外部、内部、人际、社会
  tensionLevel?: number; // 张力等级（1-10分）
  rhythmPacing?: string; // 章节节奏：快、中、慢
  wordEconomyFocus?: string; // 文字经济重点：对话密集、动作密集、氛围轻盈
  moralDilemma?: string; // 此章节探讨的道德困境或伦理问题
  characterComplexity?: string; // 此章节如何揭示角色矛盾和深度
  consequencesOfChoices?: string; // 此章节中决策的后果
  primaryLocation?: string; // 章节主要发生地点

  // 扩展的详细规划
  detailedScenes?: DetailedScene[]; // 构成章节的3-5个详细场景
  chapterEvents?: ChapterEvent[]; // 推动叙事的特定事件
  dialogueBeats?: DialogueBeat[]; // 计划的对话时刻，具有目的和潜台词
  characterArcs?: CharacterEmotionalArc[]; // 每个角色的情感历程
  actionSequences?: ActionSequence[]; // 物理动作和移动序列

  // 节奏和结构
  targetWordCount?: number; // 此章节的预计长度
  sceneTransitions?: string[]; // 场景如何连接和流动
  climaxMoment?: string; // 章节的情感/张力峰值时刻
  openingHook?: string; // 章节如何开始以吸引读者
  chapterEnding?: string; // 章节如何结束并引向下一章

  // 主题元素
  symbolism?: string[]; // 贯穿章节的象征元素
  foreshadowing?: string[]; // 暗示未来事件的元素
  callbacks?: string[]; // 对早期事件或章节的引用

  // 技术要求
  requiredSlots?: number; // 需要的最少内容槽位数
  complexityLevel?: 'simple' | 'moderate' | 'complex' | 'intricate'; // 章节复杂度：简单、中等、复杂、错综复杂
  generationPriority?: 'standard' | 'high' | 'critical'; // 此章节需要多少关注度
}

// 为结构化的章节后分析添加
export interface TimelineEntry {
  timeElapsed: string; // 已用时间
  endTimeOfChapter: string; // 章节结束时间
  specificMarkers: string; // 具体标记
}

// 情感弧线条目接口
export interface EmotionalArcEntry {
  primaryEmotion: string; // 主要情感
  tensionLevel: number | string; // 张力等级
  unresolvedHook: string; // 未解决的钩子
}

// 故事设置，用于体裁、基调和叙事风格
export interface StorySettings {
  genre?: string; // 体裁
  narrativeVoice?: string; // 叙事声音
  tone?: string; // 基调
  targetAudience?: string; // 目标读者
  writingStyle?: string; // 写作风格
}

// Agent活动日志，用于UI显示
export interface AgentLogEntry {
  timestamp: number; // 时间戳
  chapterNumber: number; // 章节编号
  type: 'decision' | 'execution' | 'evaluation' | 'iteration' | 'warning' | 'success' | 'diff'; // 类型：决策、执行、评估、迭代、警告、成功、差异
  message: string; // 消息
  details?: any; // 详情
  // 用于差异可视化
  beforeText?: string; // 修改前文本
  afterText?: string; // 修改后文本
  strategy?: string; // 策略
}
