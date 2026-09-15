const fs = require('fs');

let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

const importStatement = `import { BoardLayout, PlayerInfo } from '../../components/games/BoardLayout';\n`;
if (!code.includes("import { BoardLayout")) {
  code = code.replace("import { MatchmakingModal }", importStatement + "import { MatchmakingModal }");
}

const startIndex = code.indexOf('<header className="w-full max-w-4xl flex items-center justify-between');
const endIndex = code.indexOf('</footer>') + 9;

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `
      <BoardLayout
        header={
          <header className="w-full flex items-center justify-between bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-3 shadow-xl">
            <div className="flex items-center gap-3">
              <button
                id="chess-btn-back"
                onClick={() => onGameOver(0)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Rời Game</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-serif text-lg">
                  ♔
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-amber-100 flex items-center gap-2">
                    Cờ Vua
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {isAiMode ? \`Luyện tập Bot (\${aiDifficulty})\` : activeRoomId ? 'Xếp Hạng PvP' : 'Offline'}
                    </span>
                  </h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                id="chess-btn-mute"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </header>
        }
        topPlayer={{
          name: isAiMode ? \`AI Đại Kiện Tướng\` : opponentInfo?.name || 'Đối Thủ',
          avatar: isAiMode ? 'https://api.dicebear.com/7.x/bottts/svg?seed=ChessMaster' : opponentInfo?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent',
          elo: opponentInfo?.elo || (isAiMode ? 1450 : 1200),
          isTurn: !isTurn && roomState?.status !== 'ended' && !chessInstanceRef.current.isGameOver(),
          statusText: 'Đang nghĩ...',
          timeLeft: activeRoomId ? turnTimeLeft : undefined,
          capturedPieces: (
            <>
              {(myColor === 'w' ? capturedWhite : capturedBlack).map((p, i) => (
                <span key={i} className="opacity-90 -ml-1.5 first:ml-0 drop-shadow-md">
                  {CHESS_PIECE_SYMBOLS[\`\${myColor === 'w' ? 'w' : 'b'}\${p}\`]?.symbol}
                </span>
              ))}
            </>
          ),
          materialAdvantage: myColor === 'w' && materialAdvantage < 0 ? \`+\${Math.abs(materialAdvantage)}\` : myColor === 'b' && materialAdvantage > 0 ? \`+\${materialAdvantage}\` : undefined,
          isOnline: opponentInfo?.connected || isAiMode,
          colorTheme: 'amber'
        }}
        bottomPlayer={{
          name: profile.username,
          avatar: profile.avatar,
          elo: profile.stats?.highScores?.['chess'] || 1200,
          isTurn: isTurn && roomState?.status !== 'ended' && !chessInstanceRef.current.isGameOver(),
          statusText: 'Lượt của bạn',
          timeLeft: activeRoomId ? turnTimeLeft : undefined,
          capturedPieces: (
            <>
              {(myColor === 'w' ? capturedBlack : capturedWhite).map((p, i) => (
                <span key={i} className="opacity-90 -ml-1.5 first:ml-0 drop-shadow-md">
                  {CHESS_PIECE_SYMBOLS[\`\${myColor === 'w' ? 'b' : 'w'}\${p}\`]?.symbol}
                </span>
              ))}
            </>
          ),
          materialAdvantage: myColor === 'w' && materialAdvantage > 0 ? \`+\${materialAdvantage}\` : myColor === 'b' && materialAdvantage < 0 ? \`+\${Math.abs(materialAdvantage)}\` : undefined,
          isOnline: true,
          colorTheme: 'emerald'
        }}
        board={
          <div className="relative flex flex-col items-center w-full">
            <div
              id="chess-board"
              className="w-[95vw] max-w-[400px] sm:max-w-[440px] md:max-w-[480px] aspect-square rounded sm:rounded-xl overflow-hidden shadow-2xl border-4 sm:border-8 border-amber-950/90 grid grid-cols-8 grid-rows-8 bg-amber-950 p-0 sm:p-0.5"
            >
              {Array.from({ length: 8 }).map((_, row) =>
                Array.from({ length: 8 }).map((_, col) => renderSquare(row, col))
              )}
            </div>
            
            <AnimatePresence>
              {pendingPromotion && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 m-auto w-64 h-36 bg-slate-900/95 backdrop-blur-md border border-amber-500/50 rounded-2xl p-3 flex flex-col items-center justify-center gap-3 z-30 shadow-2xl"
                >
                  <div className="text-xs font-bold text-amber-300">Chọn quân để phong cấp:</div>
                  <div className="flex gap-2">
                    {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map((pieceType) => (
                      <button
                        key={pieceType}
                        onClick={() => executeMoveInternal(pendingPromotion.from, pendingPromotion.to, pieceType)}
                        className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 flex items-center justify-center text-2xl transition-all"
                      >
                        {CHESS_PIECE_SYMBOLS[\`\${myColor}\${pieceType}\`]?.symbol}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        }
        controls={
          <div className="w-full flex items-center justify-center gap-2 mt-1 z-10">
            {activeRoomId ? (
              <>
                <button
                  id="chess-btn-draw"
                  onClick={mpOfferDraw}
                  className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <Handshake className="w-4 h-4" />
                  <span>Cầu Hòa</span>
                </button>
                <button
                  id="chess-btn-surrender"
                  onClick={mpSurrender}
                  className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                  <span>Đầu Hàng</span>
                </button>
              </>
            ) : (
              <div className="w-full flex gap-2">
                <button id="chess-btn-restart" onClick={handleResetGame} className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"> <RotateCcw className="w-4 h-4" /> <span>Chơi Lại Ván Mới</span> </button>
                <button onClick={handleLeaveToLobby} className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"> <ArrowLeft className="w-4 h-4" /> <span>Thoát Luyện Tập</span> </button>
              </div>
            )}
          </div>
        }
        history={
          <div className="w-full h-full bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-xl p-3 md:p-4 flex flex-col gap-3 shadow-xl">
            <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-2">Biên Bản Nước Đi</h3>
            <div className="flex flex-wrap md:flex-col gap-2 overflow-y-auto max-h-[120px] md:max-h-none">
              {moveHistory.length === 0 ? (
                <span className="italic opacity-60 text-slate-500 text-xs md:text-sm">Chưa có nước đi nào...</span>
              ) : (
                moveHistory.map((move, idx) => (
                  <span
                    key={idx}
                    className={\`px-2.5 py-1 md:py-1.5 rounded-md font-mono text-xs md:text-sm shadow-sm \${
                      idx % 2 === 0
                        ? 'bg-slate-800 text-slate-200'
                        : 'bg-amber-950/40 text-amber-300 border border-amber-900/30'
                    }\`}
                  >
                    {idx % 2 === 0 ? \`\${Math.floor(idx / 2) + 1}. \` : ''}
                    {move}
                  </span>
                ))
              )}
            </div>
          </div>
        }
      />
  `;
  
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync('src/games/chess/index.tsx', code);
  console.log('Replaced Chess Layout');
} else {
  console.log('Could not find markers in chess file');
}

