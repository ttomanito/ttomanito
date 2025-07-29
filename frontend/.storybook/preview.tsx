import type { Preview } from '@storybook/react-vite'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from '../src/theme/system' // ← 경로 맞게 조정
import '../src/theme/fonts.css'; // 웹폰트를 직접 불러오는 경우

const preview: Preview = {
  decorators: [
    (Story) => (
      <ChakraProvider value={system}>
        <Story />
      </ChakraProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
}

export default preview
