
// src/theme/system.ts
import { createSystem, defaultConfig } from '@chakra-ui/react'

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'SBAggro, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' },
        body:    { value: 'SBAggro, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' },
      },
      fontWeights: {
        light:  { value: '300' },
        normal: { value: '400' },   // 400을 Medium으로 매핑했다면 fonts.css에도 400 선언이 있어야 함
        medium: { value: '500' },
        bold:   { value: '700' },
      },
    },
  },
})
