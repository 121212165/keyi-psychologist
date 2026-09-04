import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/common';
import { ConsentModal } from '@/components/welcome/ConsentModal';
import { cn } from '@/utils/helpers';
import { navigate } from '@/router';

export default function WelcomePage() {
  const [showConsent, setShowConsent] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [userName, setUserName] = useState('');
  const [isEntering, setIsEntering] = useState(false);

  const handleStart = () => {
    setIsEntering(true);
    // 保存用户名到本地存储
    if (userName.trim()) {
      localStorage.setItem('keyi_user_name', userName.trim());
    }
    // 延迟后进入对话页
    setTimeout(() => {
      navigate('/chat/intro');
    }, 800);
  };

  const handleConsentAgree = () => {
    setConsentAgreed(true);
    setShowConsent(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col">
      {/* 顶部区域 */}
      <header className="flex-1 flex flex-col items-center justify-center px-6 pt-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-4xl">🌿</span>
          </div>

          <h1 className="text-3xl font-light text-warm-800 tracking-wider">
            可意
          </h1>
          <p className="text-sm text-warm-400 mt-2 tracking-widest uppercase">
            AI心理陪伴
          </p>
        </motion.div>

        {/* 简短介绍卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 max-w-xs w-full"
        >
          {consentAgreed ? (
            <div className="w-full p-5 bg-green-50 rounded-2xl border border-green-200">
              <div className="flex items-center gap-3">
                <span className="text-xl">✓</span>
                <div>
                  <p className="text-sm text-green-700 font-medium">已同意服务说明</p>
                  <button
                    onClick={() => setShowConsent(true)}
                    className="text-xs text-green-600 mt-1 hover:text-green-700"
                  >
                    查看详情
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConsent(true)}
              className="w-full text-left p-5 bg-white rounded-2xl shadow-sm border border-primary-100 hover:shadow-md transition-all"
            >
              <p className="text-sm text-warm-600 leading-relaxed">
                在开始之前，请先了解我们的服务说明和隐私政策
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-warm-400">约1分钟阅读</span>
                <span className="text-primary-600 text-sm font-medium">
                  了解详情 →
                </span>
              </div>
            </button>
          )}
        </motion.div>
      </header>

      {/* 底部区域 */}
      <footer className="px-6 pb-12">
        {/* 称呼输入 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6"
        >
          <Input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="你想让我怎么称呼你？"
            size="lg"
            className="text-center"
            helpText="也可以留空"
          />
        </motion.div>

        {/* 开始按钮 */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isEntering ? 0 : 1,
            y: isEntering ? 20 : 0,
          }}
          transition={{ duration: 0.6, delay: 0.5 }}
          onClick={handleStart}
          disabled={isEntering}
          className={cn(
            'w-full py-4 bg-primary-600 text-white rounded-xl font-medium',
            'shadow-lg hover:shadow-xl hover:bg-primary-700',
            'active:scale-[0.98] transition-all',
            'disabled:opacity-50'
          )}
        >
          {isEntering ? (
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
              正在进入...
            </span>
          ) : (
            '开始聊聊'
          )}
        </motion.button>

        {/* 隐私承诺 */}
        <p className="text-center text-xs text-warm-400 mt-6 flex items-center justify-center gap-1">
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          你的对话完全保密
        </p>
      </footer>

      {/* 知情同意弹窗 */}
      <AnimatePresence>
        {showConsent && (
          <ConsentModal
            isOpen={showConsent}
            onClose={() => setShowConsent(false)}
            onAgree={handleConsentAgree}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
