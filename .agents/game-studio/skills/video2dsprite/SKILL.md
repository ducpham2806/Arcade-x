---
name: video2dsprite
description: Turn one approved master still into a character's whole animated sprite set - one image-to-video clip per action (idle, walk, run, attack, jump, hurt, cast and so on), all from that still, then gate each take, key it with a soft matte, register it to the master, pick loops or retime actions, finish (HD by default, pixel on request) and package fixed-canvas frames, alpha WebM, packed MP4 and a PNG fallback with engine metadata. Use for character and creature animation, fluid motion and video-to-sprite work.
---
# Video to 2D Animation

Generate action animation clips from a master character still using image-to-video models, soft-matte chroma keying, gait loops, and game-speed retiming.

## Use when

- Animating a character or creature with actions: idle, walk, run, attack, jump, hurt, death, cast.
- Converting raw video clips into game-ready sprites or sprite sheets.

## Workflow

1. Plan: Select actions required for the character and target display frames.
2. Clip generation: Run image-to-video from the approved master still.
3. Key & Register: Soft-matte background extraction and anchor registration against the master pose.
4. Cut & Retime: Measured gait loops for walk/run; retimed action curves for one-shot hits (attack, jump, hurt).
5. Finish & Export: Output sprite sheets, alpha WebM, and engine JSON (Godot, Aseprite, Unity).
