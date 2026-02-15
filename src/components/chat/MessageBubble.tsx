import { memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn, formatTime } from '@/utils/helpers';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  typing?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

/**
 * 消息气泡组件
 */
export const MessageBubble = memo(function MessageBubble({
  message,
  showAvatar = true,
  showTimestamp = true,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const bubbleRef = useRef<HTMLDivElement>(null);

  // 消息发送后滚动到可见位置
  useEffect(() => {
    bubbleRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [message.id]);

  return (
    <motion.div
      ref={bubbleRef}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('flex gap-3', isUser && 'flex-row-reverse')}
    >
      {/* 头像 */}
      {showAvatar && (
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            isUser ? 'bg-warm-200' : 'bg-primary-100'
          )}
        >
          {isUser ? (
            <span className="text-sm">👤</span>
          ) : (
            <span className="text-sm">🌿</span>
          )}
        </div>
      )}

      {/* 气泡 */}
      <div className={cn('max-w-[75%]', isUser ? 'text-right' : 'text-left')}>
        <div
          className={cn(
            'inline-block px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-warm-800 text-white rounded-tr-sm'
              : 'bg-white text-warm-700 border border-warm-100 rounded-tl-sm shadow-sm'
          )}
        >
          {message.typing ? (
            <TypingContent />
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}
        </div>

        {/* 时间戳 */}
        {showTimestamp && (
          <p className="text-xs text-warm-400 mt-1 px-1">
            {formatTime(message.timestamp)}
          </p>
        )}
      </div>
    </motion.div>
  );
});

/**
 * 打字中动画
 */
function TypingContent() {
  return (
    <div className="flex gap-1 items-center h-5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-warm-400 rounded-full"
          animate={{
            y: [0, -6, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

/**
 * 欢迎消息气泡 - 特殊样式
 */
export const WelcomeBubble = ({ name }: { name?: string }) => {
  const displayName = name || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex gap-3"
    >
      {/* AI 头像 */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
        <span className="text-sm">🌿</span>
      </div>

      {/* 气泡 */}
      <div className="max-w-[85%]">
        <div className="inline-block px-4 py-4 bg-white border border-warm-100 rounded-2xl rounded-tl-sm shadow-sm">
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-warm-700">
              {displayName ? (
                <>
                  你好，{displayName}。
                  很高兴你来到这里。
                </>
              ) : (
                '你好，很高兴你来到这里。'
              )}
            </p>
            <p className="text-sm leading-relaxed text-warm-700">
              我是可意，你的AI陪伴助手。
            </p>
            <p className="text-sm leading-relaxed text-warm-700">
              无论你现在想倾诉什么，或者只是想找人说说话，我都在。
              不用担心说错话，这里没有评判，只有理解。
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
