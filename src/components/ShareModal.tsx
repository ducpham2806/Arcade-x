import React, { useState } from 'react';
import { ShareData } from '../types';
import { FirebaseService } from '../services/firebase';
import { usePlayer } from '../context/PlayerContext';
import { soundEngine } from '../services/audio';
import confetti from 'canvas-confetti';
import { CloseButton } from './common/CloseButton';
import {
  X,
  Share2,
  Copy,
  Check,
  Trophy,
  Award,
  Send,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Flame,
  Globe,
  Download,
  Camera,
} from 'lucide-react';

interface ShareModalProps {
  data: ShareData;
  onClose: () => void;
  onOpenChat?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ data, onClose, onOpenChat }) => {
  const { profile } = usePlayer();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [postedToChat, setPostedToChat] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://arcadex.app';
  
  // Format share caption
  const generateShareCaption = (): string => {
    if (data.type === 'recap') {
      const timeStr = typeof data.timestamp === 'number'
        ? new Date(data.timestamp).toLocaleString('vi-VN')
        : (data.timestamp || new Date().toLocaleString('vi-VN'));
      return `📸 [GAME RECAP] Tôi vừa hoàn thành trận đấu "${data.gameTitle || 'Arcade'}" trên ArcadeX Instant Gaming! Điểm số: ${(data.score || 0).toLocaleString()} • Xếp hạng đạt được: ${data.achievedRank || 'Challenger'} • Thời gian: ${timeStr}. Ai dám so trình phá kỷ lục này không? ⚡🎮`;
    }
    if (data.type === 'achievement') {
      return `🏆 Tôi vừa mở khóa huy hiệu "${data.title}" (${data.description}) trong ArcadeX Instant Gaming! Cấp độ: ${data.playerLevel || profile.level} • Danh hiệu: "${data.playerTitle || profile.currentTitle}". Vào chơi và săn thưởng cùng tôi nhé! 🎮✨`;
    }
    if (data.type === 'score') {
      return `🔥 Kỷ Lục Mới! Tôi vừa đạt ${data.score?.toLocaleString() || 0} điểm trong game "${data.gameTitle || 'Arcade'}" trên ArcadeX! Ai dám vào phá kỷ lục này không? ⚡🎮`;
    }
    return `🎮 Tôi đang leo rank Cấp ${profile.level} với ${profile.stats.totalGamesPlayed} trận tại ArcadeX! Hãy cùng tham gia trải nghiệm ngay! 🚀`;
  };

  const shareText = generateShareCaption();

  const handleDownloadImage = () => {
    if (!data.recapImageUrl) return;
    const link = document.createElement('a');
    link.download = `arcadex-recap-${data.gameId || 'game'}-${Date.now()}.png`;
    link.href = data.recapImageUrl;
    link.click();
    soundEngine.play('coin');
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      soundEngine.play('coin');
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n👉 Chơi ngay tại: ${currentUrl}`);
      setCopiedText(true);
      soundEngine.play('coin');
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=500');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}&hashtags=ArcadeX,Gaming,VietNam,HighScore`;
    window.open(url, '_blank', 'width=600,height=500');
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=500');
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`;
    window.open(url, '_blank', 'width=600,height=500');
  };

  const handlePostToGlobalChat = async () => {
    if (postedToChat || isPosting) return;
    setIsPosting(true);

    try {
      if (data.type === 'recap') {
        const timeFormatted = typeof data.timestamp === 'number'
          ? new Date(data.timestamp).toLocaleString('vi-VN')
          : (data.timestamp || new Date().toLocaleString('vi-VN'));
        await FirebaseService.sendChatMessage({
          senderId: profile.id,
          senderName: profile.username,
          senderAvatar: profile.avatar,
          senderTitle: profile.currentTitle,
          senderLevel: profile.level,
          text: `📸 [GAME RECAP] Vừa hoàn thành ván đấu "${data.gameTitle || 'Trò Chơi'}" với ${(data.score || 0).toLocaleString()} điểm! Đạt Xếp Hạng: ${data.achievedRank || 'Challenger'}!`,
          gameTipTag: 'recap',
          sharedScore: {
            gameId: data.gameId || 'arcade',
            gameTitle: data.gameTitle || 'Trò Chơi Arcade',
            score: data.score || 0,
            achievedRank: data.achievedRank,
            timestamp: timeFormatted,
            recapImageUrl: data.recapImageUrl,
          },
        });
      } else if (data.type === 'achievement') {
        await FirebaseService.sendChatMessage({
          senderId: profile.id,
          senderName: profile.username,
          senderAvatar: profile.avatar,
          senderTitle: profile.currentTitle,
          senderLevel: profile.level,
          text: `Vừa mở khóa thành tựu danh giá: "${data.title}"! 🔥`,
          gameTipTag: 'score',
          sharedAchievement: {
            id: data.badgeIcon || 'ach_shared',
            title: data.title,
            icon: data.badgeIcon || '🏆',
            description: data.description,
          },
        });
      } else if (data.type === 'score') {
        await FirebaseService.sendChatMessage({
          senderId: profile.id,
          senderName: profile.username,
          senderAvatar: profile.avatar,
          senderTitle: profile.currentTitle,
          senderLevel: profile.level,
          text: `Vừa thiết lập kỷ lục khủng ${(data.score || 0).toLocaleString()} điểm trong ${data.gameTitle || 'Game'}! Thử thách nào anh em! 🚀`,
          gameTipTag: 'score',
          sharedScore: {
            gameId: data.gameId || 'arcade',
            gameTitle: data.gameTitle || 'Trò Chơi Arcade',
            score: data.score || 0,
          },
        });
      } else {
        await FirebaseService.sendChatMessage({
          senderId: profile.id,
          senderName: profile.username,
          senderAvatar: profile.avatar,
          senderTitle: profile.currentTitle,
          senderLevel: profile.level,
          text: `Hồ sơ game thủ Cấp ${profile.level} - "${profile.currentTitle}" với ${profile.stats.totalGamesPlayed} trận chiến! 🎮`,
          gameTipTag: 'flex',
        });
      }

      soundEngine.play('combo');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setPostedToChat(true);
      if (onOpenChat) {
        setTimeout(() => {
          onOpenChat();
        }, 800);
      }
    } catch (e) {
      console.warn('Post to chat error:', e);
    } finally {
      setIsPosting(false);
    }
  };

  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-lg w-full h-[90vh] sm:h-[650px] max-h-[700px] bg-[#0e0e12] border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-indigo-950/50 relative my-auto flex flex-col overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              {data.type === 'recap' ? <Camera className="w-5 h-5 text-cyan-400" /> : <Share2 className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-display uppercase tracking-wide">
                {data.type === 'recap' ? 'Game Recap • Thẻ Ảnh Tổng Kết' : data.type === 'achievement' ? 'Khoe Thành Tựu' : data.type === 'score' ? 'Khoe Kỷ Lục Điểm' : 'Chia Sẻ Hồ Sơ'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[240px] sm:max-w-xs">
                {data.type === 'recap' 
                  ? 'Thẻ ảnh tổng kết tự động chứa điểm số, thứ hạng' 
                  : 'Chia sẻ thành tích rực rỡ lên mạng xã hội hoặc chat'}
              </p>
            </div>
          </div>

          <CloseButton
            id="btn-close-share-modal"
            onClose={onClose}
            ariaLabel="Đóng chia sẻ"
          />
        </div>

        {/* Scrollable Share Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar min-h-0">

        {/* Game Recap Card Image Preview if available */}
        {data.recapImageUrl ? (
          <div className="space-y-3 mb-5">
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 shadow-2xl shadow-cyan-950/60 bg-black/60 group">
              <img
                src={data.recapImageUrl}
                alt="Thẻ Game Recap"
                className="w-full h-auto object-contain rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-cyan-400/30 text-[10px] font-mono text-cyan-300 font-bold flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>THẺ RECAP HD</span>
              </div>
            </div>

            <button
              id="btn-download-recap-png"
              type="button"
              onClick={handleDownloadImage}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Tải Thẻ Ảnh Recap Về Thiết Bị (.PNG)</span>
            </button>
          </div>
        ) : (
          /* Standard Visual Share Card */
          <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#181828] via-[#12121e] to-[#0c0c16] border border-indigo-500/40 shadow-inner mb-5">
            {/* Ambient Glows */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-fuchsia-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Badge & Info */}
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-fuchsia-600/30 border border-indigo-400/50 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/20 shrink-0">
                {data.badgeIcon || (data.type === 'score' ? '🔥' : '👑')}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {data.type === 'achievement' ? 'Thành Tựu Mở Khóa' : data.type === 'score' ? 'Kỷ Lục Điểm Cao' : 'Hồ Sơ ArcadeX'}
                  </span>
                  {data.gameTitle && (
                    <span className="text-[10px] text-slate-400 font-semibold truncate">
                      • {data.gameTitle}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white font-display truncate mt-0.5">
                  {data.title}
                </h3>

                {data.type === 'score' && typeof data.score === 'number' ? (
                  <div className="text-xl font-extrabold text-amber-300 font-mono tracking-tight flex items-center gap-1.5 mt-0.5">
                    <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                    <span>{(data.score || 0).toLocaleString()} ĐIỂM</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">
                    {data.description}
                  </p>
                )}
              </div>
            </div>

            {/* Player Identity Footer in Card */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">{data.playerAvatar || profile.avatar}</span>
                <div>
                  <span className="font-bold text-white block leading-tight">{data.playerName || profile.username}</span>
                  <span className="text-[10px] text-indigo-300 font-semibold">{data.playerTitle || profile.currentTitle}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono block">ARCADEX INSTANT</span>
                <span className="text-[11px] font-bold text-emerald-400 font-mono">CẤP {data.playerLevel || profile.level}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action 1: Instant In-Game Global Chat Share */}
        <div className="mb-4">
          <button
            id="btn-share-post-chat"
            type="button"
            onClick={handlePostToGlobalChat}
            disabled={postedToChat || isPosting}
            className={`w-full py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              postedToChat
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white shadow-indigo-500/25 active:scale-95 cursor-pointer'
            }`}
          >
            {postedToChat ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Đã Gửi Lên Phòng Chat Toàn Cầu! 🎉</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{isPosting ? 'Đang gửi...' : 'Khoe Ngay Lên Kênh Chat Toàn Cầu'}</span>
              </>
            )}
          </button>
        </div>

        {/* Action 2: Social Media Direct Shares */}
        <div className="space-y-2 mb-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Chia Sẻ Lên Mạng Xã Hội
          </span>
          <div className="grid grid-cols-4 gap-2">
            <button
              id="btn-share-fb"
              type="button"
              onClick={handleShareFacebook}
              className="py-2.5 px-2 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#1877F2] border border-[#1877F2]/30 text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>Facebook</span>
            </button>

            <button
              id="btn-share-twitter"
              type="button"
              onClick={handleShareTwitter}
              className="py-2.5 px-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>X (Twitter)</span>
            </button>

            <button
              id="btn-share-telegram"
              type="button"
              onClick={handleShareTelegram}
              className="py-2.5 px-2 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Telegram</span>
            </button>

            <button
              id="btn-share-whatsapp"
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2.5 px-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
        </div>

        {/* Action 3: Copy Link & Copy Caption */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 shrink-0">
          <button
            id="btn-copy-share-link"
            type="button"
            onClick={handleCopyLink}
            className="py-2.5 px-3 rounded-xl bg-[#14141c] hover:bg-white/10 active:scale-95 text-slate-200 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{copiedLink ? 'Đã Sao Chép Link!' : 'Sao Chép Link'}</span>
          </button>

          <button
            id="btn-copy-share-text"
            type="button"
            onClick={handleCopyText}
            className="py-2.5 px-3 rounded-xl bg-[#14141c] hover:bg-white/10 active:scale-95 text-slate-200 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Award className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copiedText ? 'Đã Copy Caption!' : 'Sao Chép Lời Khoe'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
