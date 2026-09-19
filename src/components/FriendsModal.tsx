import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  UserPlus,
  Swords,
  Search,
  Check,
  X,
  Clock,
  Shield,
  Trophy,
  Zap,
  Trash2,
  Eye,
  Sparkles,
  Gamepad2,
  AlertCircle
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Friend, FriendChallenge } from '../types';
import { soundEngine } from '../services/audio';
import { PlayerAvatar } from './common/PlayerAvatar';

const AVAILABLE_CHALLENGE_GAMES = [
  { id: 'xiangqi', name: 'Cờ Tướng PvP', icon: '♟️', desc: 'Đấu trí 1v1 thời gian thực' },
  { id: 'caro-gomoku', name: 'Cờ Caro Đấu Trí', icon: '⭕', desc: '5 quân liên tiếp trên bàn 15x15' },
  { id: 'neon-runner', name: 'Neon Runner', icon: '⚡', desc: 'Thách đấu điểm số vô tận' },
  { id: 'hex-match', name: 'Hex Match', icon: '🧩', desc: 'Ghép khối lục giác điểm cao' },
  { id: 'tile-2048', name: '2048 Cyber', icon: '🔢', desc: 'Ghép số 2048' },
  { id: 'cyber-slice', name: 'Blade Dash', icon: '⚔️', desc: 'Chém combo né chướng ngại' },
];

export const FriendsModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    friends,
    addFriendByUsername,
    removeFriend,
    sendFriendChallenge,
    sendGiftToFriend,
    incomingChallenges,
    respondToIncomingChallenge,
    triggerTestPvPChallenge,
    openPublicProfile,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'challenges'>('list');
  const [searchUsername, setSearchUsername] = useState('');
  const [searchStatus, setSearchStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [selectedFriendForChallenge, setSelectedFriendForChallenge] = useState<Friend | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string>('xiangqi');
  const [challengeSentFeedback, setChallengeSentFeedback] = useState<string | null>(null);
  const [selectedFriendForGift, setSelectedFriendForGift] = useState<Friend | null>(null);
  const [giftFeedback, setGiftFeedback] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const topEloFriendId = React.useMemo(() => {
    if (friends.length === 0) return null;
    let maxElo = -1;
    let topId = null;
    friends.forEach(f => {
      const elo = f.elo || 1200;
      if (elo > maxElo) {
        maxElo = elo;
        topId = f.id;
      }
    });
    return topId;
  }, [friends]);

  const isGiftAlreadySentToday = (friend: Friend) => {
    if (!friend.lastGiftSentAt) return false;
    return new Date(friend.lastGiftSentAt).toDateString() === new Date().toDateString();
  };

  const handleSendGift = async (friend: Friend, giftType: 'coins' | 'gems' | 'potion') => {
    soundEngine.play('click');
    const res = await sendGiftToFriend(friend.id, giftType);
    setGiftFeedback(res.message);
    setToastNotification(`🎁 Đã tặng quà thành công cho ${friend.username}! (+30 EXP, +50 Xu)`);
    setTimeout(() => {
      setSelectedFriendForGift(null);
      setGiftFeedback(null);
    }, 1800);
    setTimeout(() => {
      setToastNotification(null);
    }, 3500);
  };

  if (activeModal !== 'friends') return null;

  const onlineFriends = friends.filter((f) => f.isOnline);
  const offlineFriends = friends.filter((f) => !f.isOnline);

  const handleAddFriendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;

    setSearchStatus({ type: 'loading', message: 'Đang tìm kiếm người chơi...' });
    const res = await addFriendByUsername(searchUsername.trim());
    if (res.success) {
      setSearchStatus({ type: 'success', message: res.message });
      setSearchUsername('');
      setTimeout(() => {
        setSearchStatus({ type: 'idle', message: '' });
        setActiveTab('list');
      }, 1200);
    } else {
      setSearchStatus({ type: 'error', message: res.message });
    }
  };

  const handleOpenChallengePicker = (friend: Friend) => {
    soundEngine.play('click');
    setSelectedFriendForChallenge(friend);
    setSelectedGameId(friend.favoriteGameId || 'xiangqi');
    setChallengeSentFeedback(null);
  };

  const handleSendChallenge = async () => {
    if (!selectedFriendForChallenge) return;
    const challenge = await sendFriendChallenge(selectedFriendForChallenge, selectedGameId);
    setChallengeSentFeedback(`Đã gửi lời mời thách đấu ${challenge.gameTitle || challenge.gameName || 'Trò chơi'} tới ${selectedFriendForChallenge.username}!`);
    setTimeout(() => {
      setSelectedFriendForChallenge(null);
      setChallengeSentFeedback(null);
    }, 1500);
  };

  return (
    <div className="arcadex-modal-overlay">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="arcadex-modal-container-md bg-neutral-900/95 border border-cyan-500/30"
      >
        {/* Header */}
        <div className="relative px-5 py-4 border-b border-neutral-800 bg-gradient-to-r from-cyan-950/40 via-neutral-900 to-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-neutral-100 tracking-wide">Bạn Bè & Thách Đấu</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {friends.length} Bạn
                </span>
                {onlineFriends.length > 0 && (
                  <span className="flex items-center space-x-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{onlineFriends.length} Online</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">Kết bạn theo tên, theo dõi trạng thái và thách đấu trực tiếp</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.play('click');
              setActiveModal('none');
            }}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-4 pt-2 gap-2">
          <button
            onClick={() => {
              soundEngine.play('click');
              setActiveTab('list');
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg text-sm font-semibold transition border-b-2 ${
              activeTab === 'list'
                ? 'border-cyan-400 text-cyan-300 bg-neutral-900/80'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Danh Sách ({friends.length})</span>
          </button>

          <button
            onClick={() => {
              soundEngine.play('click');
              setActiveTab('add');
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg text-sm font-semibold transition border-b-2 ${
              activeTab === 'add'
                ? 'border-cyan-400 text-cyan-300 bg-neutral-900/80'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Bạn Mới</span>
          </button>

          <button
            onClick={() => {
              soundEngine.play('click');
              setActiveTab('challenges');
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg text-sm font-semibold transition border-b-2 relative ${
              activeTab === 'challenges'
                ? 'border-cyan-400 text-cyan-300 bg-neutral-900/80'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Thách Đấu</span>
            {incomingChallenges.length > 0 && (
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold animate-bounce">
                {incomingChallenges.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Content */}
        <div className="arcadex-modal-body p-5 space-y-4 relative custom-scrollbar">
          {/* Toast Notification for Gift / Actions */}
          <AnimatePresence>
            {toastNotification && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="sticky top-0 z-30 mb-3 p-3 rounded-xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 border border-emerald-500/50 text-emerald-200 text-xs font-bold shadow-xl flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span>{toastNotification}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setToastNotification(null)}
                  className="text-emerald-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: FRIENDS LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {friends.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-neutral-800 rounded-xl">
                  <div className="w-14 h-14 mx-auto rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-500 mb-3">
                    <Users className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-semibold text-neutral-300">Chưa có bạn bè nào</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Hãy nhập tên người chơi tại tab "Thêm Bạn Mới" để kết bạn và cùng so tài!
                  </p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Thêm bạn ngay</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Online Friends Section */}
                  {onlineFriends.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Đang Hoạt Động ({onlineFriends.length})</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">
                        {onlineFriends.map((friend) => {
                          const isTopElo = friend.id === topEloFriendId;
                          return (
                            <div
                              key={friend.id}
                              className={`flex items-center justify-between p-3.5 rounded-xl transition group ${
                                isTopElo
                                  ? 'bg-gradient-to-r from-amber-950/40 via-neutral-800/80 to-purple-950/40 border-2 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                                  : 'bg-neutral-800/60 border border-neutral-700/60 hover:border-cyan-500/40'
                              }`}
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className="relative">
                                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-inner ${
                                    isTopElo
                                      ? 'bg-gradient-to-br from-amber-500/30 to-purple-600/30 border-2 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                                      : 'bg-gradient-to-br from-neutral-700 to-neutral-800 border border-neutral-600'
                                  }`}>
                                    {friend.avatar}
                                  </div>
                                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-neutral-900"></span>
                                  {isTopElo && (
                                    <Trophy className="w-4 h-4 text-amber-400 absolute -top-2.5 -right-2 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-bounce" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-semibold text-sm text-neutral-100 truncate group-hover:text-cyan-300 transition flex items-center gap-1.5">
                                      <span>{friend.username}</span>
                                      {isTopElo && (
                                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/40 uppercase">
                                          👑 #1 ELO
                                        </span>
                                      )}
                                    </h4>
                                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      Lv.{friend.level}
                                    </span>
                                  </div>
                                  <p className="text-xs text-neutral-400 truncate">
                                    {friend.currentTitle} • <span className="text-cyan-400 font-mono font-medium">{friend.elo || 1200} ELO</span>
                                  </p>
                                  <p className="text-[11px] text-emerald-400/90 truncate flex items-center space-x-1 mt-0.5">
                                    <Zap className="w-3 h-3 inline" />
                                    <span>{friend.customStatus || 'Đang trực tuyến'}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                                <button
                                  onClick={() => {
                                    soundEngine.play('click');
                                    setSelectedFriendForGift(friend);
                                    setGiftFeedback(null);
                                  }}
                                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer ${
                                    isGiftAlreadySentToday(friend)
                                      ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-emerald-600/80 hover:bg-emerald-600 text-white active:scale-95'
                                  }`}
                                  title={isGiftAlreadySentToday(friend) ? 'Đã tặng quà hôm nay rồi' : 'Tặng quà cho bạn bè'}
                                >
                                  <span>🎁</span>
                                  <span className="hidden sm:inline">{isGiftAlreadySentToday(friend) ? 'Đã Tặng' : 'Tặng Quà'}</span>
                                </button>
                                <button
                                  onClick={() => handleOpenChallengePicker(friend)}
                                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-red-950/40 transition active:scale-95"
                                >
                                  <Swords className="w-3.5 h-3.5" />
                                  <span>Thách Đấu</span>
                                </button>
                                <button
                                  onClick={() => openPublicProfile(friend.id)}
                                  title="Xem Hồ Sơ"
                                  className="p-1.5 rounded-lg bg-neutral-700/50 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeFriend(friend.id)}
                                  title="Xóa Bạn"
                                  className="p-1.5 rounded-lg bg-neutral-700/30 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Offline Friends Section */}
                  {offlineFriends.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center space-x-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Ngoại Tuyến ({offlineFriends.length})</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">
                        {offlineFriends.map((friend) => (
                          <div
                            key={friend.id}
                            className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 opacity-80 hover:opacity-100 transition group"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="relative">
                                <div className="w-11 h-11 rounded-xl bg-neutral-800 flex items-center justify-center text-2xl border border-neutral-700 grayscale">
                                  {friend.avatar}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-neutral-600 border-2 border-neutral-900"></span>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-sm text-neutral-300 truncate">
                                    {friend.username}
                                  </h4>
                                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-neutral-800 text-neutral-400">
                                    Lv.{friend.level}
                                  </span>
                                </div>
                                <p className="text-xs text-neutral-500 truncate">
                                  {friend.currentTitle} • {friend.elo || 1200} ELO
                                </p>
                                <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                                  {friend.customStatus || 'Ngoại tuyến gần đây'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                              <button
                                onClick={() => {
                                  soundEngine.play('click');
                                  setSelectedFriendForGift(friend);
                                  setGiftFeedback(null);
                                }}
                                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer ${
                                  isGiftAlreadySentToday(friend)
                                    ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-emerald-600/80 hover:bg-emerald-600 text-white active:scale-95'
                                }`}
                                title={isGiftAlreadySentToday(friend) ? 'Đã tặng quà hôm nay rồi' : 'Tặng quà cho bạn bè'}
                              >
                                <span>🎁</span>
                                <span className="hidden sm:inline">{isGiftAlreadySentToday(friend) ? 'Đã Tặng' : 'Tặng Quà'}</span>
                              </button>
                              <button
                                onClick={() => handleOpenChallengePicker(friend)}
                                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition"
                              >
                                <Swords className="w-3.5 h-3.5" />
                                <span>Gửi Lời Mời</span>
                              </button>
                              <button
                                onClick={() => openPublicProfile(friend.id)}
                                title="Xem Hồ Sơ"
                                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeFriend(friend.id)}
                                title="Xóa Bạn"
                                className="p-1.5 rounded-lg bg-neutral-800/40 hover:bg-red-950/40 text-neutral-500 hover:text-red-400 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 2: ADD FRIEND BY USERNAME */}
          {activeTab === 'add' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/30 via-neutral-800/50 to-indigo-950/30 border border-cyan-500/20">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Tìm Kiếm & Kết Bạn Bằng Tên Người Chơi</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Nhập chính xác hoặc từ khóa tên người chơi trong hệ thống ArcadeX. Bạn có thể thách đấu ngay sau khi kết bạn!
                </p>

                <form onSubmit={handleAddFriendSubmit} className="mt-4 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={searchUsername}
                      onChange={(e) => setSearchUsername(e.target.value)}
                      placeholder="Ví dụ: ShadowBlade_VN, CyberDragon..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 text-sm focus:outline-none focus:border-cyan-400 placeholder-neutral-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!searchUsername.trim() || searchStatus.type === 'loading'}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold shadow-md shadow-cyan-950/40 disabled:opacity-50 transition flex items-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{searchStatus.type === 'loading' ? 'Đang tìm...' : 'Kết Bạn'}</span>
                  </button>
                </form>

                {searchStatus.message && (
                  <div
                    className={`mt-3 p-3 rounded-lg text-xs flex items-center space-x-2 ${
                      searchStatus.type === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                        : searchStatus.type === 'error'
                        ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {searchStatus.type === 'success' ? (
                      <Check className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{searchStatus.message}</span>
                  </div>
                )}
              </div>

              {/* Suggestions / Active Players */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gợi Ý Kỳ Thủ Trực Tuyến Nổi Bật</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { name: 'KỳVương_SàiThành', title: 'Đại Sư Cờ Tướng', avatar: '♟️', level: 28, elo: 1920, game: 'xiangqi' },
                    { name: 'PhượngHoàng_Lửa', title: 'Thợ Săn Kỷ Lục', avatar: '🔥', level: 22, elo: 1680, game: 'hex-match' },
                    { name: 'Caro_ThầnSầu', title: 'Bậc Thầy 5 Quân', avatar: '⭕', level: 31, elo: 2050, game: 'caro-gomoku' },
                    { name: 'Blade_Master_99', title: 'Kiếm Sĩ Cyber', avatar: '⚔️', level: 19, elo: 1540, game: 'cyber-slice' },
                  ].map((sug, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-neutral-800/40 border border-neutral-700/50 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-neutral-700 flex items-center justify-center text-xl">
                          {sug.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-neutral-200 truncate">{sug.name}</p>
                          <p className="text-[11px] text-neutral-400 truncate">
                            Lv.{sug.level} • <span className="text-cyan-400">{sug.elo} ELO</span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          const res = await addFriendByUsername(sug.name);
                          if (res.success) {
                            setActiveTab('list');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
                      >
                        + Kết Bạn
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHALLENGES */}
          {activeTab === 'challenges' && (
            <div className="space-y-4">
              {incomingChallenges.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-neutral-800 rounded-xl">
                  <div className="w-14 h-14 mx-auto rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-500 mb-3">
                    <Swords className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-semibold text-neutral-300">Không có lời thách đấu nào đang chờ</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Hãy gửi lời thách đấu bạn bè từ tab "Danh Sách" hoặc chờ bạn bè mời bạn so tài!
                  </p>
                  {triggerTestPvPChallenge && (
                    <div className="mt-4 pt-4 border-t border-neutral-800/80">
                      <button
                        type="button"
                        onClick={() => {
                          triggerTestPvPChallenge();
                          setActiveModal('none');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Thử nghiệm nhận lời mời thách đấu (Xem Toast PvP)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center space-x-2">
                    <Swords className="w-4 h-4 text-red-400 animate-pulse" />
                    <span>Lời Mời Thách Đấu Đến ({incomingChallenges.length})</span>
                  </h3>
                  {incomingChallenges.map((chal) => (
                    <div
                      key={chal.id}
                      className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-neutral-900 to-amber-950/40 border border-red-500/40 shadow-lg flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-2xl shadow-inner">
                          {chal.senderAvatar || chal.fromAvatar || '⚔️'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm text-neutral-100">{chal.senderName || chal.fromName}</h4>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-300 border border-red-500/30">
                              Thách Đấu
                            </span>
                          </div>
                          <p className="text-xs text-neutral-300 mt-0.5">
                            Trò chơi: <span className="text-amber-400 font-bold">{chal.gameTitle || chal.gameName}</span>
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {chal.senderTitle || chal.fromTitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => respondToIncomingChallenge(chal, true)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition flex items-center space-x-1.5 active:scale-95"
                        >
                          <Check className="w-4 h-4" />
                          <span>Chấp Nhận</span>
                        </button>
                        <button
                          onClick={() => respondToIncomingChallenge(chal, false)}
                          className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-red-300 text-xs font-semibold transition"
                        >
                          <X className="w-4 h-4" />
                          <span>Từ Chối</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* DIRECT CHALLENGE PICKER MODAL (OVERLAY) */}
        <AnimatePresence>
          {selectedFriendForChallenge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                      <Swords className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-100 text-base">
                        Thách Đấu: {selectedFriendForChallenge.username}
                      </h3>
                      <p className="text-xs text-neutral-400">Chọn trò chơi muốn so tài với bạn bè</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFriendForChallenge(null)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_CHALLENGE_GAMES.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => {
                        soundEngine.play('click');
                        setSelectedGameId(game.id);
                      }}
                      className={`p-3.5 rounded-xl border text-left flex items-center space-x-3 transition ${
                        selectedGameId === game.id
                          ? 'bg-red-950/40 border-red-500 text-white ring-1 ring-red-500 shadow-md shadow-red-950/40'
                          : 'bg-neutral-850/60 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                      }`}
                    >
                      <div className="text-2xl">{game.icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm leading-tight text-neutral-100">{game.name}</p>
                        <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">{game.desc}</p>
                      </div>
                      {selectedGameId === game.id && (
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {challengeSentFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{challengeSentFeedback}</span>
                  </motion.div>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setSelectedFriendForChallenge(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  onClick={handleSendChallenge}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 flex items-center space-x-2 transition active:scale-95"
                >
                  <Swords className="w-4 h-4" />
                  <span>Xác Nhận Thách Đấu</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Gift Picker Modal */}
      {selectedFriendForGift && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-neutral-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedFriendForGift(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl">
                🎁
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Gửi Quà Cho Bạn Bè</h3>
                <p className="text-xs text-neutral-400">Tặng vật phẩm / tiền tệ cho <span className="text-emerald-300 font-semibold">{selectedFriendForGift.username}</span> (1 lần/ngày)</p>
              </div>
            </div>

            {giftFeedback ? (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center my-3">
                {giftFeedback}
              </div>
            ) : (
              <div className="space-y-2.5 my-3">
                <button
                  onClick={() => handleSendGift(selectedFriendForGift, 'coins')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700 transition group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🪙</span>
                    <div className="text-left">
                      <p className="font-bold text-xs text-amber-300">50 Xu Vàng</p>
                      <p className="text-[10px] text-neutral-400">Tiền tệ hữu ích cho bạn bè</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-xs font-bold">Gửi</span>
                </button>

                <button
                  onClick={() => handleSendGift(selectedFriendForGift, 'gems')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700 transition group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💎</span>
                    <div className="text-left">
                      <p className="font-bold text-xs text-cyan-300">5 Kim Cương</p>
                      <p className="text-[10px] text-neutral-400">Đá quý quý hiếm</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 text-xs font-bold">Gửi</span>
                </button>

                <button
                  onClick={() => handleSendGift(selectedFriendForGift, 'potion')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700 transition group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🧪</span>
                    <div className="text-left">
                      <p className="font-bold text-xs text-purple-300">Vật Phẩm Tiêu Hao</p>
                      <p className="text-[10px] text-neutral-400">Hỗ trợ rèn & nâng cấp</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-bold">Gửi</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
