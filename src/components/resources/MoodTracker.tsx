import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/hooks';
import { cn } from '@/utils/helpers';

/**
 * 情绪类型
 */
type MoodType =
  | 'happy'
  | 'calm'
  | 'neutral'
  | 'anxious'
  | 'sad'
  | 'angry'
  | 'overwhelmed';

/**
 * 情绪配置
 */
const moodConfig: Record<
  MoodType,
  { emoji: string; label: string; color: string; bg: string }
> = {
  happy: {
    emoji: '😊',
    label: '开心',
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
  },
  calm: {
    emoji: '😌',
    label: '平静',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
  },
  neutral: {
    emoji: '😐',
    label: '一般',
    color: 'text-warm-600',
    bg: 'bg-warm-50 border-warm-200',
  },
  anxious: {
    emoji: '😰',
    label: '焦虑',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-200',
  },
  sad: {
    emoji: '😔',
    label: '难过',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-200',
  },
  angry: {
    emoji: '😤',
    label: '生气',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
  },
  overwhelmed: {
    emoji: '😵',
    label: '疲惫',
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
  },
};

/**
 * 情绪日记组件
 */
interface MoodTrackerProps {
  onSave?: (entry: { mood: MoodType; note: string }) => void;
}

export function MoodTracker({ onSave }: MoodTrackerProps) {
  const { addMood, moodHistory } = useUser();

  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // 保存记录
  const handleSave = () => {
    if (!selectedMood) return;

    addMood({
      mood: selectedMood,
      note: note || undefined,
    });

    setIsSaved(true);
    setIsExpanded(false);

    // 重置状态
    setTimeout(() => {
      setIsSaved(false);
      setSelectedMood(null);
      setNote('');
    }, 2000);

    onSave?.({ mood: selectedMood, note });
  };

  // 取消
  const handleCancel = () => {
    setIsExpanded(false);
    setSelectedMood(null);
    setNote('');
  };

  // 紧凑模式显示
  if (!isExpanded) {
    return (
      <div className="p-4 bg-white rounded-2xl border border-warm-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-warm-800">今天感觉如何？</h3>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-primary-600 text-sm font-medium"
          >
            记录 →
          </button>
        </div>

        {/* 快速选择 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(moodConfig) as MoodType[]).slice(0, 5).map((mood) => (
            <button
              key={mood}
              onClick={() => {
                setSelectedMood(mood);
                setIsExpanded(true);
              }}
              className={cn(
                'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-transform hover:scale-110',
                moodConfig[mood].bg
              )}
              title={moodConfig[mood].label}
            >
              {moodConfig[mood].emoji}
            </button>
          ))}
        </div>

        {/* 已保存提示 */}
        <AnimatePresence>
          {isSaved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 p-3 bg-green-50 rounded-xl text-center"
            >
              <span className="text-green-600 text-sm">
                已记录今天的情绪 ✓
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 展开模式
  return (
    <div className="p-6 bg-white rounded-2xl border border-warm-100">
      <h3 className="font-medium text-warm-800 mb-4">记录今天的情绪</h3>

      {/* 情绪选择 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(Object.keys(moodConfig) as MoodType[]).map((mood) => (
          <button
            key={mood}
            onClick={() => setSelectedMood(mood)}
            className={cn(
              'p-3 rounded-xl flex flex-col items-center gap-2 transition-all',
              moodConfig[mood].bg,
              selectedMood === mood && 'ring-2 ring-primary-400 scale-105'
            )}
          >
            <span className="text-3xl">{moodConfig[mood].emoji}</span>
            <span className={cn('text-xs font-medium', moodConfig[mood].color)}>
              {moodConfig[mood].label}
            </span>
          </button>
        ))}
      </div>

      {/* 备注输入 */}
      {selectedMood && (
        <div className="mb-6">
          <label className="block text-sm text-warm-500 mb-2">
            想说什么？（可选）
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="今天发生了什么事..."
            rows={3}
            className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
          />
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={handleCancel}
          className="flex-1 py-3 bg-warm-100 text-warm-600 rounded-xl font-medium hover:bg-warm-200 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={!selectedMood}
          className={cn(
            'flex-1 py-3 rounded-xl font-medium transition-colors',
            selectedMood
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-warm-200 text-warm-400 cursor-not-allowed'
          )}
        >
          保存
        </button>
      </div>
    </div>
  );
}

/**
 * 历史记录组件
 */
export function MoodHistory({
  limit = 7,
}: {
  limit?: number;
}) {
  const { moodHistory } = useUser();

  if (moodHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="text-3xl mb-2 block">📊</span>
        <p className="text-warm-400 text-sm">还没有情绪记录</p>
      </div>
    );
  }

  const recentHistory = moodHistory.slice(0, limit);

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-warm-700 text-sm">最近记录</h4>
      <div className="space-y-2">
        {recentHistory.map((entry) => {
          const config = moodConfig[entry.mood as MoodType] || moodConfig.neutral;
          const date = new Date(entry.date);
          const timeStr = date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
          });

          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl"
            >
              <span className="text-2xl">{config.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-warm-700">
                  {config.label}
                </p>
                {entry.note && (
                  <p className="text-xs text-warm-400 truncate">
                    {entry.note}
                  </p>
                )}
              </div>
              <span className="text-xs text-warm-400">{timeStr}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
