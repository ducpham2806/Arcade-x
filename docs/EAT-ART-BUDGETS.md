# Eat Em All — art direction and budgets (before production)

Style: original storybook fantasy. Rounded sculpted forms, deep teal outlines, warm upper-left key light, cyan ice facets versus orange flame curves, parchment/brass controls. No copied characters or downloaded game art. Market references: official Cut the Rope (character-led identity), Fruit Ninja (food/hazard readability), CookieRun: Kingdom (world and narrative identity).

| Asset class | Resolution / format | Runtime budget |
|---|---|---|
| Nốm | 256×256 SVG source; raster cache at 192×192 × 18 variants (3 forms × 6 poses) | One draw, one shadow, no per-frame image decode |
| Four guardians | 320×320 SVG source; cache 256×256 × 3 poses | One guardian at once; one aura |
| Items and boosters | 128×128 SVG source; cache 96×96 | At most 32 items; same outline/light direction |
| UI glyphs | 64/128 SVG | DOM icons, no emoji-dependent rendering |
| World | 1200×800 WebP, target under 250 KiB | One decoded bitmap, one background draw/frame; dim under gameplay |
| VFX | Code shapes | 96 particles maximum; 12 floating texts; 2 translucent layers per item |
| Reduced motion | CSS media query and renderer setting | No screen shake, ambient motion, idle bob or animated glow |

No mesh LODs or platform texture compression formats apply to a Canvas2D/SVG web game. Raster caches act as resolution tiers; art is retained in vector source. UI mipmaps off; Canvas sprites use browser image smoothing. Target 60 fps, with dt-based gameplay at 30/60/120 Hz; device GPU profiling remains required before performance sign-off. Asset budgets are enforced with an export/check script. Art review must include the actual renderer rather than an isolated style board alone.
