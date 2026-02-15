import { useEffect, useCallback, useRef } from 'react';
import {
  useChatStore,
  useCrisisStore,
  useUserStore,
  determinePhase,
  shouldTriggerIntervention,
  getEmergencyContacts,
} from '@/stores';
import { generateId } from '@/utils/helpers';
import type { Message, AIResponse } from '@/types';

/**
 * 对话自定义 Hook
 */
export function useChat() {
  const chatStore = useChatStore();
  const crisisStore = useCrisisStore();
  const userStore = useUserStore();

  // 滚动到底部 ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [chatStore.messages.length, chatStore.isTyping]);

  // 初始化会话
  const startSession = useCallback(() => {
    chatStore.startSession();
  }, [chatStore]);

  // 发送消息
  const sendMessage = useCallback(
    async (content: string) => {
      // 1. 检测危机
      const riskLevel = crisisStore.detectRisk(content);
      const isCrisis = shouldTriggerIntervention(content);

      if (isCrisis) {
        crisisStore.triggerCrisis(content);
        return;
      }

      // 2. 添加用户消息
      chatStore.addUserMessage(content);

      // 3. 设置打字状态
      chatStore.setTyping(true);

      try {
        // 4. 调用AI响应（实际项目中替换为真实API）
        const response = await mockAIResponse(content, {
          phase: chatStore.phase,
          messageCount: chatStore.currentSession?.messageCount || 0,
          userName: userStore.user?.name || '',
        });

        // 5. 更新阶段
        const newPhase = determinePhase(
          (chatStore.currentSession?.messageCount || 0) + 1
        );

        // 6. 添加AI消息
        chatStore.setAIResponse({
          ...response,
          newPhase,
          riskLevel,
        });

        // 7. 如果风险等级变化，更新危机状态
        if (riskLevel !== crisisStore.riskLevel) {
          // 这里可以根据需要更新危机状态
        }
      } catch (error) {
        console.error('AI响应失败:', error);
        chatStore.setAIResponse({
          content: '抱歉，我现在有点不在状态，请再说一次？',
        });
      }
    },
    [chatStore, crisisStore, userStore]
  );

  // 结束对话
  const endSession = useCallback(() => {
    chatStore.endSession();
  }, [chatStore]);

  // 重置对话
  const resetChat = useCallback(() => {
    chatStore.resetChat();
    crisisStore.resetCrisis();
  }, [chatStore, crisisStore]);

  return {
    // 状态
    messages: chatStore.messages,
    isTyping: chatStore.isTyping,
    phase: chatStore.phase,
    currentSession: chatStore.currentSession,
    sessionHistory: chatStore.sessionHistory,
    riskLevel: crisisStore.riskLevel,
    isCrisisTriggered: crisisStore.isTriggered,
    countdown: crisisStore.countdown,

    // 方法
    startSession,
    sendMessage,
    endSession,
    resetChat,

    // Ref
    messagesEndRef,

    // 工具
    getEmergencyContacts,
  };
}

/**
 * 模拟AI响应（实际项目中替换为真实API调用）
 */
async function mockAIResponse(
  userMessage: string,
  context: {
    phase: string;
    messageCount: number;
    userName: string;
  }
): Promise<AIResponse> {
  // 模拟网络延迟
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 1000)
  );

  const lowerMessage = userMessage.toLowerCase();

  // 根据关键词返回不同响应
  if (
    lowerMessage.includes('焦虑') ||
    lowerMessage.includes('紧张')
  ) {
    return {
      content:
        '嗯，我听到你说自己有点焦虑。\n\n这种感觉确实不好受。\n\n能说说是什么让你感到焦虑吗？',
      newPhase: 'exploring',
    };
  }

  if (
    lowerMessage.includes('难过') ||
    lowerMessage.includes('伤心')
  ) {
    return {
      content:
        '听起来你现在很难过。\n\n谢谢你愿意告诉我。\n\n如果想说的话，我在这里听着。',
      newPhase: 'listening',
    };
  }

  if (
    lowerMessage.includes('工作') ||
    lowerMessage.includes('上班')
  ) {
    return {
      content:
        '工作上的事情确实会让人很有压力。\n\n方便说说是什么让你感到困扰吗？',
      newPhase: 'exploring',
    };
  }

  if (lowerMessage.includes('谢谢') || lowerMessage.includes('再见')) {
    return {
      content: '不客气。记住，任何时候想聊天，我都在这里。',
      newPhase: 'closing',
    };
  }

  // 默认回应
  return {
    content: '嗯，我听到了。\n\n谢谢你愿意分享这些。\n\n你继续说，我在这里陪着你。',
    newPhase: determinePhase(context.messageCount + 1),
  };
}

/**
 * 用户自定义 Hook
 */
export function useUser() {
  const userStore = useUserStore();

  const setUserName = useCallback(
    (name: string) => {
      userStore.setUserName(name);
    },
    [userStore]
  );

  const agreeToTerms = useCallback(() => {
    userStore.agreeToTerms();
  }, [userStore]);

  const updatePreferences = useCallback(
    (prefs: Partial<typeof userStore.preferences>) => {
      userStore.updatePreferences(prefs);
    },
    [userStore]
  );

  const addMood = useCallback(
    (mood: { mood: string; note?: string }) => {
      userStore.addMoodEntry(mood as any);
    },
    [userStore]
  );

  return {
    user: userStore.user,
    preferences: userStore.preferences,
    moodHistory: userStore.moodHistory,
    setUserName,
    agreeToTerms,
    updatePreferences,
    addMood,
  };
}

/**
 * 危机自定义 Hook
 */
export function useCrisis() {
  const crisisStore = useCrisisStore();

  const detect = useCallback(
    (text: string) => {
      return crisisStore.detectRisk(text);
    },
    [crisisStore]
  );

  const trigger = useCallback(
    (text: string) => {
      crisisStore.triggerCrisis(text);
    },
    [crisisStore]
  );

  const dismiss = useCallback(() => {
    crisisStore.dismissCrisis();
  }, [crisisStore]);

  const reset = useCallback(() => {
    crisisStore.resetCrisis();
  }, [crisisStore]);

  return {
    riskLevel: crisisStore.riskLevel,
    isTriggered: crisisStore.isTriggered,
    countdown: crisisStore.countdown,
    crisisHistory: crisisStore.crisisHistory,
    detect,
    trigger,
    dismiss,
    reset,
    getEmergencyContacts,
  };
}
