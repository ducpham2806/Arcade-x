export const BOARD_SKINS = [
  "mint",
  "sand",
  "lagoon",
  "lavender",
  "peach",
] as const;
export type BoardSkin = (typeof BOARD_SKINS)[number];
export const SKIN_NAMES: Record<BoardSkin, string> = {
  mint: "Vườn bạc hà",
  sand: "Bãi cát nắng",
  lagoon: "Hồ pha lê",
  lavender: "Vườn oải hương",
  peach: "Mây đào",
};
export function validSkin(value: unknown): value is BoardSkin {
  return BOARD_SKINS.includes(value as BoardSkin);
}
// Cosmetics have their own randomness; never consume gameplay RNG.
export function chooseSkin(
  previous?: BoardSkin,
  random = Math.random,
): BoardSkin {
  const pool = BOARD_SKINS.filter((s) => s !== previous);
  return pool[
    Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))
  ];
}
