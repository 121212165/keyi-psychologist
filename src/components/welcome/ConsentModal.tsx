import { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/common';

const CONSENT_ITEMS = [
  {
    icon: '🤖',
    title: '我的身份',
    content: '我是可意，一个AI心理陪伴助手（不是持证心理咨询师或医生）',
  },
  {
    icon: '💬',
    title: '我能做的',
    content: '倾听你的困扰、陪伴你度过情绪低谷、提供情绪管理技巧',
  },
  {
    icon: '🚫',
    title: '我不能做的',
    content: '不能做临床诊断、不能开药、不能替代专业心理治疗',
  },
  {
    icon: '🔒',
    title: '你的隐私',
    content: '对话加密存储，仅用于改进服务，不会泄露给第三方',
  },
  {
    icon: '🆘',
    title: '紧急情况',
    content: '如果出现自伤/自杀风险，我会立即提供危机干预资源',
  },
];

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

/**
 * 知情同意弹窗
 */
export function ConsentModal({ isOpen, onClose, onAgree }: ConsentModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const handleAgree = () => {
    if (agreed) {
      onAgree();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="服务说明"
      size="md"
      className="overflow-hidden"
    >
      <div className="space-y-6">
        {showFull ? (
          // 完整内容
          <div className="space-y-5">
            {CONSENT_ITEMS.map((item, index) => (
              <div key={index} className="flex gap-4">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-medium text-warm-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-warm-500 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 简短介绍
          <div className="text-center py-4">
            <p className="text-warm-600 leading-relaxed">
              在我们开始之前，请允许我简短地介绍自己：
            </p>
            <button
              onClick={() => setShowFull(true)}
              className="mt-4 text-primary-600 text-sm font-medium hover:text-primary-700"
            >
              查看完整说明 →
            </button>
          </div>
        )}

        {/* 同意区域 */}
        {showFull && (
          <div className="pt-4 border-t border-warm-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 text-primary-600 rounded border-warm-300 focus:ring-primary-500"
              />
              <span className="text-sm text-warm-600">
                我理解并同意以上内容
              </span>
            </label>

            <button
              onClick={handleAgree}
              disabled={!agreed}
              className="w-full mt-4 py-3 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
            >
              继续
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
