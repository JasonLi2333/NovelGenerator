import { Character } from '../types';
import { getFormattedPrompt, PromptNames } from './promptLoader';

/**
 * 一致性检查器 - 维护跨章节的故事连贯性
 */

export interface ConsistencyIssue {
  type: 'character_name' | 'location' | 'timeline' | 'character_trait' | 'world_rule';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  suggestion?: string;
}

export interface ConsistencyCheckResult {
  passed: boolean;
  issues: ConsistencyIssue[];
  warnings: string[];
}

/**
 * 检查章节内容是否与已建立的事实保持一致
 */
export async function checkChapterConsistency(
  chapterContent: string,
  chapterNumber: number,
  characters: Record<string, Character>,
  previousChaptersSummaries: string,
  worldName: string,
  llmFunction: (prompt: string, system: string, schema?: object, temp?: number, topP?: number, topK?: number) => Promise<string>
): Promise<ConsistencyCheckResult> {
  
  const characterNames = Object.keys(characters);
  const characterDescriptions = Object.values(characters).map(c => 
    `${c.name}: ${c.description.substring(0, 200)}`
  ).join('\n');

  const { systemPrompt, userPrompt: consistencyPrompt } = getFormattedPrompt(PromptNames.CONSISTENCY_CHECKER, {
    chapter_number: chapterNumber,
    chapter_content: chapterContent.substring(0, 5000) + (chapterContent.length > 5000 ? ' ...（已截断）' : ''),
    characters_json: JSON.stringify(characters, null, 2),
    previous_chapters_summary: previousChaptersSummaries || 'This is the first chapter.',
    world_name: worldName
  });

  try {
    const response = await llmFunction(consistencyPrompt, systemPrompt, undefined, 0.2, 0.6, 10);
    
    // 解析响应
    const issues: ConsistencyIssue[] = [];
    const warnings: string[] = [];
    
    if (response.includes("一致性检查通过") || response.includes("consistency_passed\": true")) {
      return { passed: true, issues: [], warnings: [] };
    }

    // 尝试解析JSON格式的响应
    try {
      const jsonResponse = JSON.parse(response);
      if (jsonResponse.consistency_passed === true) {
        return { passed: true, issues: [], warnings: jsonResponse.warnings || [] };
      }

      // 解析issues和warnings
      if (jsonResponse.issues && Array.isArray(jsonResponse.issues)) {
        for (const issue of jsonResponse.issues) {
          issues.push({
            type: issue.type || 'character_name',
            severity: issue.severity || 'minor',
            description: issue.description || issue,
            suggestion: issue.suggestion
          });
        }
      }

      if (jsonResponse.warnings && Array.isArray(jsonResponse.warnings)) {
        warnings.push(...jsonResponse.warnings);
      }

      return {
        passed: issues.filter(i => i.severity === 'critical').length === 0,
        issues,
        warnings
      };
    } catch (parseError) {
      // 如果不是JSON格式，回退到文本解析
      console.warn('JSON解析失败，回退到文本解析:', parseError);
    }

    // 简单的问题解析（非JSON响应的回退方案）
    const lines = response.split('\n');
    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      if (lowerLine.includes('critical') || lowerLine.includes('严重')) {
        issues.push({
          type: 'character_name',
          severity: 'critical',
          description: line.trim()
        });
      } else if (lowerLine.includes('major') || lowerLine.includes('重大')) {
        issues.push({
          type: 'character_name',
          severity: 'major',
          description: line.trim()
        });
      } else if (lowerLine.includes('minor') || lowerLine.includes('轻微')) {
        warnings.push(line.trim());
      }
    }

    return {
      passed: issues.filter(i => i.severity === 'critical').length === 0,
      issues,
      warnings
    };

  } catch (error) {
    console.warn('Consistency check failed:', error);
    // Don't block generation on consistency check failure
    return { passed: true, issues: [], warnings: ['一致性检查未能执行，请人工检查章节内容'] };
  }
}

/**
 * Validate character names are consistent throughout the chapter
 * 检查角色称呼的一致性和尊称使用是否合理
 */
export function validateCharacterNames(
  chapterContent: string,
  knownCharacters: Record<string, Character>
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  const characterNames = Object.keys(knownCharacters);

  // 1. 检测称呼一致性：检查名字倒置问题
  for (const name of characterNames) {
    // 对于中文名字，检测可能的倒置形式
    if (name.length >= 2) {
      // 生成可能的倒置形式（交换前后两个字）
      const charArray = [...name];
      if (charArray.length >= 2) {
        const reversedName = charArray[1] + charArray[0] + charArray.slice(2).join('');
        const reversedNameShort = charArray[1] + charArray[0];

        // 检查章节中是否出现了倒置称呼
        const reversedPattern = new RegExp(`${reversedName}|${reversedNameShort}`, 'g');
        if (reversedPattern.test(chapterContent)) {
          issues.push({
            type: 'character_name',
            severity: 'major',
            description: `角色"${name}"在章节中被倒置称呼为"${reversedName}"或"${reversedNameShort}"，这可能导致读者混淆。`,
            suggestion: `请确保角色称呼保持一致，使用统一的"${name}"称呼。`
          });
        }
      }
    }
  }

  // 2. 检测尊称使用：低境界角色不应直呼高境界角色大名
  const characters = Object.values(knownCharacters);
  const charactersWithRealm = characters.filter(c =>
    c.description.includes('境界') ||
    c.description.includes('期') ||
    c.description.includes('境') ||
    /筑基|金丹|元婴|化神|炼虚|合体|大乘|渡劫/.test(c.description)
  );

  if (charactersWithRealm.length >= 2) {
    // 提取角色境界等级
    const realmOrder = ['练气', '筑基', '金丹', '元婴', '化神', '炼虚', '合体', '大乘', '渡劫'];
    const characterRealms: Record<string, number> = {};

    for (const character of charactersWithRealm) {
      for (let i = 0; i < realmOrder.length; i++) {
        if (character.description.includes(realmOrder[i])) {
          characterRealms[character.name] = i;
          break;
        }
      }
    }

    // 检查章节中的直接称呼
    for (const [name, realmLevel] of Object.entries(characterRealms)) {
      // 查找章节中其他角色对这个角色的直接称呼
      const directAddressPattern = new RegExp(`(?<!师)(?<!前)(?<!道)(?<!同)${name}(?![兄姐弟妹伯叔祖父母子女君尊皇帝王后妃])`, 'g');
      const directAddresses = chapterContent.match(directAddressPattern) || [];

      if (directAddresses.length > 0) {
        // 找出可能的低境界发言者
        for (const otherName of characterNames) {
          if (otherName !== name && characterRealms[otherName] !== undefined) {
            const otherRealmLevel = characterRealms[otherName];
            if (otherRealmLevel < realmLevel - 1) { // 境界相差较大
              // 检查是否在对话上下文中
              const contextPattern = new RegExp(`(?:${otherName}[^。]*?[""'""]|[^。]*?${otherName}[^。]*?[""'""])[^。]*?${name}[^。]*?[。！？]`, 'g');
              if (contextPattern.test(chapterContent)) {
                // 检查是否是挑衅性对话
                const provocationPattern = new RegExp(`${otherName}[^。]*?(?:挑衅|辱骂|嘲讽|呵斥)[^。]*?${name}`, 'g');
                if (!provocationPattern.test(chapterContent)) {
                  issues.push({
                    type: 'character_name',
                    severity: 'minor',
                    description: `境界较低的角色"${otherName}"在非挑衅情节中直呼高境界角色"${name}"的大名，这不符合修仙网文礼仪。`,
                    suggestion: `建议使用尊称如"前辈"、"道友"或"${name}前辈"。`
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  return issues;
}

/**
 * 检查时间线一致性
 */
export function validateTimeline(
  currentChapterTime: string,
  previousChapterTime: string
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  
      // 基本时间线验证
      // 在生产环境中，需要解析实际的日期/时间并进行比较
      if (currentChapterTime && previousChapterTime) {
    if (currentChapterTime === previousChapterTime) {
      issues.push({
        type: 'timeline',
        severity: 'minor',
        description: `章节结束时间与上一章节相同："${currentChapterTime}"。请确认这是否正确。`
      });
    }
  }
  
  return issues;
}
