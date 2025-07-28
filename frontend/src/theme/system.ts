// src/theme/system.ts
import { createSystem, defaultConfig, defineGlobalStyles } from '@chakra-ui/react';

const globalCss = defineGlobalStyles({
  /* Firefox */
  'html, body': {
    scrollbarWidth: 'none',
  },
  /* Chrome / Safari / Edge */
  '::-webkit-scrollbar': {
    display: 'none',
  },
});

export const system = createSystem(defaultConfig, {
  globalCss, // ← 여기!
  theme: {
    tokens: {
      fonts: {
        heading: {
          value: 'SBAggro, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        },
        body: {
          value: 'SBAggro, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        },
      },
      fontWeights: {
        light: { value: '300' },
        normal: { value: '400' },
        medium: { value: '500' },
        bold: { value: '700' },
      },
    },
  },
});
