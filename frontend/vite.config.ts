// vite.config.ts
/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/',

  /* ------------------------------- 빌드 ------------------------------- */
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },

  /* .env 대신 define으로 넘겨야 하는 값이 있다면 이쪽에 */
  // define: {
  //   'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
  // },

  /* ------------------------------ 플러그인 ----------------------------- */
  plugins: [
    react(),
    svgr(),
    tsconfigPaths(), // 💡 tsconfig 경로 별칭 처리

    /* ----------------------------- PWA 설정 --------------------------- */
    VitePWA({
      /* ① SW가 새 버전이면 자동 교체 */
      registerType: 'autoUpdate',

      /* ② generateSW 전략 명시 + Workbox 커스터마이징 */
      strategies: 'generateSW',
      workbox: {
        /* 모든 API·인증·콜백 경로를 한 방에 네트워크 전용으로 */
        runtimeCaching: [
          { urlPattern: /^\/(api|auth|login)\//, handler: 'NetworkOnly' },
        ],
        /* index.html fallback에서도 예외 처리 */
        navigateFallbackDenylist: [/^\/(api|auth|login)\//],
      },

      /* ③ PWA 메타데이터 */
      manifest: {
        name: '또마니또',
        short_name: '또마니또',
        description: 'PWA test',
        theme_color: '#C8C6FF',       // 토큰 대신 HEX 값 사용
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/',

        /* 아이콘 세트 */
        icons: [
          {
            src: 'icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      /* ④ dev 서버에서도 SW 테스트하고 싶다면 enabled 유지 */
      devOptions: {
        enabled: true,
      },
    }),
  ],

  /* ------------------------------ Vitest ----------------------------- */
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [
              { browser: 'chromium' },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },

  /* ------------------------------ 서버 ------------------------------ */
  server: {
    proxy: {
      '/api': {
        target: 'https://i13b206.p.ssafy.io',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
