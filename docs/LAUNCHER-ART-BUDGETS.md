# ArcadeX 2.12.0 launcher artwork

22 distinct gameplay identities, each with a 512 × 512 icon and a 1280 × 640 promotional banner. Native SVG masters retain editable geometry and text; WebP exports are used at runtime to keep mobile rendering inexpensive. Each icon must stay under 150 KB and each banner under 220 KB. Assets load outside the launcher JavaScript bundle and are cached per selected game. UI images have no mipmaps.

The existing native illustration system was upgraded with depth, material highlights, a consistent frame and per-game palettes. Neon Run uses the actual Néo character cel from the reviewed v0.14 source. Battleship uses its own ships, Rainbow Blocks its tetrominoes, Blossom its flower, Dungeon Titan its sword/castle/shield, and puzzle/board games retain different gameplay geometry. No repeated anonymous icon is used across games.

Run `node scripts/build-launcher-art.mjs` to export all SVG and WebP assets plus `review/arcadex-art-all-worlds.html`. Inspect at both 64 px and 128 px, reject blank images, duplicates and unreadable silhouettes, and validate the byte limits in `docs/launcher-art-manifest.json`.
