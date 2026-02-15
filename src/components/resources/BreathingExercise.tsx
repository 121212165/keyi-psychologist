import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 呼吸练习阶段
 */
type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

/**
 * 呼吸练习配置
 */
interface BreathingConfig {
  inhaleDuration: number;
  holdDuration: number;
  exhaleDuration: number;
  cycles: number;
}

/**
 * 默认配置 - 4-7-8 呼吸法
 */
const defaultConfig: BreathingConfig = {
  inhaleDuration: 4000,
  holdDuration: 7000,
  exhaleDuration: 8000,
  cycles: 3,
};

/**
 * 呼吸练习组件
 */
interface BreathingExerciseProps {
  config?: Partial<BreathingConfig>;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function BreathingExercise({
  config = {},
  onComplete,
  onCancel,
}: BreathingExerciseProps) {
  const mergedConfig = { ...defaultConfig, ...config };

  const [phase, setPhase] = useState<BreathingPhase>('idle');
  const [isActive, setIsActive] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 开始练习
  const start = useCallback(() => {
    setIsActive(true);
    setCycle(0);
    setPhase('inhale');
  }, []);

  // 停止练习
  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsActive(false);
    setPhase('idle');
    setProgress(0);
    onCancel?.();
  }, [onCancel]);

  // 练习完成
  const complete = useCallback(() => {
    setIsActive(false);
    setPhase('idle');
    setProgress(0);
    onComplete?.();
  }, [onComplete]);

  // 呼吸循环
  useEffect(() => {
    if (!isActive) return;

    const runCycle = async () => {
      for (let i = 0; i < mergedConfig.cycles; i++) {
        await animatePhase('inhale', mergedConfig.inhaleDuration);
        setCycle(i + 1);
        await animatePhase('hold', mergedConfig.holdDuration);
        await animatePhase('exhale', mergedConfig.exhaleDuration);
      }
      complete();
    };

    runCycle();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, mergedConfig, complete]);

  // 阶段性动画
  const animatePhase = (
    targetPhase: BreathingPhase,
    duration: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      setPhase(targetPhase);

      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progressValue = Math.min(elapsed / duration, 1);
        setProgress(progressValue);

        if (elapsed < duration) {
          timeoutRef.current = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  };

  // 圆形缩放比例
  const getScale = () => {
    if (phase === 'idle') return 1;
    if (phase === 'inhale') return 1 + progress * 0.5;
    if (phase === 'hold') return 1.5;
    if (phase === 'exhale') return 1.5 - progress * 0.5;
    return 1;
  };

  // 获取阶段文字
  const getPhaseText = () => {
    switch (phase) {
      case 'idle': return '准备';
      case 'inhale': return '吸气';
      case 'hold': return '屏住';
      case 'exhale': return '呼气';
    }
  };

  // 获取提示文字
  const getHintText = () => {
    switch (phase) {
      case 'idle': return '准备好了吗？';
      case 'inhale': return `${Math.ceil(mergedConfig.inhaleDuration / 1000)} 秒...`;
      case 'hold': return `${Math.ceil(mergedConfig.holdDuration / 1000)} 秒...`;
      case 'exhale': return `${Math.ceil(mergedConfig.exhaleDuration / 1000)} 秒...`;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* 圆形动画 */}
      <div className="relative mb-8">
        <motion.div
          className="w-48 h-48 rounded-full bg-primary-100"
          animate={{
            scale: getScale() * 1.2,
            opacity: phase === 'idle' ? 0.5 : 1,
          }}
          transition={{ duration: 0.3 }}
        />

        <motion.div
          className="absolute inset-4 rounded-full bg-primary-200 flex items-center justify-center"
          animate={{ scale: getScale() }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <p className="text-2xl font-medium text-primary-700">
                {getPhaseText()}
              </p>
              <p className="text-sm text-primary-500 mt-1">
                {getHintText()}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {phase !== 'idle' && (
          <svg className="absolute inset-0 w-48 h-48 -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="92"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-primary-300"
              strokeDasharray={579}
              strokeDashoffset={579 * (1 - progress)}
            />
          </svg>
        )}
      </div>

      {isActive && (
        <p className="text-sm text-warm-500 mb-6">
          第 {cycle} / {mergedConfig.cycles} 轮
        </p>
      )}

      <div className="flex gap-4">
        {!isActive ? (
          <>
            <button
              onClick={start}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              开始练习
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-warm-200 text-warm-700 rounded-xl font-medium hover:bg-warm-300 transition-colors"
              >
                跳过
              </button>
            )}
          </>
        ) : (
          <button
            onClick={stop}
            className="px-6 py-3 bg-warm-200 text-warm-700 rounded-xl font-medium hover:bg-warm-300 transition-colors"
          >
            停止
          </button>
        )}
      </div>

      <p className="text-xs text-warm-400 mt-6 text-center max-w-xs">
        4-7-8 呼吸法可以帮助放松身心，缓解焦虑。
      </p>
    </div>
  );
}

/**
 * 快速呼吸练习
 */
export function QuickBreathing({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm hover:bg-primary-100 transition-colors"
      >
        <span>🫁</span>
        <span>试试呼吸练习</span>
      </button>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl border border-primary-100">
      <BreathingExercise
        config={{ cycles: 1 }}
        onComplete={() => {
          setIsVisible(false);
          onComplete?.();
        }}
        onCancel={() => setIsVisible(false)}
      />
    </div>
  );
}
