---
name: generate2dsprite
description: Make game-ready 2D characters, creatures, props, icons and FX as master stills, sprite sheets or animation clips. Plan size, motion and finish; generate the art (image generation is the default); approve one master still per character; then key, slice, register, scale, palette, QA and export frames for a game engine (Aseprite JSON, Godot SpriteFrames or Sprite3D). HD finish by default, pixel finish on request. Character animation is one image-to-video clip per action from the master (video2dsprite); sheets are for FX, icons and props. Use for sprites, masters, sheets, frame-by-frame animation and packaging frames from any source.
---
# Generate 2D Sprite

Make the smallest asset bundle the game needs, at its real display size, camera and style.
Game logic (collision, damage, timing) stays independent of the art.

## Use when

- A character, creature, prop, item, icon or FX is needed as a master still, a sheet or clips.
- Frames already exist (generated, painted, code-drawn) and need clips, palettes or an engine export.

## Do not use when

- Maps, tiles, terrain, parallax or scene plates: generate2dmap.
- Animating a character: approve one master here, then video2dsprite makes one clip per action.
- Code-drawn art the user asked for: codeart2d.

## Master still workflow

1. Spec: name, subject, identity (precise description), facing (left/right/front/back), class (hero/mob/boss/prop), finish (hd/pixel).
2. Generate master still with route_media or local image generator.
3. Review: identity, facing, framing, no cutoffs.
4. Approve: save master still and metadata with scale and anchor.
5. Character actions then get animated with video2dsprite.
