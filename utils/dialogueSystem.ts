/**
 * 中文网文角色对话系统 - 为不同角色创建独特的说话方式
 */

import { Character } from '../types';

export interface CharacterVoiceProfile {
  name: string;
  speechPatterns: string[];
  vocabularyLevel: string; // 文雅、现代、江湖、古风、修仙、宫廷、纨绔、老怪
  emotionalRange: string; // 内敛、外放、暴躁、沉稳
  catchphrases?: string[];
  dialectNotes?: string;
  communicationStyle: string; // 直接、委婉、啰嗦、简洁、诗意、嘲讽、舔狗
  roleType?: string; // 主角、反派、路人、配角等
}

/**
 * 根据角色描述生成语音特征
 */
export function generateVoiceProfile(character: Character): CharacterVoiceProfile {
  const description = character.description;
  
  // 推断词汇层次
  let vocabularyLevel = '现代';
  if (description.includes('纨绔') || description.includes('公子') || description.includes('少爷') || description.includes('龙傲天')) {
    vocabularyLevel = '纨绔';
  } else if (description.includes('老怪') || description.includes('老魔') || description.includes('老妖') || description.includes('老祖')) {
    vocabularyLevel = '老怪';
  } else if (description.includes('仙') || description.includes('修') || description.includes('道')) {
    vocabularyLevel = '修仙';
  } else if (description.includes('古') || description.includes('宫') || description.includes('皇') || description.includes('朝')) {
    vocabularyLevel = '古风';
  } else if (description.includes('侠') || description.includes('武林') || description.includes('江湖')) {
    vocabularyLevel = '江湖';
  } else if (description.includes('书生') || description.includes('文') || description.includes('雅')) {
    vocabularyLevel = '文雅';
  } else if (description.includes('宫廷') || description.includes('贵族')) {
    vocabularyLevel = '宫廷';
  }
  
  // 推断情感范围
  let emotionalRange = '外放';
  if (description.includes('沉稳') || description.includes('冷静') || description.includes('内敛')) {
    emotionalRange = '内敛';
  } else if (description.includes('暴躁') || description.includes('冲动') || description.includes('火爆')) {
    emotionalRange = '暴躁';
  } else if (description.includes('沉着') || description.includes('稳重')) {
    emotionalRange = '沉稳';
  }
  
  // 推断交流风格
  let communicationStyle = '直接';
  if (description.includes('嘲讽') || description.includes('讽刺') || description.includes('挖苦') || description.includes('拉仇恨')) {
    communicationStyle = '嘲讽';
  } else if (description.includes('舔狗') || description.includes('讨好') || description.includes('捧哏') || description.includes('逢迎')) {
    communicationStyle = '舔狗';
  } else if (description.includes('诗人') || description.includes('文人') || description.includes('书生')) {
    communicationStyle = '诗意';
  } else if (description.includes('直率') || description.includes('武者') || description.includes('军人')) {
    communicationStyle = '简洁';
  } else if (description.includes('官') || description.includes('外交')) {
    communicationStyle = '委婉';
  } else if (description.includes('学者') || description.includes('夫子')) {
    communicationStyle = '啰嗦';
  }

  // 推断角色类型
  let roleType = '配角';
  if (description.includes('主角') || description.includes('主人公') || description.includes('主角光环')) {
    roleType = '主角';
  } else if (description.includes('反派') || description.includes('大boss') || description.includes('敌人') || description.includes('villain')) {
    roleType = '反派';
  } else if (description.includes('路人') || description.includes('龙套') || description.includes('配角') || description.includes('小角色')) {
    roleType = '路人';
  } else if (description.includes('师兄') || description.includes('师妹') || description.includes('师傅') || description.includes('徒弟')) {
    roleType = '配角';
  }

  return {
    name: character.name,
    speechPatterns: [],
    vocabularyLevel,
    emotionalRange,
    communicationStyle,
    roleType
  };
}

/**
 * 获取角色对话指南
 */
export function getDialogueGuidelines(profile: CharacterVoiceProfile): string {
  let guidelines = `\n**${profile.name}的对话特征：**\n`;
  
  // 词汇层次指导
  switch (profile.vocabularyLevel) {
    case '文雅':
      guidelines += `- 使用文雅、有教养的语言\n- 完整句子，语法规范\n- 可能使用文言词汇或成语\n- 避免粗俗和俚语\n- 例："在下以为...""恕在下直言..."\n`;
      break;
    case '江湖':
      guidelines += `- 使用江湖行话、市井俚语\n- 句子可能简短或破碎\n- 直白、不拐弯抹角\n- 例："爷们儿...""老子...""这事儿..."\n`;
      break;
    case '古风':
      guidelines += `- 使用古代用语、文言色彩\n- 可能使用"吾""汝""尔"等古词\n- 语气庄重典雅\n- 例："吾观汝...""此事当如何..."\n`;
      break;
    case '修仙':
      guidelines += `- 使用修仙特有术语（道友、前辈、晚辈）\n- 语气超然或威严\n- 提及天道、因果、劫数等概念\n- 例："道友客气了...""敢问前辈..."\n`;
      break;
    case '宫廷':
      guidelines += `- 使用宫廷敬语、尊称\n- 语气恭敬或威严\n- 注重礼仪和等级\n- 例："臣以为...""启禀陛下...""本宫..."\n`;
      break;
    case '纨绔':
      guidelines += `- 使用高傲、自大的语气\n- 经常自称"本少爷""本公子""我龙傲天"\n- 瞧不起别人，颐指气使\n- 喜欢炫耀财富和背景\n- 例："本少爷看上你了...""你知道我是谁吗？""敢得罪我龙傲天！"\n`;
      break;
    case '老怪':
      guidelines += `- 使用阴森、诡异的语气\n- 经常发出"桀桀桀"的怪笑\n- 说话喜欢绕弯子、卖关子\n- 喜欢自称"老祖""老夫"等\n- 例："桀桀桀，小娃娃...""老祖我活了八百年...""年轻人，你不懂啊..."\n`;
      break;
    default: // 现代
      guidelines += `- 使用现代日常用语\n- 自然、轻松的表达\n- 可使用网络流行语（适度）\n- 例："我觉得...""这个...""那啥..."\n`;
  }
  
  // 交流风格指导
  switch (profile.communicationStyle) {
    case '简洁':
      guidelines += `- 短句，少废话\n- 直奔主题\n- 可能使用句子片段\n- 没有不必要的解释\n- 例："走。""杀。""废话少说。"\n`;
      break;
    case '啰嗦':
      guidelines += `- 较长、复杂的句子\n- 提供上下文和解释\n- 可能过度解释或离题\n- 喜欢听自己说话\n- 例："这个嘛，就要从头说起了，当年..."\n`;
      break;
    case '诗意':
      guidelines += `- 使用比喻和意象\n- 富有节奏感、韵律\n- 可能说话隐晦或用典\n- 表达之美很重要\n- 例："月落乌啼，霜天寒夜..."\n`;
      break;
    case '委婉':
      guidelines += `- 暗示而非直说\n- 使用委婉语和谨慎措辞\n- 圆滑、得体\n- 留有解释余地\n- 例："恐怕...""或许...""不妨..."\n`;
      break;
    case '嘲讽':
      guidelines += `- 使用讽刺、挖苦的语气\n- 专门挑刺、拉仇恨\n- 说话带刺，让人难堪\n- 喜欢揭人短处\n- 例："就你这水平还想...？""啧啧啧，真可怜...""你确定你行吗？"\n`;
      break;
    case '舔狗':
      guidelines += `- 讨好、谄媚的语气\n- 专门捧哏、拍马屁\n- 说话小心翼翼，生怕得罪人\n- 喜欢吹捧对方\n- 例："您说得太对了...""我听您的...""您真厉害..."\n`;
      break;
    default: // 直接
      guidelines += `- 说话清晰明了\n- 直截了当、诚实\n- 不拐弯抹角\n- 重视清晰胜过圆滑\n- 例："我就直说了。""实话告诉你。"\n`;
  }
  
  // 情感范围指导
  switch (profile.emotionalRange) {
    case '内敛':
      guidelines += `- 情绪细微、克制\n- 很少提高音量或表现强烈情感\n- 保持镇定\n- 情感通过小动作表现\n- 例：即使生气也只是"嗯"一声\n`;
      break;
    case '暴躁':
      guidelines += `- 情绪即时且强烈\n- 可能大喊、打断或反应激烈\n- 心直口快\n- 快速愤怒或喜悦\n- 例："混账！""去你的！"\n`;
      break;
    case '沉稳':
      guidelines += `- 情绪稳定、平和\n- 即使危机时刻也冷静说话\n- 感情深埋\n- 行动胜于言语\n- 例：危机时刻也只是平静地说"走"\n`;
      break;
    default: // 外放
      guidelines += `- 情绪清晰真实\n- 适当表现感受\n- 平衡的情感反应\n- 真实且有共鸣\n- 例：高兴时笑，难过时低沉\n`;
  }
  
  if (profile.catchphrases && profile.catchphrases.length > 0) {
    guidelines += `\n**口头禅/标志性表达：**\n${profile.catchphrases.map(p => `- "${p}"`).join('\n')}\n`;
  }
  
  if (profile.dialectNotes) {
    guidelines += `\n**方言/口音特点：** ${profile.dialectNotes}\n`;
  }

  // 角色类型专用指南
  if (profile.roleType) {
    switch (profile.roleType) {
      case '反派':
        guidelines += `\n**反派专用指南：**\n`;
        guidelines += `- 死于话多：在战斗前或战斗中一定要自报家门\n- 打架前必自报家门："吾乃XXX，今日特来取你狗命！"\n- 喜欢炫耀自己的来历和实力\n- 死前往往会有长篇大论的遗言\n- 例："桀桀桀，你可知吾乃XXX宗宗主...""小子，你惹怒我了！"\n`;
        break;
      case '路人':
        guidelines += `\n**路人专用指南：**\n`;
        guidelines += `- 负责震惊和解说战况："恐怖如斯！""天哪，这也太强了吧！"\n- 围观群众的反应要夸张\n- 喜欢八卦和传播消息\n- 对话简短，起到烘托氛围的作用\n- 例："哇！那人好厉害！""听说XXX又干了什么...""太可怕了！"\n`;
        break;
      case '主角':
        guidelines += `\n**主角专用指南：**\n`;
        guidelines += `- 拥有主角光环，说话往往一语中的\n- 即使弱小也有底气\n- 喜欢装逼但实力匹配\n- 面对危机时冷静应对\n- 例："你以为这样就结束了？""今天我就要逆天改命！"\n`;
        break;
      case '配角':
        guidelines += `\n**配角专用指南：**\n`;
        guidelines += `- 适度衬托主角，不要抢戏\n- 有自己的小聪明和小算盘\n- 对话符合身份和地位\n- 适当提供信息和助力\n- 例：符合角色的身份说话，如师兄关心师弟，朋友仗义相助\n`;
        break;
    }
  }

  return guidelines;
}

/**
 * 获取场景中所有角色的对话指南
 */
export function getSceneDialogueGuidelines(characters: Record<string, Character>): string {
  let guidelines = "\n**角色说话方式指南：**\n";
  
  for (const character of Object.values(characters)) {
    const profile = generateVoiceProfile(character);
    guidelines += getDialogueGuidelines(profile);
    guidelines += "\n";
  }
  
  guidelines += `\n**对话对比度：**
确保每个角色听起来都与其他人不同。他们的说话模式、用词选择和节奏应该是可以立即识别的。读者应该能够在没有对话标签的情况下识别出是谁在说话。

**中文网文对话技巧：**
1. 不同身份用不同称呼：晚辈对长辈（前辈、师尊），平辈（道友、兄台），对晚辈（小友、小子）
2. 修仙文中加入境界意识：筑基对金丹要恭敬，金丹对筑基可以随意
3. 古风文中注意礼仪：见面要行礼，说话要有分寸
4. 现代文可以活泼，但也要符合人设
5. 对话要有潜台词，不能啥都直说
`;
  
  return guidelines;
}
