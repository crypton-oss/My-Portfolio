import { useState } from 'react';
import { motion } from 'framer-motion';
import './NativeStartNow.css';

interface NativeStartNowProps {
  onStart?: () => Promise<void> | void;
  variant?: 'solid' | 'outline' | 'gradient' | 'default';
  size?: 'sm' | 'default' | 'lg';
  showRocket?: boolean;
  label?: string;
  loadingLabel?: string;
  successLabel?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function NativeStartNow({
  onStart,
  variant = 'default',
  size = 'default',
  showRocket = true,
  label = 'Start Now',
  loadingLabel = 'Starting...',
  successLabel = 'Ready!',
  disabled = false,
  icon,
}: NativeStartNowProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleClick = async () => {
    if (disabled || status !== 'idle') return;
    
    setStatus('loading');
    try {
      if (onStart) {
        await onStart();
      }
      setStatus('success');
      // Reset back to idle after 1.5s
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      setStatus('idle');
    }
  };

  const RocketIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="start-now-icon animate-bounce">
      <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5M14 2c3.5 0 8 4.5 8 8 0 2.25-1.5 3.5-3.5 3.5-2.25 0-3.5-1.25-3.5-3.5s1.25-3.5 3.5-3.5" />
      <path d="M9 15l-3-3m0 0L4 6l8 4 4-4 2 2-4 4 4 8-6-2-3-3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const DefaultSparkleIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="start-now-sparkle">
      <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
    </svg>
  );

  return (
    <motion.button
      type="button"
      whileHover={!disabled && status === 'idle' ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled && status === 'idle' ? { scale: 0.98 } : {}}
      onClick={handleClick}
      disabled={disabled || status === 'loading'}
      className={`start-now-btn start-now-btn--${variant} start-now-btn--${size} ${disabled ? 'start-now-btn--disabled' : ''} ${status !== 'idle' ? 'start-now-btn--active' : ''}`}
    >
      {/* Sparkles decoration (Only in gradient or solid hover) */}
      {status === 'idle' && variant === 'gradient' && (
        <>
          <div className="sparkle-container sparkle-1">{DefaultSparkleIcon}</div>
          <div className="sparkle-container sparkle-2">{DefaultSparkleIcon}</div>
        </>
      )}

      <div className="start-now-content">
        {status === 'loading' && (
          <span className="start-now-spinner animate-spin">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          </span>
        )}
        
        {status === 'success' && (
          <span className="start-now-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}

        {status === 'idle' && (
          icon ? <span className="start-now-custom-icon">{icon}</span> : showRocket && RocketIcon
        )}

        <span>
          {status === 'idle' && label}
          {status === 'loading' && loadingLabel}
          {status === 'success' && successLabel}
        </span>
      </div>
    </motion.button>
  );
}
