import re

with open('src/components/LeaderboardModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """                    {/* Rank Badge Indicator */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black border border-white/15 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-lg">
                      <span className={rankInfo.theme.textColor}>#{rank}</span>
                    </div>

                    <div className="mt-2 mb-3 relative">
                      <div className={`w-20 h-20 rounded-2xl bg-[#050505] border-2 ${rankInfo.theme.borderClass} flex items-center justify-center text-5xl shadow-inner relative z-10`}>
                        {entry.avatar}
                      </div>
                      {rank === 1 && (
                         <Crown className="w-8 h-8 text-yellow-400 absolute -top-5 -right-3 rotate-12 drop-shadow-[0_0_10px_rgba(253,224,71,0.6)] animate-bounce" />
                      )}
                    </div>

                    <div className="mb-3">
                      <h4 className="text-base font-bold text-white truncate max-w-[160px] flex items-center justify-center gap-1.5 mx-auto">
                        <span>{entry.playerName}</span>
                        {entry.isCurrentPlayer && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-bold border border-indigo-500/40">
                            Bạn
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{entry.title || 'Cao Thủ Arcade'}</p>
                    </div>

                    {/* Interactive Liên Quân Rank Badge with Next Requirement Tooltip */}
                    <div className="mb-3">
                      <RankBadge
                        elo={entry.score}
                        size="sm"
                        showDivision={true}
                        showTooltip={true}
                        isPodium={false}
                      />
                    </div>

                    {/* ELO Score Display */}
                    <div className="w-full py-2.5 rounded-xl bg-[#050505] border border-white/10 shadow-inner">
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-0.5 tracking-widest flex items-center justify-center gap-1">
                        <span>ELO SCORE</span>
                      </div>
                      <div className={`text-xl font-extrabold font-mono ${rankInfo.theme.textColor}`}>
                        {(entry.score || 0).toLocaleString()}
                      </div>
                    </div>"""

replacement = """                    {rank === 1 && <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent pointer-events-none" />}
                    <div className="flex items-center gap-3 sm:gap-4 w-full max-w-[50%]">
                      {/* Rank Badge Indicator */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 border border-white/15 flex items-center justify-center text-sm sm:text-base font-black shadow-lg z-10 shrink-0">
                        <span className={rankInfo.theme.textColor}>#{rank}</span>
                      </div>
                      <div className="relative shrink-0">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#050505] border-2 ${rankInfo.theme.borderClass} flex items-center justify-center text-2xl sm:text-3xl shadow-inner relative z-10`}>
                          {entry.avatar}
                        </div>
                        {rank === 1 && (
                           <Crown className="w-5 h-5 text-yellow-400 absolute -top-3 -right-2 rotate-12 drop-shadow-[0_0_10px_rgba(253,224,71,0.6)] animate-bounce z-20" />
                        )}
                      </div>
                      <div className="flex flex-col z-10 text-left min-w-0">
                        <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                          <span className="truncate">{entry.playerName}</span>
                          {entry.isCurrentPlayer && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-bold border border-indigo-500/40 shrink-0">
                              Bạn
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-slate-400 truncate">{entry.title || 'Cao Thủ Arcade'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6 z-10 shrink-0">
                      <div className="hidden sm:block">
                        <RankBadge
                          elo={entry.score}
                          size="sm"
                          showDivision={true}
                          showTooltip={true}
                          isPodium={false}
                        />
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                          ELO
                        </div>
                        <div className={`text-base sm:text-xl font-extrabold font-mono ${rankInfo.theme.textColor}`}>
                          {(entry.score || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>"""

content = content.replace(target, replacement)
with open('src/components/LeaderboardModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

