import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../services/audio';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  ShoppingBag,
  Coins,
  Flame,
  User,
  Package,
  Crown,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface OnboardingFeature {
  icon: string;
  title: string;
  desc: string;
}

interface OnboardingStepDef {
  targetId: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  features: OnboardingFeature[];
  proTip: string;
  actionButton?: {
    label: string;
    actionType: 'open_shop';
  };
}

interface RectBounds {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
}

const ONBOARDING_STEPS: OnboardingStepDef[] = [
  {
    targetId: 'btn-header-home',
    title: 'Chào Mừng Đến Với ArcadeX!',
    subtitle: 'Nền Tảng Instant Web Arcade Thế Hệ Mới',
    badge: 'BẮT ĐẦU',
    description:
      'ArcadeX là nền tảng trò chơi tức thì (Instant Games) chạy mượt mà trên mọi thiết bị mà không cần cài đặt.',
    features: [
      {
        icon: '🕹️',
        title: '13+ Mini-games Đa Thể Loại',
        desc: 'Từ giải đố IQ (2048, Sudoku), phản xạ (Neon Runner), đến cờ tướng và cờ vua PvP.',
      },
      {
        icon: '⚡',
        title: 'Chuẩn PWA Hoạt Động Offline',
        desc: 'Tự động lưu cache để chơi tiếp ngay cả khi mất kết nối mạng internet.',
      },
      {
        icon: '☁️',
        title: 'Đồng Bộ Điểm Số & Đám Mây',
        desc: 'Tiến trình, ELO và cấp độ được lưu an toàn và đồng bộ thời gian thực.',
      },
    ],
    proTip: 'Bấm vào biểu tượng ArcadeX bất kỳ lúc nào để quay về sảnh chính.',
  },
  {
    targetId: 'btn-header-profile',
    title: 'Hồ Sơ Game Thủ & Cấp Độ EXP',
    subtitle: 'Thước Đo Tiến Trình & Vinh Quang',
    badge: 'HỒ SƠ',
    description:
      'Theo dõi cấp độ game thủ (Level), thanh tiến trình EXP, avatar và danh hiệu đang trang bị.',
    features: [
      {
        icon: '📈',
        title: 'Tích Lũy EXP Tăng Cấp',
        desc: 'Mỗi ván chơi, kỷ lục mới và nhiệm vụ hoàn thành đều thưởng EXP để bạn lên cấp.',
      },
      {
        icon: '🎁',
        title: 'Quà Thăng Cấp (Level Up)',
        desc: 'Nhận lượng lớn Arcade Coins và Gems mỗi khi bạn đạt cấp độ mới.',
      },
      {
        icon: '🟢',
        title: 'Chấm Trạng Thái Mạng Live',
        desc: 'Màu xanh khi trực tuyến (Cloud synced), chuyển đỏ báo hiệu đang ở chế độ Offline an toàn.',
      },
    ],
    proTip: 'Nhấp vào Avatar để mở chi tiết Hồ Sơ, đổi Danh hiệu và theo dõi biểu đồ ELO.',
  },
  {
    targetId: 'btn-header-streak',
    title: 'Chuỗi Điểm Danh Rực Lửa (Daily Streak)',
    subtitle: 'Giữ Vững Ngọn Lửa Nhận Quà Khủng',
    badge: 'ĐIỂM DANH',
    description:
      'Hệ thống ghi nhận chuỗi ngày đăng nhập liên tiếp với hệ số nhân phần thưởng cực hấp dẫn.',
    features: [
      {
        icon: '🔥',
        title: 'Hệ Số Nhân Thưởng Lên Tới x2.0',
        desc: 'Chuỗi streak càng dài, lượng Xu và EXP nhận được từ điểm danh hàng ngày càng lớn.',
      },
      {
        icon: '🏆',
        title: 'Jackpot Ngày Thứ 7',
        desc: 'Duy trì streak 7 ngày liên tiếp để mở khóa Rương Huyền Thoại Jackpot!',
      },
      {
        icon: '⏰',
        title: 'Chấm Đỏ Nhắc Nhở',
        desc: 'Chấm đỏ nhấp nháy trên biểu tượng ngọn lửa báo hiệu bạn chưa nhận quà hôm nay.',
      },
    ],
    proTip: 'Bấm vào Ngọn Lửa để mở popup Điểm Danh và nhận thưởng tức thì!',
  },
  {
    targetId: 'header-arcade-coins',
    title: 'Kinh Tế Arcade: Xu (Coins) & Đá Quý',
    subtitle: 'Nguồn Tài Nguyên Mua Sắm & Rèn Đúc',
    badge: 'TIỀN TỆ',
    description:
      'Arcade Coins và Gems là huyết mạch tài chính của ArcadeX, dùng để mua sắm trong Cửa Hàng và nâng cấp trang bị.',
    features: [
      {
        icon: '🪙',
        title: 'Arcade Coins (Xu)',
        desc: 'Kiếm được khi chơi game, đạt điểm cao, hoàn thành nhiệm vụ và điểm danh.',
      },
      {
        icon: '💎',
        title: 'Gems (Đá Quý)',
        desc: 'Tiền tệ cao cấp nhận từ quà thăng cấp, chuỗi streak và mở rương báu.',
      },
      {
        icon: '🛍️',
        title: 'Truy Cập Nhanh Shop',
        desc: 'Nhấp trực tiếp vào số Xu trên Header để mở ngay Cửa Hàng Arcade Shop!',
      },
    ],
    proTip: 'Không cần nạp tiền thật! 100% skin và vật phẩm đều có thể cày cuốc bằng Arcade Coins.',
  },
  {
    targetId: 'btn-nav-shop',
    title: 'Cửa Hàng Arcade (Arcade Shop)',
    subtitle: 'Sắm Skin, Theme Bàn Cờ & Hiệu Ứng Độc Quyền',
    badge: 'CỬA HÀNG',
    description:
      'Nơi bạn đổi Arcade Coins lấy các bộ skin độc quyền cho từng mini-game, từ bàn cờ Caro đến phi thuyền vũ trụ.',
    features: [
      {
        icon: '🎨',
        title: 'Duyệt Skin Theo Mini-Game',
        desc: 'Lọc nhanh skin cho Cờ Caro, Eat \'Em All, Sudoku, Shikaku, Neon Runner...',
      },
      {
        icon: '👁️',
        title: 'Xem Trước Trực Quan (Live Preview)',
        desc: 'Trực tiếp chiêm ngưỡng diện mạo, màu sắc và hiệu ứng trước khi quyết định mở khóa.',
      },
      {
        icon: '⚡',
        title: 'Trang Bị Tức Thì 1-Chạm',
        desc: 'Một chạm để đổi diện mạo trò chơi ngay lập tức mà không mất thêm chi phí.',
      },
    ],
    proTip: 'Hãy thử mở Arcade Shop để ngắm các bộ skin tuyệt đẹp đang chờ bạn!',
    actionButton: {
      label: '🛍️ Mở Thử Arcade Shop Ngay',
      actionType: 'open_shop',
    },
  },
  {
    targetId: 'btn-nav-inventory',
    title: 'Rương Đồ, Lò Rèn & Tiện Ích Mở Rộng',
    subtitle: 'Kho Tài Sản Cá Nhân & Chế Tạo Thần Bí',
    badge: 'KHO ĐỒ',
    description:
      'Quản lý kho đồ, mở các hòm báu nhận vật phẩm ngẫu nhiên và truy cập Lò Rèn Ma Thuật.',
    features: [
      {
        icon: '📦',
        title: 'Mở Rương Báu 3D (Gacha Chests)',
        desc: 'Các loại rương từ Đồng, Bạc, Vàng đến Huyền Thoại với hiệu ứng mở thưởng cực đã.',
      },
      {
        icon: '⚒️',
        title: 'Lò Rèn Ma Thuật (Crafting Forge)',
        desc: 'Dung hợp 3 trang bị cùng cấp để chế tạo vật phẩm cao cấp hơn và kích hoạt Bạo Kích.',
      },
      {
        icon: '📋',
        title: 'Menu Tiện Ích Mở Rộng',
        desc: 'Bấm nút "Tiện Ích" để mở nhanh Nhiệm Vụ Ngày, Thành Tựu, BXH và Điểm Danh.',
      },
    ],
    proTip: 'Số lượng rương báu đang có được hiển thị bằng chấm tròn đếm số ngay trên nút Rương Đồ.',
  },
  {
    targetId: 'section-hall-of-fame',
    title: 'Đại Sảnh Danh Vọng (Hall of Fame) & Bắt Đầu!',
    subtitle: 'Khắc Tên Lên Bảng Vàng Kỷ Lục Gia',
    badge: 'VINH QUANG',
    description:
      'Bạn đã sẵn sàng chinh phục thế giới ArcadeX! Khám phá Đại Sảnh Danh Vọng ngay tại sảnh chính để thách đấu kỷ lục gia.',
    features: [
      {
        icon: '👑',
        title: 'Kỷ Lục Toàn Thời Gian (All-Time Legends)',
        desc: 'Chiêm ngưỡng kỷ lục cao nhất của từng mini-game được ghi nhận trên toàn hệ thống.',
      },
      {
        icon: '🏅',
        title: '13 Huy Hiệu Độc Quyền',
        desc: 'Đạt điểm số cao hơn Kỷ Lục Gia để soán ngôi và sở hữu Huy Hiệu Độc Quyền cho trò chơi đó!',
      },
      {
        icon: '⚔️',
        title: 'Thách Đấu Trực Tiếp',
        desc: 'Bấm "Thách Đấu Kỷ Lục" trên bất kỳ trò chơi nào để bắt đầu ván đấu ngay.',
      },
    ],
    proTip: 'Chúc bạn có những giờ phút giải trí thăng hoa và sớm ghi danh vào Hall of Fame!',
  },
];

export const InteractiveOnboarding: React.FC = () => {
  const { isOnboardingActive, finishOnboarding, setActiveModal } = useGame();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<RectBounds | null>(null);

  useEffect(() => {
    if (!isOnboardingActive) {
      setTargetRect(null);
      return;
    }

    const step = ONBOARDING_STEPS[currentStep];
    if (!step) return;

    let isMounted = true;

    const measure = (shouldScroll = false) => {
      if (!isMounted) return;
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (shouldScroll) {
          if (rect.top < 0 || rect.bottom > window.innerHeight) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        setTargetRect((prev) => {
          if (
            prev &&
            Math.abs(prev.top - rect.top) < 1 &&
            Math.abs(prev.left - rect.left) < 1 &&
            Math.abs(prev.width - rect.width) < 1 &&
            Math.abs(prev.height - rect.height) < 1
          ) {
            return prev;
          }
          return {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
          };
        });
      } else {
        setTargetRect(null);
      }
    };

    // Scroll and measure on step change
    measure(true);

    const handleResizeOrScroll = () => {
      measure(false);
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    const timer = setTimeout(() => {
      measure(false);
    }, 150);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
      clearTimeout(timer);
    };
  }, [isOnboardingActive, currentStep]);

  if (!isOnboardingActive) {
    return null;
  }

  const step = ONBOARDING_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    soundEngine.play('tap');
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    soundEngine.play('tap');
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    soundEngine.play('levelUp');
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    finishOnboarding();
  };

  const handleSkip = () => {
    soundEngine.play('click');
    finishOnboarding();
  };

  const handleStepAction = () => {
    if (step.actionButton?.actionType === 'open_shop') {
      soundEngine.play('click');
      setActiveModal('shop');
    }
  };

  // Calculate Tooltip placement
  let tooltipStyle: React.CSSProperties = {
    maxWidth: '440px',
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  if (!isMobile && targetRect) {
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const placeBelow = spaceBelow > 380 || targetRect.top < 200;

    let top = placeBelow ? targetRect.bottom + 14 : targetRect.top - 420;
    if (top < 12) top = 12;

    const targetCenterX = targetRect.left + targetRect.width / 2;
    let left = targetCenterX - 220;
    if (left < 16) left = 16;
    if (left + 440 > window.innerWidth - 16) left = window.innerWidth - 456;

    tooltipStyle = {
      ...tooltipStyle,
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
    };
  }

  return (
    <div
      id="onboarding-overlay"
      className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center pointer-events-auto select-none"
    >
      {/* Dark backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={handleNext}
      />

      {/* Spotlight Cutout around target element */}
      {targetRect && (
        <div
          id="onboarding-spotlight"
          className="fixed pointer-events-none rounded-2xl transition-all duration-300 ease-out border-2 border-amber-400/90 shadow-[0_0_35px_rgba(245,158,11,0.45)] ring-4 ring-amber-400/25"
          style={{
            top: `${Math.max(4, targetRect.top - 6)}px`,
            left: `${Math.max(4, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
            zIndex: 101,
          }}
        >
          {/* Subtle pulse aura */}
          <span className="absolute inset-0 rounded-2xl border border-amber-300 animate-ping opacity-30" />
        </div>
      )}

      {/* Floating Tooltip Card */}
      <div
        id="onboarding-tooltip-card"
        className={`relative z-[102] w-full max-w-[460px] p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#181824] via-[#12121a] to-[#0c0c12] border border-amber-500/40 shadow-2xl shadow-black/80 flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-200 ${
          isMobile ? 'mb-2 px-4 pb-5 rounded-b-none border-b-0' : ''
        }`}
        style={!isMobile ? tooltipStyle : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Step Indicator & Skip Button */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>{step.badge}</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              Bước {currentStep + 1} / {ONBOARDING_STEPS.length}
            </span>
          </div>

          <button
            id="btn-onboarding-skip"
            type="button"
            onClick={handleSkip}
            className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span>Bỏ qua</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Content */}
        <div>
          <h3 className="text-base sm:text-lg font-black text-white font-display flex items-center gap-2 leading-snug">
            <span>{step.title}</span>
          </h3>
          <p className="text-xs text-amber-400 font-medium mt-0.5">{step.subtitle}</p>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">{step.description}</p>
        </div>

        {/* 3 Key Feature Bullets */}
        <div className="space-y-2 py-1">
          {step.features.map((feat, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2 rounded-xl bg-black/40 border border-white/5"
            >
              <span className="text-base shrink-0 mt-0.5">{feat.icon}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white leading-tight">{feat.title}</div>
                <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  {feat.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Action Button if any (e.g. Try Shop) */}
        {step.actionButton && (
          <div className="pt-0.5">
            <button
              type="button"
              onClick={handleStepAction}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <span>{step.actionButton.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Pro Tip Box */}
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-snug flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 font-bold">Mẹo hay: </strong>
            <span>{step.proTip}</span>
          </div>
        </div>

        {/* Progress Bar & Navigation Controls */}
        <div className="pt-2 border-t border-white/10 space-y-2.5">
          {/* Step Dots & Line */}
          <div className="flex items-center justify-between gap-1">
            {ONBOARDING_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  soundEngine.play('tap');
                  setCurrentStep(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentStep
                    ? 'w-8 bg-amber-400 shadow-sm shadow-amber-400/50'
                    : idx < currentStep
                    ? 'w-3 bg-amber-600/60'
                    : 'w-3 bg-white/10'
                }`}
                title={`Chuyển đến bước ${idx + 1}`}
              />
            ))}
          </div>

          {/* Buttons: Back / Next */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              id="btn-onboarding-prev"
              type="button"
              onClick={handlePrev}
              disabled={isFirstStep}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 min-h-[38px] ${
                isFirstStep
                  ? 'opacity-40 text-slate-500 cursor-not-allowed bg-transparent'
                  : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>

            <button
              id="btn-onboarding-next"
              type="button"
              onClick={handleNext}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg cursor-pointer min-h-[38px] ${
                isLastStep
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30 hover:brightness-110 active:scale-95'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-amber-500/30 hover:brightness-110 active:scale-95'
              }`}
            >
              <span>{isLastStep ? 'Bắt Đầu Trải Nghiệm 🚀' : 'Tiếp theo'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
