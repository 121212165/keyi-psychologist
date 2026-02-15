import type { RiskLevel, CrisisEvent } from '@/types';
import { generateId } from '@/utils/helpers';

/**
 * 风险关键词配置
 */
interface RiskKeywords {
  /** 红色预警 - 高风险 */
  red: string[];
  /** 黄色预警 - 中风险 */
  yellow: string[];
  /** 需要关注的模式 */
  patterns: RegExp[];
}

/**
 * 默认关键词配置
 */
const defaultKeywords: RiskKeywords = {
  // 自杀相关
  red: [
    '不想活了',
    '活着没意义',
    '想死',
    '自杀',
    '自残',
    '解脱',
    '一了百了',
    '死了算了',
    '太累了',
    '结束一切',
    '活够了',
    '没意思',
    '死了好',
    '不想活',
    '去死',
  ],

  // 自伤相关
  yellow: [
    '崩溃',
    '失控',
    '活不下去',
    '没办法',
    '控制不住',
    '太痛苦了',
    '撑不住了',
    '没有意义',
    '绝望',
    '无望',
    '孤独',
    '空虚',
  ],

  // 正则模式
  patterns: [
    /.*(?:想|要|去)死.*/,
    /.*(?:结束|没了|完了).*/,
    /.*(?:压力|负担).*大.*/,
  ],
};

/**
 * 风险检测结果
 */
interface RiskResult {
  level: RiskLevel;
  matchedKeywords: string[];
  isCrisis: boolean;
  suggestedAction?: string;
}

/**
 * 风险服务类
 */
class RiskService {
  private keywords: RiskKeywords;
  private eventCallback?: (event: CrisisEvent) => void;

  constructor(
    keywords: Partial<RiskKeywords> = {},
    eventCallback?: (event: CrisisEvent) => void
  ) {
    this.keywords = { ...defaultKeywords, ...keywords };
    this.eventCallback = eventCallback;
  }

  /**
   * 检测文本风险等级
   */
  detect(text: string): RiskResult {
    const lowerText = text.toLowerCase();
    const matchedRed: string[] = [];
    const matchedYellow: string[] = [];

    // 检测红色关键词
    for (const keyword of this.keywords.red) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matchedRed.push(keyword);
      }
    }

    // 检测黄色关键词
    for (const keyword of this.keywords.yellow) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matchedYellow.push(keyword);
      }
    }

    // 检测正则模式
    const matchedPatterns = this.keywords.patterns.filter((pattern) =>
      pattern.test(text)
    );

    // 判断风险等级
    let level: RiskLevel = 'low';
    let isCrisis = false;

    if (matchedRed.length > 0) {
      level = 'high';
      isCrisis = true;
    } else if (matchedYellow.length > 0 || matchedPatterns.length > 0) {
      level = 'medium';
    }

    // 获取建议操作
    const suggestedAction = this.getSuggestedAction(level);

    return {
      level,
      matchedKeywords: [...matchedRed, ...matchedYellow],
      isCrisis,
      suggestedAction,
    };
  }

  /**
   * 检测是否为高风险（需要立即干预）
   */
  isHighRisk(text: string): boolean {
    const result = this.detect(text);
    return result.level === 'high';
  }

  /**
   * 检测是否为中风险或更高
   */
  isMediumOrHigher(text: string): boolean {
    const result = this.detect(text);
    return result.level === 'medium' || result.level === 'high';
  }

  /**
   * 创建危机事件记录
   */
  createCrisisEvent(
    text: string,
    sessionId: string,
    level: RiskLevel
  ): CrisisEvent {
    const event: CrisisEvent = {
      id: generateId('crisis'),
      sessionId,
      timestamp: new Date().toISOString(),
      level,
      triggerText: text,
      resolved: false,
    };

    // 回调通知
    if (this.eventCallback) {
      this.eventCallback(event);
    }

    return event;
  }

  /**
   * 获取建议操作
   */
  private getSuggestedAction(level: RiskLevel): string | undefined {
    const actions = {
      low: undefined,
      medium: '建议更多关注用户的情绪状态，温和地询问具体情况',
      high: '立即触发危机干预流程，提供紧急资源联系信息',
    };

    return actions[level];
  }

  /**
   * 添加自定义关键词
   */
  addRedKeywords(keywords: string[]): void {
    this.keywords.red.push(...keywords);
  }

  addYellowKeywords(keywords: string[]): void {
    this.keywords.yellow.push(...keywords);
  }

  addPatterns(patterns: RegExp[]): void {
    this.keywords.patterns.push(...patterns);
  }

  /**
   * 清空关键词（用于测试）
   */
  clearKeywords(): void {
    this.keywords.red = [];
    this.keywords.yellow = [];
    this.keywords.patterns = [];
  }

  /**
   * 设置事件回调
   */
  setEventCallback(callback: (event: CrisisEvent) => void): void {
    this.eventCallback = callback;
  }
}

// 创建默认实例
export const riskService = new RiskService();

// 导出类（便于自定义配置）
export { RiskService };

// 常用关键词组
export const keywordGroups = {
  // 自杀相关
  suicide: [
    '不想活了',
    '活着没意义',
    '想死',
    '自杀',
    '解脱',
    '一了百了',
  ],

  // 自伤相关
  selfHarm: [
    '自残',
    '割腕',
    '撞墙',
    '伤害自己',
  ],

  // 绝望相关
  hopelessness: [
    '绝望',
    '无望',
    '没有希望',
    '看不到希望',
    '太绝望了',
  ],

  // 痛苦相关
  pain: [
    '太痛苦了',
    '撑不住了',
    '活不下去了',
    '受不了了',
  ],
};
