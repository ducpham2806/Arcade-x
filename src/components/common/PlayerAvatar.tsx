import React from 'react';
import { motion } from 'motion/react';
import { isPlayerTop10 } from '../../utils/leaderboardUtils';

interface PlayerAvatarProps {
  avatar: React.ReactNode | string;
  playerName?: string;
  forceTop10?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCrown?: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  avatar,
  playerName,
  forceTop10 = false,
  className = '',
  size = 'md',
  showCrown = true,
}) => {
  const isTop10 = showCrown && (forceTop10 || (playerName ? isPlayerTop10(playerName) : false));

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
    xl: 'w-16 h-16 text-3xl',
  }[size];

  const crownSizes = {
    sm: '-top-3 text-xs',
    md: '-top-3.5 text-sm',
    lg: '-top-4 text-base',
    xl: '-top-5 text-lg',
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Animated Crown Effect for Top 10 */}
      {isTop10 && (
        <motion.div
          initial={{ y: -3, scale: 0.9, rotate: -5 }}
          animate={{ 
            y: [-5, -1, -5], 
            scale: [1, 1.1, 1], 
            rotate: [-4, 4, -4] 
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute ${crownSizes} z-30 pointer-events-none filter drop-shadow-[0_0_10px_rgba(234,179,8,0.9)]`}
          title={`👑 ${playerName ? `${playerName} - ` : ''}Top 10 Huyền Thoại`}
        >
          <span className="select-none inline-block filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">👑</span>
        </motion.div>
      )}

      {/* Avatar Container with Golden Glow if Top 10 */}
      <div 
        className={`relative flex items-center justify-center overflow-hidden rounded-2xl ${sizeClasses} ${
          isTop10
            ? 'border-2 border-yellow-400 bg-gradient-to-br from-yellow-500/25 via-amber-500/15 to-yellow-600/30 shadow-[0_0_15px_rgba(234,179,8,0.5)] ring-2 ring-yellow-400/50'
            : 'bg-[#151722] border border-white/10'
        }`}
      >
        {typeof avatar === 'string' && avatar.startsWith('http') ? (
          <img src={avatar} alt={playerName || 'Avatar'} className="w-full h-full object-cover" />
        ) : (
          <span className="select-none">{avatar || '🎮'}</span>
        )}
      </div>

      {/* Subtle sparkle indicator for Top 10 */}
      {isTop10 && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping pointer-events-none" />
      )}
    </div>
  );
};
