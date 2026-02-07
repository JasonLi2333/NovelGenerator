/**
 * Synthesis Agent - Integration specialist for combining specialist agent outputs
 */

import { generateText } from '../services/llm';
import { StructureAgentOutput, CharacterAgentOutput, SceneAgentOutput } from './specialistAgents';

// =================== INTERFACES ===================

export interface SynthesisInput {
  structureOutput: StructureAgentOutput;
  characterOutput: CharacterAgentOutput;
  sceneOutput: SceneAgentOutput;
  chapterNumber: number;
  chapterTitle: string;
}

export interface SynthesisOutput {
  integratedChapter: string;
  transitionsAdded: string[];
  integrationNotes: string[];
  conflictsResolved: ConflictResolution[];
  metadata: {
    agentType: 'Synthesis';
    processingTime: number;
    confidence: number;
    totalSlotsFilled: number;
    notes: string[];
  };
}

export interface ConflictResolution {
  conflictType: 'tone' | 'pacing' | 'content' | 'character' | 'power_scaling' | 'system_logic';
  description: string;
  resolution: string;
}

export interface SlotMapping {
  slotId: string;
  content: string;
  sourceAgent: 'structure' | 'character' | 'scene';
  priority: number;
}

// =================== SYNTHESIS AGENT CLASS ===================

export class SynthesisAgent {
  async integrate(input: SynthesisInput): Promise<SynthesisOutput> {
    const startTime = Date.now();

    console.log(`🔗 Synthesis Agent integrating Chapter ${input.chapterNumber}: "${input.chapterTitle}"`);

    // Step 1: Map all slot content from specialist agents
    const slotMappings = this.mapAllSlots(input);

    // Step 2: Detect and resolve conflicts
    const conflicts = this.detectConflicts(slotMappings, input);
    const resolvedMappings = await this.resolveConflicts(slotMappings, conflicts);

    // Step 3: Generate chapter hooks for cliffhangers
    const chapterHooks = await this.generateChapterHooks(resolvedMappings, input);

    // Step 4: Perform final integration
    const integratedChapter = await this.performIntegration(
      input.structureOutput.chapterStructure,
      resolvedMappings,
      chapterHooks
    );

    const output: SynthesisOutput = {
      integratedChapter,
      transitionsAdded: chapterHooks,
      integrationNotes: this.generateIntegrationNotes(resolvedMappings),
      conflictsResolved: conflicts,
      metadata: {
        agentType: 'Synthesis',
        processingTime: Date.now() - startTime,
        confidence: this.calculateConfidence(resolvedMappings, conflicts),
        totalSlotsFilled: Object.keys(resolvedMappings).length,
        notes: [
          `Integrated ${Object.keys(resolvedMappings).length} slots from 3 specialist agents`,
          `Resolved ${conflicts.length} conflicts`,
          `Added ${chapterHooks.length} chapter hooks`
        ]
      }
    };

    console.log(`✅ Synthesis complete: ${output.metadata.totalSlotsFilled} slots integrated`);
    return output;
  }


  // =================== SLOT MAPPING ===================

  private mapAllSlots(input: SynthesisInput): Record<string, SlotMapping> {
    const mappings: Record<string, SlotMapping> = {};

    // Map structure slots (highest priority - framework)
    for (const [slotId, content] of Object.entries(input.structureOutput.content)) {
      if (slotId !== 'structure') { // Skip the main structure template
        mappings[slotId] = {
          slotId,
          content,
          sourceAgent: 'structure',
          priority: 3
        };
      }
    }

    // Map character slots (high priority - dialogue and thoughts)
    for (const [slotId, content] of Object.entries(input.characterOutput.content)) {
      mappings[slotId] = {
        slotId,
        content,
        sourceAgent: 'character',
        priority: 2
      };
    }

    // Map scene slots (medium priority - descriptions and action)
    for (const [slotId, content] of Object.entries(input.sceneOutput.content)) {
      mappings[slotId] = {
        slotId,
        content,
        sourceAgent: 'scene',
        priority: 1
      };
    }

    console.log(`📋 Mapped ${Object.keys(mappings).length} slots from specialist agents`);
    return mappings;
  }

  // =================== CONFLICT DETECTION ===================

  private detectConflicts(mappings: Record<string, SlotMapping>, input: SynthesisInput): ConflictResolution[] {
    const conflicts: ConflictResolution[] = [];

    // Check for tone conflicts
    const toneConflicts = this.detectToneConflicts(mappings);
    conflicts.push(...toneConflicts);

    // Check for pacing conflicts
    const pacingConflicts = this.detectPacingConflicts(mappings);
    conflicts.push(...pacingConflicts);

    // Check for content conflicts
    const contentConflicts = this.detectContentConflicts(mappings);
    conflicts.push(...contentConflicts);

    // Check for power scaling conflicts (战力崩坏检测)
    const powerConflicts = this.detectPowerScalingConflicts(mappings, input);
    conflicts.push(...powerConflicts);

    // Check for system logic conflicts (系统逻辑检测)
    const systemConflicts = this.detectSystemLogicConflicts(mappings, input);
    conflicts.push(...systemConflicts);

    if (conflicts.length > 0) {
      console.log(`⚠️ Detected ${conflicts.length} conflicts requiring resolution`);
    }

    return conflicts;
  }

  private detectToneConflicts(mappings: Record<string, SlotMapping>): ConflictResolution[] {
    const conflicts: ConflictResolution[] = [];

    // Simple tone conflict detection - could be enhanced with AI analysis
    // For now, just flag if we have very different emotional tones

    return conflicts;
  }

  private detectPacingConflicts(mappings: Record<string, SlotMapping>): ConflictResolution[] {
    const conflicts: ConflictResolution[] = [];

    // Check for pacing mismatches between action and dialogue
    // For example, fast action followed by slow introspective dialogue

    return conflicts;
  }

  private detectContentConflicts(mappings: Record<string, SlotMapping>): ConflictResolution[] {
    const conflicts: ConflictResolution[] = [];

    // Check for factual conflicts between different agents' content
    // For example, character mentioning different location than scene describes

    return conflicts;
  }

  private detectPowerScalingConflicts(mappings: Record<string, SlotMapping>, input: SynthesisInput): ConflictResolution[] {
    const conflicts: ConflictResolution[] = [];

    // 战力崩坏检测：检查主角战力是否突然崩坏
    // 例如：上一章打不过筑基期，这一章秒杀金丹期

    const allContent = Object.values(mappings).map(m => m.content).join(' ');

    // 检测战力相关关键词
    const powerKeywords = {
      low: ['练气期', '筑基初期', '筑基中期', '筑基后期', '筑基期'],
      medium: ['金丹初期', '金丹中期', '金丹后期', '金丹期', '元婴初期'],
      high: ['元婴后期', '化神期', '炼虚期', '合体期', '大乘期', '渡劫期']
    };

    // 简单的战力崩坏检测逻辑
    // 这里可以根据具体内容进行更复杂的分析
    const hasLowPower = powerKeywords.low.some(keyword => allContent.includes(keyword));
    const hasHighPower = powerKeywords.high.some(keyword => allContent.includes(keyword));

    if (hasLowPower && hasHighPower) {
      // 检查是否有不合理的战力跳跃
      // 这里可以扩展为更复杂的逻辑，比如跨章节对比
      conflicts.push({
        conflictType: 'power_scaling',
        description: '检测到可能的战力崩坏：内容中同时出现低阶和极高阶修仙境界',
        resolution: '建议检查主角战力是否合理，避免突然的境界跳跃'
      });
    }

    return conflicts;
  }

  private detectSystemLogicConflicts(mappings: Record<string, SlotMapping>, input: SynthesisInput): ConflictResolution[] {
    const conflicts: ConflictResolution[] = [];

    // 系统逻辑检测：检查系统的奖励是否与设定一致

    const allContent = Object.values(mappings).map(m => m.content).join(' ');

    // 检测系统相关内容
    const systemPatterns = [
      /系统奖励.*(?:灵石|丹药|功法|法宝)/g,
      /恭喜宿主.*获得/g,
      /任务完成.*奖励/g,
      /升级.*获得.*属性点/g
    ];

    for (const pattern of systemPatterns) {
      const matches = allContent.match(pattern);
      if (matches) {
        // 检查奖励是否合理
        // 这里可以添加更复杂的逻辑来验证奖励与任务难度是否匹配
        // 例如：简单任务不应该给极品法宝，困难任务应该有相应奖励

        conflicts.push({
          conflictType: 'system_logic',
          description: `检测到系统奖励：${matches[0]}，请确认奖励是否与设定和难度匹配`,
          resolution: '验证系统奖励的合理性，避免与世界观设定冲突'
        });
      }
    }

    return conflicts;
  }

  // =================== CONFLICT RESOLUTION ===================

  private async resolveConflicts(
    mappings: Record<string, SlotMapping>,
    conflicts: ConflictResolution[]
  ): Promise<Record<string, SlotMapping>> {
    if (conflicts.length === 0) {
      return mappings;
    }

    console.log(`🔧 Resolving ${conflicts.length} conflicts...`);

    // For now, use simple priority-based resolution
    // In a full implementation, this would use AI to intelligently resolve conflicts
    const resolvedMappings = { ...mappings };

    for (const conflict of conflicts) {
      // Implement conflict resolution logic here
      // For now, we'll just log and continue
      console.log(`⚠️ Conflict detected: ${conflict.description}`);
    }

    return resolvedMappings;
  }

  // =================== CHAPTER HOOKS GENERATION ===================

  private async generateChapterHooks(
    mappings: Record<string, SlotMapping>,
    input: SynthesisInput
  ): Promise<string[]> {
    console.log('🎣 Generating chapter hooks for cliffhangers...');

    const hookPrompt = this.buildTransitionPrompt(mappings, input);

    try {
      const hooksContent = await generateText(
        'synthesis',
        hookPrompt.userPrompt,
        hookPrompt.systemPrompt,
        undefined,
        0.7, // Moderate creativity for hooks - should be engaging
        0.8,
        30
      );

      return this.parseChapterHooks(hooksContent);
    } catch (error) {
      console.warn('Failed to generate AI hooks, using basic ones:', error);
      return this.generateBasicTransitions(mappings);
    }
  }

  private buildTransitionPrompt(
    mappings: Record<string, SlotMapping>,
    input: SynthesisInput
  ): { systemPrompt: string; userPrompt: string } {
    const systemPrompt = `你是网文高手，精通"断章"艺术。你唯一的工作是为章节生成让人欲罢不能的钩子(Hooks)。

关键原则：
- 每个钩子必须制造悬念，让读者忍不住点开下一章
- 钩子要短小精悍，充满张力
- 不要透露太多，但要吊足胃口
- 使用网文常见手法：危机、转折、疑问、意外

网文钩子类型：
- 危机降临："就在这时，一道恐怖的气息突然出现！"
- 转折反转："可他没想到的是……"
- 疑问悬念："这背后隐藏着什么秘密？"
- 意外发现："他的瞳孔猛地收缩，因为……"
- 升级突破："就在突破的关键时刻……"`;

    const userPrompt = `为第 ${input.chapterNumber} 章 "${input.chapterTitle}" 生成网文风格的钩子！

**章节内容梗概：**
${this.formatContentForTransitions(mappings)}

**钩子要求：**
1. **制造悬念**：让读者产生"接下来会发生什么"的好奇心
2. **断章艺术**：在最关键、最紧张的时刻戛然而止
3. **网文特色**：使用"就在这时"、"可没想到"、"突然"等网文常用句式
4. **张力十足**：危机、转折、疑问、意外任选其一

**输出格式：**
提供3-5个钩子句子，每个都是独立的断章结尾。
每个钩子长度：15-30字，充满张力和悬念。

**网文钩子示例：**
"就在他准备转身离开的时候，一道系统提示突然出现在脑海中："
"可就在这时，天空忽然暗了下来，一股毁天灭地的气息正从远方逼近！"
"他的脸色瞬间变得煞白，因为他突然想起了一个恐怖的传闻……"
"突破的瓶颈终于松动了，可就在这时，一股诡异的力量突然入侵了他的识海！"
"她正准备说出那个秘密，可没想到，对方竟然已经知道了……"

**生成钩子：**`;

    return { systemPrompt, userPrompt };
  }

  private formatContentForTransitions(mappings: Record<string, SlotMapping>): string {
    return Object.entries(mappings)
      .slice(0, 5) // Limit to first 5 for context
      .map(([slotId, mapping]) => `${slotId}: ${mapping.content.slice(0, 100)}...`)
      .join('\n');
  }

  private parseChapterHooks(content: string): string[] {
    // Extract hook phrases from AI response
    const lines = content.split('\n').filter(line => line.trim());
    return lines
      .filter(line => line.length > 10 && line.length < 100) // Hooks should be longer than basic transitions
      .slice(0, 5); // Max 5 hooks
  }

  private generateBasicTransitions(mappings: Record<string, SlotMapping>): string[] {
    // 网文风格的基本过渡词汇
    return [
      "一盏茶的功夫过去了。",
      "半晌无人言语。",
      "与此同时，千里之外……",
      "画面一转。",
      "须臾之间。",
      "转眼已是黄昏。",
      "就在这时。",
      "另一边。"
    ];
  }

  // =================== FINAL INTEGRATION ===================

  private async performIntegration(
    structureTemplate: string,
    mappings: Record<string, SlotMapping>,
    chapterHooks: string[]
  ): Promise<string> {
    console.log('🔧 Performing final integration...');

    const integrationPrompt = this.buildIntegrationPrompt(structureTemplate, mappings, chapterHooks);

    try {
      const integratedContent = await generateText(
        'synthesis',
        integrationPrompt.userPrompt,
        integrationPrompt.systemPrompt,
        undefined,
        0.3, // Very low creativity - this is assembly, not creation
        0.7,
        20
      );

      return integratedContent;
    } catch (error) {
      console.warn('AI integration failed, using simple slot replacement:', error);
      return this.performSimpleIntegration(structureTemplate, mappings, chapterHooks);
    }
  }

  private buildIntegrationPrompt(
    structureTemplate: string,
    mappings: Record<string, SlotMapping>,
    chapterHooks: string[]
  ): { systemPrompt: string; userPrompt: string } {
    const systemPrompt = `你是文本整合专家。你唯一的工作是：

1. 用提供的内容替换[SLOT]标记
2. 在不同类型内容间添加流畅过渡
3. 确保自然流畅和可读性

不要：
- 重写或修改专家内容
- 添加新的情节元素或描写
- 改变现有内容的语气或风格
- 创建新的对话或动作

只：
- 用精确提供的内容填充槽位
- 添加最少的连接词保证流畅
- 确保正确的标点和格式`;

    const userPrompt = `整合以下内容：

**结构模板：**
${structureTemplate}

**槽位内容：**
${Object.entries(mappings)
  .map(([slotId, mapping]) => `[${slotId}]: ${mapping.content}`)
  .join('\n\n')}

**可用钩子（仅用于章节末尾）：**
${chapterHooks.join('\n')}

**整合规则：**
1. 用对应内容替换每个[SLOT]标记
2. 在内容感觉脱节处，使用简单的连接词（如“片刻后”、“与此同时”）。
3. **必须**从“可用钩子”中选择一个最合适的，放在章节的**最末尾**作为断章。
4. 保持自然段落分隔
5. 完全保留所有专家内容
6. 只在绝对必要时添加最少的连接词

现在执行整合：`;

    return { systemPrompt, userPrompt };
  }

  private performSimpleIntegration(
    structureTemplate: string,
    mappings: Record<string, SlotMapping>,
    chapterHooks: string[]
  ): string {
    console.log('🔧 Performing simple slot replacement integration...');

    let integrated = structureTemplate;

    // Sort mappings by priority (higher priority slots filled first)
    const sortedMappings = Object.entries(mappings)
      .sort(([, a], [, b]) => b.priority - a.priority);

    // Track which slots were filled
    const filledSlots = new Set<string>();

    // Replace each slot with its content
    for (const [slotId, mapping] of sortedMappings) {
      const slotPattern = new RegExp(`\\[${slotId}\\]`, 'g');
      const beforeReplace = integrated;
      integrated = integrated.replace(slotPattern, mapping.content);
      
      if (beforeReplace !== integrated) {
        filledSlots.add(slotId);
        console.log(`✅ Filled slot: [${slotId}]`);
      }
    }

    // Find all remaining unfilled slots
    const unfilledSlots = integrated.match(/\[([^\]]+)\]/g) || [];
    
    if (unfilledSlots.length > 0) {
      console.warn(`⚠️ WARNING: ${unfilledSlots.length} unfilled slots remaining:`);
      unfilledSlots.forEach(slot => console.warn(`   - ${slot}`));
      console.warn('⚠️ These slots were NOT filled by specialist agents!');
      console.warn('⚠️ Check that Character and Scene agents are returning content in correct format: [SLOT_NAME]: content');
    }

    // DO NOT remove unfilled slots - leave them visible for debugging
    // integrated = integrated.replace(/\[([^\]]+)\]/g, '');

    // Add chapter hooks at the end if needed (for cliffhanger effect)
    if (chapterHooks.length > 0) {
      const paragraphs = integrated.split('\n\n');
      if (paragraphs.length > 1) {
        // Add a hook at the end of the chapter for cliffhanger effect
        integrated = integrated + `\n\n${chapterHooks[0] || ''}`;
      }
    }

    console.log(`📊 Integration summary: ${filledSlots.size} slots filled, ${unfilledSlots.length} unfilled`);

    return integrated.trim();
  }

  // =================== HELPER METHODS ===================

  private generateIntegrationNotes(mappings: Record<string, SlotMapping>): string[] {
    const notes: string[] = [];

    const agentCounts = {
      structure: 0,
      character: 0,
      scene: 0
    };

    for (const mapping of Object.values(mappings)) {
      agentCounts[mapping.sourceAgent]++;
    }

    notes.push(`Structure Agent: ${agentCounts.structure} slots`);
    notes.push(`Character Agent: ${agentCounts.character} slots`);
    notes.push(`Scene Agent: ${agentCounts.scene} slots`);

    return notes;
  }

  private calculateConfidence(
    mappings: Record<string, SlotMapping>,
    conflicts: ConflictResolution[]
  ): number {
    const baseConfidence = 90;
    const conflictPenalty = conflicts.length * 5; // -5% per conflict
    const slotBonus = Math.min(Object.keys(mappings).length * 2, 10); // +2% per slot, max 10%

    return Math.max(Math.min(baseConfidence - conflictPenalty + slotBonus, 100), 60);
  }
}

// =================== EXPORT ===================

export const synthesisAgent = new SynthesisAgent();