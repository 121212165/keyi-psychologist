import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageBubble, WelcomeBubble, type Message } from '@/components/chat/MessageBubble';
import { InputArea, EndChatButton } from '@/components/chat/InputArea';
import { generateId } from '@/utils/helpers';
import { navigate } from '@/router';
import { aiService } from '@/services';
import { useChatStore, useCrisisStore } from '@/stores';

export default function ChatPage() {
  const isIntro = window.location.pathname === '/chat/intro';

  // 消息状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');

  // 对话是否结束
  const [isEnded, setIsEnded] = useState(false);

  // 滚动到底部
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取用户名
  useEffect(() => {
    const savedName = localStorage.getItem('keyi_user_name');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  // 欢迎消息
  useEffect(() => {
    if (isIntro) {
      setMessages([
        {
          id: generateId(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          typing: true,
        },
      ]);

      // 模拟打字效果
      const timer = setTimeout(() => {
        setMessages([
          {
            id: generateId(),
            role: 'assistant',
            content: userName
              ? `你好，${userName}。很高兴你来到这里。\n\n我是可意，你的AI陪伴助手。\n\n无论你现在想倾诉什么，或者只是想找人说说话，我都在。\n不用担心说错话，这里没有评判，只有理解。`
              : '你好，很高兴你来到这里。\n\n我是可意，你的AI陪伴助手。\n\n无论你现在想倾诉什么，或者只是想找人说说话，我都在。\n不用担心说错话，这里没有评判，只有理解。',
            timestamp: new Date(),
          },
        ]);
        // 移除 /chat/intro 前缀，进入正常对话
        navigate('/chat');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isIntro, userName]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSendMessage = useCallback(
    async (content: string) => {
      // 添加用户消息
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // 设置打字状态
      setIsTyping(true);

      try {
        // 获取AI响应
        const response = await aiService.getResponse(content, {
          messages: messages,
          phase: useChatStore.getState().phase,
          userName,
          messageCount: messages.length,
        });

        const aiMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        // 如果AI返回了新阶段，更新状态
        if (response.newPhase) {
          useChatStore.getState().setPhase(response.newPhase);
        }
      } catch (error) {
        console.error('获取AI响应失败:', error);
        // 失败时显示错误消息
        const errorMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: '抱歉，我现在有点不在状态，请再说一次？',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, userName]
  );

  // 结束对话
  const handleEndChat = () => {
    setIsEnded(true);
    navigate('/closing');
  };

  return (
    <div className="h-screen flex flex-col bg-primary-50">
      {/* 顶部栏 */}
      <header className="flex-shrink-0 px-4 py-3 bg-white border-b border-primary-100">
        <div className="flex items-center justify-center">
          <span className="text-warm-600 font-medium">可意</span>
        </div>
      </header>

      {/* 消息区域 */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* 欢迎消息 */}
          {isIntro && <WelcomeBubble name={userName} />}

          {/* 历史消息 */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* AI正在打字 */}
          {isTyping && (
            <MessageBubble
              message={{
                id: 'typing',
                role: 'assistant',
                content: '',
                timestamp: new Date(),
                typing: true,
              }}
            />
          )}

          {/* 结束对话按钮 */}
          {!isIntro && !isEnded && messages.length > 3 && (
            <EndChatButton onClick={handleEndChat} />
          )}

          {/* 滚动锚点 */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 输入区域 */}
      <footer className="flex-shrink-0">
        {!isEnded && <InputArea onSend={handleSendMessage} />}
      </footer>
    </div>
  );
}
