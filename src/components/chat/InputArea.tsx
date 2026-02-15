import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helpers';

interface InputAreaProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * 对话输入区域组件
 */
export function InputArea({
  onSend,
  disabled = false,
  placeholder = '想说什么都可以...',
  autoFocus = false,
}: InputAreaProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动增长高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [value]);

  // 自动聚焦
  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  // 发送处理
  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
  };

  // 键盘事件
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 快捷短语
  const quickPhrases = [
    '我最近心情不太好',
    '想聊聊工作',
    '不知道从何说起',
    '有点焦虑',
  ];

  return (
    <div className="bg-white border-t border-warm-100 px-4 py-3">
      {/* 快捷短语 - 仅在没有文本时显示 */}
      <AnimatePresence>
        {!value.trim() && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide"
          >
            {quickPhrases.map((phrase) => (
              <button
                key={phrase}
                onClick={() => {
                  setValue(phrase);
                  textareaRef.current?.focus();
                }}
                className="flex-shrink-0 px-3 py-1.5 bg-warm-100 text-warm-600 text-sm rounded-full hover:bg-warm-200 transition-colors"
              >
                {phrase}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 输入框行 */}
      <div className="flex items-end gap-2">
        {/* 语音按钮（预留） */}
        <button
          disabled={disabled}
          className={cn(
            'p-3 rounded-full transition-colors',
            disabled
              ? 'bg-warm-100 text-warm-300'
              : 'bg-warm-100 text-warm-500 hover:bg-warm-200'
          )}
          aria-label="语音输入"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>

        {/* 输入框 */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full px-4 py-3 bg-warm-100 border-0 rounded-xl text-sm resize-none',
              'placeholder-warm-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'scrollbar-hide'
            )}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>

        {/* 发送按钮 */}
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className={cn(
            'p-3 rounded-full transition-all',
            value.trim() && !disabled
              ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
              : 'bg-warm-200 text-warm-400 cursor-not-allowed'
          )}
          aria-label="发送消息"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * 结束对话按钮
 */
export function EndChatButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'mx-auto mt-4 text-xs text-warm-400',
        'hover:text-warm-600 transition-colors',
        'disabled:opacity-50'
      )}
    >
      今天就到这里
    </motion.button>
  );
}
