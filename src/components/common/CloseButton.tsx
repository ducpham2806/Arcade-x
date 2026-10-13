import React from 'react';
import { X } from 'lucide-react';
import { soundEngine } from '../../services/audio';

export interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  className?: string;
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  onClose,
  onClick,
  size = 'md',
  ariaLabel = 'Đóng cửa sổ',
  className = '',
  id,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundEngine.play('click');
    if (onClick) {
      onClick(e);
    }
    if (onClose) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl',
    lg: 'w-10 h-10 sm:w-11 sm:h-11 rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5 sm:w-6 sm:h-6',
  };

  return (
    <button
      id={id || 'btn-modal-close'}
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`bg-white/5 hover:bg-rose-500/20 active:scale-90 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      <X className={iconSizes[size]} />
    </button>
  );
};

