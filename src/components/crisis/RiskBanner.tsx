import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { RiskLevel } from '@/types';
import { cn } from '@/utils/helpers';

interface RiskBannerProps {
  level: RiskLevel;
  onDismiss: () => void;
}

/**
 * 风险提示条
 * - 根据风险等级显示不同颜色
 * - 自动隐藏
 */
export function RiskBanner({ level, onDismiss }: RiskBannerProps) {
  const [isVisible, setIsVisible] = useState(level !== 'low');

  useEffect(() => {
    if (level !== 'low') {
      setIsVisible(true);
    }
  }, [level]);

  if (level === 'low') return null;

  const config = {
    medium: {
      icon: '⚠️',
      bg: 'bg-warning-50',
      border: 'border-warning-200',
      text: 'text-warning-700',
      title: '我注意到你提到了一些让人担心的事',
    },
    high: {
      icon: '🆘',
      bg: 'bg-danger-50',
      border: 'border-danger-200',
      text: 'text-danger-700',
      title: '我非常担心你的安全',
    },
  };

  const currentConfig = config[level];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'border-b',
            currentConfig.bg,
            currentConfig.border
          )}
        >
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <span className="text-xl">{currentConfig.icon}</span>
            <p
              className={cn(
                'flex-1 text-sm font-medium',
                currentConfig.text
              )}
            >
              {currentConfig.title}
            </p>
            <button
              onClick={() => {
                setIsVisible(false);
                onDismiss();
              }}
              className={cn(
                'p-1 rounded-full hover:bg-white/50 transition-colors',
                currentConfig.text
              )}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
