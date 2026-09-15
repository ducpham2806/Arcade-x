import re

with open('src/components/InventoryModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure to import Sword and Gem if not there
if "Sword" not in content:
    content = content.replace("import { ", "import { Sword, Gem, ")

# Replace the segment map
old_map = """                  {[
                    { id: 'all' as FilterCategory, label: 'Tất Cả', icon: '✨', count: counts.all, desc: 'Tất cả vật phẩm' },
                    { id: 'weapons' as FilterCategory, label: 'Vũ Khí', icon: '⚔️', count: counts.weapons, desc: 'Vũ khí & skin trang bị' },
                    { id: 'consumables' as FilterCategory, label: 'Tiêu Hao', icon: '🧪', count: counts.consumables, desc: 'Rương báu & bình tăng tốc' },
                    { id: 'materials' as FilterCategory, label: 'Vật Liệu', icon: '💎', count: counts.materials, desc: 'Nguyên liệu chế tác' },
                  ].map((seg) => {"""

new_map = """                  {[
                    { id: 'all' as FilterCategory, label: 'Tất Cả', icon: <Sparkles className="w-5 h-5 sm:w-4 sm:h-4" />, count: counts.all, desc: 'Tất cả vật phẩm' },
                    { id: 'weapons' as FilterCategory, label: 'Vũ Khí', icon: <Sword className="w-5 h-5 sm:w-4 sm:h-4" />, count: counts.weapons, desc: 'Vũ khí & skin trang bị' },
                    { id: 'consumables' as FilterCategory, label: 'Tiêu Hao', icon: <FlaskConical className="w-5 h-5 sm:w-4 sm:h-4" />, count: counts.consumables, desc: 'Rương báu & bình tăng tốc' },
                    { id: 'materials' as FilterCategory, label: 'Vật Liệu', icon: <Gem className="w-5 h-5 sm:w-4 sm:h-4" />, count: counts.materials, desc: 'Nguyên liệu chế tác' },
                  ].map((seg) => {"""

content = content.replace(old_map, new_map)

# Replace the active filter subtitle logic to use these elements or just text
old_subtitle = """                <div className="flex sm:hidden items-center justify-between text-[11px] text-slate-400 px-1 pt-1.5">
                  <span className="flex items-center gap-1">
                    <span className="text-indigo-400 font-bold">
                      {filterCategory === 'all' && '✨ Tất Cả'}
                      {filterCategory === 'weapons' && '⚔️ Vũ Khí & Trang Bị'}
                      {filterCategory === 'consumables' && '🧪 Tiêu Hao & Rương Báu'}
                      {filterCategory === 'materials' && '💎 Vật Liệu Chế Tác'}
                    </span>
                    <span className="text-slate-500">
                      ({filterCategory === 'all' ? counts.all : filterCategory === 'weapons' ? counts.weapons : filterCategory === 'consumables' ? counts.consumables : counts.materials} món)
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-500">Chạm icon để đổi tab lọc</span>
                </div>"""

new_subtitle = """                <div className="flex sm:hidden items-center justify-between text-[11px] text-slate-400 px-1 pt-1.5">
                  <span className="flex items-center gap-1">
                    <span className="text-indigo-400 font-bold flex items-center gap-1">
                      {filterCategory === 'all' && <><Sparkles className="w-3 h-3" /> Tất Cả</>}
                      {filterCategory === 'weapons' && <><Sword className="w-3 h-3" /> Vũ Khí & Trang Bị</>}
                      {filterCategory === 'consumables' && <><FlaskConical className="w-3 h-3" /> Tiêu Hao</>}
                      {filterCategory === 'materials' && <><Gem className="w-3 h-3" /> Vật Liệu</>}
                    </span>
                    <span className="text-slate-500">
                      ({filterCategory === 'all' ? counts.all : filterCategory === 'weapons' ? counts.weapons : filterCategory === 'consumables' ? counts.consumables : counts.materials} món)
                    </span>
                  </span>
                </div>"""

content = content.replace(old_subtitle, new_subtitle)

with open('src/components/InventoryModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
