import {
  type ReactNode,
  type MouseEvent,
  useEffect,
  useCallback,
} from 'react';
import { motion, AnimatePresence, type MotionProps } from 'framer-motion';
import { cn } from '@/utils/helpers';

export interface ModalProps {
  /** 是否显示 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 标题 */
  title?: string;
  /** 子内容 */
  children: ReactNode;
  /** 底部内容 */
  footer?: ReactNode;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** 是否点击遮罩层关闭 */
  closeOnOverlayClick?: boolean;
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean;
  /** 是否有遮罩层 */
  hasOverlay?: boolean;
  /** 位置 */
  position?: 'center' | 'bottom';
  /** 额外样式类 */
  className?: string;
}

/**
 * Modal 弹窗组件 - 支持动画和多种尺寸
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  hasOverlay = true,
  position = 'center',
  className,
}: ModalProps) {
  // ESC 键关闭
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // 点击遮罩层
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  // 尺寸样式
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[90vw]',
  };

  // 位置样式
  const positions = {
    center: 'items-center',
    bottom: 'items-end sm:items-center',
  };

  // 动画配置
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      y: position === 'bottom' ? '100%' : 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      y: position === 'bottom' ? '100%' : 20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-50 flex justify-center sm:p-4',
            positions[position],
            'overflow-hidden'
          )}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
        >
          {/* 遮罩层 */}
          {hasOverlay && (
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
            />
          )}

          {/* 弹窗内容 */}
          <motion.div
            className={cn(
              'relative w-full bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl',
              'flex flex-col max-h-[90vh]',
              sizes[size],
              className
            )}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants as MotionProps['variants']}
          >
            {/* 头部 */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
                {title && (
                  <h2 className="text-lg font-medium text-warm-800">{title}</h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 text-warm-400 hover:text-warm-600 transition-colors rounded-full hover:bg-warm-50"
                    aria-label="关闭"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* 内容 */}
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

            {/* 底部 */}
            {footer && (
              <div className="px-6 py-4 border-t border-warm-100 bg-warm-50 rounded-b-3xl">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * 确认弹窗
 */
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

/**
 * ConfirmModal 确认弹窗 - 二次确认场景
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '确认操作',
  content = '确定要执行此操作吗？',
  confirmText = '确定',
  cancelText = '取消',
  variant = 'primary',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" hasOverlay>
      {title && (
        <div className="text-center mb-4">
          <div
            className={cn(
              'w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center',
              variant === 'danger'
                ? 'bg-danger-100 text-danger-500'
                : 'bg-primary-100 text-primary-500'
            )}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-warm-800">{title}</h3>
          {content && (
            <p className="text-sm text-warm-500 mt-1">{content}</p>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-warm-100 text-warm-700 rounded-xl font-medium hover:bg-warm-200 transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50',
            variant === 'danger'
              ? 'bg-danger-500 text-white hover:bg-danger-600'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          )}
        >
          {loading ? '处理中...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
