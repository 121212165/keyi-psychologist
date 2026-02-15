import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getEmergencyContacts } from '@/stores';
import { cn } from '@/utils/helpers';

interface CrisisModalProps {
  countdown: number;
  onClose: () => void;
}

/**
 * 危机干预弹窗
 * - 全屏显示
 * - 不可最小化
 * - 倒计时锁定
 */
export function CrisisModal({ countdown, onClose }: CrisisModalProps) {
  const [showContent, setShowContent] = useState(false);
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  // 延迟显示内容（等待动画）
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // 阻止 ESC 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const contacts = getEmergencyContacts();

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* 紧急警告头部 */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-red-500 text-white">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <span className="text-3xl">⚠️</span>
          </motion.div>
          <div>
            <h1 className="text-xl font-bold">紧急情况</h1>
            <p className="text-red-100 text-sm">请立即寻求帮助</p>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-lg mx-6 mt-20 text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <p className="text-white text-lg leading-relaxed">
            根据你描述的情况，我们非常担心你的安全。
            <br />
            这已经超出了我能帮助的范围。
          </p>

          {/* 求助资源 */}
          <div className="space-y-4">
            {contacts.map((contact, index) => (
              <motion.a
                key={contact.name}
                href={contact.action}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: showContent ? 1 : 0,
                  x: showContent ? 0 : -20,
                }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl',
                  'bg-white/10 backdrop-blur',
                  'hover:bg-white/20 transition-colors',
                  'text-left'
                )}
              >
                <span className="text-3xl">{contact.icon}</span>
                <div className="flex-1">
                  <p className="text-white font-medium">{contact.name}</p>
                  <p className="text-white/70 text-sm">{contact.description}</p>
                </div>
                <span className="text-white font-bold">{contact.phone}</span>
              </motion.a>
            ))}
          </div>

          {/* 重要信息 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 rounded-xl p-6"
          >
            <p className="text-white/90 text-lg font-medium mb-2">
              你不是一个人
            </p>
            <p className="text-white/70 text-sm">
              帮助是存在的，请让别人知道你现在的状态
            </p>
          </motion.div>

          {/* 关闭按钮 - 仅在倒计时结束后可用 */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: countdown === 0 ? 1 : 0 }}
            transition={{ delay: 0.7 }}
            onClick={onClose}
            className="w-full py-4 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors"
          >
            {countdown > 0
              ? `${minutes}:${seconds.toString().padStart(2, '0')} 后可关闭`
              : '我理解了（关闭）'}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
