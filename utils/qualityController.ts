/**
 * Quality Controller - Advanced quality analysis and auto-correction system
 * Based on detailed narrative quality feedback analysis
 */

// =================== INTERFACES ===================

export interface QualityAnalysis {
  audit: AuditAnalysis;                    // 网文审核分析
  waterInjection: WaterInjectionAnalysis;   // 水文检测分析
  goldenThree: GoldenThreeAnalysis;         // 黄金三章分析
  emotionalCurve: EmotionalCurveAnalysis;   // 情感曲线分析
  pacing: PacingAnalysis;                   // 节奏分析
  stakes: StakesAnalysis;                   // 利益相关分析
  overallScore: number;
  recommendations: QualityRecommendation[];
}

export interface EmotionalCurveAnalysis {
  hasClimax: boolean;
  climaxPosition: number; // percentage through chapter
  isMonotone: boolean;
  emotionalRange: number; // 1-10 scale
  needsBreathing: boolean;
  issues: string[];
}

export interface PacingAnalysis {
  sceneType: 'action' | 'emotional' | 'revelation' | 'setup';
  averageSentenceLength: number;
  expectedLength: number; // for scene type
  pacingMatch: boolean;
  issues: string[];
}

export interface RepetitionAnalysis {
  overusedWords: Array<{ word: string; count: number; severity: 'low' | 'medium' | 'high' }>;
  repetitivePatterns: Array<{ pattern: string; count: number }>;
  cliches: Array<{ phrase: string; category: string }>;
  needsVariation: boolean;
}

export interface ShowVsTellAnalysis {
  tellCount: number;
  showCount: number;
  ratio: number; // show/tell ratio
  problematicPhrases: Array<{ phrase: string; type: 'emotion-tell' | 'appearance-tell' | 'state-tell' }>;
  needsConversion: boolean;
}

export interface RevelationAnalysis {
  hasRevelation: boolean;
  isShown: boolean; // vs told
  readerExperience: 'immersive' | 'detached' | 'confused';
  specificity: number; // 1-10 scale
  emotionalImpact: number; // 1-10 scale
  issues: string[];
}

export interface StakesAnalysis {
  areStakesClear: boolean;
  stakesLevel: 'personal' | 'professional' | 'life-death' | 'world-ending';
  consequences: string[];
  playerAgency: boolean; // is character active or passive
  tension: number; // 1-10 scale
}

export interface MicroDetailsAnalysis {
  contextRelevant: boolean;
  distractingCount: number;
  atmosphericCount: number;
  balance: 'appropriate' | 'too-mundane' | 'too-sparse';
}

export interface AuditAnalysis {
  sensitiveWords: Array<{ word: string; category: 'political' | 'erotic' | 'violent' | 'forbidden' }>;
  crabRisk: { level: 'low' | 'medium' | 'high' | 'critical'; reasons: string[] };
  isSafe: boolean;
  violations: string[];
}

export interface WaterInjectionAnalysis {
  meaninglessRepetitions: Array<{ pattern: string; count: number; severity: 'low' | 'medium' | 'high' }>;
  adjectiveHell: { count: number; density: number; isExcessive: boolean };
  totalWaterWords: number;
  waterPercentage: number;
  needsTrim: boolean;
}

export interface GoldenThreeAnalysis {
  hasSystemCheat: boolean;
  systemCheatPosition: number; // 章节位置
  hasConflictHate: boolean;
  conflictIntensity: number; // 1-10 冲突强度
  hateLevel: number; // 拉仇恨程度 1-10
  isGoldenStandard: boolean;
  issues: string[];
}

export interface QualityRecommendation {
  category: 'audit' | 'water' | 'golden-three' | 'emotional' | 'pacing' | 'stakes';
  severity: 'low' | 'medium' | 'high' | 'critical';
  issue: string;
  solution: string;
  autoFixable: boolean;
}

// =================== QUALITY CONTROLLER CLASS ===================

export class QualityController {
  private readonly OVERUSED_THRESHOLD = 3;

  // =================== 网文审核敏感词库 ===================
  private readonly SENSITIVE_WORDS = {
    political: [
      '政治', '政府', '共产党', '习近平', '领导人', '党中央', '国家主席',
      '维稳', '上访', '抗议', '示威', '游行', '集会', '请愿'
    ],
    erotic: [
      '性', '裸', '乳', '臀', '阴', '茎', '插', '舔', '舐', '吸', '吮',
      '高潮', '射', '精', '液', '春药', '媚药', '催情', '处女', '破处'
    ],
    violent: [
      '血腥', '暴力', '杀戮', '屠杀', '虐杀', '肢解', '分尸', '碎尸', '碎尸万段',
      '酷刑', '折磨', '凌辱', '奸杀', '强奸', '轮奸', '群奸'
    ],
    forbidden: [
      '河蟹', '和谐', '删帖', '封号', '禁言', '屏蔽', '敏感词', '关键词',
      '审查', '删书', '封书', '下架', '禁书', '404'
    ]
  };

  // =================== 水文检测模式 ===================
  private readonly WATER_PATTERNS = {
    meaningless: [
      /啊{3,}/g, // 啊啊啊啊
      /嗯{3,}/g, // 嗯嗯嗯嗯
      /哦{3,}/g, // 哦哦哦哦
      /嘿{3,}/g, // 嘿嘿嘿嘿
      /呵{3,}/g, // 呵呵呵呵
      /哈{3,}/g, // 哈哈哈哈
      /嘻{3,}/g, // 嘻嘻嘻嘻
      /嘿{3,}/g  // 嘿嘿嘿嘿
    ],
    adjectiveHell: [
      /\b(美丽|漂亮|帅气|英俊|可爱|温柔|善良|邪恶|凶狠|可怕|恐怖|黑暗|光明|洁白|漆黑|鲜红|血红|湛蓝|蔚蓝|翠绿|碧绿|金黄|银白|晶莹|璀璨|辉煌|耀眼|阴森|诡异|神秘|神奇|玄妙|深邃|宽阔|狭窄|高大|矮小|肥胖|瘦弱|强壮|虚弱|年轻|年老|苍老|稚嫩|成熟|稚气){2,}\b/g, // 形容词堆砌
      /\b(无比|非常|特别|十分|极其|超级|超级|超级|相当|格外|分外|异常|尤为|尤其|特别|尤其|极其|极为|万分|十分|十分|百般|千般|万般){2,}\b/g  // 程度副词堆砌
    ]
  };

  // =================== 黄金三章检测模式 ===================
  private readonly GOLDEN_THREE_PATTERNS = {
    systemCheat: [
      /系统/g, /金手指/g, /作弊/g, /外挂/g, /绑定/g, /升级/g, /属性/g,
      /技能/g, /等级/g, /经验/g, /任务/g, /奖励/g, /商城/g, /抽奖/g
    ],
    conflictHate: [
      /退婚/g, /悔婚/g, /休妻/g, /休夫/g, /离婚/g, /分手/g, /抛弃/g,
      /羞辱/g, /侮辱/g, /嘲笑/g, /讥讽/g, /奚落/g, /打脸/g, /打压/g,
      /针对/g, /陷害/g, /阴谋/g, /算计/g, /背叛/g, /出轨/g
    ]
  };

  // =================== 中文自动修正映射 ===================
  private readonly CHINESE_EMOTION_TO_ACTION = {
    '生气': ['额头青筋暴起', '茶杯被捏得粉碎', '牙齿咬得咯咯作响', '拳头紧紧握住'],
    '愤怒': ['眼中燃烧着怒火', '声音提高八度', '桌子被拍得砰砰响', '呼吸变得急促'],
    '开心': ['嘴角上扬', '眼睛弯成月牙', '笑声回荡在房间', '脚步变得轻快'],
    '悲伤': ['泪水在眼眶打转', '肩膀微微颤抖', '声音变得沙哑', '低下头不愿让人看见'],
    '恐惧': ['身体不由自主后退', '心脏狂跳不止', '冷汗从额头渗出', '声音颤抖着'],
    '惊讶': ['眼睛瞪大', '嘴巴微微张开', '身体僵硬', '呼吸一滞'],
    '失望': ['眼神黯淡下来', '叹了口气', '肩膀垮了下来', '无力地靠在椅子上'],
    '兴奋': ['两眼放光', '手舞足蹈', '声音高亢', '坐立不安']
  };

  // =================== MAIN ANALYSIS METHOD ===================

  analyzeChapter(content: string, chapterType: 'action' | 'emotional' | 'revelation' | 'setup', chapterNumber?: number): QualityAnalysis {
    const audit = this.analyzeAudit(content);
    const waterInjection = this.analyzeWaterInjection(content);
    const goldenThree = this.analyzeGoldenThree(content, chapterNumber);
    const emotionalCurve = this.analyzeEmotionalCurve(content);
    const pacing = this.analyzePacing(content, chapterType);
    const stakes = this.analyzeStakes(content);

    const overallScore = this.calculateOverallScore({
      audit,
      waterInjection,
      goldenThree,
      emotionalCurve,
      pacing,
      stakes
    });

    const recommendations = this.generateRecommendations({
      audit,
      waterInjection,
      goldenThree,
      emotionalCurve,
      pacing,
      stakes
    });

    return {
      audit,
      waterInjection,
      goldenThree,
      emotionalCurve,
      pacing,
      stakes,
      overallScore,
      recommendations
    };
  }

  // =================== EMOTIONAL CURVE ANALYSIS ===================

  private analyzeEmotionalCurve(content: string): EmotionalCurveAnalysis {
    const sentences = content.split(/[.!?]+/).filter(s => s.length > 10);
    const emotionalIntensity = sentences.map(s => this.calculateEmotionalIntensity(s));

    // Find peak intensity
    const maxIntensity = Math.max(...emotionalIntensity);
    const peakIndex = emotionalIntensity.indexOf(maxIntensity);
    const climaxPosition = (peakIndex / sentences.length) * 100;

    // Check if monotone (little variation)
    const intensityRange = maxIntensity - Math.min(...emotionalIntensity);
    const isMonotone = intensityRange < 3;

    // Check for climax in proper position (70-80%)
    const hasClimax = climaxPosition >= 70 && climaxPosition <= 85;

    // Check if needs breathing space (too many high-intensity sentences in a row)
    let needsBreathing = false;
    for (let i = 0; i < emotionalIntensity.length - 3; i++) {
      const consecutive = emotionalIntensity.slice(i, i + 4);
      if (consecutive.every(intensity => intensity >= 7)) {
        needsBreathing = true;
        break;
      }
    }

    const issues = [];
    if (!hasClimax) issues.push(`Climax at ${climaxPosition.toFixed(0)}% instead of 70-80%`);
    if (isMonotone) issues.push('Emotional range too narrow');
    if (needsBreathing) issues.push('Too much consecutive high intensity');

    return {
      hasClimax,
      climaxPosition,
      isMonotone,
      emotionalRange: intensityRange,
      needsBreathing,
      issues
    };
  }

  private calculateEmotionalIntensity(sentence: string): number {
    const highIntensityWords = ['screamed', 'shattered', 'exploded', 'terror', 'agony', 'ecstasy'];
    const mediumIntensityWords = ['shouted', 'worried', 'excited', 'afraid', 'angry', 'surprised'];
    const lowIntensityWords = ['said', 'walked', 'looked', 'sat', 'stood', 'thought'];

    let intensity = 5; // baseline

    highIntensityWords.forEach(word => {
      if (sentence.toLowerCase().includes(word)) intensity += 2;
    });

    mediumIntensityWords.forEach(word => {
      if (sentence.toLowerCase().includes(word)) intensity += 1;
    });

    lowIntensityWords.forEach(word => {
      if (sentence.toLowerCase().includes(word)) intensity -= 1;
    });

    return Math.max(1, Math.min(10, intensity));
  }

  // =================== 网文审核分析 ===================

  private analyzeAudit(content: string): AuditAnalysis {
    const sensitiveWords: Array<{ word: string; category: 'political' | 'erotic' | 'violent' | 'forbidden' }> = [];
    const violations: string[] = [];

    // 检测敏感词
    Object.entries(this.SENSITIVE_WORDS).forEach(([category, words]) => {
      words.forEach(word => {
        const regex = new RegExp(word, 'g');
        const matches = content.match(regex);
        if (matches) {
          matches.forEach(() => {
            sensitiveWords.push({
              word,
              category: category as 'political' | 'erotic' | 'violent' | 'forbidden'
            });
          });
        }
      });
    });

    // 计算河蟹风险
    const crabRisk = this.calculateCrabRisk(sensitiveWords, content);

    // 生成违规记录
    sensitiveWords.forEach(({ word, category }) => {
      let violationMsg = '';
      switch (category) {
        case 'political':
          violationMsg = `检测到政治敏感词"${word}"，可能导致封书`;
          break;
        case 'erotic':
          violationMsg = `检测到色情内容"${word}"，违反平台规定`;
          break;
        case 'violent':
          violationMsg = `检测到血腥暴力"${word}"，内容过于极端`;
          break;
        case 'forbidden':
          violationMsg = `检测到禁忌词"${word}"，直接触发河蟹机制`;
          break;
      }
      violations.push(violationMsg);
    });

    return {
      sensitiveWords,
      crabRisk,
      isSafe: crabRisk.level === 'low',
      violations
    };
  }

  private calculateCrabRisk(sensitiveWords: Array<{ word: string; category: string }>, content: string): { level: 'low' | 'medium' | 'high' | 'critical'; reasons: string[] } {
    const reasons: string[] = [];
    let riskScore = 0;

    // 敏感词数量和类型评分
    const politicalCount = sensitiveWords.filter(w => w.category === 'political').length;
    const eroticCount = sensitiveWords.filter(w => w.category === 'erotic').length;
    const violentCount = sensitiveWords.filter(w => w.category === 'violent').length;
    const forbiddenCount = sensitiveWords.filter(w => w.category === 'forbidden').length;

    riskScore += politicalCount * 5; // 政治敏感最高风险
    riskScore += eroticCount * 4;    // 色情内容高风险
    riskScore += violentCount * 3;   // 暴力内容中等风险
    riskScore += forbiddenCount * 10; // 禁忌词直接高风险

    // 内容长度风险（太短可能被认为是测试内容）
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 100) {
      riskScore += 2;
      reasons.push('章节过短，可能被视为测试内容');
    }

    // 重复敏感词风险
    const uniqueWords = new Set(sensitiveWords.map(w => w.word));
    if (uniqueWords.size < sensitiveWords.length) {
      riskScore += 3;
      reasons.push('存在重复敏感词');
    }

    // 确定风险等级
    let level: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore >= 15) {
      level = 'critical';
      reasons.push('综合风险极高，可能立即封书');
    } else if (riskScore >= 10) {
      level = 'high';
      reasons.push('高风险内容，建议修改');
    } else if (riskScore >= 5) {
      level = 'medium';
      reasons.push('中等风险，需要注意');
    } else {
      level = 'low';
      reasons.push('风险较低，相对安全');
    }

    return { level, reasons };
  }

  // =================== 水文检测分析 ===================

  private analyzeWaterInjection(content: string): WaterInjectionAnalysis {
    const meaninglessRepetitions: Array<{ pattern: string; count: number; severity: 'low' | 'medium' | 'high' }> = [];

    // 检测无意义重复
    Object.entries(this.WATER_PATTERNS.meaningless).forEach(([key, regex]) => {
      const matches = content.match(regex) || [];
      if (matches.length > 0) {
        const totalLength = matches.join('').length;
        let severity: 'low' | 'medium' | 'high' = 'low';
        if (totalLength > 20) severity = 'high';
        else if (totalLength > 10) severity = 'medium';

        meaninglessRepetitions.push({
          pattern: key,
          count: matches.length,
          severity
        });
      }
    });

    // 检测形容词地狱
    const adjectiveHellMatches = [];
    this.WATER_PATTERNS.adjectiveHell.forEach(regex => {
      const matches = content.match(regex) || [];
      adjectiveHellMatches.push(...matches);
    });

    const totalWords = content.split(/\s+/).length;
    const adjectiveCount = adjectiveHellMatches.length;
    const adjectiveDensity = totalWords > 0 ? (adjectiveCount / totalWords) * 100 : 0;
    const isExcessive = adjectiveDensity > 5 || adjectiveCount > 10; // 形容词密度超过5%或数量超过10个

    // 计算总水文字数
    const waterWords = meaninglessRepetitions.reduce((sum, rep) => sum + rep.count, 0) +
                      (isExcessive ? adjectiveCount * 2 : 0); // 形容词地狱算双倍水文
    const waterPercentage = totalWords > 0 ? (waterWords / totalWords) * 100 : 0;

    return {
      meaninglessRepetitions,
      adjectiveHell: {
        count: adjectiveCount,
        density: adjectiveDensity,
        isExcessive
      },
      totalWaterWords: waterWords,
      waterPercentage,
      needsTrim: waterPercentage > 10 // 水文占比超过10%需要删减
    };
  }

  // =================== 黄金三章检测分析 ===================

  private analyzeGoldenThree(content: string, chapterNumber?: number): GoldenThreeAnalysis {
    const issues: string[] = [];
    let hasSystemCheat = false;
    let systemCheatPosition = 0;
    let hasConflictHate = false;
    let conflictIntensity = 0;
    let hateLevel = 0;

    // 检测金手指/系统（主要针对第一章）
    if (chapterNumber === 1 || chapterNumber === undefined) {
      const systemMatches = this.GOLDEN_THREE_PATTERNS.systemCheat.filter(pattern => {
        return pattern.test(content);
      });

      hasSystemCheat = systemMatches.length > 0;
      if (hasSystemCheat) {
        // 找到系统元素首次出现的位置
        const words = content.split(/\s+/);
        for (let i = 0; i < words.length; i++) {
          if (this.GOLDEN_THREE_PATTERNS.systemCheat.some(pattern =>
            pattern.test(words[i])
          )) {
            systemCheatPosition = (i / words.length) * 100; // 百分比位置
            break;
          }
        }
        issues.push('第一章出现金手指/系统元素，建议控制节奏');
      }
    }

    // 检测冲突/拉仇恨（针对前三章）
    if (chapterNumber && chapterNumber <= 3) {
      const conflictMatches = this.GOLDEN_THREE_PATTERNS.conflictHate.filter(pattern => {
        return pattern.test(content);
      });

      hasConflictHate = conflictMatches.length > 0;
      if (hasConflictHate) {
        conflictIntensity = Math.min(10, conflictMatches.length * 2);
        hateLevel = this.calculateHateLevel(content);

        if (conflictIntensity < 3) {
          issues.push('前三章冲突不足，难以吸引读者');
        } else if (conflictIntensity > 8) {
          issues.push('前三章冲突过强，可能吓跑读者');
        }
      } else {
        issues.push('前三章缺乏明显冲突/拉仇恨元素');
      }
    }

    // 判断是否符合黄金三章标准
    const isGoldenStandard = (chapterNumber === 1 && hasSystemCheat) ||
                           (chapterNumber && chapterNumber <= 3 && hasConflictHate && conflictIntensity >= 3 && conflictIntensity <= 8);

    return {
      hasSystemCheat,
      systemCheatPosition,
      hasConflictHate,
      conflictIntensity,
      hateLevel,
      isGoldenStandard,
      issues
    };
  }

  private calculateHateLevel(content: string): number {
    let hateScore = 0;

    // 检测各种拉仇恨元素
    const hateIndicators = [
      { pattern: /羞辱|侮辱|嘲笑|讥讽/g, weight: 3 },
      { pattern: /打脸|打压|针对|陷害/g, weight: 4 },
      { pattern: /阴谋|算计|背叛|出轨/g, weight: 5 },
      { pattern: /退婚|悔婚|休妻|休夫/g, weight: 6 },
      { pattern: /离婚|分手|抛弃/g, weight: 4 }
    ];

    hateIndicators.forEach(({ pattern, weight }) => {
      const matches = content.match(pattern) || [];
      hateScore += matches.length * weight;
    });

    // 检测情感强度词
    const emotionWords = /气愤|愤怒|憎恨|怨恨|嫉妒|羡慕/g;
    const emotionMatches = content.match(emotionWords) || [];
    hateScore += emotionMatches.length * 2;

    return Math.min(10, Math.max(0, hateScore));
  }

  // =================== PACING ANALYSIS ===================

  private analyzePacing(content: string, sceneType: 'action' | 'emotional' | 'revelation' | 'setup'): PacingAnalysis {
    const sentences = content.split(/[.!?]+/).filter(s => s.length > 5);
    const avgLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;

    const expectedLengths = {
      action: 12,
      emotional: 18,
      revelation: 15,
      setup: 16
    };

    const expectedLength = expectedLengths[sceneType];
    const pacingMatch = Math.abs(avgLength - expectedLength) <= 3;

    const issues = [];
    if (!pacingMatch) {
      if (avgLength > expectedLength + 3) {
        issues.push(`Sentences too long for ${sceneType} scene (${avgLength.toFixed(1)} vs ${expectedLength} words)`);
      } else {
        issues.push(`Sentences too short for ${sceneType} scene (${avgLength.toFixed(1)} vs ${expectedLength} words)`);
      }
    }

    return {
      sceneType,
      averageSentenceLength: avgLength,
      expectedLength,
      pacingMatch,
      issues
    };
  }


  // =================== REVELATION ANALYSIS ===================

  private analyzeRevelation(content: string): RevelationAnalysis {
    const revelationKeywords = ['revealed', 'discovered', 'realized', 'understood', 'truth', 'secret'];
    const hasRevelation = revelationKeywords.some(keyword =>
      content.toLowerCase().includes(keyword)
    );

    if (!hasRevelation) {
      return {
        hasRevelation: false,
        isShown: true,
        readerExperience: 'immersive',
        specificity: 10,
        emotionalImpact: 10,
        issues: []
      };
    }

    // Check if revelation is shown vs told
    const tellRevelationPatterns = [
      /he explained/gi,
      /she told/gi,
      /revealed that/gi,
      /made clear that/gi
    ];

    const isShown = !tellRevelationPatterns.some(pattern => content.match(pattern));

    // Check specificity (concrete facts vs vague statements)
    const specificityMarkers = content.match(/\b(exactly|precisely|specifically|[0-9]+|"[^"]*")/g) || [];
    const specificity = Math.min(10, specificityMarkers.length);

    // Estimate emotional impact based on character reactions
    const reactionMarkers = content.match(/(gasped|stumbled|stared|froze|trembled)/g) || [];
    const emotionalImpact = Math.min(10, reactionMarkers.length * 2);

    const issues = [];
    if (!isShown) issues.push('Revelation told rather than shown');
    if (specificity < 3) issues.push('Revelation lacks concrete details');
    if (emotionalImpact < 5) issues.push('Character reaction to revelation is weak');

    return {
      hasRevelation,
      isShown,
      readerExperience: isShown && specificity >= 3 ? 'immersive' : 'detached',
      specificity,
      emotionalImpact,
      issues
    };
  }

  // =================== STAKES ANALYSIS ===================

  private analyzeStakes(content: string): StakesAnalysis {
    const stakesKeywords = ['must', 'have to', 'need to', 'or else', 'if not', 'unless'];
    const consequenceKeywords = ['die', 'death', 'destroy', 'lose', 'fail', 'end'];

    const areStakesClear = stakesKeywords.some(keyword =>
      content.toLowerCase().includes(keyword)
    );

    // Determine stakes level
    let stakesLevel: 'personal' | 'professional' | 'life-death' | 'world-ending' = 'personal';
    if (content.toLowerCase().includes('world') || content.toLowerCase().includes('everyone')) {
      stakesLevel = 'world-ending';
    } else if (consequenceKeywords.some(k => content.toLowerCase().includes(k))) {
      stakesLevel = 'life-death';
    } else if (content.toLowerCase().includes('job') || content.toLowerCase().includes('career')) {
      stakesLevel = 'professional';
    }

    // Check player agency (active vs passive)
    const activeVerbs = content.match(/\b(she|he) (decides|chooses|fights|runs|attacks|defends)/gi) || [];
    const passiveVerbs = content.match(/\b(she|he) (watches|observes|waits|hides)/gi) || [];
    const playerAgency = activeVerbs.length > passiveVerbs.length;

    const consequences = consequenceKeywords.filter(keyword =>
      content.toLowerCase().includes(keyword)
    );

    const tension = Math.min(10, consequences.length + (playerAgency ? 2 : 0) + (areStakesClear ? 2 : 0));

    return {
      areStakesClear,
      stakesLevel,
      consequences,
      playerAgency,
      tension
    };
  }

  // =================== MICRO DETAILS ANALYSIS ===================

  private analyzeMicroDetails(content: string, chapterType: 'action' | 'emotional' | 'revelation' | 'setup'): MicroDetailsAnalysis {
    const mundaneDetails = [
      /dinner/gi, /cleaning/gi, /cold\b/gi, /wondered if/gi, /getting a/gi,
      /heading home/gi, /clean under/gi, /making her nose/gi
    ];

    const atmosphericDetails = [
      /dust/gi, /shadow/gi, /light/gi, /sound/gi, /smell/gi, /echo/gi,
      /creak/gi, /whisper/gi, /glow/gi, /shimmer/gi
    ];

    const distractingCount = mundaneDetails.reduce((count, pattern) =>
      count + (content.match(pattern) || []).length, 0
    );

    const atmosphericCount = atmosphericDetails.reduce((count, pattern) =>
      count + (content.match(pattern) || []).length, 0
    );

    // Context relevance depends on chapter type
    const isHighTension = chapterType === 'action' || chapterType === 'revelation';
    const contextRelevant = !isHighTension || distractingCount === 0;

    let balance: 'appropriate' | 'too-mundane' | 'too-sparse' = 'appropriate';
    if (distractingCount > 3) balance = 'too-mundane';
    if (atmosphericCount === 0) balance = 'too-sparse';

    return {
      contextRelevant,
      distractingCount,
      atmosphericCount,
      balance
    };
  }

  // =================== SCORING AND RECOMMENDATIONS ===================

  private calculateOverallScore(analysis: {
    audit: AuditAnalysis;
    waterInjection: WaterInjectionAnalysis;
    goldenThree: GoldenThreeAnalysis;
    emotionalCurve: EmotionalCurveAnalysis;
    pacing: PacingAnalysis;
    stakes: StakesAnalysis;
  }): number {
    let score = 100;

    // 网文审核处罚（最高优先级）
    if (!analysis.audit.isSafe) {
      const riskMultiplier = analysis.audit.crabRisk.level === 'critical' ? 4 :
                            analysis.audit.crabRisk.level === 'high' ? 3 :
                            analysis.audit.crabRisk.level === 'medium' ? 2 : 1;
      score -= analysis.audit.violations.length * 5 * riskMultiplier;
    }

    // 水文检测处罚
    if (analysis.waterInjection.needsTrim) {
      score -= Math.floor(analysis.waterInjection.waterPercentage * 2); // 水文占比每1%扣2分
    }
    score -= analysis.waterInjection.meaninglessRepetitions.length * 3;
    if (analysis.waterInjection.adjectiveHell.isExcessive) {
      score -= 10;
    }

    // 黄金三章加分/扣分
    if (analysis.goldenThree.isGoldenStandard) {
      score += 20; // 符合黄金三章标准加分
    } else {
      score -= analysis.goldenThree.issues.length * 5;
    }

    // Emotional curve penalties
    if (!analysis.emotionalCurve.hasClimax) score -= 15;
    if (analysis.emotionalCurve.isMonotone) score -= 10;
    if (analysis.emotionalCurve.needsBreathing) score -= 10;

    // Pacing penalties
    if (!analysis.pacing.pacingMatch) score -= 10;

    // Stakes penalties
    if (!analysis.stakes.areStakesClear) score -= 10;
    if (!analysis.stakes.playerAgency) score -= 8;

    return Math.max(0, score);
  }

  private generateRecommendations(analysis: {
    audit: AuditAnalysis;
    waterInjection: WaterInjectionAnalysis;
    goldenThree: GoldenThreeAnalysis;
    emotionalCurve: EmotionalCurveAnalysis;
    pacing: PacingAnalysis;
    stakes: StakesAnalysis;
  }): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = [];

    // 网文审核推荐
    if (!analysis.audit.isSafe) {
      analysis.audit.violations.forEach(violation => {
        recommendations.push({
          category: 'audit',
          severity: analysis.audit.crabRisk.level === 'critical' ? 'critical' :
                   analysis.audit.crabRisk.level === 'high' ? 'high' : 'medium',
          issue: violation,
          solution: '立即删除或修改敏感内容，避免封书风险',
          autoFixable: false
        });
      });
    }

    // 水文检测推荐
    if (analysis.waterInjection.needsTrim) {
      recommendations.push({
        category: 'water',
        severity: analysis.waterInjection.waterPercentage > 20 ? 'high' : 'medium',
        issue: `水文占比${analysis.waterInjection.waterPercentage.toFixed(1)}%，超过10%阈值`,
        solution: '删除无意义重复和过度形容词堆砌',
        autoFixable: true
      });
    }

    if (analysis.waterInjection.adjectiveHell.isExcessive) {
      recommendations.push({
        category: 'water',
        severity: 'medium',
        issue: `形容词密度${analysis.waterInjection.adjectiveHell.density.toFixed(1)}%，形成"形容词地狱"`,
        solution: '精简形容词使用，保留最具表现力的词汇',
        autoFixable: true
      });
    }

    // 黄金三章推荐
    analysis.goldenThree.issues.forEach(issue => {
      recommendations.push({
        category: 'golden-three',
        severity: analysis.goldenThree.isGoldenStandard ? 'low' : 'high',
        issue,
        solution: analysis.goldenThree.hasSystemCheat ?
          '控制金手指/系统出现节奏，避免读者审美疲劳' :
          '在前三章建立足够冲突和拉仇恨元素',
        autoFixable: false
      });
    });

    // Emotional curve recommendations
    if (!analysis.emotionalCurve.hasClimax) {
      recommendations.push({
        category: 'emotional',
        severity: 'high',
        issue: `高潮出现在${analysis.emotionalCurve.climaxPosition.toFixed(0)}%，不符合70-80%标准`,
        solution: '重新构建章节，将最高潮放在70-80%位置',
        autoFixable: false
      });
    }

    if (analysis.emotionalCurve.needsBreathing) {
      recommendations.push({
        category: 'emotional',
        severity: 'medium',
        issue: '连续高强度情绪，需要情绪缓冲',
        solution: '在高潮间插入平静时刻',
        autoFixable: true
      });
    }

    // Pacing recommendations
    if (!analysis.pacing.pacingMatch) {
      recommendations.push({
        category: 'pacing',
        severity: 'medium',
        issue: analysis.pacing.issues[0] || '节奏不匹配',
        solution: `调整${analysis.pacing.sceneType}场景的句子长度`,
        autoFixable: true
      });
    }

    // Stakes recommendations
    if (!analysis.stakes.areStakesClear) {
      recommendations.push({
        category: 'stakes',
        severity: 'high',
        issue: '利益相关不明确',
        solution: '明确说明角色失败将失去什么',
        autoFixable: false
      });
    }

    return recommendations;
  }

  // =================== AUTO-CORRECTION METHODS ===================

  autoCorrectContent(content: string, recommendations: QualityRecommendation[]): string {
    let correctedContent = content;

    recommendations.forEach(rec => {
      if (!rec.autoFixable) return;

      switch (rec.category) {
        case 'water':
          correctedContent = this.autoFixWaterInjection(correctedContent);
          break;
        case 'emotional':
          correctedContent = this.autoFixEmotionalBreathing(correctedContent);
          break;
        case 'pacing':
          correctedContent = this.autoFixPacing(correctedContent);
          break;
      }
    });

    // 总是尝试自动修正中文情绪表达（如果有的话）
    correctedContent = this.autoFixChineseEmotionTell(correctedContent);

    return correctedContent;
  }

  private autoFixWaterInjection(content: string): string {
    let fixed = content;

    // 删除无意义重复
    Object.values(this.WATER_PATTERNS.meaningless).forEach(regex => {
      fixed = fixed.replace(regex, (match) => {
        // 只保留3个字符的重复，其余删除
        return match.length <= 3 ? match : match.substring(0, 3);
      });
    });

    // 精简形容词地狱
    let adjectiveCount = 0;
    this.WATER_PATTERNS.adjectiveHell.forEach(regex => {
      fixed = fixed.replace(regex, (match) => {
        adjectiveCount++;
        // 每3个形容词保留1个
        if (adjectiveCount % 3 === 0) {
          return match;
        }
        return '';
      });
    });

    return fixed;
  }

  private autoFixChineseEmotionTell(content: string): string {
    let fixed = content;

    // 匹配中文情绪表达："他感到很生气"、"她觉得很难过"等
    const emotionPatterns = [
      /([他她它])(感到|觉得|觉得很|感觉|感觉到)(很|非常|特别|十分|极其|无比|相当|格外|异常|尤其|尤为|尤其|极其|极为|万分|十分|百般|千般|万般)*(\w+)/g
    ];

    emotionPatterns.forEach(pattern => {
      fixed = fixed.replace(pattern, (match, subject, verb, intensifier, emotion) => {
        const actionOptions = this.CHINESE_EMOTION_TO_ACTION[emotion as keyof typeof this.CHINESE_EMOTION_TO_ACTION];
        if (actionOptions) {
          const randomAction = actionOptions[Math.floor(Math.random() * actionOptions.length)];
          return `${subject}${randomAction}`;
        }
        return match;
      });
    });

    return fixed;
  }

  private autoFixPacing(content: string): string {
    // This is a simplified version - would need more sophisticated sentence restructuring
    return content;
  }

  private autoFixEmotionalBreathing(content: string): string {
    // Insert breathing moments after high-intensity sequences
    const breathingMoments = [
      'She took a slow breath.',
      'The moment stretched.',
      'Silence settled between them.',
      'She steadied herself.'
    ];

    // Simple implementation - would need more sophisticated detection
    return content.replace(/(screamed|shattered|exploded)([^.]*\.)/g, (match) => {
      const breathingMoment = breathingMoments[Math.floor(Math.random() * breathingMoments.length)];
      return `${match}\n\n${breathingMoment}`;
    });
  }
}

// =================== EXPORT ===================

export const qualityController = new QualityController();