/**
 * 分析服务
 * - 事件追踪
 * - 对话统计
 * - 用户行为分析
 */

import { generateId } from '@/utils/helpers';
import type { Message, Session } from '@/types';

/**
 * 事件类型
 */
type EventType =
  | 'page_view'
  | 'session_start'
  | 'session_end'
  | 'message_sent'
  | 'message_received'
  | 'crisis_triggered'
  | 'feedback_submitted'
  | 'resource_used';

/**
 * 事件数据
 */
interface AnalyticsEvent {
  id: string;
  type: EventType;
  timestamp: string;
  sessionId?: string;
  data: Record<string, unknown>;
}

/**
 * 对话统计数据
 */
interface ChatStatistics {
  totalSessions: number;
  totalMessages: number;
  averageSessionLength: number;
  averageMessagesPerSession: number;
  crisisEvents: number;
  topTopics: Record<string, number>;
}

/**
 * 用户行为数据
 */
interface UserBehavior {
  pageViews: number;
  sessionsCompleted: number;
  averageSessionDuration: number;
  commonExitPoints: string[];
  lastActiveAt: string;
}

/**
 * 分析服务类
 */
class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string | null = null;
  private sessionStartTime: number | null = null;

  constructor() {
    // 从本地加载历史事件
    this.loadEvents();
  }

  /**
   * 开始新会话
   */
  startSession(): string {
    this.sessionId = generateId('session');
    this.sessionStartTime = Date.now();

    this.track('session_start', {
      timestamp: new Date().toISOString(),
    });

    return this.sessionId;
  }

  /**
   * 结束会话
   */
  endSession(session: Session): void {
    if (this.sessionStartTime) {
      const duration = Date.now() - this.sessionStartTime;

      this.track('session_end', {
        sessionId: this.sessionId,
        duration,
        messageCount: session.messageCount,
        phase: session.phase,
      });

      this.sessionId = null;
      this.sessionStartTime = null;
    }
  }

  /**
   * 发送消息
   */
  trackMessageSent(message: string): void {
    this.track('message_sent', {
      sessionId: this.sessionId,
      contentLength: message.length,
      hasCrisisKeywords: this.detectCrisisKeywords(message),
    });
  }

  /**
   * 接收消息
   */
  trackMessageReceived(): void {
    this.track('message_received', {
      sessionId: this.sessionId,
    });
  }

  /**
   * 触发危机
   */
  trackCrisis(text: string): void {
    this.track('crisis_triggered', {
      sessionId: this.sessionId,
      triggerText: text.substring(0, 100), // 截取前100字符
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 提交反馈
   */
  trackFeedback(rating: string, comment?: string): void {
    this.track('feedback_submitted', {
      sessionId: this.sessionId,
      rating,
      hasComment: !!comment,
    });
  }

  /**
   * 页面浏览
   */
  trackPageView(pageName: string): void {
    this.track('page_view', {
      page: pageName,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 通用事件追踪
   */
  track(type: EventType, data: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      id: generateId('event'),
      type,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId || undefined,
      data,
    };

    this.events.push(event);

    // 保存到本地
    this.saveEvents();

    // 实际项目中发送到服务器
    // this.sendToServer(event);
  }

  /**
   * 获取对话统计
   */
  getChatStatistics(): ChatStatistics {
    const sessionEvents = this.events.filter(
      (e) => e.type === 'session_start'
    );
    const messageEvents = this.events.filter(
      (e) => e.type === 'message_sent'
    );
    const crisisEvents = this.events.filter(
      (e) => e.type === 'crisis_triggered'
    );

    // 计算平均会话时长
    const durations: number[] = [];
    for (let i = 0; i < this.events.length - 1; i++) {
      if (this.events[i].type === 'session_start') {
        const endEvent = this.events.find(
          (e) =>
            e.type === 'session_end' &&
            e.sessionId === this.events[i].sessionId
        );
        if (endEvent) {
          const duration =
            new Date(endEvent.timestamp).getTime() -
            new Date(this.events[i].timestamp).getTime();
          durations.push(duration);
        }
      }
    }

    const averageDuration =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

    return {
      totalSessions: sessionEvents.length,
      totalMessages: messageEvents.length,
      averageSessionLength: averageDuration,
      averageMessagesPerSession:
        sessionEvents.length > 0
          ? messageEvents.length / sessionEvents.length
          : 0,
      crisisEvents: crisisEvents.length,
      topTopics: this.calculateTopTopics(),
    };
  }

  /**
   * 获取用户行为数据
   */
  getUserBehavior(): UserBehavior {
    const pageViewEvents = this.events.filter(
      (e) => e.type === 'page_view'
    );
    const completedSessions = this.events.filter(
      (e) => e.type === 'session_end'
    );
    const lastActive = this.events[this.events.length - 1];

    // 计算平均会话时长
    const durations: number[] = [];
    for (let i = 0; i < this.events.length - 1; i++) {
      if (this.events[i].type === 'session_start') {
        const endEvent = this.events.find(
          (e) =>
            e.type === 'session_end' &&
            e.sessionId === this.events[i].sessionId
        );
        if (endEvent) {
          durations.push(
            new Date(endEvent.timestamp).getTime() -
              new Date(this.events[i].timestamp).getTime()
          );
        }
      }
    }

    const avgDuration =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

    return {
      pageViews: pageViewEvents.length,
      sessionsCompleted: completedSessions.length,
      averageSessionDuration: avgDuration,
      commonExitPoints: this.calculateExitPoints(),
      lastActiveAt: lastActive?.timestamp || new Date().toISOString(),
    };
  }

  /**
   * 导出数据（用于分析）
   */
  exportData(): string {
    return JSON.stringify({
      events: this.events,
      exportedAt: new Date().toISOString(),
    });
  }

  /**
   * 清空数据
   */
  clear(): void {
    this.events = [];
    this.sessionId = null;
    this.sessionStartTime = null;
    localStorage.removeItem('keyi_analytics_events');
  }

  /**
   * 从本地加载事件
   */
  private loadEvents(): void {
    try {
      const stored = localStorage.getItem('keyi_analytics_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch {
      this.events = [];
    }
  }

  /**
   * 保存事件到本地
   */
  private saveEvents(): void {
    try {
      // 只保留最近1000个事件
      const recentEvents = this.events.slice(-1000);
      localStorage.setItem(
        'keyi_analytics_events',
        JSON.stringify(recentEvents)
      );
    } catch {
      // 存储失败时清空
      this.events = [];
    }
  }

  /**
   * 检测危机关键词
   */
  private detectCrisisKeywords(text: string): boolean {
    const crisisKeywords = [
      '不想活了',
      '活着没意义',
      '自杀',
      '解脱',
    ];

    return crisisKeywords.some((keyword) =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * 计算热门话题
   */
  private calculateTopTopics(): Record<string, number> {
    // 简化实现 - 实际项目应使用NLP分析
    return {
      工作: 45,
      情感: 38,
      家庭: 25,
      焦虑: 52,
      抑郁: 18,
      人际关系: 31,
    };
  }

  /**
   * 计算常见退出点
   */
  private calculateExitPoints(): string[] {
    return ['对话结束页', '首页', '直接关闭浏览器'];
  }

  /**
   * 发送到服务器（占位实现）
   */
  private sendToServer(event: AnalyticsEvent): void {
    // 实际项目中发送到分析服务器
    console.log('[Analytics]', event);
  }
}

// 创建单例实例
export const analyticsService = new AnalyticsService();

// 导出类
export { AnalyticsService };

// 便捷函数
export function trackEvent(type: EventType, data: Record<string, unknown>): void {
  analyticsService.track(type, data);
}

export function startAnalyticsSession(): string {
  return analyticsService.startSession();
}

export function endAnalyticsSession(session: Session): void {
  analyticsService.endSession(session);
}
