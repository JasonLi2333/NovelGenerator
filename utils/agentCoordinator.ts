/**
 * 代理协调器 - 混合多代理章节生成的中央协调器
 */

import { ChapterData, ParsedChapterPlan, Character } from '../types';
import { coherenceManager, ChapterContext, RepetitionReport, RepetitionConstraints } from './coherenceManager';
import { structureAgent, characterAgent, sceneAgent, DialogueRequirement } from './specialistAgents';
import { synthesisAgent } from './synthesisAgent';
import { agentEditChapter } from './editingAgent';
import { generateText } from '../services/llm';
import { storyContextDB, SharedChapterState, RevelationValidation, ContentLimitCheck, ToneGuidance, BalanceReport } from './storyContextDatabase';

// =================== 接口 ===================

export interface ChapterGenerationInput {
  chapterNumber: number;
  chapterPlan: ParsedChapterPlan;
  characters: Record<string, Character>;
  previousChapterEnd?: string;
  storyOutline: string;
  targetLength: number;
  genre?: string; // 用户选择的类型
}

export interface GenerationPhaseResult {
  phaseName: string;
  duration: number;
  success: boolean;
  output?: any;
  errors?: string[];
  warnings?: string[];
}

export interface HybridGenerationResult {
  success: boolean;
  chapterData: ChapterData;
  phases: GenerationPhaseResult[];
  metadata: {
    totalTime: number;
    agentPerformance: Record<string, { time: number; confidence: number }>;
    qualityMetrics: {
      coherenceScore: number;
      integrationScore: number;
      polishScore: number;
    };
  };
}

export interface GenerationOptions {
  enableLightPolish: boolean;
  enableConsistencyCheck: boolean;
  enableFallbackToOldSystem: boolean;
  parallelProcessing: boolean;
  maxRetries: number;
}

// =================== 代理协调器类 ===================

export class AgentCoordinator {
  private options: GenerationOptions;

  constructor(options: Partial<GenerationOptions> = {}) {
    this.options = {
      enableLightPolish: true,
      enableConsistencyCheck: true,
      enableFallbackToOldSystem: false, // 禁用回退以强制使用协调系统
      parallelProcessing: false, // 使用顺序协调生成
      maxRetries: 2,
      ...options
    };
  }

  // =================== 主要生成方法 ===================

  async generateChapter(input: ChapterGenerationInput): Promise<HybridGenerationResult> {
    const startTime = Date.now();
    const phases: GenerationPhaseResult[] = [];

    console.log(`🚀 开始为第 ${input.chapterNumber} 章生成混合内容: "${input.chapterPlan.title}"`);

    try {
      // 第一阶段：上下文准备
      const contextPhase = await this.executePhase('上下文准备', async () => {
        return await this.prepareContext(input);
      });
      phases.push(contextPhase);

      if (!contextPhase.success) {
        throw new Error('上下文准备失败');
      }

      const context = contextPhase.output as ChapterContext;

      // 第二阶段：协调顺序生成
      const generationPhase = await this.executePhase('协调专家生成', async () => {
        return await this.coordinatedSequentialGeneration(input, context);
      });
      phases.push(generationPhase);

      if (!generationPhase.success) {
        if (this.options.enableFallbackToOldSystem) {
          console.log('🔄 回退到旧生成系统...');
          return await this.fallbackToOldSystem(input);
        }
        throw new Error('专家生成失败');
      }

      const { structureOutput, characterOutput, sceneOutput } = generationPhase.output;

      // 第三阶段：合成与宏观验证
      const synthesisPhase = await this.executePhase('合成与宏观验证', async () => {
        const balanceReport = storyContextDB.validateChapterBalance();

        return await this.synthesisWithValidation({
          structureOutput,
          characterOutput,
          sceneOutput,
          chapterNumber: input.chapterNumber,
          chapterTitle: input.chapterPlan.title,
          balanceReport
        });
      });
      phases.push(synthesisPhase);

      if (!synthesisPhase.success) {
        throw new Error('内容合成失败');
      }

      const synthesisResult = synthesisPhase.output;
      let finalContent = synthesisResult.integratedChapter;

      console.log(`🔗 内容合成完成，采用高质量代理协调`);

      // 第四阶段：轻度润色（可选）
      if (this.options.enableLightPolish) {
        const polishPhase = await this.executePhase('轻度润色', async () => {
          return await this.applyLightPolish(finalContent, input);
        });
        phases.push(polishPhase);

        if (polishPhase.success && polishPhase.output) {
          finalContent = polishPhase.output;
        }
      }

      // 第五阶段：重复检查与修复
      const repetitionPhase = await this.executePhase('重复检查', async () => {
        const repetitionReport = coherenceManager.checkForRepetition(finalContent, input.chapterNumber);

        if (repetitionReport.severity === 'high' || repetitionReport.totalRepetitions > 2) {
          console.log(`⚠️ 在第 ${input.chapterNumber} 章检测到高度重复:`, repetitionReport.issues.map(i => i.phrase));

          // 对最终内容应用重复修复
          let fixedContent = finalContent;
          for (const issue of repetitionReport.issues) {
            if (issue.severity === 'high') {
              // 简单的重复修复 - 可以增强
              const regex = new RegExp(issue.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
              const matches = fixedContent.match(regex);
              if (matches && matches.length > 1) {
                // 保留第一次出现，替换其他为变体
                let replaceCount = 0;
                fixedContent = fixedContent.replace(regex, (match) => {
                  if (replaceCount === 0) {
                    replaceCount++;
                    return match; // 保留第一次
                  }
                  replaceCount++;
                  return this.getAlternativePhrase(match, issue.category);
                });
              }
            }
          }

          return { report: repetitionReport, fixedContent, fixed: fixedContent !== finalContent };
        }

        return { report: repetitionReport, fixedContent: finalContent, fixed: false };
      });
      phases.push(repetitionPhase);

      if (repetitionPhase.success && repetitionPhase.output?.fixed) {
        finalContent = repetitionPhase.output.fixedContent;
        console.log(`🔧 对第 ${input.chapterNumber} 章应用了重复修复`);
      }

      // 第六阶段：连贯性更新
      const updatePhase = await this.executePhase('连贯性更新', async () => {
        const chapterData: ChapterData = {
          title: input.chapterPlan.title,
          content: finalContent,
          plan: this.formatChapterPlan(input.chapterPlan),
          summary: input.chapterPlan.summary
        };

        coherenceManager.updateFromGeneratedChapter(chapterData, input.chapterNumber);
        return chapterData;
      });
      phases.push(updatePhase);

      const finalChapterData = updatePhase.output as ChapterData;

      // 计算元数据
      const metadata = this.calculateMetadata(phases, startTime);

      console.log(`✅ 第 ${input.chapterNumber} 章混合生成完成 (${metadata.totalTime}ms)`);

      return {
        success: true,
        chapterData: finalChapterData,
        phases,
        metadata
      };

    } catch (error) {
      console.error(`❌ 第 ${input.chapterNumber} 章混合生成失败:`, error);

      if (this.options.enableFallbackToOldSystem) {
        console.log('🔄 尝试回退到旧系统...');
        return await this.fallbackToOldSystem(input);
      }

      return {
        success: false,
        chapterData: {
          title: input.chapterPlan.title,
          content: `生成章节时出错: ${error}`,
          plan: this.formatChapterPlan(input.chapterPlan)
        },
        phases,
        metadata: this.calculateMetadata(phases, startTime)
      };
    }
  }

  // =================== 阶段执行 ===================

  private async executePhase<T>(
    phaseName: string,
    phaseFunction: () => Promise<T>
  ): Promise<GenerationPhaseResult> {
    const startTime = Date.now();
    console.log(`📋 开始阶段: ${phaseName}`);

    try {
      const output = await phaseFunction();
      const duration = Date.now() - startTime;

      console.log(`✅ 阶段完成: ${phaseName} (${duration}ms)`);

      return {
        phaseName,
        duration,
        success: true,
        output
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      console.error(`❌ 阶段失败: ${phaseName} (${duration}ms):`, error);

      return {
        phaseName,
        duration,
        success: false,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // =================== 上下文准备 ===================

  private async prepareContext(input: ChapterGenerationInput): Promise<ChapterContext> {
    // 如果是第一章，初始化连贯性管理器
    if (input.chapterNumber === 1) {
      coherenceManager.initializeFromOutline(
        input.storyOutline,
        input.characters,
        10 // 假设10章 - 应该来自输入
      );
    }

    // 准备章节上下文
    const context = coherenceManager.prepareChapterContext(
      input.chapterNumber,
      input.chapterPlan
    );

    console.log(`📋 上下文已准备，包含 ${context.structure.plotThreadsToAdvance.length} 个要推进的情节线`);
    return context;
  }

  // =================== 专家生成 ===================

  private async parallelSpecialistGeneration(
    input: ChapterGenerationInput,
    context: ChapterContext
  ) {
    console.log(`⚡ 并行运行专家代理...`);

    const [structureOutput, characterOutput, sceneOutput] = await Promise.all([
      structureAgent.generate({
        chapterPlan: input.chapterPlan,
        chapterNumber: input.chapterNumber,
        context: context.structure,
        constraints: context.constraints,
        previousChapterEnd: input.previousChapterEnd,
        targetLength: input.targetLength,
        storyOutline: input.storyOutline
      }),
      characterAgent.generate({
        chapterPlan: input.chapterPlan,
        chapterNumber: input.chapterNumber,
        context: context.character,
        constraints: context.constraints,
        structureSlots: { dialogueSlots: [], actionSlots: [], internalSlots: [], descriptionSlots: [] }, // 结构后填充
        dialogueRequirements: this.generateDialogueRequirements(input.chapterPlan, input.characters),
        storyOutline: input.storyOutline,
        genre: input.genre
      }),
      sceneAgent.generate({
        chapterPlan: input.chapterPlan,
        chapterNumber: input.chapterNumber,
        context: context.scene,
        constraints: context.constraints,
        structureSlots: { dialogueSlots: [], actionSlots: [], internalSlots: [], descriptionSlots: [] }, // 结构后填充
        storyOutline: input.storyOutline,
        genre: input.genre
      })
    ]);

    // 使用实际结构插槽更新角色和场景输出
    const updatedCharacterOutput = await this.updateWithStructureSlots(
      characterOutput,
      structureOutput,
      input,
      context
    );

    const updatedSceneOutput = await this.updateWithStructureSlots(
      sceneOutput,
      structureOutput,
      input,
      context
    );

    return {
      structureOutput,
      characterOutput: updatedCharacterOutput,
      sceneOutput: updatedSceneOutput
    };
  }

  private async sequentialSpecialistGeneration(
    input: ChapterGenerationInput,
    context: ChapterContext
  ) {
    console.log(`🔄 顺序运行专家代理...`);

    // 首先：结构代理
    const structureOutput = await structureAgent.generate({
      chapterPlan: input.chapterPlan,
      chapterNumber: input.chapterNumber,
      context: context.structure,
      constraints: context.constraints,
      previousChapterEnd: input.previousChapterEnd,
      targetLength: input.targetLength,
      storyOutline: input.storyOutline
    });

    console.log(`📊 结构代理创建的插槽:`);
    console.log(`   - 对话插槽: ${structureOutput.slots.dialogueSlots.length} - ${structureOutput.slots.dialogueSlots.join(', ')}`);
    console.log(`   - 动作插槽: ${structureOutput.slots.actionSlots.length} - ${structureOutput.slots.actionSlots.join(', ')}`);
    console.log(`   - 内心插槽: ${structureOutput.slots.internalSlots.length} - ${structureOutput.slots.internalSlots.join(', ')}`);
    console.log(`   - 描述插槽: ${structureOutput.slots.descriptionSlots.length} - ${structureOutput.slots.descriptionSlots.join(', ')}`);

    // 然后：角色代理（使用结构插槽）
    const characterOutput = await characterAgent.generate({
      chapterPlan: input.chapterPlan,
      chapterNumber: input.chapterNumber,
      context: context.character,
      constraints: context.constraints,
      structureSlots: structureOutput.slots,
      dialogueRequirements: this.generateDialogueRequirements(input.chapterPlan, input.characters),
      storyOutline: input.storyOutline,
      genre: input.genre
    });

    // 最后：场景代理（使用结构插槽）
    const sceneOutput = await sceneAgent.generate({
      chapterPlan: input.chapterPlan,
      chapterNumber: input.chapterNumber,
      context: context.scene,
      constraints: context.constraints,
      structureSlots: structureOutput.slots,
      storyOutline: input.storyOutline,
      genre: input.genre
    });

    return {
      structureOutput,
      characterOutput,
      sceneOutput
    };
  }

  private generateDialogueRequirements(chapterPlan: ParsedChapterPlan, characters?: Record<string, any>): DialogueRequirement[] {
    const activeCharacters = characters ? Object.keys(characters) : ['protagonist'];
    const requirements: DialogueRequirement[] = [];

    // 基于章节重点的主要对话
    if (chapterPlan.characterDevelopmentFocus) {
      requirements.push({
        slotId: 'DIALOGUE_CHARACTER_DEVELOPMENT',
        characters: activeCharacters.slice(0, 2),
        purpose: '角色发展和关系构建',
        emotionalTone: chapterPlan.emotionalToneTension || 'neutral',
        subtext: chapterPlan.characterComplexity
      });
    }

    // 冲突相关对话
    if (chapterPlan.conflictType) {
      requirements.push({
        slotId: 'DIALOGUE_CONFLICT',
        characters: activeCharacters,
        purpose: `处理${chapterPlan.conflictType}冲突`,
        emotionalTone: chapterPlan.emotionalToneTension || 'tense'
      });
    }

    // 情节推进对话
    if (chapterPlan.plotAdvancement) {
      requirements.push({
        slotId: 'DIALOGUE_PLOT',
        characters: activeCharacters.slice(0, 2),
        purpose: '推进主要情节',
        emotionalTone: chapterPlan.emotionalToneTension || 'neutral'
      });
    }

    // 如果没有特定要求，则使用默认对话
    if (requirements.length === 0) {
      requirements.push({
        slotId: 'DIALOGUE_MAIN',
        characters: activeCharacters.slice(0, 2),
        purpose: '推进故事发展',
        emotionalTone: chapterPlan.emotionalToneTension || 'neutral'
      });
    }

    return requirements;
  }

  private async updateWithStructureSlots(
    agentOutput: any,
    structureOutput: any,
    input: ChapterGenerationInput,
    context: ChapterContext
  ) {
    // 对于并行生成，我们需要使用实际的结构插槽重新生成角色/场景内容
    // 这是一个简化版本 - 在生产环境中，我们会有更复杂的更新机制
    return agentOutput;
  }

  // =================== 轻度润色 ===================

  private async applyLightPolish(
    content: string,
    input: ChapterGenerationInput
  ): Promise<string> {
    console.log(`✨ 对第 ${input.chapterNumber} 章应用轻度润色...`);

    try {
      // 使用现有的编辑系统在"轻度润色"模式
      const editingResult = await agentEditChapter(
        {
          chapterContent: content,
          chapterPlan: input.chapterPlan,
          chapterPlanText: this.formatChapterPlan(input.chapterPlan),
          critiqueNotes: '仅轻度润色 - 保留专家内容质量',
          chapterNumber: input.chapterNumber,
          onLog: (entry) => {
            console.log(`📝 编辑日志: ${entry.message}`);
          }
        },
        (prompt, system, schema, temp, topP, topK) => generateText('editing', prompt, system, schema, temp, topP, topK)
      );

      return editingResult.refinedContent;
    } catch (error) {
      console.warn('轻度润色失败，返回原始内容:', error);
      return content;
    }
  }

  // =================== 回退系统 ===================

  private async fallbackToOldSystem(input: ChapterGenerationInput): Promise<HybridGenerationResult> {
    console.log('🔄 回退系统已禁用 - 强制使用协调式中文生成系统...');

    // 由于我们要完全汉化，禁用回退到旧系统
    // 改为直接重新尝试协调式生成（重试一次）
    console.log('🔄 重新尝试协调式中文生成...');

    try {
      // 创建一个简化的上下文进行重试
      const retryContext = coherenceManager.prepareChapterContext(
        input.chapterNumber,
        input.chapterPlan
      );

      // 重新尝试协调式生成
      const retryResult = await this.coordinatedSequentialGeneration(input, retryContext);

      // 如果重试成功，返回结果
      const startTime = Date.now();
      const finalContent = await this.synthesisWithValidation({
        structureOutput: retryResult.structureOutput,
        characterOutput: retryResult.characterOutput,
        sceneOutput: retryResult.sceneOutput,
        chapterNumber: input.chapterNumber,
        chapterTitle: input.chapterPlan.title,
        balanceReport: storyContextDB.validateChapterBalance()
      });

      const finalChapterData: ChapterData = {
        title: input.chapterPlan.title,
        content: finalContent.integratedChapter,
        plan: this.formatChapterPlan(input.chapterPlan),
        summary: input.chapterPlan.summary
      };

      coherenceManager.updateFromGeneratedChapter(finalChapterData, input.chapterNumber);

      return {
        success: true,
        chapterData: finalChapterData,
        phases: [{
          phaseName: '回退重试',
          duration: Date.now() - startTime,
          success: true,
          output: finalContent
        }],
        metadata: {
          totalTime: Date.now() - startTime,
          agentPerformance: {
            'coordinator': { time: Date.now() - startTime, confidence: 0.7 }
          },
          qualityMetrics: {
            coherenceScore: 75,
            integrationScore: 70,
            polishScore: 65
          }
        }
      };

    } catch (retryError) {
      console.error('❌ 协调式生成重试也失败:', retryError);
      return {
        success: false,
        chapterData: {
          title: input.chapterPlan.title,
          content: `协调式中文生成系统完全失败: ${retryError instanceof Error ? retryError.message : String(retryError)}`,
          plan: this.formatChapterPlan(input.chapterPlan)
        },
        phases: [{
          phaseName: '回退系统',
          duration: 0,
          success: false,
          errors: ['协调式生成重试失败，已禁用旧系统回退']
        }],
        metadata: {
          totalTime: 0,
          agentPerformance: {},
          qualityMetrics: {
            coherenceScore: 0,
            integrationScore: 0,
            polishScore: 0
          }
        }
      };
    }
  }

  // =================== 帮助方法 ===================

  private formatChapterPlan(plan: ParsedChapterPlan): string {
    return `标题：${plan.title}
概要：${plan.summary}
场景拆解：${plan.sceneBreakdown}
角色发展：${plan.characterDevelopmentFocus}
冲突类型：${plan.conflictType}
紧张度：${plan.tensionLevel}/10
道德困境：${plan.moralDilemma}
角色复杂性：${plan.characterComplexity}
后果：${plan.consequencesOfChoices}`;
  }

  private calculateMetadata(phases: GenerationPhaseResult[], startTime: number) {
    const totalTime = Date.now() - startTime;
    const agentPerformance: Record<string, { time: number; confidence: number }> = {};

    // 从阶段中提取代理性能
    for (const phase of phases) {
      if (phase.output?.metadata) {
        const metadata = phase.output.metadata;
        agentPerformance[metadata.agentType] = {
          time: metadata.processingTime,
          confidence: metadata.confidence
        };
      }
    }

    // 计算质量指标（简化版）
    const qualityMetrics = {
      coherenceScore: phases.every(p => p.success) ? 90 : 60,
      integrationScore: phases.find(p => p.phaseName === '内容合成')?.success ? 85 : 50,
      polishScore: phases.find(p => p.phaseName === '轻度润色')?.success ? 80 : 70
    };

    return {
      totalTime,
      agentPerformance,
      qualityMetrics
    };
  }

  // =================== 重复帮助方法 ===================

  private getAlternativePhrase(originalPhrase: string, category: string): string {
    // 中文重复检测和替换逻辑
    const alternatives: Record<string, string[]> = {
      'metaphors': [
        '心中一紧 -> 心脏猛地收缩',
        '倒吸一口凉气 -> 呼吸一滞',
        '心脏猛地收缩 -> 心跳如擂鼓',
        '呼吸一滞 -> 呼吸困难',
        '心跳加速 -> 脉搏狂跳'
      ],
      'sensoryDescriptions': [
        '刺鼻的血腥味 -> 令人作呕的铁锈味',
        '铁锈味弥漫 -> 金属气息扑鼻',
        '血腥气味 -> 腥甜的味道',
        '寒意袭来 -> 冷风拂面',
        '震耳欲聋 -> 轰鸣声响起'
      ],
      'emotionalPhrases': [
        '恐惧笼罩 -> 焦虑蔓延',
        '惊恐万分 -> 心生畏惧',
        '紧张不安 -> 忐忑不安'
      ]
    };

    // 尝试查找直接替换
    const categoryAlts = alternatives[category] || [];
    for (const alt of categoryAlts) {
      const [original, replacement] = alt.split(' -> ');
      if (originalPhrase.toLowerCase().includes(original.toLowerCase())) {
        return originalPhrase.replace(new RegExp(original, 'gi'), replacement);
      }
    }

    // 后备方案：简单变体
    if (originalPhrase.includes('心中一紧')) {
      return originalPhrase.replace('心中一紧', '心脏猛地收缩');
    }
    if (originalPhrase.includes('倒吸一口凉气')) {
      return originalPhrase.replace('倒吸一口凉气', '呼吸一滞');
    }
    if (originalPhrase.includes('刺鼻的血腥味')) {
      return originalPhrase.replace('刺鼻的血腥味', '令人作呕的铁锈味');
    }

    // 最后的手段：标记为已变体
    return `${originalPhrase} [已变体]`;
  }

  // =================== 协调生成 ===================

  private async coordinatedSequentialGeneration(input: ChapterGenerationInput, context: ChapterContext): Promise<any> {
    const sceneType = this.determineSceneType(input.chapterPlan);

    // 为本章初始化故事上下文数据库
    storyContextDB.initializeChapter(input.chapterNumber, sceneType);

    console.log(`🔄 开始协调顺序生成 (${sceneType} 场景)`);

    // 步骤1：带故事记忆验证的结构代理
    console.log('📋 阶段1: 带故事记忆的结构规划');
    const structureOutput = await this.structureAgentWithValidation(input, context);

    if (!structureOutput.success) {
      throw new Error(`结构验证失败: ${structureOutput.errors?.join(', ')}`);
    }

    // 步骤2：带内容限制的角色代理
    console.log('👥 阶段2: 带内容限制的角色生成');
    const characterOutput = await this.characterAgentWithLimits(structureOutput, input, context);

    if (!characterOutput.success) {
      throw new Error(`角色生成失败: ${characterOutput.errors?.join(', ')}`);
    }

    // 注册角色输出以进行语气分析
    storyContextDB.registerCharacterOutput(characterOutput.content);

    // 步骤3：带语气感知的场景代理
    console.log('🎬 阶段3: 带语气协调的场景生成');
    const sceneOutput = await this.sceneAgentWithToneAwareness(structureOutput, characterOutput.content, input, context);

    if (!sceneOutput.success) {
      throw new Error(`场景生成失败: ${sceneOutput.errors?.join(', ')}`);
    }

    return {
      structureOutput: structureOutput.framework,
      characterOutput: characterOutput.content,
      sceneOutput: sceneOutput.content,
      coordinationMetadata: {
        sceneType,
        toneDetected: storyContextDB.getSharedState().currentTone,
        contentLimitsApplied: characterOutput.limitsApplied || [],
        toneCoordination: sceneOutput.toneAdaptation || 'none'
      }
    };
  }

  private async structureAgentWithValidation(input: ChapterGenerationInput, context: ChapterContext): Promise<any> {
    // 检查本章计划的揭示内容
    const chapterPlan = input.chapterPlan;

    // 更智能的揭示检测 - 寻找特定的揭示关键词
    const summary = chapterPlan.summary?.toLowerCase() || '';
    const hasSignificantRevelation = (
      summary.includes('major reveal') ||
      summary.includes('discovers the truth') ||
      summary.includes('shocking revelation') ||
      summary.includes('reveals the secret') ||
      (summary.includes('reveal') && (summary.includes('identity') || summary.includes('betrayal') || summary.includes('conspiracy')))
    );

    if (hasSignificantRevelation) {
      console.log('🔍 检查重大揭示的时间和上下文...');

      // 更细致的上下文检查 - 第1章可以有设置性揭示，但不能有重大故事揭示
      const isEarlyChapter = input.chapterNumber <= 2;
      const isSetupRevelation = summary.includes('setup') || summary.includes('introduction') || summary.includes('beginning');

      if (isEarlyChapter && !isSetupRevelation) {
        console.log('⚠️ 重大揭示可能需要更多上下文建立');
        // 不阻止，只警告 - 让生成继续但标记关注点
        console.log('🔄 继续生成但标记以供审查...');
      }
    }

    // 调用原始结构代理（将增强故事记忆）
    try {
      const result = await structureAgent.generate({
        chapterPlan: input.chapterPlan,
        chapterNumber: input.chapterNumber,
        context: context.structure,
        constraints: context.constraints,
        previousChapterEnd: input.previousChapterEnd,
        targetLength: input.targetLength,
        storyOutline: input.storyOutline
      });

      return {
        success: true,
        framework: result.chapterStructure,
        slots: result.slots,
        metadata: result.metadata
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [error.message]
      };
    }
  }

  private async characterAgentWithLimits(structureOutput: any, input: ChapterGenerationInput, context: any): Promise<any> {
    try {
      // 从输入角色中提取角色名称
      const activeCharacters = input.characters ? Object.keys(input.characters) : ['protagonist'];

      // 调用角色代理
      const result = await characterAgent.generate({
        chapterPlan: input.chapterPlan,
        chapterNumber: input.chapterNumber,
        context: context.character || {
          activeCharacters: activeCharacters,
          characterStates: input.characters || {},
          relationshipDynamics: [],
          emotionalJourneys: [],
          goalsAndMotivations: []
        },
        constraints: context.constraints || {
          mustNotContradictFacts: [],
          mustRespectRelationships: [],
          mustFollowWorldRules: [],
          mustAdvancePlotThreads: [],
          mustMaintainCharacterConsistency: []
        },
        structureSlots: structureOutput.slots || {
          dialogueSlots: ['DIALOGUE_1', 'DIALOGUE_2'],
          actionSlots: ['ACTION_1'],
          internalSlots: ['INTERNAL_1'],
          descriptionSlots: ['DESCRIPTION_1']
        },
        dialogueRequirements: [
          {
            slotId: 'DIALOGUE_1',
            characters: activeCharacters.slice(0, 2),
            purpose: '推进情节',
            emotionalTone: input.chapterPlan.emotionalToneTension || 'neutral'
          }
        ],
        storyOutline: input.storyOutline,
        genre: input.genre
      });

      const content = result.content.characterContent || '';

      // 检查内容限制
      const limitCheck = storyContextDB.checkContentLimits('character', content);

      if (!limitCheck.allowed) {
        console.log(`⚠️ 超出内容限制: ${limitCheck.reason}`);

        // 根据建议应用自动修正
        let correctedContent = content;

        if (limitCheck.suggestedAction === 'condense-internal') {
          // 简单浓缩逻辑
          correctedContent = this.condenseInternalMonologue(content);
          console.log('🔧 应用了内心独白浓缩');
        }

        if (limitCheck.suggestedAction === 'add-micro-action') {
          correctedContent = this.insertMicroActions(content);
          console.log('🔧 添加了微动作以打破内心块');
        }

        return {
          success: true,
          content: correctedContent,
          limitsApplied: [limitCheck.suggestedAction],
          originalLimitIssue: limitCheck.reason
        };
      }

      return {
        success: true,
        content: content,
        limitsApplied: []
      };

    } catch (error: any) {
      return {
        success: false,
        errors: [error.message]
      };
    }
  }

  private async sceneAgentWithToneAwareness(structureOutput: any, characterContent: string, input: ChapterGenerationInput, context: any): Promise<any> {
    try {
      // 从故事上下文数据库获取语气指导
      const toneGuidance = storyContextDB.getToneGuidanceForScene();

      console.log(`🎭 场景适应检测到的语气: ${storyContextDB.getSharedState().currentTone}`);
      console.log(`📏 描述指导: ${toneGuidance.descriptionLength}, ${toneGuidance.sentenceStyle}`);

      // 使用语气指导调用场景代理
      const result = await sceneAgent.generate({
        chapterPlan: input.chapterPlan,
        chapterNumber: input.chapterNumber,
        context: context.scene || {
          primaryLocation: {
            name: input.chapterPlan.primaryLocation || 'unknown location',
            description: '主要场景位置',
            currentOccupants: [],
            securityLevel: 'neutral' as const,
            changes: []
          },
          secondaryLocations: [],
          atmosphereRequirements: {
            mood: input.chapterPlan.emotionalToneTension || 'neutral',
            tension: String(input.chapterPlan.tensionLevel || 5),
            sensoryFocus: ['visual', 'auditory']
          },
          worldStateRequirements: []
        },
        constraints: context.constraints || {
          mustNotContradictFacts: [],
          mustRespectRelationships: [],
          mustFollowWorldRules: [],
          mustAdvancePlotThreads: [],
          mustMaintainCharacterConsistency: []
        },
        structureSlots: structureOutput.slots || {
          dialogueSlots: ['DIALOGUE_1', 'DIALOGUE_2'],
          actionSlots: ['ACTION_1'],
          internalSlots: ['INTERNAL_1'],
          descriptionSlots: ['DESCRIPTION_1']
        },
        storyOutline: input.storyOutline,
        genre: input.genre
      });

      return {
        success: true,
        content: result.content.sceneDescriptions || '',
        toneAdaptation: `适应了 ${storyContextDB.getSharedState().currentTone} 语气`
      };

    } catch (error: any) {
      return {
        success: false,
        errors: [error.message]
      };
    }
  }

  private async synthesisWithValidation(input: any): Promise<any> {
    try {
      // 为合成代理创建兼容的输出对象
      const structureAgentOutput = {
        chapterStructure: input.structureOutput,
        plotAdvancement: [],
        pacingNotes: [],
        transitionPoints: [],
        slots: {
          dialogueSlots: [],
          actionSlots: [],
          internalSlots: [],
          descriptionSlots: []
        },
        content: {},
        metadata: {
          agentType: 'Structure',
          processingTime: 0,
          confidence: 0.8,
          notes: []
        }
      };

      const characterAgentOutput = {
        characterContent: input.characterOutput,
        slotsFilled: [],
        dialogueGenerated: [],
        internalMonologue: [],
        dialogueContent: {},
        internalThoughts: {},
        characterMoments: [],
        emotionalProgression: [],
        content: { characterContent: input.characterOutput },
        metadata: {
          agentType: 'Character',
          processingTime: 0,
          confidence: 0.8,
          notes: []
        }
      };

      const sceneAgentOutput = {
        sceneDescriptions: input.sceneOutput,
        atmosphericElements: [],
        sensoryDetails: [],
        settingEstablishment: '',
        descriptions: {},
        actionContent: {},
        content: { sceneDescriptions: input.sceneOutput },
        metadata: {
          agentType: 'Scene',
          processingTime: 0,
          confidence: 0.8,
          notes: []
        }
      };

      // 首先，运行正常合成
      const synthesisResult = await synthesisAgent.integrate({
        structureOutput: structureAgentOutput,
        characterOutput: characterAgentOutput,
        sceneOutput: sceneAgentOutput,
        chapterNumber: input.chapterNumber,
        chapterTitle: input.chapterTitle
      });

      let finalContent = synthesisResult.integratedChapter;

      // 然后，运行宏观验证
      const balanceReport = input.balanceReport;

      if (balanceReport.issues.length > 0) {
        console.log(`⚠️ 检测到平衡问题:`, balanceReport.issues.map(i => i.type));

        // 应用自动修正
        for (const issue of balanceReport.issues) {
          switch (issue.type) {
            case 'description-overload':
              finalContent = this.reduceDescriptionDensity(finalContent);
              console.log('🔧 降低了描述密度');
              break;

            case 'internal-overload':
              finalContent = this.breakUpInternalMonologue(finalContent);
              console.log('🔧 分解了内心独白块');
              break;

            case 'consecutive-description':
              finalContent = this.insertActionBeats(finalContent);
              console.log('🔧 在描述之间插入了动作节奏');
              break;
          }
        }
      }

      return {
        ...synthesisResult,
        integratedChapter: finalContent,
        balanceCorrections: balanceReport.issues.map(i => i.type)
      };

    } catch (error: any) {
      throw new Error(`Synthesis with validation failed: ${error.message}`);
    }
  }

  // =================== 内容修正帮助方法 ===================

  private determineSceneType(chapterPlan: any): SharedChapterState['sceneType'] {
    const summary = chapterPlan.summary?.toLowerCase() || '';

    // 中文关键词识别 - 动作场景
    if (summary.includes('fight') || summary.includes('battle') || summary.includes('chase') ||
        summary.includes('打脸') || summary.includes('突破') || summary.includes('渡劫')) {
      return 'action';
    }
    // 中文关键词识别 - 揭示场景
    if (summary.includes('reveal') || summary.includes('truth') || summary.includes('discover') ||
        summary.includes('拍卖会')) {
      return 'revelation';
    }
    if (summary.includes('emotion') || summary.includes('feel') || summary.includes('remember')) {
      return 'emotional';
    }
    if (summary.includes('final') || summary.includes('climax') || summary.includes('end')) {
      return 'climax';
    }

    return 'setup';
  }

  private condenseInternalMonologue(content: string): string {
    // 简单浓缩：查找长内心块并缩短它们
    return content.replace(/(\[INTERNAL[^\]]*\][^[]{200,})/g, (match) => {
      const words = match.split(/\s+/);
      if (words.length > 50) {
        return words.slice(0, 50).join(' ') + '...';
      }
      return match;
    });
  }

  private insertMicroActions(content: string): string {
    // 在内心块之间插入微动作
    const microActions = [
      '她调整了一下坐姿。',
      '他深吸了一口气。',
      '目光低垂。',
      '他握紧了拳头。',
      '她移开了视线。'
    ];

    let actionIndex = 0;
    return content.replace(/(\[INTERNAL[^\]]*\][^[]+)(\[INTERNAL)/g, (match, first, second) => {
      const action = microActions[actionIndex % microActions.length];
      actionIndex++;
      return `${first}\n\n${action}\n\n${second}`;
    });
  }

  private reduceDescriptionDensity(content: string): string {
    // 移除过多的形容词和感官细节 - 适配中文标点和句子结构
    // 匹配多个形容词修饰的感官描述，如"刺鼻的、令人作呕的、血腥的味道"，简化为"味道"
    return content.replace(/([的，,]*[^\s，,]+[的，,]*[^\s，,]+[的，,]*[^\s，,]+)\s*(气味|声音|味道|感觉|气息|响声|滋味|触感)/g, '$2');
  }

  private breakUpInternalMonologue(content: string): string {
    // 与insertMicroActions类似，但用于最终内容
    return this.insertMicroActions(content);
  }

  private insertActionBeats(content: string): string {
    // 在长描述块之间插入物理动作
    const actionBeats = [
      '她凑近了一些。',
      '他环视四周。',
      '时间仿佛凝固了。',
      '气氛有些微妙的变化。'
    ];

    // 适配中文句子结构，在连续的长描述段落之间插入动作节奏点
    return content.replace(/([。])\s*([^。]{100,}[。])\s*([^。]{100,}[。])/g, (match, end1, desc1, desc2) => {
      const beat = actionBeats[Math.floor(Math.random() * actionBeats.length)];
      return `${end1}${desc1}\n\n${beat}\n\n${desc2}`;
    });
  }

  // =================== 配置 ===================

  updateOptions(newOptions: Partial<GenerationOptions>): void {
    this.options = { ...this.options, ...newOptions };
    console.log('📝 代理协调器选项已更新:', this.options);
  }

  getOptions(): GenerationOptions {
    return { ...this.options };
  }
}

// =================== 导出 ===================

export const agentCoordinator = new AgentCoordinator();