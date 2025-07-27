# 1단계: Build 단계
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2단계: Nginx 이미지로 빌드 결과 복사
FROM nginx:alpine

# 빌드된 결과물을 Nginx 기본 경로로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# (선택) React 라우팅을 위한 기본 nginx 설정 덮어쓰기
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
