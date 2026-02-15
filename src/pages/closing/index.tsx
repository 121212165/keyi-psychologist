import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { cn } from '@/utils/helpers';
import { navigate } from '@/router';

export default function ClosingPage() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [customFeedback, setCustomFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnd = () => {
    if (showFeedback && !feedback) {
      setShowFeedback(true);
      return;
    }

    setIsSubmitting(true);

    // 保存反馈（实际项目中保存到服务器）
    const feedbackData = {
      rating: feedback,
      comment: customFeedback,
      timestamp: new Date().toISOString(),
    };
    console.log('保存反馈:', feedbackData);

    // 延迟后返回首页
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  const feedbackOptions = [
    { value: 'A', emoji: '😊', label: '好多了', desc: '压力明显减轻' },
    { value: 'B', emoji: '🙂', label: '好一些', desc: '有点帮助' },
    { value: 'C', emoji: '😐', label: '没变化', desc: '和之前差不多' },
    { value: 'D', emoji: '😔', label: '更糟了', desc: '感觉更差了' },
  ];

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      {/* 顶部占位 */}
      <header className="flex-shrink-0 px-4 py-3 bg-white border-b border-primary-100">
        <div className="flex items-center justify-center">
          <span className="text-warm-600 font-medium">可意</span>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-lg mx-auto space-y-8">
          <AnimatePresence mode="wait">
            {!showFeedback ? (
              // 结束确认
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <MessageBubble
                  message={{
                    id: 'closing-1',
                    role: 'assistant',
                    content: `今天谢谢你愿意分享这么多。\n我能感受到你的信任，这对我很重要。\n\n记住，任何时候想聊天，我都在这里。\n照顾好自己。`,
                    timestamp: new Date(),
                  }}
                />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="flex justify-center mt-8"
                >
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="text-warm-400 text-sm hover:text-warm-600 transition-colors"
                  >
                    今天的对话结束了
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              // 反馈收集
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <MessageBubble
                  message={{
                    id: 'feedback-question',
                    role: 'assistant',
                    content: '今天的对话对你有帮助吗？',
                    timestamp: new Date(),
                  }}
                />

                {/* 评分选项 */}
                <div className="grid grid-cols-2 gap-3">
                  {feedbackOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFeedback(option.value)}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all',
                        feedback === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-warm-100 hover:border-warm-200'
                      )}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <p className="font-medium text-warm-800 mt-1">
                        {option.label}
                      </p>
                      <p className="text-xs text-warm-500">{option.desc}</p>
                    </button>
                  ))}
                </div>

                {/* 可选反馈 */}
                <div>
                  <label className="block text-sm text-warm-500 mb-2">
                    有什么想对我说的吗？（可选）
                  </label>
                  <textarea
                    value={customFeedback}
                    onChange={(e) => setCustomFeedback(e.target.value)}
                    placeholder="任何建议或想法..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                {/* 结束按钮 */}
                <button
                  onClick={handleEnd}
                  disabled={isSubmitting}
                  className={cn(
                    'w-full py-4 bg-warm-800 text-white rounded-xl font-medium',
                    'disabled:opacity-50',
                    !isSubmitting && 'hover:bg-warm-700 transition-colors'
                  )}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      保存中...
                    </span>
                  ) : (
                    '结束对话'
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
