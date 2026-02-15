/**
 * 对话阶段类型
 */
export type SessionPhase =
  | 'greeting'      // 问候阶段
  | 'listening'     // 倾听阶段
  | 'exploring'     // 探索阶段
  | 'guiding'       // 引导阶段
  | 'intervention'   // 干预阶段
  | 'closing';       // 结束阶段

/**
 * 风险等级类型
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * 消息类型
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  typing?: boolean;
  metadata?: {
    phase?: SessionPhase;
    riskLevel?: RiskLevel;
  };
}

/**
 * 用户类型
 */
export interface User {
  id: string;
  name: string;
  agreedToTerms: boolean;
  createdAt: string;
  totalSessions: number;
  preferences: UserPreferences;
}

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  notifications: boolean;
  soundEnabled: boolean;
  autoTyping: boolean;
}

/**
 * 对话会话类型
 */
export interface Session {
  id: string;
  startTime: string;
  endTime?: string;
  phase: SessionPhase;
  riskLevel: RiskLevel;
  messageCount: number;
  feedback?: SessionFeedback;
}

/**
 * 对话反馈类型
 */
export interface SessionFeedback {
  rating: 'A' | 'B' | 'C' | 'D';
  comment?: string;
  submittedAt: string;
}

/**
 * 危机事件类型
 */
export interface CrisisEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  level: RiskLevel;
  triggerText: string;
  resolved: boolean;
}

/**
 * 情绪类型
 */
export type MoodType =
  | 'happy'
  | 'calm'
  | 'neutral'
  | 'anxious'
  | 'sad'
  | 'angry'
  | 'overwhelmed';

/**
 * 情绪记录类型
 */
export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodType;
  note?: string;
}

/**
 * AI响应类型
 */
export interface AIResponse {
  content: string;
  newPhase?: SessionPhase;
  riskLevel?: RiskLevel;
  suggestedActions?: string[];
}
