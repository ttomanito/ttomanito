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
    breakpoints: {
      xs: "375px",
      mobile: "520px",
    },
    tokens: {

      fonts: {
        gmarketSans: {
          value: "GmarketSans, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        },
        sbaAggro: {
          value: "SBAggro, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        },
        body: { value: "{fonts.gmarketSans}" },
        heading: { value: "{fonts.gmarketSans}" },
      },
      fontWeights: {
        light: { value: "300" },
        normal: { value: "400" },
        medium: { value: "500" },
        bold: { value: "700" },
      },
      colors: {
        accent: {
          50:  { value: '#F3F2FF' },
          100: { value: '#E5E3FF' },
          200: { value: '#D5D3FF' },
          300: { value: '#CCC9FF' },
          400: { value: '#C3C0FF' },
          500: { value: '#C8C6FF' }, // ✅ 기준색
          600: { value: '#9B94F0' },
          700: { value: '#776ED8' },
          800: { value: '#5B50B0' },
          900: { value: '#413589' },
          950: { value: '#2A2166' },
        },
      },

    },
    textStyles: {
      title_md: {
        description: '중간 제목',
        value: {
          fontSize: '20px',
          fontWeight: '500',
          fontFamily: '{fonts.sbaAggro}',
          letterSpacing: '0',
        },
      },
      title_ml: {
        description: '중간 큰 제목',
        value: {
          fontSize: '24px',
          fontWeight: '500',
          fontFamily: '{fonts.sbaAggro}',
          letterSpacing: '0',
        },
      },
      title_mlg: {
        description: '중간-대 제목',
        value: {
          fontSize: '30px',
          fontWeight: '700',
          fontFamily: '{fonts.sbaAggro}',
          letterSpacing: '0',
        },
      },
      title_lg: {
        description: '큰 제목',
        value: {
          fontSize: '36px',
          fontWeight: '700',
          fontFamily: '{fonts.sbaAggro}',
          letterSpacing: '0',
        },
      },
      input_label: {
        description: '입력 라벨 텍스트',
        value: {
          fontSize: '12px',
          fontWeight: '500',
          fontFamily: '{fonts.sbaAggro}',
          letterSpacing: '0.48px', // 4% of 12px
        },
      },
      body_md: {
        description: '본문 중간',
        value: {
          fontSize: '16px',
          fontWeight: '500',
          fontFamily: '{fonts.gmarketSans}',
          letterSpacing: '0',
        },
      },
      body_sm: {
        description: '본문 소',
        value: {
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: '{fonts.gmarketSans}',
          letterSpacing: '0',
        },
      },
      caption_xs_light: {
        description: '캡션 아주 작고 라이트',
        value: {
          fontSize: '12px',
          fontWeight: '300',
          fontFamily: '{fonts.gmarketSans}',
          letterSpacing: '0',
        },
      },
      caption_xs_md: {
        description: '캡션 아주 작고 미디엄',
        value: {
          fontSize: '12px',
          fontWeight: '500',
          fontFamily: '{fonts.gmarketSans}',
          letterSpacing: '0',
        },
      },
      caption_sm: {
        description: '캡션 소',
        value: {
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: '{fonts.gmarketSans}',
          letterSpacing: '0',
        },
      },
      modal_title: {
        description: '모달 제목',
        value: {
          fontSize: '20px',
          fontWeight: '500',
          fontFamily: '{fonts.sbaAggro}',
          letterSpacing: '0',
        },
      },
    },
  },
})
