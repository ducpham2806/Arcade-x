import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Friend } from '../types';
import { SupabaseService } from '../services/supabase';
import { StorageService, DEFAULT_ACHIEVEMENTS } from '../services/storage';
import { usePlayer } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';
import { PlayerAvatar } from './common/PlayerAvatar';
import { soundEngine } from '../services/audio';
import confetti from 'canvas-confetti';
import {
  MessageSquare,
  Send,
  X,
  Minimize2,
  Maximize2,
  Heart,
  Sparkles,
  Trophy,
  Award,
  Lightbulb,
  HelpCircle,
  Flame,
  Volume2,
  VolumeX,
  Smile,
  ChevronDown,
  Users,
} from 'lucide-react';

interface GlobalChatProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenShare?: () => void;
}

const QUICK_TIPS = [
  '💡 Mẹo 2048: Luôn giữ ô số lớn nhất ở 1 góc và dồn hàng!',
  '⚡ Neon Runner: Nhảy 2 nhịp (Double Jump) đều tay để né gai kép.',
  '🎯 Blade Dash: Cắt combo x5 liên tục để nhân đôi điểm thưởng!',
  '🚀 Space Shooter: Ưu tiên nhặt đạn Laser để quét quái nhanh.',
  '🛡️ Pixel Dungeon: Luôn dụ từng quái vào hành lang hẹp để hạ gục.',
];

const EMOJIS = ['🔥', '🎮', '⚡', '🏆', '💎', '😎', '🚀', '💯', '✨', '👑'];

export const GlobalChat: React.FC<GlobalChatProps> = ({ isOpen, onToggle }) => {
  const { profile } = usePlayer();
  const { friends, activeGameId } = useGame();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedTag, setSelectedTag] = useState<'general' | 'tip' | 'score' | 'question'>('general');
  const [filterTag, setFilterTag] = useState<'all' | 'tip' | 'score' | 'question' | 'friends'>('all');
  const [selectedFriendDM, setSelectedFriendDM] = useState<Friend | null>(null);
  const [friendMessages, setFriendMessages] = useState<Record<string, Array<{ id: string; senderId: string; text: string; timestamp: number }>>>(() => {
    try {
      const saved = localStorage.getItem('arcadex_friend_dm_messages');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [dmInputText, setDmInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatMuted, setIsChatMuted] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTipsMenu, setShowTipsMenu] = useState(false);
  const [onlineCount, setOnlineCount] = useState(28);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dmMessagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef(true);

  // Save friend messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('arcadex_friend_dm_messages', JSON.stringify(friendMessages));
    } catch {}
  }, [friendMessages]);

  const handleSendDM = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dmInputText.trim() || !selectedFriendDM) return;

    const text = dmInputText.trim();
    setDmInputText('');
    const newMsg = {
      id: `dm_${Date.now()}_${Math.random()}`,
      senderId: profile.id,
      text,
      timestamp: Date.now(),
    };

    setFriendMessages(prev => {
      const existing = prev[selectedFriendDM.id] || [];
      return { ...prev, [selectedFriendDM.id]: [...existing, newMsg] };
    });

    soundEngine.play('shoot');

    // Simulate reply from friend after 1.5s if online
    if (selectedFriendDM.isOnline) {
      setTimeout(() => {
        const replies = [
          `Chào ${profile.username}! Mình đang chơi game rất hăng đây.`,
          `Tuyệt vời! Cùng rèn đồ và leo rank thôi 🎮`,
          `Cảm ơn bạn đã nhắn tin nhé! Hẹn đấu trường sớm nhất.`,
          `Haha chuẩn luôn! Bạn đỉnh quá ⚡`,
        ];
        const replyText = replies[Math.floor(Math.random() * replies.length)];
        const replyMsg = {
          id: `dm_reply_${Date.now()}`,
          senderId: selectedFriendDM.id,
          text: replyText,
          timestamp: Date.now(),
        };
        setFriendMessages(curr => {
          const ex = curr[selectedFriendDM.id] || [];
          return { ...curr, [selectedFriendDM.id]: [...ex, replyMsg] };
        });
        if (!isChatMuted) soundEngine.play('coin');
      }, 1500);
    }
  };

  // Online count random subtle realistic variance
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((prev) => Math.max(15, prev + Math.floor(Math.random() * 3) - 1));
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to real-time chat messages
  useEffect(() => {
    const unsubscribe = SupabaseService.subscribeToChat((newMessages) => {
      setMessages(newMessages);

      if (!isFirstLoadRef.current && !isOpen) {
        setUnreadCount((c) => c + 1);
        if (!isChatMuted) {
          soundEngine.play('coin');
        }
      }
      isFirstLoadRef.current = false;
    });

    return () => unsubscribe();
  }, [isOpen, isChatMuted]);

  // Auto scroll to bottom when new messages arrive and chat is open
  useEffect(() => {
    if (isOpen) {
      if (filterTag === 'friends' && selectedFriendDM) {
        dmMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      setUnreadCount(0);
    }
  }, [messages, friendMessages, isOpen, filterTag, selectedFriendDM]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputText('');
    setShowEmojiPicker(false);
    setShowTipsMenu(false);

    try {
      await SupabaseService.sendChatMessage({
        senderId: profile.id,
        senderName: profile.username,
        senderAvatar: profile.avatar,
        senderTitle: profile.currentTitle,
        senderLevel: profile.level,
        text,
        gameTipTag: selectedTag,
      });
      soundEngine.play('shoot');
    } catch (err) {
      console.warn('Send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendQuickTip = (tip: string) => {
    setInputText(tip);
    setSelectedTag('tip');
    setShowTipsMenu(false);
  };

  const handleLikeMessage = (messageId: string) => {
    soundEngine.play('click');
    SupabaseService.toggleLikeChatMessage(messageId, profile.id);
  };

  const filteredMessages = messages.filter((m) => {
    if (filterTag === 'all') return true;
    return m.gameTipTag === filterTag;
  });

  const getTitleRarity = (titleStr: string) => {
    const ach = DEFAULT_ACHIEVEMENTS.find(a => a.rewardTitle === titleStr);
    if (!ach) return 'common';
    return ach.rewardGems >= 30 ? 'legendary' : (ach.rewardGems >= 20 ? 'epic' : 'rare');
  };

  return (
    <>
      {/* Floating Chat Window (Native Drawer on Mobile, Popover on Desktop) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col justify-end sm:justify-start">
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto transition-opacity"
            onClick={onToggle}
          />

          <div
            id="window-global-chat"
            className="pointer-events-auto relative z-[101] mb-[74px] sm:mb-0 sm:fixed sm:bottom-[76px] sm:right-5 w-full sm:w-96 md:w-[420px] h-[72vh] sm:h-[580px] max-h-[75vh] sm:max-h-[calc(100vh-100px)] bg-[#0c0c14] border border-indigo-500/40 rounded-3xl shadow-2xl shadow-black/90 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            {/* Mobile Drag Indicator Handle */}
            <div className="sm:hidden w-full flex justify-center pt-2 pb-0.5 bg-gradient-to-r from-indigo-950/90 via-[#101020] to-[#0c0c16] cursor-pointer" onClick={onToggle}>
              <div className="w-10 h-1 rounded-full bg-white/25" />
            </div>

            {/* Top Bar Header */}
            <div className="px-4 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-950/80 via-[#101020] to-[#0c0c16] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                {filterTag === 'friends' && selectedFriendDM ? (
                  <button
                    type="button"
                    onClick={() => setSelectedFriendDM(null)}
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer mr-1"
                    title="Trở lại danh sách bạn bè"
                  >
                    ←
                  </button>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider">
                      {filterTag === 'friends' && selectedFriendDM ? `Chat: ${selectedFriendDM.username}` : 'Phòng Chat Toàn Cầu'}
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    {filterTag === 'friends' && selectedFriendDM ? (
                      <span className="text-emerald-400 font-semibold">
                        {selectedFriendDM.isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {onlineCount} Online
                      </span>
                    )}
                    <span>• Real-time Sync</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsChatMuted(!isChatMuted)}
                  className={`p-1.5 rounded-lg border text-slate-400 hover:text-white transition-colors cursor-pointer ${
                    isChatMuted ? 'bg-rose-500/20 border-rose-500/30 text-rose-300' : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                  title={isChatMuted ? 'Bật âm thanh chat' : 'Tắt âm thanh chat'}
                >
                  {isChatMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  id="btn-close-chat"
                  type="button"
                  onClick={onToggle}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Đóng khung chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Channel Filters - Grid layout on all devices */}
            <div className="px-3 py-1.5 bg-[#090910] border-b border-white/5 grid grid-cols-5 gap-1 text-[11px] shrink-0">
              <button
                type="button"
                onClick={() => { setFilterTag('all'); setSelectedFriendDM(null); }}
                className={`py-1.5 px-1 rounded-lg font-bold text-center transition-colors cursor-pointer border ${
                  filterTag === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/30'
                    : 'bg-white/5 text-slate-400 hover:text-white border-transparent'
                }`}
              >
                Tất Cả
              </button>
              <button
                type="button"
                onClick={() => { setFilterTag('tip'); setSelectedFriendDM(null); }}
                className={`py-1.5 px-1 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border ${
                  filterTag === 'tip'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-sm shadow-amber-500/30'
                    : 'bg-white/5 text-amber-400 hover:text-amber-300 border-transparent'
                }`}
              >
                <Lightbulb className="w-3 h-3 shrink-0" />
                <span>Mẹo</span>
              </button>
              <button
                type="button"
                onClick={() => { setFilterTag('score'); setSelectedFriendDM(null); }}
                className={`py-1.5 px-1 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border ${
                  filterTag === 'score'
                    ? 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-sm shadow-fuchsia-500/30'
                    : 'bg-white/5 text-fuchsia-400 hover:text-fuchsia-300 border-transparent'
                }`}
              >
                <Trophy className="w-3 h-3 shrink-0" />
                <span>Kỷ Lục</span>
              </button>
              <button
                type="button"
                onClick={() => { setFilterTag('question'); setSelectedFriendDM(null); }}
                className={`py-1.5 px-1 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border ${
                  filterTag === 'question'
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm shadow-cyan-500/30'
                    : 'bg-white/5 text-cyan-400 hover:text-cyan-300 border-transparent'
                }`}
              >
                <HelpCircle className="w-3 h-3 shrink-0" />
                <span>Hỏi</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterTag('friends')}
                className={`py-1.5 px-1 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border ${
                  filterTag === 'friends'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/30'
                    : 'bg-white/5 text-emerald-400 hover:text-emerald-300 border-transparent'
                }`}
              >
                <Users className="w-3 h-3 shrink-0" />
                <span>Bạn Bè</span>
              </button>
            </div>

          {/* Chat Messages Feed or Friend List */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {filterTag === 'friends' && !selectedFriendDM ? (
              friends.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                  <Users className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs">Chưa có bạn bè nào.</p>
                  <p className="text-[11px] text-slate-600">Hãy thêm bạn bè từ bảng xếp hạng hoặc profile để trò chuyện riêng!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 px-1 mb-1">Chọn bạn bè để mở khung chat riêng:</div>
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      onClick={() => setSelectedFriendDM(friend)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#12121e] border border-white/10 hover:border-emerald-500/40 hover:bg-[#151525] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl shadow-md">
                            {friend.avatar}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#12121e] ${friend.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">{friend.username}</h4>
                          <p className="text-[10px] text-slate-400">{friend.isOnline ? 'Đang online' : 'Offline'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                        Nhắn Tin 💬
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : filterTag === 'friends' && selectedFriendDM ? (
              /* 1-on-1 DM Chat Feed */
              <div className="space-y-3">
                <div className="text-center py-2">
                  <span className="text-[10px] px-3 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5 font-mono">
                    Đang trò chuyện riêng với {selectedFriendDM.username}
                  </span>
                </div>
                {(!friendMessages[selectedFriendDM.id] || friendMessages[selectedFriendDM.id].length === 0) ? (
                  <div className="h-40 flex flex-col items-center justify-center text-center p-4 text-slate-500">
                    <MessageSquare className="w-8 h-8 opacity-30 mb-2" />
                    <p className="text-xs">Chưa có tin nhắn nào với {selectedFriendDM.username}.</p>
                    <p className="text-[11px] text-slate-600">Hãy gửi lời chào mở đầu cuộc trò chuyện!</p>
                  </div>
                ) : (
                  (friendMessages[selectedFriendDM.id] || []).map((dm) => {
                    const isMe = dm.senderId === profile.id;
                    return (
                      <div
                        key={dm.id}
                        className={`flex flex-col space-y-1 ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 px-1">
                          <span className="text-[11px] font-bold text-slate-300">
                            {isMe ? profile.username : selectedFriendDM.username}
                          </span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed break-words shadow-md ${
                            isMe
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-tr-none'
                              : 'bg-[#151522] text-slate-200 border border-white/5 rounded-tl-none'
                          }`}
                        >
                          <p>{dm.text}</p>
                          <span className="block text-[9px] text-white/60 text-right mt-1">
                            {new Date(dm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={dmMessagesEndRef} />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <MessageSquare className="w-8 h-8 opacity-40 mb-2" />
                <p className="text-xs">Chưa có tin nhắn nào trong mục này.</p>
                <p className="text-[11px] text-slate-600">Hãy là người đầu tiên chia sẻ mẹo chơi!</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMe = msg.senderId === profile.id;
                const hasLiked = msg.likedBy?.includes(profile.id);

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col space-y-1 ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {/* Header: Sender Name, Level, Badge */}
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-xs">{msg.senderAvatar}</span>
                      <span className={`text-[11px] font-bold ${isMe ? 'text-indigo-400' : 'text-slate-200'}`}>
                        {msg.senderName}
                      </span>
                      {msg.gameTipTag === 'tip' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          Mẹo 💡
                        </span>
                      )}
                      {msg.gameTipTag === 'score' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-fuchsia-500/20 text-fuchsia-300 font-bold border border-fuchsia-500/30">
                          Kỷ Lục 🏆
                        </span>
                      )}
                      {msg.gameTipTag === 'question' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                          Hỏi ❓
                        </span>
                      )}
                      {msg.gameTipTag === 'recap' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                          Recap 📸
                        </span>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed break-words shadow-md ${
                        isMe
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                          : 'bg-[#151522] text-slate-200 border border-white/5 rounded-tl-none'
                      }`}
                    >
                      {/* Shared Achievement Card inside Chat */}
                      {msg.sharedAchievement && (
                        <div className="mb-2 p-2.5 rounded-xl bg-black/40 border border-amber-400/40 flex items-center gap-2.5">
                          <span className="text-2xl">{msg.sharedAchievement.icon}</span>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-amber-300 uppercase block">Thành Tựu Đã Mở Khóa</span>
                            <span className="text-xs font-bold text-white block truncate">{msg.sharedAchievement.title}</span>
                            <span className="text-[10px] text-slate-300 line-clamp-1">{msg.sharedAchievement.description}</span>
                          </div>
                        </div>
                      )}

                      {/* Shared High Score & Game Recap Card inside Chat */}
                      {msg.sharedScore && (
                        <div className="mb-2.5 p-2.5 rounded-xl bg-black/50 border border-fuchsia-400/40 shadow-sm">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <div className="w-8 h-8 rounded-lg bg-fuchsia-600/30 flex items-center justify-center text-lg shrink-0">
                              {msg.sharedScore.recapImageUrl ? '📸' : '🔥'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-bold text-fuchsia-300 uppercase truncate">
                                  {msg.sharedScore.gameTitle}
                                </span>
                                {msg.sharedScore.achievedRank && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30 shrink-0">
                                    {msg.sharedScore.achievedRank}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-extrabold text-amber-300 font-mono">
                                {(msg.sharedScore.score || 0).toLocaleString()} ĐIỂM
                              </span>
                            </div>
                          </div>

                          {msg.sharedScore.recapImageUrl && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-white/10 relative group">
                              <img
                                src={msg.sharedScore.recapImageUrl}
                                alt="Thẻ Recap"
                                className="w-full h-auto object-cover max-h-40 cursor-pointer"
                                onClick={() => {
                                  if (msg.sharedScore?.recapImageUrl) {
                                    const w = window.open('');
                                    w?.document.write(`<img src="${msg.sharedScore.recapImageUrl}" style="max-width:100%;height:auto;" />`);
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Text */}
                      <p>{msg.text}</p>

                      {/* Footer: Time & Like Button */}
                      <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-white/10 text-[10px] text-slate-400">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button
                          type="button"
                          onClick={() => handleLikeMessage(msg.id)}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md active:scale-90 transition-all cursor-pointer ${
                            hasLiked ? 'text-rose-400 bg-rose-500/20 font-bold' : 'hover:text-rose-300 hover:bg-white/10 bg-white/5'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${hasLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                          <span>{msg.likes || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Tips & Emojis Popovers */}
          {showTipsMenu && (
            <div className="p-2 bg-[#121220] border-t border-indigo-500/30 space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[11px] text-indigo-300 font-bold px-1">
                <span>Chọn Mẹo Chơi Nhanh:</span>
                <button type="button" onClick={() => setShowTipsMenu(false)} className="text-slate-400 hover:text-white p-1 active:scale-90 transition-all cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {QUICK_TIPS.map((tip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendQuickTip(tip)}
                    className="w-full text-left p-1.5 rounded-lg bg-white/5 hover:bg-indigo-600/30 active:scale-[0.98] text-xs text-slate-300 hover:text-white transition-all truncate block cursor-pointer"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showEmojiPicker && (
            <div className="p-2 bg-[#121220] border-t border-indigo-500/30 flex items-center justify-between gap-1 flex-wrap">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setInputText((prev) => prev + emoji)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 active:scale-90 text-base flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Bottom Chat Input Form */}
          {filterTag === 'friends' && !selectedFriendDM ? (
            <div className="p-3 bg-[#08080f] border-t border-white/10 text-center text-xs text-slate-500">
              Chọn một người bạn ở trên để nhắn tin riêng.
            </div>
          ) : (
            <form onSubmit={filterTag === 'friends' && selectedFriendDM ? handleSendDM : handleSendMessage} className="p-3 bg-[#08080f] border-t border-white/10 shrink-0 space-y-2">
              {/* Tag Selection Bar (Only for global chat) */}
              {filterTag !== 'friends' && (
                <div className="flex items-center justify-between gap-1 text-[10px]">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 font-medium">Nhãn:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTag('general')}
                      className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                        selectedTag === 'general' ? 'bg-indigo-600 text-white font-bold' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Chung
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTag('tip')}
                      className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                        selectedTag === 'tip' ? 'bg-amber-600 text-white font-bold' : 'bg-white/5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                      }`}
                    >
                      Mẹo 💡
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTag('question')}
                      className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                        selectedTag === 'question' ? 'bg-cyan-600 text-white font-bold' : 'bg-white/5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10'
                      }`}
                    >
                      Hỏi ❓
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowTipsMenu(!showTipsMenu)}
                      className="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Lightbulb className="w-2.5 h-2.5" />
                      <span>Mẫu Mẹo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 active:scale-90 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="Chèn biểu cảm"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Input & Send Button */}
              <div className="flex items-center gap-2">
                <input
                  id="input-chat-message"
                  type="text"
                  value={filterTag === 'friends' && selectedFriendDM ? dmInputText : inputText}
                  onChange={(e) => {
                    if (filterTag === 'friends' && selectedFriendDM) {
                      setDmInputText(e.target.value);
                    } else {
                      setInputText(e.target.value);
                    }
                  }}
                  maxLength={300}
                  placeholder={filterTag === 'friends' && selectedFriendDM ? `Nhắn tin cho ${selectedFriendDM.username}...` : 'Nhập tin nhắn hoặc mẹo chơi...'}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#12121e] border border-white/10 text-white placeholder-slate-500 text-xs outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  id="btn-send-chat"
                  type="submit"
                  disabled={filterTag === 'friends' && selectedFriendDM ? !dmInputText.trim() : (!inputText.trim() || isSending)}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95 shrink-0"
                  aria-label="Gửi tin nhắn"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )}
  </>
);
};
