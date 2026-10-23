// Only first-screen art blocks entry. Other chapters, skins and bosses warm later.
const firstScreen: Record<string, RegExp> = {
  'boom-buddies': /\/art-v4\/pip-(?:move|actions|portrait)\.webp$|\/art-v3\/tiles\/(?:0|1|2|44|45|46)\.webp$|\/art-v3\/(?:icons|enemies)\/enemy_(?:slime_rust|rat_machine)\.webp$/,
  'hex-match': /\/(?:bg_cluster01|board_frame_cluster01|logo_blossom_blast|tile_dark_[ab]|theme01_p\d_[^/]+)\.png$/,
  'dungeon-tap': /\/art-v5\/(?:world-1|party-a|goblin|enemies-a|ui|fx)\.webp$/,
  'cosmic-defense': /\/backgrounds\/bg_01_asteria_(?:far|mid|near)\.png$|\/sprites\/(?:ship|enemies|items|ui|logo)\.png$/,
  'rainbow-blocks': /\/bg\/bg_teal\.svg$|\/blocks\/block_[ijloszt]_base\.svg$/,
  'battleship': /\/(?:ocean|us-carrier|jp-battleship)\.webp$/,
};
export function startupAssets(id: string, urls: string[]): string[] {
  const icon = urls.filter(url => url === `/game-art/icons/${id}.webp`);
  // These frames already own asset loading; do not download their packs twice.
  if (id === 'neon-runner' || id === 'brick-breaker') return icon;
  const available = urls.filter(url => !url.startsWith('/game-art/') && !/\/(?:prompts|manifest|.*audit)\.json$/.test(url));
  const selected = firstScreen[id] ? available.filter(url => firstScreen[id].test(url)) : available.slice(0, 8);
  return [...new Set([...icon, ...selected])].slice(0, 16);
}
