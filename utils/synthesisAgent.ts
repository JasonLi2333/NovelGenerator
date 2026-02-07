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
  conflictType: 'tone' | 'pacing' | 'content' | 'character';
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

    // Step 3: Generate transitions and connecting tissue
    const transitions = await this.generateTransitions(resolvedMappings, input);

    // Step 4: Perform final integration
    const integratedChapter = await this.performIntegration(
      input.structureOutput.chapterStructure,
      resolvedMappings,
      transitions
    );

    const output: SynthesisOutput = {
      integratedChapter,
      transitionsAdded: transitions,
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
          `Added ${transitions.length} transitions`
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

  // =================== TRANSITION GENERATION ===================

  private async generateTransitions(
    mappings: Record<string, SlotMapping>,
    input: SynthesisInput
  ): Promise<string[]> {
    console.log('🌉 Generating transitions between specialist content...');

    const transitionPrompt = this.buildTransitionPrompt(mappings, input);

    try {
      const transitionsContent = await generateText(
        'synthesis',
        transitionPrompt.userPrompt,
        transitionPrompt.systemPrompt,
        undefined,
        0.6, // Lower creativity for transitions - should be subtle
        0.8,
        30
      );

      return this.parseTransitions(transitionsContent);
    } catch (error) {
      console.warn('Failed to generate AI transitions, using basic ones:', error);
      return this.generateBasicTransitions(mappings);
    }
  }

  private buildTransitionPrompt(
    mappings: Record<string, SlotMapping>,
    input: SynthesisInput
  ): { systemPrompt: string; userPrompt: string } {
    const systemPrompt = `你是叙事流畅专家。你的工作是在不同专家写作的内容之间创建流畅自然的过渡。

关键：你的过渡必须微妙且简短 - 刚好足够流畅连接不同元素。不要重写专家内容，只提供连接组织。

聚焦：
- 时间过渡（时间流逝）
- 空间过渡（地点/焦点变化）
- 情感桥梁（情绪转变）
- 逻辑连接（因果关系）`;

    const userPrompt = `为第 ${input.chapterNumber} 章创建微妙的过渡："${input.chapterTitle}"

**需要连接的内容：**
${this.formatContentForTransitions(mappings)}

**过渡指南：**

1. **时间桥梁：**
   - "片刻之后……"
   - "沉默延伸着……"
   - "她还没来得及回应……"

2. **空间过渡：**
   - "她的目光转向……"
   - "声音从……传来"
   - "角落里有动静……"

3. **情感连接：**
   - "那种感觉加剧了……"
   - "他的表情发生了某种变化……"
   - "紧张感骤然消散……"

4. **逻辑链接：**
   - "这解释了……"
   - "这意味着……"
   - "但随即……"

**输出格式：**
提供3-5个短过渡句，可以插入到内容块之间。每个最多5-15字。

示例：
"沉默在两人之间尴尬地延伸。"
"她的注意力猛地回到现实。"
"这个暗示像冷水一样击中了她。"

现在生成过渡：`;

    return { systemPrompt, userPrompt };
  }

  private formatContentForTransitions(mappings: Record<string, SlotMapping>): string {
    return Object.entries(mappings)
      .slice(0, 5) // Limit to first 5 for context
      .map(([slotId, mapping]) => `${slotId}: ${mapping.content.slice(0, 100)}...`)
      .join('\n');
  }

  private parseTransitions(content: string): string[] {
    // Extract transition phrases from AI response
    const lines = content.split('\n').filter(line => line.trim());
    return lines
      .filter(line => line.length > 5 && line.length < 100)
      .slice(0, 5); // Max 5 transitions
  }

  private generateBasicTransitions(mappings: Record<string, SlotMapping>): string[] {
    // Fallback basic transitions
    return [
      "片刻过去了。",
      "沉默延伸着。",
      "空气中有什么变了。",
      "时间仿佛慢了下来。",
      "氛围发生了变化。"
    ];
  }

  // =================== FINAL INTEGRATION ===================

  private async performIntegration(
    structureTemplate: string,
    mappings: Record<string, SlotMapping>,
    transitions: string[]
  ): Promise<string> {
    console.log('🔧 Performing final integration...');

    const integrationPrompt = this.buildIntegrationPrompt(structureTemplate, mappings, transitions);

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
      return this.performSimpleIntegration(structureTemplate, mappings, transitions);
    }
  }

  private buildIntegrationPrompt(
    structureTemplate: string,
    mappings: Record<string, SlotMapping>,
    transitions: string[]
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

**可用过渡：**
${transitions.join('\n')}

**整合规则：**
1. 用对应内容替换每个[SLOT]标记
2. 在内容感觉脱节处添加过渡
3. 保持自然段落分隔
4. 完全保留所有专家内容
5. 只在绝对必要时添加最少的连接词

现在执行整合：`;

    return { systemPrompt, userPrompt };
  }

  private performSimpleIntegration(
    structureTemplate: string,
    mappings: Record<string, SlotMapping>,
    transitions: string[]
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

    // Add basic transitions at paragraph breaks if needed
    if (transitions.length > 0) {
      const paragraphs = integrated.split('\n\n');
      if (paragraphs.length > 1) {
        // Add a transition between first two paragraphs if available
        integrated = paragraphs.join(`\n\n${transitions[0] || ''}\n\n`);
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