// src/theme/system.ts
import {
  createSystem,
  defaultConfig,
  defineGlobalStyles,
} from "@chakra-ui/react"

const globalCss = defineGlobalStyles({
  "html, body": {
    scrollbarWidth: "none",
  },
  "::-webkit-scrollbar": {
    display: "none",
  },
})

export const system = createSystem(defaultConfig, {
  globalCss,
  theme: {
    tokens: {
      fonts: {
        /** 본문 및 일반 헤딩용: GmarketSans */
        body: {
          value: "GmarketSans, SBAggro, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        },
        heading: {
          value: "GmarketSans, SBAggro, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        },
        /** 제목 전용 폰트: SBAggro */
        heading_1: {
          value: "SBAggro, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        },
      },
      fontWeights: {
        light: { value: "300" },
        normal: { value: "400" },
        medium: { value: "500" },
        bold: { value: "700" },
      },
      colors: {
        accent: {
          50:  { value: '#faf5ff' },
          100: { value: '#f3e8ff' },
          200: { value: '#e9d5ff' },
          300: { value: '#d8b4fe' },
          400: { value: '#c084fc' },
          500: { value: '#a855f7' },
          600: { value: '#9333ea' },
          700: { value: '#641ba3' },
          800: { value: '#4a1772' },
          900: { value: '#2f0553' },
          950: { value: '#1a032e' },
        },
      },
    },
  },
})
