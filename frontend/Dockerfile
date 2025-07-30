# 1단계: Build
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# ✅ Chakra UI 타입 생성 (이 부분 추가)
RUN npx @chakra-ui/cli typegen --outir src/@types/chakra.d.ts src/theme/system.ts || echo "Chakra typegen failed"

RUN npm run build

# 2단계: Nginx로 정적 파일 서빙
FROM nginx:alpine

# React 빌드 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# (선택) 커스텀 Nginx 설정 덮어쓰기
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


#test