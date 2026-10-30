# Production prompt briefs — Dungeon Titan v5

Generation method: built-in Imagegen (including targeted edits), not CLI. Reference art: current Bomb Buddies art v3 review and Pip v4 review. These briefs summarize the production directions; `prompts.json` retains the available exact final correction prompts.

Shared direction: original medieval high fantasy, rich painted pixel-textured raster, sculpted volume, weathered bronze/steel, leather, moss, luminous magic, warm upper-left light and cool shadows. Full silhouettes; no flat vector characters, emoji, labels, grid lines or watermark. All character/item/VFX sheets request genuine transparent alpha. Environments are opaque.

## Boss sheets (4×2)

Eight poses in reading order: idle, left step, right step, raised attack windup, forceful attack, recovery crouch, stunned/exposed core, fallen defeat. Same identity and scale within a sheet.

1. Goblin king: moss-green skin, broken bronze crown, battered armor, leather skirt, huge stone mace, amber rune core.
2. Undead general: ivory skull/ribs, tarnished bronze plate, midnight cape, bone shield, executioner sword, cyan soul core.
3. Void spider matriarch: violet chitin, eight legs, emerald abdomen, ivory fangs, poison sac, magenta eyes.
4. Vampire count: pale face, black hair, black/silver armor, oxblood cape, ruby core, crimson saber and blood magic.
5. Fire dragon: quadruped red volcanic scales, obsidian horns, folded wings, molten chest, curled tail and fire breath.
6. Frost giant: glacial stone, white fur, crystal crown/shoulders, cyan heart, massive fists.
7. Thunder titan: aged gold/dark steel plate, winged helmet, purple cloak, rune warhammer and white-blue lightning.
8. Void puppet lord: hooded violet robes, porcelain mask, segmented hands/string magic, turquoise cosmic ribcage core and close orbiting runes.

## Party sheets

Four poses per character: idle, attack anticipation, attack, hurt. First sheet rows: green-cloaked silver swordmaster; leather-clad elven archer; bearded blue-robed fire mage; faceless jagged-granite golem with cyan runes. Second sheet: violet hooded twin-dagger assassin; ivory/gold sun priestess; red bronze dragon knight with spear. Correction removes bear features from golem and increases transparent margins.

## Enemy sheets

Two poses per character, idle/attack. Four sets: goblin scout/shield guard/shaman + skeletal executioner/tomb guardian/necromancer; purple spider/poison tree/forest witch + vampire bat/blood sentinel/castle ghost; fire imp/lava golem/baby dragon + ice spirit/snow warrior/ice witch; thunder guardian/lightning herald/spectral mounted knight + void hunter/rock titan illusion/abyss ghost. Third sheet correction rearranges to4×3 cells; others2×6.

## Equipment and icons

Equipment sheet6×4: sword, breastplate, winged helmet, green cloak, ruby ring; archer bow/leather vest/feather amulet; mage fire staff/blue robe/orb pendant; golem fist/granite armor/rune tablet; assassin daggers/purple armor/poison pendant; priestess sun staff/ivory robe/sun pendant; dragon spear/red plate/fang pendant; ornate chest.

Skill sheet5×5: lightning sword, berserker fist, gold hand, shadow clones, blade storm, war horn, sun slash; arrow rain, ice arrow, bullseye arrow; meteor, blizzard, thundercloud; quake fist, rock shield, golem smash; void dagger, poison knives, spectral assassin; blessing, cleansing leaf, winged miracle; dragon roar, crimson heart, descending dragon.

Interface sheet6×6 uses the exact order in `UI_ICONS` in FantasyIcon.tsx: medieval painted controls/resources with clear silhouettes. Final correction preserves order and adds transparent gutters.

## Environments

Two2×2 source atlases, each tile portrait512×768 at runtime. Camera looks across an empty stone arena, clear center for monster, walkable lower floor, architecture at edges, quiet top for HUD. Regions: mossy goblin gate, blue crypt mine, enchanted poisonous forest, vampire courtyard, basalt volcano, frozen citadel, gold thunder temple, shattered cosmic void temple. No characters or UI baked into backgrounds.

## Combat effects

4×3 transparent atlas: row1 four-stage golden slash; row2 cyan parry rune/ward/shards/fade; row3 violet arcane star/burst/rune/wisps. Compact effect within each cell, no huge bloom and no character baked in.
