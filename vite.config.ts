import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'node:fs';
import {defineConfig} from 'vite';
import {sitePagesPlugin} from './scripts/site-pages.mjs';
import { launcherVendorChunk } from './scripts/launcher-vendor-chunks';
import { snakePreviewMedia } from './scripts/snake-preview-media';
import { snakeCatalogPackage } from './scripts/snake-catalog-package';
import {VitePWA} from 'vite-plugin-pwa';
import {GAME_ASSET_CACHE,GAME_CODE_CACHE} from './src/games/packageCache';

export default defineConfig(({ mode }) => {
  const snakeCatalog = mode === 'snake-catalog';
  const shellFiles = new Set<string>();
  return {
    plugins: [
      ...(snakeCatalog ? [snakePreviewMedia(), snakeCatalogPackage()] : []),
      sitePagesPlugin(),
      react(),
      tailwindcss(),
      { name: 'launcher-shell-only', generateBundle(_options, bundle) {
        // Follow static imports, plus lazily loaded launcher UI (modals, chat, store, confetti, game
        // asset lists) so it still works offline. Dynamic game chunks are independent download packages.
        const launcherUi = /[\\/]src[\\/](components|commerce|launcher|data)[\\/]|[\\/]src[\\/]games[\\/]packageAssets\.json$|[\\/]node_modules[\\/]canvas-confetti[\\/]/;
        const visit = (name: string) => {
          if (shellFiles.has(name)) return;
          const chunk = bundle[name]; if (!chunk || chunk.type !== 'chunk') return;
          shellFiles.add(name);
          const metadata = (chunk as unknown as { viteMetadata?: { importedCss: Set<string>; importedAssets: Set<string> } }).viteMetadata;
          metadata?.importedCss.forEach(css => shellFiles.add(css));
          metadata?.importedAssets.forEach(asset => shellFiles.add(asset));
          chunk.imports.forEach(visit);
          chunk.dynamicImports.forEach(dynamic => {
            const target = bundle[dynamic];
            if (target?.type === 'chunk' && target.facadeModuleId && launcherUi.test(target.facadeModuleId)) visit(dynamic);
          });
        };
        Object.values(bundle).forEach(chunk => { if (chunk.type === 'chunk' && chunk.isEntry) visit(chunk.fileName); });
      } },
      {name:'chronicles-existing-game',configureServer(server){
        server.middlewares.use((req,res,next)=>{
          if(!req.url?.startsWith('/chronicles-realms/'))return next();
          const root=path.resolve('standalone/chronicles-realms/dist');let file:string;
          try{file=path.resolve(root,decodeURIComponent(req.url.split('?')[0].slice('/chronicles-realms/'.length)));}catch{return next();}
          if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return next();
          const type:Record<string,string>={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png'};
          res.setHeader('Content-Type',type[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
        });
      },generateBundle(){
        const root=path.resolve('standalone/chronicles-realms/dist');
        for(const relative of fs.readdirSync(root,{recursive:true})) {
          const file=path.join(root,String(relative));if(!fs.statSync(file).isFile())continue;
          this.emitFile({type:'asset',fileName:'chronicles-realms/'+String(relative).replaceAll(path.sep,'/'),source:fs.readFileSync(file)});
        }
      }},
      VitePWA({
        registerType: 'prompt',
        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'icon.svg',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'ArcadeX - Instant Game Launcher and PWA Platform',
          short_name: 'ArcadeX',
          description: 'Launcher mini-game đơn giản, đồng bộ tài khoản và hỗ trợ chơi ngoại tuyến.',
          theme_color: '#3f56d9',
          background_color: '#f7f9fc',
          display: 'standalone',
          orientation: 'any',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Keep installation small: games and artwork are cached on demand.
          globPatterns: ['index.html', 'huong-dan/**/*.html', 'thong-tin/**/*.html', 'assets/*.{js,css,png,svg,webp,woff,woff2}'],
          manifestTransforms: [async entries => ({ manifest: entries.filter(entry => !entry.url.startsWith('assets/') || shellFiles.has(entry.url)), warnings: [] })],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/(?:huong-dan|thong-tin)(?:\/|$)/, /^\/preview\/snake(?:\/|$)/, /^\/chronicles-realms\//, /^\/standalone\//],
          runtimeCaching: [
            ...(snakeCatalog ? [{
              urlPattern: ({url,sameOrigin}) => sameOrigin && /^\/assets\/snake-[^/]+\.(?:png|webp|wav)$/.test(url.pathname),
              handler: 'CacheFirst' as const,
              options: { cacheName: GAME_ASSET_CACHE, matchOptions: { ignoreVary: true }, cacheableResponse: { statuses: [200] } },
            }, {
              // Hashed same-origin files carry the same bytes in a download, module import or preload.
              urlPattern: ({url,sameOrigin}) => sameOrigin && /^\/assets\/[^/]+-[A-Za-z0-9_-]{8}\.(?:js|css)$/.test(url.pathname),
              handler: 'CacheFirst' as const,
              options: { cacheName: GAME_CODE_CACHE, matchOptions: { ignoreVary: true }, cacheableResponse: { statuses: [200] } },
            }] : []),
            ...['blossom', 'boom', 'rainbow_blocks_assets', 'games/cosmic-defense', 'games/battleship', 'games/dungeon-tap', 'games/word-cross', 'games/word-chain', 'standalone/neon-run', 'game-art', 'chronicles-realms/assets'].map(prefix => ({
              urlPattern: new RegExp('/' + prefix + '/.*\\.(?:png|svg|webp|json|ttf)$', 'i'),
              handler: 'CacheFirst' as const,
              options: { cacheName: GAME_ASSET_CACHE, expiration: { maxEntries: 1200, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [200] } },
            })),
            {
              urlPattern: /\/(?:chronicles-realms|standalone\/neon-run)\/(?:index\.html)?$/i,
              handler: 'NetworkFirst',
              options: { cacheName: 'standalone-pages', networkTimeoutSeconds: 3, expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [200] } },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 15,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'game-assets-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:js|css)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: GAME_CODE_CACHE,
                expiration: {
                  maxEntries: 80,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    build: {
      ...(snakeCatalog ? {outDir:'test-results/snake-catalog-build',manifest:true} : {}),
      rollupOptions: {
        output: {
          // Long-lived vendor chunks: a release that only changes app code keeps these cached.
          manualChunks: launcherVendorChunk,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        ...(snakeCatalog ? {'./snake-legend/catalog-entry':path.resolve(__dirname,'src/games/snake-legend/catalog-entry-enabled.ts')} : {}),
      },
    },
    server: {
      allowedHosts: ['terminal.local'],
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
