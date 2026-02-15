import { create } from 'zustand';
import type { RiskLevel, CrisisEvent } from '@/types';
import { generateId } from '@/utils/helpers';

/**
 * 危机状态类型
 */
export interface CrisisState {
  // 当前风险等级
  riskLevel: RiskLevel;

  // 是否触发危机模式
  isTriggered: boolean;

  // 干预倒计时（秒）
  countdown: number;

  // 危机事件历史
  crisisHistory: CrisisEvent[];

  // 上次检测文本
  lastTriggerText: string;

  // 操作方法
  detectRisk: (text: string) => RiskLevel;
  triggerCrisis: (triggerText: string) => void;
  dismissCrisis: () => void;
  resetCrisis: () => void;
  decrementCountdown: () => void;
}

/**
 * 红色预警关键词
 */
const RED_KEYWORDS = [
  '不想活了',
  '活着没意义',
  '自杀',
  '自残',
  '解脱',
  '一了百了',
  '死了算了',
  '太累了',
  '结束一切',
  '不想活了',
];

/**
 * 黄色预警关键词
 */
const YELLOW_KEYWORDS = [
  '崩溃',
  '失控',
  '活不下去',
  '没办法',
  '控制不住',
  '太痛苦了',
  '撑不住了',
  '想死',
  '活够了',
  '没有意义',
];

/**
 * 危机状态管理 Store
 */
export const useCrisisStore = create<CrisisState>((set, get) => ({
  // 初始状态
  riskLevel: 'low',
  isTriggered: false,
  countdown: 180, // 3分钟
  crisisHistory: [],
  lastTriggerText: '',

  // 检测风险等级
  detectRisk: (text: string) => {
    const lowerText = text.toLowerCase();

    // 检查红色关键词
    const hasRed = RED_KEYWORDS.some((keyword) =>
      lowerText.includes(keyword.toLowerCase())
    );

    if (hasRed) {
      return 'high';
    }

    // 检查黄色关键词
    const hasYellow = YELLOW_KEYWORDS.some((keyword) =>
      lowerText.includes(keyword.toLowerCase())
    );

    if (hasYellow) {
      return 'medium';
    }

    return 'low';
  },

  // 触发危机模式
  triggerCrisis: (triggerText: string) => {
    const { crisisHistory, riskLevel } = get();

    // 创建危机事件记录
    const event: CrisisEvent = {
      id: generateId('crisis'),
      sessionId: generateId('session'), // 简化处理
      timestamp: new Date().toISOString(),
      level: riskLevel,
      triggerText,
      resolved: false,
    };

    set({
      riskLevel: 'high',
      isTriggered: true,
      countdown: 180, // 重置倒计时
      crisisHistory: [event, ...crisisHistory],
      lastTriggerText: triggerText,
    });

    // 播放警示音
    playAlertSound();

    // 记录日志
    console.warn('[Crisis] 危机触发:', {
      level: 'high',
      triggerText,
      timestamp: event.timestamp,
    });
  },

  // 解除危机模式
  dismissCrisis: () => {
    const { crisisHistory, lastTriggerText } = get();

    // 标记最后一条为已解决
    if (crisisHistory.length > 0) {
      const updatedHistory = [
        {
          ...crisisHistory[0],
          resolved: true,
        },
        ...crisisHistory.slice(1),
      ];

      set({
        crisisHistory: updatedHistory,
      });
    }

    set({
      riskLevel: 'low',
      isTriggered: false,
      countdown: 180,
      lastTriggerText: '',
    });
  },

  // 重置危机状态
  resetCrisis: () => {
    set({
      riskLevel: 'low',
      isTriggered: false,
      countdown: 180,
      lastTriggerText: '',
    });
  },

  // 倒计时递减
  decrementCountdown: () => {
    const { countdown, isTriggered } = get();

    if (isTriggered && countdown > 0) {
      set({ countdown: countdown - 1 });
    }

    if (countdown === 1) {
      // 倒计时结束自动解除
      get().dismissCrisis();
    }
  },
}));

/**
 * 播放警示音
 */
function playAlertSound() {
  try {
    const audio = new Audio('/sounds/crisis-alert.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // 如果无法播放，不影响流程
      console.log('[Crisis] 无法播放警示音');
    });
  } catch {
    console.log('[Crisis] 警示音不可用');
  }
}

/**
 * 检测是否需要干预的便捷函数
 */
export function shouldTriggerIntervention(text: string): boolean {
  const lowerText = text.toLowerCase();
  return RED_KEYWORDS.some((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  );
}

/**
 * 获取紧急联系人列表
 */
export function getEmergencyContacts() {
  return [
    {
      name: '急救电话',
      phone: '120',
      description: '24小时急救',
      icon: '🚑',
      action: 'tel:120',
    },
    {
      name: '心理危机热线',
      phone: '400-161-9995',
      description: '24小时免费',
      icon: '📞',
      action: 'tel:4001619995',
    },
    {
      name: '北京心理危机干预中心',
      phone: '010-82951332',
      description: '24小时',
      icon: '🏥',
      action: 'tel:01082951332',
    },
    {
      name: '上海心理援助热线',
      phone: '021-12320-5',
      description: '24小时',
      icon: '📱',
      action: 'tel:021123205',
    },
  ];
}
