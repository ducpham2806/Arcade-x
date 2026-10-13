# Blossom Blast VFX v0.8

Uses the supplied anim_spec.json frame counts and original png/anim/anim_fx_* sheets: per-color pops, Bloom Bomb, Sun, Rainbow, merge and chain. No gameplay damage or scoring changes.

Normal removal: original color burst plus original petal sprites. Bee: gold beam and floral sweep along the actual full affected row/column. Sun: original radial Sun burst plus distinct sweeps on every full affected row/column (normally three each, clipped at board edges). Bloom Bomb: original bloom sheet sized to affected area plus outward staggered colored bursts. Rainbow: source rainbow sheet, color-matched curved links and flower ghosts, then original target bursts. Overlapping batches remain until completion; result waits on actual animation promises and duration.

New asset: png/vfx_fx/vfx_petal_sweep_v8.png. Created with built-in imagegen, transparent RGBA, 2172x724. Original generated output preserved; no third-party game artwork copied. The PNG is stretched across rows and rotated for columns in VFX.tsx.

Generation prompt:
Use case: stylized-concept. Asset type: single transparent raster VFX texture for Blossom Blast flower puzzle game. Create ONE horizontal sweeping trail made of a luminous warm honey-gold tapered ribbon with scattered small stylized pink, cream and yellow flower petals, tiny four-point stars. Broad central sweep tapering gently toward both ends, horizontal aspect ratio 3:1. Flat polished 2D cartoon mobile game art, soft glow with crisp petal silhouettes, restrained highlights, visible transparent spaces between petals; compatible with cheerful outlined floral game pieces. No characters, no UI, no lettering, no background, no frame, no grid, no multiple variations. Actual transparent alpha background. This texture will be stretched and animated across rows and rotated for columns; leave generous transparent margin above and below. Do not include a solid rectangular glow or opaque background.

Design references (mechanic distinctions, not copied art):
https://candycrush.zendesk.com/hc/en-us/articles/211939685-Creating-and-combining-Special-Candies
https://playrix.helpshift.com/hc/en/5-gardenscapes/faq/708-what-are-chargeable-power-ups/

Validation includes frame-source references, horizontal/vertical ray counts, no rectangular target overlays, effect cleanup, result timing, rapid moves and embedded offline assets. No real-device FPS profiling.
