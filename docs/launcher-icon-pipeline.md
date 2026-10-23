# Launcher icon sources

The seven image-generated icon masters dated 2026-10-21 are recorded in
`art/launcher/tech-art-sources.json`, including their original filename,
Library identity and SHA-256. Keep the original PNG pixels in `art/launcher/`;
this directory is source-only and is not shipped with the launcher.

Runtime budget: square 512 × 512 WebP, under 150 KB each, no mipmaps.
Use the complete composition, without new illustration, text or cropping.
Each exported icon has a content-hashed URL so an earlier cached icon cannot
stand in for the new art. `src/visuals/rasterIcons.json` is the runtime mapping.

Run `node scripts/import-tech-art-icons.mjs` after importing an approved master.
The regular artwork exporter must preserve these raster sources; it may generate
the remaining native icons and promotional banners. The same runtime icon
resolver is used by library cards, featured art, loading, recent games and headers.

Only these seven generated launcher icons were recovered from the latest set.
The other fifteen games retain their existing distinct icons; they are not
represented as newly generated imagery.
