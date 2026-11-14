import React, { useEffect, useRef, useState } from 'react';
import type { GameBridgeAPI } from '../../types';
import {
  equipFolkSkin,
  purchaseSkinWithCandy,
  type FolkProfileSave,
} from './economy';
import { FOLK_SKINS_CATALOG, getSkinById } from './skins-catalog';
import type { FolkGameKind, SkinCategory, SkinItemDef } from './types';

interface FolkShopModalProps {
  game: FolkGameKind;
  profile: FolkProfileSave;
  bridge?: GameBridgeAPI;
  onProfileChange: (next: FolkProfileSave) => void;
  onClose: () => void;
}

const CATEGORY_TABS: { id: SkinCategory; label: string; game: FolkGameKind }[] = [
  { id: 'oaq_stones', label: 'Quân & Quan', game: 'o-an-quan' },
  { id: 'oaq_board', label: 'Sân & Bàn Cờ', game: 'o-an-quan' },
  { id: 'oaq_hand', label: 'Tay & Mẹt', game: 'o-an-quan' },
  { id: 'nlc_double_tile', label: 'Ô Gạch Đôi', game: 'nhay-lo-co' },
  { id: 'nlc_court', label: 'Bàn Chơi & Ngõ', game: 'nhay-lo-co' },
  { id: 'nlc_cham', label: 'Chàm & Dấu Nhà', game: 'nhay-lo-co' },
  { id: 'nlc_character', label: 'Nhân Vật', game: 'nhay-lo-co' },
];

const RARITY_LABELS: Record<SkinItemDef['rarity'], string> = {
  common: 'Mộc Mạc',
  rare: 'Hiếm',
  epic: 'Kinh Kỳ',
  legendary: 'Huyền Thoại',
};

function drawPixelPreview(canvas: HTMLCanvasElement, item: SkinItemDef, tick: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const { primary, secondary, accent, highlight, outline, particle } = item.palette;

  // Nền khung preview
  ctx.fillStyle = '#2B1810';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w - 4, h - 4);

  const bob = Math.round(Math.sin(tick * 0.08) * 2);

  if (item.category === 'oaq_stones') {
    // Vẽ 3 viên Quân Dân + 1 viên Quan lớn ở giữa
    const drawStone = (cx: number, cy: number, r: number, isQuan: boolean) => {
      ctx.fillStyle = outline;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isQuan ? accent : primary;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.arc(cx + r * 0.2, cy + r * 0.25, r * 0.55, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = highlight;
      ctx.fillRect(Math.round(cx - r * 0.45), Math.round(cy - r * 0.45), 4, 4);
    };
    drawStone(44, 62 + bob, 11, false);
    drawStone(136, 62 - bob, 11, false);
    drawStone(90, 52 + bob, 20, true);
    // Hạt lấp lánh
    ctx.fillStyle = particle;
    ctx.fillRect(62 + ((tick * 2) % 12), 24, 3, 3);
    ctx.fillRect(114, 28 + ((tick * 3) % 10), 3, 3);
  } else if (item.category === 'nlc_double_tile') {
    // Vẽ cặp Ô Viên Gạch Đôi (Ô 4 - Ô 5)
    for (let i = 0; i < 2; i++) {
      const x = 22 + i * 70;
      const y = 26 + (i === 0 ? bob : -bob);
      ctx.fillStyle = outline;
      ctx.fillRect(x - 2, y - 2, 62, 58);
      ctx.fillStyle = primary;
      ctx.fillRect(x, y, 58, 54);
      ctx.fillStyle = secondary;
      ctx.fillRect(x + 6, y + 6, 46, 42);
      ctx.fillStyle = accent;
      ctx.fillRect(x + 18, y + 18, 22, 18);
      ctx.fillStyle = highlight;
      ctx.fillRect(x + 8, y + 8, 8, 4);
    }
  } else if (item.category === 'oaq_board' || item.category === 'nlc_court') {
    ctx.fillStyle = secondary;
    ctx.fillRect(14, 14, w - 28, h - 28);
    ctx.fillStyle = primary;
    ctx.fillRect(18, 18, w - 36, h - 36);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, w - 48, h - 48);
    ctx.fillStyle = highlight;
    ctx.fillRect(36, 36, 20, 20);
    ctx.fillRect(62, 36, 20, 20);
    ctx.fillRect(88, 36, 20, 20);
    ctx.fillRect(114, 36, 20, 20);
  } else {
    // Nhân vật / Chàm / Tay
    ctx.fillStyle = outline;
    ctx.fillRect(66, 22 + bob, 48, 56);
    ctx.fillStyle = primary;
    ctx.fillRect(68, 24 + bob, 44, 52);
    ctx.fillStyle = secondary;
    ctx.fillRect(74, 30 + bob, 32, 22);
    ctx.fillStyle = accent;
    ctx.fillRect(72, 54 + bob, 36, 12);
    ctx.fillStyle = highlight;
    ctx.fillRect(78, 34 + bob, 6, 6);
  }
}

export const FolkShopModal: React.FC<FolkShopModalProps> = ({
  game,
  profile,
  bridge,
  onProfileChange,
  onClose,
}) => {
  const tabs = CATEGORY_TABS.filter((t) => t.game === game);
  const [activeTab, setActiveTab] = useState<SkinCategory>(tabs[0].id);
  const items = FOLK_SKINS_CATALOG.filter((s) => s.category === activeTab);
  const [selectedId, setSelectedId] = useState<string>(profile.equippedSkins[activeTab] || items[0]?.id);
  const [notice, setNotice] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedItem = getSkinById(selectedId);
  const isOwned = profile.ownedSkins.includes(selectedItem.id);
  const isEquipped = profile.equippedSkins[selectedItem.category] === selectedItem.id;

  useEffect(() => {
    const first = FOLK_SKINS_CATALOG.find((s) => s.category === activeTab);
    const equipped = profile.equippedSkins[activeTab];
    setSelectedId(equipped || first?.id || '');
    setNotice('');
  }, [activeTab]);

  useEffect(() => {
    let raf = 0;
    let tick = 0;
    const loop = () => {
      tick += 1;
      if (canvasRef.current) {
        drawPixelPreview(canvasRef.current, selectedItem, tick);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [selectedItem]);

  const handleBuyCandy = () => {
    const res = purchaseSkinWithCandy(profile, selectedItem.id, bridge);
    if (!res.ok) {
      setNotice(res.error || 'Chưa đủ Kẹo Mạch Nha.');
      return;
    }
    onProfileChange(res.profile);
    setNotice(`Đã mở khóa & trang bị "${selectedItem.name}"!`);
  };

  const handleEquip = () => {
    const res = equipFolkSkin(profile, selectedItem.id, bridge);
    if (res.ok) {
      onProfileChange(res.profile);
      setNotice(`Đã trang bị "${selectedItem.name}".`);
    }
  };

  return (
    <div className="fd-overlay" role="dialog" aria-modal="true" aria-labelledby="fd-shop-title">
      <div className="fd-modal-shell">
        <header className="fd-modal-header">
          <div>
            <h2 id="fd-shop-title">Tiệm Tạp Hóa Cổng Trường</h2>
            <p className="fd-subtitle">Đổi Kẹo Mạch Nha lấy Skin Pixel cho {game === 'o-an-quan' ? 'Ô Ăn Quan' : 'Nhảy Lò Cò'}</p>
          </div>
          <div className="fd-wallet-pill">
            <span>🍬 {profile.candyTokens} Kẹo Mạch Nha</span>
            <button type="button" className="fd-close-btn" onClick={onClose} aria-label="Đóng tiệm">
              ✕
            </button>
          </div>
        </header>

        <nav className="fd-shop-tabs" aria-label="Danh mục Skin">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`fd-tab-btn ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar fd-shop-body">
          <div className="fd-shop-preview-card">
            <canvas ref={canvasRef} width={180} height={108} className="fd-pixel-canvas" />
            <div className="fd-preview-meta">
              <div className="fd-rarity-badge" data-rarity={selectedItem.rarity}>
                {RARITY_LABELS[selectedItem.rarity]}
              </div>
              <h3>{selectedItem.name}</h3>
              <p>{selectedItem.description}</p>
              {notice && <p className="fd-shop-notice">{notice}</p>}
              <div className="fd-preview-actions">
                {isEquipped ? (
                  <span className="fd-equipped-tag">✓ Đang trang bị</span>
                ) : isOwned ? (
                  <button type="button" className="fd-btn-primary" onClick={handleEquip}>
                    Trang bị ngay
                  </button>
                ) : (
                  <button
                    type="button"
                    className="fd-btn-primary"
                    disabled={profile.candyTokens < selectedItem.priceCandy}
                    onClick={handleBuyCandy}
                  >
                    Đổi bằng 🍬 {selectedItem.priceCandy} Kẹo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 fd-shop-grid">
            {items.map((item) => {
              const owned = profile.ownedSkins.includes(item.id);
              const equipped = profile.equippedSkins[item.category] === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    setNotice('');
                  }}
                  className={`fd-skin-card ${selectedId === item.id ? 'is-selected' : ''}`}
                >
                  <div className="fd-skin-swatch" style={{ background: item.palette.primary, borderColor: item.palette.accent }}>
                    <span className="fd-skin-dot" style={{ background: item.palette.accent }} />
                  </div>
                  <div className="fd-skin-name">{item.name}</div>
                  <div className="fd-skin-price">
                    {equipped ? 'Đang dùng' : owned ? 'Đã sở hữu' : `🍬 ${item.priceCandy} Kẹo`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
