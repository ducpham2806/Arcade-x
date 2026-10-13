import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { useGame } from "../context/GameContext";
import { usePlayer } from "../context/PlayerContext";
import { ALL_GAMES_LIST, GAME_REGISTRY } from "../games/registry";
import { SupabaseService } from "../services/supabase";
import type { LeaderboardEntry } from "../types";
import { WordRankingPanel } from "../games/word-cross/RankingPanel";
import type { WordSave } from "../games/word-cross/types";
import { RankingPanel } from "../games/car-escape/RankingPanel";
import { readGameSave } from "../services/gameSaves";
import { CosmicRankingPanel } from "../games/cosmic-defense/RankingPanel";
import { CloseButton } from "./common/CloseButton";

export const LeaderboardModal: React.FC<{ initialGameId?: string }> = ({
  initialGameId,
}) => {
  const { setActiveModal } = useGame();
  const { profile } = usePlayer();
  const [gameId, setGameId] = useState(
    initialGameId && GAME_REGISTRY[initialGameId]
      ? initialGameId
      : ALL_GAMES_LIST[0].id,
  );
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  useEffect(() => {
    setEntries([]);
    if (gameId === "car-escape" || gameId === "word-cross" || gameId === "cosmic-defense") return;
    return SupabaseService.subscribeToGameLeaderboard(gameId, setEntries, 20);
  }, [gameId]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveModal("none");
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [setActiveModal]);
  const gamePicker = <label htmlFor="leaderboard-game" style={{display:'block',marginBottom:20}}>Trò chơi
    <select id="leaderboard-game" value={gameId} onChange={e=>setGameId(e.target.value)} style={{display:'block',width:'100%',minHeight:44,padding:10,marginTop:8,borderRadius:12,background:'#fff',color:'#253249',border:'1px solid #aeb9cd'}}>
      {ALL_GAMES_LIST.map(game=><option key={game.id} value={game.id}>{game.title}</option>)}
    </select>
  </label>;
  if (gameId === "cosmic-defense") return <CosmicRankingPanel gamePicker={gamePicker} onClose={() => setActiveModal("none")} />;
  if (gameId === "word-cross") {
    const saved = readGameSave("word-cross") as WordSave | undefined;
    return (
      <WordRankingPanel
        save={saved}
        gamePicker={gamePicker}
        level={saved?.run?.puzzle?.level || 1}
        onClose={() => setActiveModal("none")}
      />
    );
  }
  if (gameId === "car-escape") {
    const saved = readGameSave("car-escape") as any;
    return (
      <RankingPanel
        level={saved?.run?.level || 1}
        gamePicker={gamePicker}
        result={saved?.results?.[saved?.run?.level || 1]}
        onClose={() => setActiveModal("none")}
      />
    );
  }
  return (
    <div
      className="platform-ui arcadex-modal-overlay"
      onClick={() => setActiveModal("none")}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="leaderboard-title"
        className="arcadex-modal-container p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <h2
            id="leaderboard-title"
            className="text-xl font-bold flex items-center gap-2 text-white"
          >
            <Trophy size={22} />
            Bảng điểm game
          </h2>
          <CloseButton onClose={() => setActiveModal("none")} />
        </header>
        <div className="py-4 shrink-0 space-y-3">
          <label htmlFor="leaderboard-game" className="text-sm text-slate-300">
            Trò chơi
          </label>
          <select
            id="leaderboard-game"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="block w-full rounded-xl border border-white/15 bg-slate-950 p-3 text-white"
          >
            {ALL_GAMES_LIST.map((game) => (
              <option key={game.id} value={game.id}>
                {game.title}
              </option>
            ))}
          </select>
          <p className="text-sm text-indigo-200">
            Kỷ lục của bạn:{" "}
            {(profile.stats.highScores[gameId] || 0).toLocaleString()} điểm
          </p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <ol className="space-y-2">
            {entries.map((entry, i) => (
              <li
                key={`${entry.playerName}-${i}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5"
              >
                <span className="text-sm text-slate-400 w-8">{i + 1}</span>
                <span aria-hidden="true" className="text-xl">
                  {entry.avatar?.startsWith("http")
                    ? "🎮"
                    : entry.avatar || "🎮"}
                </span>
                <span className="flex-1 min-w-0 truncate text-sm text-white">
                  {entry.playerName}
                </span>
                <span className="font-mono text-lime-200">
                  {entry.score.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
          {entries.length === 0 && (
            <p className="text-slate-400 text-center py-12">
              Chưa có điểm được tải cho game này.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

