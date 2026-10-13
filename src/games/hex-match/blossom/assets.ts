import sets from "./piece_sets.json" with { type: "json" };
import { Tile } from "./types";
declare global {
  interface Window {
    __BLOSSOM_INLINE_ASSETS__?: Record<string, string>;
    __BLOSSOM_REVIEW__?: boolean;
  }
}
export const asset = (p: string) =>
  (typeof window !== "undefined" && window.__BLOSSOM_INLINE_ASSETS__?.[p]) ||
  `/blossom/${p}`;
export function pieceAsset(
  t: Tile,
  chapter: number,
  chibi = false,
  season = "none",
): string {
  if (t.gift) return asset("png/ui/icon_gift.png");
  if (t.seed) return asset("png/garden/garden_bed_cluster01.png");
  if (t.special) return asset(`png/specials/special_${t.special}.png`);
  if (t.color < 0) return "";
  if (season !== "none") {
    const ids =
      season === "tet"
        ? [
            "cherry_yellow",
            "daisy_gold",
            "orange_orange",
            "envelope_red",
            "lantern_red",
            "firework_gold",
          ]
        : [
            "crescent_yellow",
            "star_lantern_red",
            "mooncake_brown",
            "bunny_white",
            "lantern_orange",
            "orange_green",
          ];
    return asset(
      `png/theme_seasons/season_${season}_p${t.color + 1}_${ids[t.color]}.png`,
    );
  }
  const id = chibi
    ? `pieces/piece_${sets.styles.chibi.order[t.color]}_normal`
    : `theme_pieces/${(sets.styles.gloss.clusters as Record<string, string[]>)[chapter][t.color]}`;
  return asset(`png/${id}.png`);
}
export function hazardAsset(t: Tile): string {
  const h = t.hazard;
  if (!h) return "";
  const name =
    h === "rock"
      ? `rock_hp${Math.min(3, t.hp || 1)}`
      : h === "ice"
        ? `ice_l${Math.min(3, t.hp || 1)}`
        : h === "bomb"
          ? "bomb_timer"
          : h;
  return asset(`png/hazards/hazard_${name}.png`);
}
export const BOSS_NAMES = [
  "sau_buom_xam",
  "qua_tham_an",
  "coi_xay_gio_xam",
  "cua_khong_lo",
  "nam_doc_khong_lo",
  "bo_cap_xam",
  "yeti_bui_xam",
  "rong_bui_dam",
  "nhen_dem",
  "nu_hoang_xam",
];
export const bossAsset = (c: number) =>
  asset(
    `png/bosses/boss_${String(c).padStart(2, "0")}_${BOSS_NAMES[c - 1]}.png`,
  );

export const boosterAsset = (k: string) =>
  asset(
    `png/items/${({ bee: "booster_bee_start", bomb: "booster_bomb_start", rainbow: "booster_rainbow_start", moves: "booster_plus5", fertilizer: "booster_fertilizer", hammer: "support_hammer", shuffle: "support_shuffle", undo: "support_undo", vacuum: "support_vacuum", broom: "support_broom" } as Record<string, string>)[k]}.png`,
  );
