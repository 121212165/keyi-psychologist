import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageBubble, WelcomeBubble, type Message } from '@/components/chat/MessageBubble';
import { InputArea, EndChatButton } from '@/components/chat/InputArea';
import { generateId } from '@/utils/helpers';
import { navigate } from '@/router';

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

      // 模拟AI响应（实际项目中这里会调用API）
      setTimeout(() => {
        const aiMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: generateAIResponse(content),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500 + Math.random() * 1000);
    },
    []
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

/**
 * 模拟AI响应（实际项目中替换为真实API调用）
 */
function generateAIResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // 简单关键词匹配
  if (
    lowerMessage.includes('焦虑') ||
    lowerMessage.includes('紧张')
  ) {
    return '嗯，我听到你说自己有点焦虑。\n\n这种感觉确实不好受。\n\n能说说是什么让你感到焦虑吗？';
  }

  if (
    lowerMessage.includes('难过') ||
    lowerMessage.includes('伤心')
  ) {
    return '听起来你现在很难过。\n\n谢谢你愿意告诉我。\n\n如果想说的话，我在这里听着。';
  }

  if (
    lowerMessage.includes('工作') ||
    lowerMessage.includes('上班')
  ) {
    return '工作上的事情确实会让人很有压力。\n\n方便说说是什么让你感到困扰吗？';
  }

  // 默认回应
  return '嗯，我听到了。\n\n谢谢你愿意分享这些。\n\n你继续说，我在这里陪着你。';
}
