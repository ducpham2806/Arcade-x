import React from 'react';
import { HexTile, BoosterType } from './types';
import { CandyItemIcon, CandyObstacleOverlay } from './CandyAssets';

export type TouchSensitivity = 'tight' | 'standard' | 'spacious';

interface HexBoardProps {
  grid: HexTile[][];
  onTileClick: (r: number, c: number, clientX: number, clientY: number) => void;
  activeBooster: BoosterType | null;
  shakeTile: { r: number; c: number } | null;
  isProcessing?: boolean;
  touchSensitivity?: TouchSensitivity;
}

export const HexBoard: React.FC<HexBoardProps> = ({
  grid,
  onTileClick,
  activeBooster,
  shakeTile,
  isProcessing,
  touchSensitivity = 'standard',
}) => {
  if (!grid || grid.length === 0) return null;

  // Adapt sizing/padding based on touch sensitivity
  const getSensitivityClass = () => {
    switch (touchSensitivity) {
      case 'tight':
        return 'w-[12vw] h-[12vw] max-w-[50px] max-h-[50px] min-w-[34px] min-h-[34px] m-[0.5px]';
      case 'spacious':
        return 'w-[14vw] h-[14vw] max-w-[60px] max-h-[60px] min-w-[42px] min-h-[42px] m-[2px] sm:m-1';
      case 'standard':
      default:
        return 'w-[13vw] h-[13vw] max-w-[56px] max-h-[56px] min-w-[38px] min-h-[38px] m-[1px] sm:m-0.5';
    }
  };

  const getButtonHitboxClass = () => {
    switch (touchSensitivity) {
      case 'tight':
        return 'p-0.5';
      case 'spacious':
        return 'p-0 scale-105';
      case 'standard':
      default:
        return 'p-0';
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none touch-none px-0.5">
      {/* Booster Prompt Banner */}
      {activeBooster && (
        <div className="mb-2 px-3.5 py-1.5 rounded-full bg-amber-500/25 border border-amber-400 text-amber-200 text-xs font-black animate-pulse flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.5)] z-20">
          <span>
            {activeBooster === 'hammer' && '🔨 Chạm vào viên kẹo để đập vỡ!'}
            {activeBooster === 'rocket' && '⚡ Chạm vào hàng để phóng kẹo sọc quét ngang!'}
            {activeBooster === 'color_bomb' && '💣 Chạm vào màu kẹo bất kỳ để nổ quét toàn bộ màu đó!'}
            {activeBooster === 'shuffle' && '🔄 Bấm vào bảng để xáo trộn kẹo!'}
          </span>
        </div>
      )}

      {/* Hex Grid Stage */}
      <div className="relative w-full max-w-[480px] bg-slate-950/70 border border-slate-800/80 rounded-3xl p-2 sm:p-3 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center">
        {grid.map((row, r) => {
          const isOdd = r % 2 === 1;
          return (
            <div
              key={r}
              className="flex justify-center -my-0.5 sm:-my-1 w-full"
              style={{
                transform: isOdd ? 'translateX(3.2%)' : 'translateX(0%)',
              }}
            >
              {row.map((tile, c) => {
                const isShaking = shakeTile?.r === r && shakeTile?.c === c;

                return (
                  <div
                    key={tile.id || `${r}-${c}`}
                    className={`relative ${getSensitivityClass()} flex items-center justify-center transition-all duration-200 ${
                      isShaking ? 'animate-[wiggle_0.4s_ease-in-out]' : ''
                    } ${
                      tile.isDropping
                        ? 'animate-[tileDrop_0.35s_cubic-bezier(0.34,1.56,0.64,1)]'
                        : ''
                    }`}
                  >
                    {/* The Candy Button */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={(e) => {
                        if (isProcessing) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        onTileClick(r, c, rect.left + rect.width / 2, rect.top + rect.height / 2);
                      }}
                      className={`w-full h-full flex items-center justify-center transition-all duration-250 cursor-pointer relative overflow-visible ${getButtonHitboxClass()} ${
                        tile.isPopping
                          ? 'scale-0 opacity-0 rotate-45 pointer-events-none'
                          : 'scale-100 opacity-100 active:scale-90 hover:scale-105'
                      } ${
                        activeBooster ? 'scale-105 ring-2 ring-amber-400 rounded-2xl' : ''
                      }`}
                    >
                      {/* Candy Piece SVG */}
                      <div className="w-[96%] h-[96%] flex items-center justify-center relative z-0 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                        <CandyItemIcon
                          color={tile.color}
                          special={tile.special}
                          obstacle={tile.obstacle}
                        />
                      </div>

                      {/* Obstacle Layer */}
                      <CandyObstacleOverlay type={tile.obstacle} />
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-14deg) scale(1.15); }
          40% { transform: rotate(12deg) scale(1.15); }
          60% { transform: rotate(-10deg) scale(1.08); }
          80% { transform: rotate(8deg) scale(1.04); }
        }

        @keyframes tileDrop {
          0% {
            transform: translateY(-40px) scale(0.7);
            opacity: 0.3;
          }
          70% {
            transform: translateY(4px) scale(1.05);
            opacity: 1;
          }
          100% {
            transform: translateY(0px) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
