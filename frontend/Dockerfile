FROM node:18-alpine AS builder

WORKDIR /app

# 빌드 시점 환경 변수 (ARG로 받아서 ENV로 설정)
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# 의존성 설치
COPY package*.json ./
RUN npm ci

# 빌드
COPY . .
RUN npm run build

# Nginx로 서빙
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]




