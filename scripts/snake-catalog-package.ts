import type { Plugin } from 'vite';

export function snakeCatalogPackage(): Plugin {
  return {
    name: 'snake-catalog-package',
    // Vite's CSS pass removes empty JS chunks and moves their styles to the importers.
    generateBundle: { order: 'post', handler(_options, bundle) {
      const chunks = Object.values(bundle).filter(output => output.type === 'chunk');
      const game = chunks.find(chunk => chunk.facadeModuleId?.endsWith('/SnakeLegendCatalog.tsx'));
      const wrapper = chunks.find(chunk => chunk.facadeModuleId?.endsWith('/GameWrapper.tsx'));
      if (!game || !wrapper) this.error('Snake catalog package is missing its game or wrapper chunk');

      const code = new Set<string>();
      const visit = (file: string) => {
        if (code.has(file)) return;
        const chunk = bundle[file];
        if (chunk?.type !== 'chunk') this.error(`Missing chunk ${file} in Snake catalog package`);
        code.add(file);
        chunk.viteMetadata?.importedCss.forEach(css => code.add(css));
        chunk.imports.forEach(visit);
      };
      visit(game.fileName);
      visit(wrapper.fileName);

      for (const file of code) if (!bundle[file]) this.error(`Missing offline output ${file}`);
      const media = game.referencedFiles.filter(file => file.startsWith('assets/snake-'));
      if (!media.length) this.error('Snake catalog package has no external media');
      this.emitFile({
        type: 'asset',
        fileName: 'snake-offline-package.json',
        source: JSON.stringify({
          code: [...code].sort().map(file => '/' + file),
          media: [...new Set(media)].sort().map(file => '/' + file),
        }),
      });
    } },
  };
}
