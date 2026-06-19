import { useState, useEffect } from 'react';
import './NativeLiquidButton.css';

interface NativeLiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  progress?: number;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  liquidVariant?: 'default' | 'gradient' | 'glow' | 'wave';
  liquidColor?: string; // e.g. 'bg-purple-500' or hex color
  size?: 'sm' | 'default' | 'lg' | 'xl';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  autoSimulate?: boolean;
  showPercentage?: boolean;
  children: React.ReactNode;
}

export function NativeLiquidButton({
  progress: customProgress,
  loading: customLoading,
  success: customSuccess,
  error: customError,
  liquidVariant = 'default',
  liquidColor,
  size = 'default',
  variant = 'default',
  autoSimulate = false,
  showPercentage = false,
  onClick,
  children,
  className = '',
  ...props
}: NativeLiquidButtonProps) {
  const [progress, setProgress] = useState(customProgress || 0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Sync state with custom props
  useEffect(() => {
    if (customProgress !== undefined) {
      setProgress(customProgress);
    }
  }, [customProgress]);

  useEffect(() => {
    if (customLoading) setStatus('loading');
    else if (customSuccess) setStatus('success');
    else if (customError) setStatus('error');
    else setStatus('idle');
  }, [customLoading, customSuccess, customError]);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status === 'loading' || status === 'success') return;
    
    if (onClick) {
      onClick(e);
    }

    if (autoSimulate) {
      setStatus('loading');
      setProgress(0);
      
      // Simulate progress up to 100%
      for (let p = 0; p <= 100; p += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setProgress(p);
      }
      
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setProgress(0);
      }, 2000);
    }
  };

  const isBtnLoading = status === 'loading' || (progress > 0 && progress < 100);
  const isBtnSuccess = status === 'success' || progress === 100;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBtnLoading}
      className={`liquid-btn liquid-btn--${size} liquid-btn--${variant} liquid-btn--${liquidVariant} ${isBtnLoading ? 'liquid-btn--loading' : ''} ${isBtnSuccess ? 'liquid-btn--success' : ''} ${className}`}
      {...props}
    >
      {/* Liquid Wave Background */}
      {isBtnLoading && (
        <div 
          className="liquid-wave-bg"
          style={{ 
            transform: `translateY(${100 - progress}%)`,
            backgroundColor: liquidColor || undefined 
          }}
        >
          <div className="liquid-wave-element wave-1" />
          <div className="liquid-wave-element wave-2" />
        </div>
      )}

      {/* Button Glow Effect */}
      {liquidVariant === 'glow' && <div className="liquid-glow" />}

      {/* Button Content */}
      <div className="liquid-content">
        {isBtnLoading && (
          <span className="liquid-spinner animate-spin">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          </span>
        )}
        
        {isBtnSuccess && (
          <span className="liquid-success-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}

        <span className="liquid-text">
          {children}
          {isBtnLoading && showPercentage && ` (${progress}%)`}
        </span>
      </div>
    </button>
  );
}
