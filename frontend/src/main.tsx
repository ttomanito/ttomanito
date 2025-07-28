// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // ← 폰트 선언을 먼저 불러옵니다
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '@/theme/system'; // createSystem 한 것

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider value={system}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
);
