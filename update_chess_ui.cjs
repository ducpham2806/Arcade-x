const fs = require('fs');
let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

const mainRegex = /\{\/\* Main Game Stage \*\/\}[\s\S]*?\{\/\* Move History \/ Notation Log Bar \*\/\}/;

const newMain = `{/* Main Game Stage */}
      <main className="w-full max-w-md flex-1 flex flex-col items-center justify-center gap-2 sm:gap-4 z-10">
        {/* Opponent Player Card */}
        <div className={\`w-full flex flex-col justify-between items-stretch bg-slate-900/60 backdrop-blur-md border rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg transition-colors \${(!isTurn && !isMatchEnded) ? 'border-amber-400/50 shadow-amber-900/20' : 'border-slate-800/80'}\`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src={
                    isAiMode
                      ? 'https://api.dicebear.com/7.x/bottts/svg?seed=ChessMaster'
                      : opponentInfo?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent'
                  }
                  alt="Opponent"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-800 border-2 border-slate-700 object-cover shadow-sm"
                />
                <span
                  className={\`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 \${
                    opponentInfo?.connected || isAiMode ? 'bg-emerald-500' : 'bg-rose-500'
                  }\`}
                />
              </div>
              <div className="flex flex-col">
                <div className="font-bold text-sm sm:text-base text-slate-100 leading-tight">
                  {isAiMode ? \`AI Đại Kiện Tướng\` : opponentInfo?.name || 'Đối Thủ'}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">
                    {opponentInfo?.elo || (isAiMode ? 1450 : 1200)}
                  </span>
                  {!isTurn && !isMatchEnded && <span className="text-amber-400 animate-pulse ml-1 font-semibold text-[10px] uppercase">Đang nghĩ...</span>}
                </div>
              </div>
            </div>
            
            {/* Captured Pieces & Timer */}
            <div className="flex flex-col items-end gap-1.5">
              {activeRoomId && !isTurn && !isMatchEnded && (
                <div className={\`flex items-center gap-1 font-mono font-bold text-sm px-2 py-0.5 rounded-md border \${turnTimeLeft <= 10 ? 'bg-rose-950/80 text-rose-400 border-rose-500/50 animate-pulse' : 'bg-slate-800 text-amber-400 border-slate-700'}\`}>
                  <Timer className="w-3.5 h-3.5" />
                  {turnTimeLeft}s
                </div>
              )}
              <div className="flex items-center h-6 overflow-hidden rounded bg-slate-950/40 px-1 border border-slate-800/50">
                <div className="flex text-lg sm:text-xl leading-none tracking-tighter text-slate-300">
                  {(myColor === 'w' ? capturedWhite : capturedBlack).map((p, i) => (
                    <span key={i} className="opacity-90 -ml-1.5 first:ml-0 drop-shadow-md">
                      {CHESS_PIECE_SYMBOLS[\`\${myColor === 'w' ? 'w' : 'b'}\${p}\`]?.symbol}
                    </span>
                  ))}
                </div>
                {materialAdvantage !== 0 && (
                  <span className="text-[10px] font-bold text-slate-400 ml-1.5 mr-1">
                    {myColor === 'w' && materialAdvantage < 0 ? \`+\${Math.abs(materialAdvantage)}\` : ''}
                    {myColor === 'b' && materialAdvantage > 0 ? \`+\${materialAdvantage}\` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center: 8x8 Chessboard Container */}
        <div className="relative flex flex-col items-center w-full">
          {/* The Chessboard Grid */}
          <div
            id="chess-board"
            className="w-[95vw] max-w-[400px] sm:max-w-[440px] md:max-w-[480px] aspect-square rounded sm:rounded-xl overflow-hidden shadow-2xl border-4 sm:border-8 border-amber-950/90 grid grid-cols-8 grid-rows-8 bg-amber-950 p-0 sm:p-0.5"
          >
            {Array.from({ length: 8 }).map((_, row) =>
              Array.from({ length: 8 }).map((_, col) => renderSquare(row, col))
            )}
          </div>

          {/* Pawn Promotion Modal */}
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
                      onClick={() =>
                        executeMoveInternal(pendingPromotion.from, pendingPromotion.to, pieceType)
                      }
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

        {/* Player Profile Card */}
        <div className={\`w-full flex flex-col justify-between items-stretch bg-slate-900/60 backdrop-blur-md border rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg transition-colors \${(isTurn && !isMatchEnded) ? 'border-emerald-500/50 shadow-emerald-900/20' : 'border-slate-800/80'}\`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src={myInfo?.avatarUrl || profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me'}
                  alt="Me"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-800 border-2 border-emerald-500/60 object-cover shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 bg-emerald-500" />
              </div>
              <div className="flex flex-col">
                <div className="font-bold text-sm sm:text-base text-slate-100 leading-tight">
                  {myInfo?.name || profile?.username || 'Bạn'}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">
                    {myInfo?.elo || 1200}
                  </span>
                  {isTurn && !isMatchEnded && <span className="text-emerald-400 animate-pulse ml-1 font-semibold text-[10px] uppercase">Lượt của bạn</span>}
                </div>
              </div>
            </div>
            
            {/* Captured Pieces & Timer */}
            <div className="flex flex-col items-end gap-1.5">
              {activeRoomId && isTurn && !isMatchEnded && (
                <div className={\`flex items-center gap-1 font-mono font-bold text-sm px-2 py-0.5 rounded-md border \${turnTimeLeft <= 10 ? 'bg-rose-950/80 text-rose-400 border-rose-500/50 animate-pulse' : 'bg-slate-800 text-emerald-400 border-emerald-500/30'}\`}>
                  <Timer className="w-3.5 h-3.5" />
                  {turnTimeLeft}s
                </div>
              )}
              <div className="flex items-center h-6 overflow-hidden rounded bg-slate-950/40 px-1 border border-slate-800/50">
                <div className="flex text-lg sm:text-xl leading-none tracking-tighter text-slate-300">
                  {(myColor === 'w' ? capturedBlack : capturedWhite).map((p, i) => (
                    <span key={i} className="opacity-90 -ml-1.5 first:ml-0 drop-shadow-md">
                      {CHESS_PIECE_SYMBOLS[\`\${myColor === 'w' ? 'b' : 'w'}\${p}\`]?.symbol}
                    </span>
                  ))}
                </div>
                {materialAdvantage !== 0 && (
                  <span className="text-[10px] font-bold text-slate-400 ml-1.5 mr-1">
                    {myColor === 'w' && materialAdvantage > 0 ? \`+\${materialAdvantage}\` : ''}
                    {myColor === 'b' && materialAdvantage < 0 ? \`+\${Math.abs(materialAdvantage)}\` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* In-Game Interactive Buttons */}
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
      </main>
      {/* Move History / Notation Log Bar */}`;

code = code.replace(mainRegex, newMain);
fs.writeFileSync('src/games/chess/index.tsx', code);
