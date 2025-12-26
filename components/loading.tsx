import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  variant?: 'page' | 'content' | 'inline' | 'spinner';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
  className?: string;
}

export default function Loading({
  variant = 'content',
  text,
  size = 'md',
  fullscreen = false,
  className,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const spinnerSize = sizeClasses[size];

  // Spinner only - for buttons
  if (variant === 'spinner') {
    return <Loader2 className={cn(spinnerSize, 'animate-spin', className)} />;
  }

  // Inline - small spinner with text on same line
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className={cn(sizeClasses.sm, 'animate-spin')} />
        <span className="text-sm text-muted-foreground">{text || 'Loading...'}</span>
      </div>
    );
  }

  // Page variant - full page centered with large spinner
  if (variant === 'page') {
    const content = (
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader2 className={cn(sizeClasses.lg, 'animate-spin text-primary')} />
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
    );

    if (fullscreen) {
      return (
        <div className={cn('fixed inset-0 z-50 bg-background/80 backdrop-blur-sm', className)}>
          <div className="flex items-center justify-center min-h-screen">{content}</div>
        </div>
      );
    }

    return (
      <div className={cn('container mx-auto p-4', className)}>
        <div className="flex items-center justify-center min-h-[400px]">{content}</div>
      </div>
    );
  }

  // Content variant (default) - centered in container
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 min-h-[300px]', className)}>
      <Loader2 className={cn(spinnerSize, 'animate-spin text-primary')} />
      {(text || variant === 'content') && <p className="text-muted-foreground">{text || 'Loading...'}</p>}
    </div>
  );
}
