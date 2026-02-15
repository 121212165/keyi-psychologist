import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Message, SessionPhase, Session, AIResponse } from '@/types';
import { generateId } from '@/utils/helpers';

/**
 * 对话状态类型
 */
export interface ChatState {
  // 当前会话
  currentSession: Session | null;
  messages: Message[];
  isTyping: boolean;
  phase: SessionPhase;

  // 会话历史
  sessionHistory: Session[];

  // 操作方法
  startSession: () => void;
  endSession: () => void;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (content: string) => void;
  setTyping: (typing: boolean) => void;
  setPhase: (phase: SessionPhase) => void;
  setAIResponse: (response: AIResponse) => void;
  resetChat: () => void;
}

/**
 * 创建持久化存储
 */
const createPersistStorage = <T>() =>
  ({
    name: 'keyi-chat-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state: ChatState) => ({
      sessionHistory: state.sessionHistory,
      currentSession: state.currentSession,
    }),
  } as const);

/**
 * 对话状态管理 Store
 */
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentSession: null,
      messages: [],
      isTyping: false,
      phase: 'greeting',
      sessionHistory: [],

      // 开始新会话
      startSession: () => {
        const newSession: Session = {
          id: generateId('session'),
          startTime: new Date().toISOString(),
          phase: 'greeting',
          riskLevel: 'low',
          messageCount: 0,
        };

        set({
          currentSession: newSession,
          messages: [],
          isTyping: false,
          phase: 'greeting',
        });
      },

      // 结束当前会话
      endSession: () => {
        const { currentSession, sessionHistory } = get();

        if (currentSession) {
          const endedSession: Session = {
            ...currentSession,
            endTime: new Date().toISOString(),
          };

          set({
            currentSession: null,
            sessionHistory: [endedSession, ...sessionHistory],
          });
        }
      },

      // 添加用户消息
      addUserMessage: (content: string) => {
        const { currentSession, messages } = get();

        const userMessage: Message = {
          id: generateId('msg'),
          role: 'user',
          content,
          timestamp: new Date(),
        };

        set({
          messages: [...messages, userMessage],
          currentSession: currentSession
            ? {
                ...currentSession,
                messageCount: currentSession.messageCount + 1,
              }
            : null,
        });
      },

      // 添加AI消息
      addAssistantMessage: (content: string) => {
        const { messages } = get();

        const aiMessage: Message = {
          id: generateId('msg'),
          role: 'assistant',
          content,
          timestamp: new Date(),
        };

        set({
          messages: [...messages, aiMessage],
          isTyping: false,
        });
      },

      // 设置打字状态
      setTyping: (typing: boolean) => {
        set({ isTyping: typing });
      },

      // 设置当前阶段
      setPhase: (phase: SessionPhase) => {
        const { currentSession } = get();

        set({
          phase,
          currentSession: currentSession
            ? { ...currentSession, phase }
            : null,
        });
      },

      // 设置AI响应（包含阶段和风险更新）
      setAIResponse: (response: AIResponse) => {
        const { messages } = get();

        const aiMessage: Message = {
          id: generateId('msg'),
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          metadata: {
            phase: response.newPhase,
            riskLevel: response.riskLevel,
          },
        };

        set({
          messages: [...messages, aiMessage],
          isTyping: false,
          phase: response.newPhase || get().phase,
        });
      },

      // 重置对话
      resetChat: () => {
        set({
          currentSession: null,
          messages: [],
          isTyping: false,
          phase: 'greeting',
        });
      },
    }),
    createPersistStorage<ChatState>()
  )
);

/**
 * 对话阶段判断辅助函数
 */
export function determinePhase(messageCount: number): SessionPhase {
  if (messageCount < 3) return 'listening';
  if (messageCount < 8) return 'exploring';
  if (messageCount < 15) return 'guiding';
  if (messageCount < 25) return 'intervention';
  return 'closing';
}
