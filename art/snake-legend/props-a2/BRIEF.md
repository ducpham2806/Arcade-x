# R01 interactive props A2 brief

Reuse the existing A1 painted style: soft green stone, jade inlays, cream highlights,
dark green outlines, top-down camera with a little front face, light from upper left.

## Budgets before production

- Exit marker: 2 states (closed / ready), each <=192x192 RGBA; one runtime atlas.
- Switch: 2 states (up / latched), each <=128x128 RGBA, same atlas.
- Whole runtime atlas <=512x512 (1 MiB decoded), encoded WebP <=180 KiB.
- No texture filters, no extra RAF, no particles. One prop sprite per exit/switch.
- Art must not change any trigger, solid bounds, level or replay verifier.
- Exit trigger stays 1u in world, switch stays 1u. Ground art registration is
  shared across states; state labels / ground rings remain readable above art.
- Reduced motion removes decorative pulse. A blocked gate gets exact-footprint
  strips from existing terrain; no decorative rock may imply a different collider.

The image-generation route is the built-in imagegen tool (host_image). Generated
prop states are candidates until reviewed in the real renderer at game scale.
No new character animation is implied by this bundle.
