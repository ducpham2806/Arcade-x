import React from "react";
import { createRoot } from "react-dom/client";
import { HexMatchGame } from "../index";
import { GameBridgeAPI } from "../../../types";
import { defaultSave, SAVE_KEY } from "./save";
const noop = () => {};
const bridge: GameBridgeAPI = {
  submitScore: async () => ({ isNewHighScore: false }),
  grantExp: noop,
  grantCoins: noop,
  grantGems: noop,
  reportProgress: noop,
  reportQuest: noop,
  triggerLootRoll: () => null,
  playSound: noop,
  getEquippedSkin: () => "",
  getSkin: () => "",
  saveGameState: noop,
  loadGameState: () => null,
  recordMove: noop,
  updateSessionState: noop,
};
function profile() {
  const s = defaultSave();
  for (let n = 1; n <= 100; n++) s.stars[n] = 3;
  s.coins = 5000;
  s.inventory = {
    bee: 5,
    bomb: 5,
    rainbow: 5,
    moves: 5,
    fertilizer: 5,
    hammer: 5,
    shuffle: 5,
    undo: 5,
    vacuum: 5,
    broom: 5,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  location.reload();
}
function Preview() {
  return (
    <>
      <div className="preview-tools">
        <span>Blossom · Bản duyệt v0.8</span>
        <button onClick={profile}>Hồ sơ test: 5.000 Xu + vật phẩm</button>
        <button
          onClick={() => {
            localStorage.removeItem(SAVE_KEY);
            location.reload();
          }}
        >
          Chơi từ đầu
        </button>
      </div>
      <div className="preview-game">
        <HexMatchGame
          bridge={bridge}
          isPaused={false}
          isMuted={false}
          isPracticeMode
          onGameOver={noop}
          onRestart={noop}
        />
      </div>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<Preview />);
