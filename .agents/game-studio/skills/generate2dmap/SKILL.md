---
name: generate2dmap
description: Plan and build 2D game maps, levels, and scenes - top-down and side-scrolling levels, tilemaps, prop packs, parallax backgrounds and battle plates - with collision, navigation, reachability checks, and export to Tiled, Godot 4 or LDtk. Use for any map, level, room, scene, background, terrain or prop-kit request.
---
# Generate 2D Map

Build structured 2D game environments, layered scenes, and tilemaps with game-ready collision and navigation metadata.

## Use when

- Designing top-down RPG maps, side-scroller levels, or battle arenas.
- Creating tilesets, prop packs, and seamless autotiles.
- Exporting map bundles to Tiled, Godot 4, or LDtk.

## Workflow

1. Layout & Architecture: Define map dimensions, biome, grid size (e.g. 16x16, 32x32), camera angle, and exits.
2. Layer Generation: Create ground-only base map, dressed reference, and prop pack.
3. Props & Anchor: Anchor transparent props with sorted ground lines.
4. Collision & Navigation: Generate collision boxes, walkable surfaces, and interactive zones.
5. Export: Produce map bundle compatible with Tiled (.tmx), Godot TileMapLayer (.tscn), or LDtk.
