import re

with open('src/components/LeaderboardModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target_header = """            <div className="px-5 py-3.5 bg-[#0a0a0f] border-b border-white/5 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex-1">Xếp Hạng & Game Thủ</div>
              <div className="w-36 text-center">Bậc Hạng Liên Quân</div>
              <div className="w-28 text-right">Điểm ELO</div>
            </div>"""
            
replacement_header = """            <div className="px-3 sm:px-5 py-3 bg-[#0a0a0f] border-b border-white/5 flex items-center justify-between text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex-1">Hạng & Game Thủ</div>
              <div className="hidden sm:block w-36 text-center">Bậc Hạng</div>
              <div className="w-16 sm:w-28 text-right">ELO</div>
            </div>"""

content = content.replace(target_header, replacement_header)

target_item = """                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className="w-6 text-center text-sm font-black text-slate-500 font-mono">
                          #{entry.rank}
                        </span>
                        <div className={`w-10 h-10 rounded-xl bg-[#0a0a0a] border ${rankInfo.theme.borderClass} flex items-center justify-center text-xl shrink-0`}>
                          {entry.avatar}
                        </div>
                        <div className="min-w-0 pr-4">
                          <div className="text-sm font-bold text-white flex items-center gap-2 truncate">
                            <span>{entry.playerName}</span>
                            {isPlayer && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                                Bạn
                              </span>
                            )}
                            {filterView === 'daily_best' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                                Hôm nay
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 truncate block">{entry.title || 'Tân Binh Arcade'}</span>
                        </div>
                      </div>

                      {/* Interactive Rank Badge */}
                      <div className="w-36 flex items-center justify-center shrink-0">
                        <RankBadge
                          elo={entry.score}
                          size="xs"
                          showDivision={true}
                          showTooltip={true}
                          isPodium={false}
                        />
                      </div>

                      {/* ELO Score Display */}
                      <div className="w-28 text-right shrink-0">
                        <div className={`text-base font-black font-mono ${rankInfo.theme.textColor}`}>
                          {(entry.score || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                          ELO
                        </div>
                      </div>"""

replacement_item = """                      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                        <span className="w-5 sm:w-6 text-center text-xs sm:text-sm font-black text-slate-500 font-mono">
                          #{entry.rank}
                        </span>
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0a0a0a] border ${rankInfo.theme.borderClass} flex items-center justify-center text-lg sm:text-xl shrink-0`}>
                          {entry.avatar}
                        </div>
                        <div className="min-w-0 pr-2 sm:pr-4">
                          <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                            <span className="truncate">{entry.playerName}</span>
                            {isPlayer && (
                              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 shrink-0">
                                Bạn
                              </span>
                            )}
                            {filterView === 'daily_best' && (
                              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium shrink-0">
                                Hôm nay
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] sm:text-[10px] text-slate-500 truncate block">{entry.title || 'Tân Binh Arcade'}</span>
                        </div>
                      </div>

                      {/* Interactive Rank Badge */}
                      <div className="hidden sm:flex w-36 items-center justify-center shrink-0">
                        <RankBadge
                          elo={entry.score}
                          size="xs"
                          showDivision={true}
                          showTooltip={true}
                          isPodium={false}
                        />
                      </div>

                      {/* ELO Score Display */}
                      <div className="w-16 sm:w-28 text-right shrink-0">
                        <div className={`text-sm sm:text-base font-black font-mono ${rankInfo.theme.textColor}`}>
                          {(entry.score || 0).toLocaleString()}
                        </div>
                      </div>"""

content = content.replace(target_item, replacement_item)
with open('src/components/LeaderboardModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

