import type { Plugin } from 'vite';

// Legacy generators still supply inline literals for the standalone review export.
// The hosted preview ships those same bytes as hashed resources.
export function snakePreviewMedia(): Plugin {
  return {
    name: 'snake-preview-media',
    apply: 'build',
    enforce: 'pre',
    transform(source, id) {
      const file = id.match(/\/src\/games\/snake-legend\/src\/(assets|story-prop-assets|audio-assets|audio-feedback-assets)\.ts$/)?.[1];
      if (!file) return;

      const assetUrl = (name: string, extension: string, encoded: string) => {
        const reference = this.emitFile({
          type: 'asset',
          name: `snake-${name}.${extension}`,
          source: Buffer.from(encoded, 'base64'),
          needsCodeReference: true,
        });
        return `import.meta.ROLLUP_FILE_URL_${reference}`;
      };
      let code: string;
      if (file === 'assets') {
        code = source.replace(/"([a-z0-9_]+)":\{"image":"data:image\/(png|webp);base64,([A-Za-z0-9+/=]+)"/g,
          (_literal, name, extension, encoded) => `"${name}":{"image":${assetUrl(name, extension, encoded)}`);
      } else if (file === 'story-prop-assets') {
        code = source.replace(/"data:image\/webp;base64,([A-Za-z0-9+/=]+)"/,
          (_literal, encoded) => assetUrl('r01_props', 'webp', encoded));
      } else {
        code = source.replace(/"(sfx_[a-z0-9_]+)":\s*"(UklGR[A-Za-z0-9+/=]+)"/g,
          (_literal, name, encoded) => `"${name}":${assetUrl(name, 'wav', encoded)}`);
      }
      if (code === source) this.error(`No media literals matched in ${file}.ts`);
      return { code, map: null };
    },
    generateBundle(_options, bundle) {
      // Include Rollup file URLs in Vite's per-chunk manifest for package tooling.
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue;
        for (const file of output.referencedFiles) {
          if (file.split('/').at(-1)?.startsWith('snake-')) output.viteMetadata?.importedAssets.add(file);
        }
      }
    },
  };
}
