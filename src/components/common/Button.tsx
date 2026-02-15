import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/helpers';
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否加载中 */
  loading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 子元素 */
  children?: ReactNode;
  /** 图标（可选） */
  icon?: ReactNode;
  /** 图标位置 */
  iconPosition?: 'left' | 'right';
  /** 全宽 */
  fullWidth?: boolean;
}

/**
 * Button 组件 - 可爱心理场景的温暖按钮
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      children,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-xl
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
    `;

    const variants = {
      primary: `
        bg-primary-600 text-white
        hover:bg-primary-700
        focus:ring-primary-500
        shadow-md hover:shadow-lg
      `,
      secondary: `
        bg-primary-100 text-primary-700
        hover:bg-primary-200
        focus:ring-primary-400
      `,
      ghost: `
        text-primary-600
        hover:bg-primary-50
        focus:ring-primary-400
      `,
      danger: `
        bg-danger-500 text-white
        hover:bg-danger-600
        focus:ring-danger-400
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-3 text-sm',
      lg: 'px-6 py-4 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...(props as any)}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
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
            <span>加载中...</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="icon">{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span className="icon">{icon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * 加载中的按钮变体 - 使用 Framer Motion
 */
export const LoadingButton = motion(
  forwardRef<HTMLButtonElement, ButtonProps & { loadingText?: string }>(
    ({ loadingText = '加载中...', children, ...props }, ref) => {
      return (
        <Button ref={ref} loading disabled {...props}>
          {loadingText}
        </Button>
      );
    }
  )
);

LoadingButton.displayName = 'LoadingButton';
