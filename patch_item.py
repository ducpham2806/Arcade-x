import re

with open('src/components/InventoryModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """        {/* ========================================================================= */}
        {/* ISOLATED ITEM INFORMATION INSPECTOR (EASY TO DISMISS)                    */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {selectedItem && (
            <div 
              className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-md bg-[#121422] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden"
              >
                {/* Header with Badges & Close Button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getRarityBadge(selectedItem.rarity)}
                    {selectedItem.gameId && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 uppercase">
                        {selectedItem.gameId}
                      </span>
                    )}
                  </div>
                  <button
                    id="btn-close-item-inspector"
                    type="button"
                    onClick={() => {
                      soundEngine.play('click');
                      setSelectedItem(null);
                    }}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Item Visual */}
                <div className="flex flex-col items-center text-center mb-5">
                  <div 
                    style={getRaritySlotBoxStyle(selectedItem.rarity, false, false)}
                    className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center text-5xl mb-3 shadow-xl ${getRaritySlotStyle(selectedItem.rarity, false, false)}`}
                  >
                    {selectedItem.icon}
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">{selectedItem.name}</h3>
                  <p className="text-xs text-slate-300 max-w-xs">{selectedItem.description}</p>
                  
                  {/* Bonus Effect Tag */}
                  {!(selectedItem as any).isChest && selectedItem.bonusDescription && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                      <Zap className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{selectedItem.bonusDescription}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {(selectedItem as any).isChest ? (
                    <button
                      id="btn-open-chest-action"
                      type="button"
                      onClick={() => handleOpenChest((selectedItem as any).chestType)}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 active:scale-95 text-white font-bold text-sm shadow-[0_0_20px_rgba(217,119,6,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Package className="w-4 h-4" /> Mở Rương Báu Ngay
                    </button>
                  ) : (
                    <>
                      {/* Equip / Unequip Button for weapons, skins, avatars, titles */}
                      {(selectedItem.type === 'weapon' || selectedItem.type === 'skin' || selectedItem.type === 'avatar' || selectedItem.type === 'title') && (
                        (selectedItem as any).equipped ? (
                          <button
                            id="btn-unequip-item-action"
                            type="button"
                            onClick={() => {
                              unequipItem(selectedItem.id);
                              setSelectedItem({ ...selectedItem, equipped: false });
                            }}
                            className="w-full py-3 rounded-xl bg-white/10 text-slate-200 text-sm font-bold hover:bg-white/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Shield className="w-4 h-4" /> Gỡ Trang Bị
                          </button>
                        ) : (
                          <button
                            id="btn-equip-item-action"
                            type="button"
                            onClick={() => {
                              equipItem(selectedItem.id);
                              setSelectedItem({ ...selectedItem, equipped: true });
                            }}
                            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" /> Trang Bị Ngay
                          </button>
                        )
                      )}"""

replacement = """        {/* ========================================================================= */}
        {/* ISOLATED ITEM INFORMATION INSPECTOR (EASY TO DISMISS)                    */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {selectedItem && (
            <div 
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-[#121422] border border-white/15 rounded-3xl p-5 shadow-2xl relative overflow-hidden"
              >
                {/* Header with Badges & Close Button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getRarityBadge(selectedItem.rarity)}
                    {selectedItem.gameId && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 uppercase flex items-center gap-1">
                        <Gamepad2 className="w-3 h-3" /> {selectedItem.gameId}
                      </span>
                    )}
                  </div>
                  <button
                    id="btn-close-item-inspector"
                    type="button"
                    onClick={() => {
                      soundEngine.play('click');
                      setSelectedItem(null);
                    }}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Item Visual */}
                <div className="flex flex-col items-center text-center mb-5">
                  <div 
                    style={getRaritySlotBoxStyle(selectedItem.rarity, false, false)}
                    className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-4xl mb-3 shadow-xl ${getRaritySlotStyle(selectedItem.rarity, false, false)}`}
                  >
                    {selectedItem.icon}
                  </div>
                  <h3 className="text-xl font-black text-white mb-1.5">{selectedItem.name}</h3>
                  <p className="text-[11px] text-slate-400 max-w-[260px] leading-relaxed">{selectedItem.description}</p>
                </div>

                {/* Additional Info Details */}
                <div className="bg-black/30 rounded-xl p-3 border border-white/5 mb-5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">Phân loại</span>
                    <span className="text-slate-200 font-medium">
                      {selectedItem.type === 'weapon' ? 'Vũ Khí' : 
                       selectedItem.type === 'skin' ? 'Skin' : 
                       selectedItem.type === 'avatar' ? 'Ảnh Đại Diện' : 
                       selectedItem.type === 'title' ? 'Danh Hiệu' : 'Vật Phẩm'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">Sử dụng cho</span>
                    <span className="text-slate-200 font-medium">
                      {selectedItem.gameId ? `Mini-game: ${selectedItem.gameId}` : 'Hồ Sơ Toàn Cầu'}
                    </span>
                  </div>
                  {!(selectedItem as any).isChest && selectedItem.bonusDescription && (
                    <div className="pt-2.5 mt-2.5 border-t border-white/10">
                      <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" /> Đặc tính / Hiệu ứng
                      </div>
                      <div className="text-indigo-300 text-[11px] font-bold leading-relaxed bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                        {selectedItem.bonusDescription}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {(selectedItem as any).isChest ? (
                    <button
                      id="btn-open-chest-action"
                      type="button"
                      onClick={() => handleOpenChest((selectedItem as any).chestType)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 active:scale-95 text-white font-bold text-sm shadow-[0_0_15px_rgba(217,119,6,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Package className="w-4 h-4" /> Mở Rương Ngay
                    </button>
                  ) : (
                    <>
                      {/* Equip / Unequip Button for weapons, skins, avatars, titles */}
                      {(selectedItem.type === 'weapon' || selectedItem.type === 'skin' || selectedItem.type === 'avatar' || selectedItem.type === 'title') && (
                        (selectedItem as any).equipped ? (
                          <button
                            id="btn-unequip-item-action"
                            type="button"
                            onClick={() => {
                              soundEngine.play('click');
                              unequipItem(selectedItem.id);
                              setSelectedItem(null);
                            }}
                            className="w-full py-3 rounded-xl bg-white/10 text-slate-200 text-sm font-bold hover:bg-white/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Shield className="w-4 h-4" /> Gỡ Trang Bị
                          </button>
                        ) : (
                          <button
                            id="btn-equip-item-action"
                            type="button"
                            onClick={() => {
                              soundEngine.play('powerup');
                              confetti({
                                particleCount: 50,
                                spread: 60,
                                origin: { y: 0.8 },
                                zIndex: 9999
                              });
                              equipItem(selectedItem.id);
                              setSelectedItem(null);
                            }}
                            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" /> Trang Bị Ngay
                          </button>
                        )
                      )}"""

content = content.replace(target, replacement)
with open('src/components/InventoryModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

