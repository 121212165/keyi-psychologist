import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helpers';

/**
 * 着陆练习步骤
 */
interface GroundingStep {
  label: string;
  icon: string;
  items: string[];
  color: {
    bg: string;
    border: string;
    text: string;
  };
}

/**
 * 着陆练习步骤配置
 */
const defaultSteps: GroundingStep[] = [
  {
    label: '看到的',
    icon: '👁️',
    items: ['5个你能看到的东西'],
    color: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  },
  {
    label: '触摸的',
    icon: '✋',
    items: ['4个你能触摸到的东西'],
    color: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  },
  {
    label: '听到的',
    icon: '👂',
    items: ['3个你能听到的声音'],
    color: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  },
  {
    label: '闻到的',
    icon: '👃',
    items: ['2个你能闻到的气味'],
    color: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  },
  {
    label: '感受',
    icon: '💭',
    items: ['1个你现在的感受'],
    color: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  },
];

/**
 * 着陆练习组件 (5-4-3-2-1 技术)
 */
interface GroundingExerciseProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function GroundingExercise({
  onComplete,
  onCancel,
}: GroundingExerciseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [userInput, setUserInput] = useState('');

  const step = defaultSteps[currentStep];
  const isLastStep = currentStep === defaultSteps.length - 1;

  // 完成当前步骤
  const completeStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep(currentStep + 1);
      setUserInput('');
    }
  };

  // 跳过当前步骤
  const skipStep = () => {
    if (isLastStep) {
      onCancel?.();
    } else {
      setCurrentStep(currentStep + 1);
      setUserInput('');
    }
  };

  // 重置练习
  const reset = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setUserInput('');
  };

  return (
    <div className="max-w-md mx-auto">
      {/* 进度指示器 */}
      <div className="flex justify-between mb-6 px-2">
        {defaultSteps.map((s, index) => (
          <div
            key={index}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
              completedSteps.includes(index)
                ? 'bg-primary-500 text-white'
                : index === currentStep
                ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-300'
                : 'bg-warm-100 text-warm-400'
            )}
          >
            {completedSteps.includes(index) ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              index + 1
            )}
          </div>
        ))}
      </div>

      {/* 当前步骤内容 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className={cn(
            'p-6 rounded-2xl border-2 mb-6',
            step.color.bg,
            step.color.border
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{step.icon}</span>
            <h3 className={cn('text-xl font-medium', step.color.text)}>
              {step.label}
            </h3>
          </div>

          <p className="text-warm-600 mb-4">
            {step.items[0]}，然后慢慢告诉我你注意到了什么。
          </p>

          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="在这里写下你注意到的事物..."
            className="w-full p-3 bg-white rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
            rows={3}
          />
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3">
        <button
          onClick={completeStep}
          className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
        >
          {isLastStep ? '完成' : '继续'}
        </button>

        <button
          onClick={skipStep}
          className="px-4 py-3 bg-warm-100 text-warm-600 rounded-xl font-medium hover:bg-warm-200 transition-colors"
        >
          {isLastStep ? '跳过' : '跳过'}
        </button>
      </div>

      {completedSteps.length > 0 && (
        <button
          onClick={reset}
          className="w-full mt-4 text-sm text-warm-400 hover:text-warm-600 transition-colors"
        >
          重新开始
        </button>
      )}

      <p className="text-xs text-warm-400 mt-6 text-center">
        着陆技术可以帮助你从焦虑中平静下来，回到当下。
      </p>
    </div>
  );
}

/**
 * 快速着陆练习
 */
export function QuickGrounding({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors"
      >
        <span>🌿</span>
        <span>试试着陆练习</span>
      </button>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl border border-green-100">
      <GroundingExercise
        onComplete={() => {
          setIsVisible(false);
          onComplete?.();
        }}
        onCancel={() => setIsVisible(false)}
      />
    </div>
  );
}
