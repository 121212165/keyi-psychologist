import { cn } from '@/utils/helpers';

/**
 * Loading Spinner 组件
 */
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

export function Spinner({
  size = 'md',
  color = 'primary',
  className,
}: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const colors = {
    primary: 'text-primary-500',
    white: 'text-white',
    gray: 'text-warm-400',
  };

  return (
    <svg
      className={cn('animate-spin', sizes[size], colors[color], className)}
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
  );
}

/**
 * 加载中文本
 */
export function LoadingText({
  text = '加载中...',
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Spinner size="sm" />
      <span className="text-sm text-warm-500">{text}</span>
    </div>
  );
}

/**
 * 全屏加载
 */
export function FullPageLoader({
  text = '加载中...',
}: {
  text?: string;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-warm-50 z-50">
      <div className="text-center">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-warm-600">{text}</p>
      </div>
    </div>
  );
}

/**
 * 骨架屏组件
 */
export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: number | string;
  height?: number | string;
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-warm-200',
        variants[variant],
        className
      )}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1em' : undefined),
      }}
    />
  );
}

/**
 * 消息气泡骨架屏
 */
export function MessageBubbleSkeleton() {
  return (
    <div className="flex gap-3 max-w-[75%]">
      <Skeleton variant="circular" width={32} height={32} />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-10 w-full" variant="rectangular" />
      </div>
    </div>
  );
}
