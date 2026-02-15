import { forwardRef, type InputHTMLAttributes, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 标签 */
  label?: string;
  /** 错误信息 */
  error?: string;
  /** 帮助文本 */
  helpText?: string;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否加载中 */
  loading?: boolean;
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
}

/**
 * Input 输入框组件
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      size = 'md',
      loading,
      leftIcon,
      rightIcon,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const internalId = useId();
    const inputId = id || internalId;

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-sm',
      lg: 'px-5 py-4 text-base',
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-warm-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-white border border-warm-200 rounded-xl',
              'text-warm-800 placeholder-warm-400',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400',
              'disabled:bg-warm-100 disabled:cursor-not-allowed',
              error && 'border-danger-300 focus:ring-danger-200 focus:border-danger-400',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              sizes[size],
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400">
              {rightIcon}
            </div>
          )}

          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="animate-spin h-4 w-4 text-primary-500"
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
            </div>
          )}
        </div>

        {(error || helpText) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-danger-500' : 'text-warm-400'
            )}
          >
            {error || helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 标签 */
  label?: string;
  /** 错误信息 */
  error?: string;
  /** 帮助文本 */
  helpText?: string;
  /** 是否自动增长 */
  autoResize?: boolean;
}

/**
 * Textarea 多行文本输入组件
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helpText,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const internalId = useId();
    const textareaId = id || internalId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-warm-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full bg-white border border-warm-200 rounded-xl px-4 py-3',
            'text-warm-800 placeholder-warm-400',
            'transition-all duration-200 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400',
            'disabled:bg-warm-100 disabled:cursor-not-allowed',
            error && 'border-danger-300 focus:ring-danger-200 focus:border-danger-400',
            className
          )}
          {...props}
        />

        {(error || helpText) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-danger-500' : 'text-warm-400'
            )}
          >
            {error || helpText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
