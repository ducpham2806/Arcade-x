const fs = require('fs');
let code = fs.readFileSync('src/games/caro-gomoku/index.tsx', 'utf-8');

const importStatement = `import { BoardLayout } from '../../components/games/BoardLayout';\n`;
if (!code.includes("import { BoardLayout")) {
  code = code.replace("import { GameComponentProps }", importStatement + "import { GameComponentProps }");
}

const lines = code.split('\n');

let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("4. ACTIVE BOARD & PLAYING VIEW")) {
    startIndex = i + 2; // the {(screenMode === 'playing... line
  }
  if (lines[i].includes("5. MATCH RESULT MODAL")) {
    endIndex = i - 1; // the line before { /* 5. MATCH RESULT MODAL...
    break;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  const before = lines.slice(0, startIndex).join('\n');
  const after = lines.slice(endIndex).join('\n');
  
  const replacement = `      {(screenMode === 'playing' || screenMode === 'ai_practice') && (
        <BoardLayout
          header={
            <div className="w-full flex items-center justify-between bg-[#10101c]/95 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSurrenderConfirm(true)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Thoát</span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 font-serif text-lg">
                    #
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-bold text-indigo-100 flex items-center gap-2">
                      Cờ Ca-rô
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {screenMode === 'ai_practice' ? 'Tập luyện' : 'Xếp hạng'}
                      </span>
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          }
          topPlayer={{
            name: screenMode === 'ai_practice' ? \`ArcadeX Bot (\${aiDifficulty === 'easy' ? 'Tập sự' : aiDifficulty === 'medium' ? 'Cao thủ' : 'Bất bại'})\` : opponentInfo?.displayName || 'Đối thủ',
            avatar: screenMode === 'ai_practice' ? '🤖' : opponentInfo?.avatar || '🎮',
            elo: screenMode === 'ai_practice' ? (aiDifficulty === 'easy' ? 1000 : aiDifficulty === 'medium' ? 1350 : 1600) : opponentInfo?.elo || 1200,
            isTurn: !isMyTurn && !isMatchFinished,
            statusText: 'Đang nghĩ...',
            timeLeft: screenMode === 'playing' ? secondsRemaining : undefined,
            isOnline: screenMode === 'playing' ? true : undefined,
            colorTheme: 'rose',
            symbolMarker: opponentSymbol
          }}
          bottomPlayer={{
            name: profile?.username || 'Bạn',
            avatar: profile?.avatar || '😎',
            elo: playerElo,
            isTurn: isMyTurn && !isMatchFinished,
            statusText: 'Lượt của bạn',
            timeLeft: screenMode === 'playing' ? secondsRemaining : undefined,
            isOnline: true,
            colorTheme: 'cyan',
            symbolMarker: mySymbol
          }}
          board={
            <div className="relative p-1 sm:p-2 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#121220] via-[#0d0d18] to-[#0a0a10] border border-indigo-500/30 shadow-2xl shadow-black/90 overflow-hidden w-full max-w-[480px]">
              <div
                className="grid gap-0 bg-[#090912] border border-indigo-500/40 rounded-xl p-1 shadow-inner w-full aspect-square"
                style={{
                  gridTemplateColumns: \`repeat(\${BOARD_SIZE}, minmax(0, 1fr))\`
                }}
              >
                {Array.from({ length: BOARD_SIZE }).map((_, row) =>
                  Array.from({ length: BOARD_SIZE }).map((_, col) => {
                    const cellKey = \`\${row}_\${col}\`;
                    const stone = activeBoard[cellKey];
                    const isLast = activeLastMove?.x === row && activeLastMove?.y === col;
                    const isWinningStone = activeWinningLine?.some((p) => p.x === row && p.y === col);
                    const isStar = STAR_POINTS.some((p) => p.x === row && p.y === col);
                    const isHovered = hoverCell?.x === row && hoverCell?.y === col && !stone && isMyTurn && !isMatchFinished;

                    return (
                      <div
                        key={cellKey}
                        onClick={() => handleCellClick(row, col)}
                        onMouseEnter={() => setHoverCell({ x: row, y: col })}
                        onMouseLeave={() => setHoverCell(null)}
                        className="relative border-[0.5px] border-indigo-500/20 flex items-center justify-center cursor-pointer transition-colors duration-150 group"
                      >
                        {/* Star Dot Marker */}
                        {isStar && !stone && (
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/50 pointer-events-none" />
                        )}

                        {/* Hover Ghost Stone */}
                        {isHovered && (
                          <div className="w-4/5 h-4/5 rounded-full bg-white/20 border border-white/40 animate-pulse pointer-events-none flex items-center justify-center text-[10px] font-bold opacity-60">
                            {mySymbol}
                          </div>
                        )}

                        {/* Placed Stone */}
                        {stone && (
                          <div
                            className={\`w-[85%] h-[85%] rounded-full flex items-center justify-center font-black text-[10px] sm:text-xs shadow-md select-none transition-transform transform scale-100 \${
                              stone === 'X'
                                ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-black shadow-cyan-500/50 border border-cyan-200'
                                : 'bg-gradient-to-br from-rose-400 to-red-600 text-white shadow-rose-500/50 border border-rose-200'
                            } \${isWinningStone ? 'ring-2 sm:ring-4 ring-amber-400 animate-bounce z-10' : ''} \${
                              isLast ? 'ring-1 sm:ring-2 ring-white/80' : ''
                            }\`}
                          >
                            {stone}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Draw Offer Banner in Live Match */}
              {screenMode === 'playing' && roomData?.drawOfferFrom && roomData.drawOfferFrom !== myRole && !isMatchFinished && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[90%] px-4 py-2.5 rounded-2xl bg-amber-950/95 border border-amber-400 text-amber-200 text-xs flex flex-col items-center justify-center gap-2 shadow-2xl z-20 animate-in slide-in-from-top-2">
                  <span className="flex items-center gap-1.5 font-bold text-center">
                    <Handshake className="w-4 h-4 text-amber-400" />
                    Đối thủ vừa cầu hòa!
                  </span>
                  <div className="flex items-center justify-center gap-2 w-full">
                    <button onClick={handleAcceptDraw} className="flex-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold">
                      Chấp nhận
                    </button>
                    <button onClick={handleRejectDraw} className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-600">
                      Từ chối
                    </button>
                  </div>
                </div>
              )}
            }
          }
          controls={
            <div className="w-full flex flex-col items-center gap-2 mt-1 z-10">
              <div className="w-full max-w-xl flex flex-wrap items-center justify-between gap-2 px-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSurrenderConfirm(true)}
                    disabled={isMatchFinished}
                    className="px-3.5 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-30 cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Đầu Hàng</span>
                  </button>
                  {screenMode === 'playing' && (
                    <button
                      onClick={handleOfferDraw}
                      disabled={isMatchFinished || roomData?.drawOfferFrom === myRole}
                      className="px-3.5 py-2 rounded-xl bg-amber-950/50 hover:bg-amber-900 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-30 cursor-pointer"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                      <span>{roomData?.drawOfferFrom === myRole ? 'Đã Cầu Hòa' : 'Cầu Hòa'}</span>
                    </button>
                  )}
                </div>

                {/* Quick Emote Buttons */}
                {screenMode === 'playing' && (
                  <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                    {QUICK_EMOTES.slice(0, 5).map((emote) => (
                      <button
                        key={emote}
                        onClick={() => handleSendEmote(emote)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-base hover:scale-125 transition-transform cursor-pointer"
                      >
                        {emote}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowChatBox(!showChatBox)}
                      className="p-1.5 rounded-lg hover:bg-indigo-600/40 text-indigo-300 transition-colors cursor-pointer"
                      title="Tin nhắn nhanh"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Chat Popover */}
              {showChatBox && screenMode === 'playing' && (
                <div className="w-full max-w-sm rounded-2xl bg-[#121222] border border-indigo-500/40 p-3 shadow-2xl animate-in fade-in space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Gửi tin nhắn mẫu:</div>
                  <div className="flex flex-col gap-1.5">
                    {QUICK_PHRASES.map((phrase) => (
                      <button
                        key={phrase}
                        onClick={() => handleSendPhrase(phrase)}
                        className="text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-indigo-600/30 text-xs text-white transition-colors cursor-pointer"
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Live Messages Feed */}
              {screenMode === 'playing' && roomData?.quickMessages && roomData.quickMessages.length > 0 && (
                <div className="w-full max-w-[560px] px-3 py-1.5 rounded-xl bg-black/30 text-[11px] text-slate-400 text-center truncate">
                  💬 {roomData.quickMessages[roomData.quickMessages.length - 1].senderName}: {roomData.quickMessages[roomData.quickMessages.length - 1].text}
                </div>
              )}
            </div>
          }
        />
      )}`;
      
  const newCode = before + '\n' + replacement + '\n' + after;
  fs.writeFileSync('src/games/caro-gomoku/index.tsx', newCode);
  console.log('Replaced Gomoku Layout successfully.');
} else {
  console.log('Could not find markers in gomoku file');
}
