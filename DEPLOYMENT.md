# 학년 배정 시스템 배포 가이드

## 배포 전 준비사항

### 1. 환경 변수 설정

#### 백엔드 (`.env`)
```env
# 데이터베이스 (운영 환경에서는 PostgreSQL 사용 권장)
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/assignment_db

# 보안
SECRET_KEY=강력한-랜덤-문자열-최소-32자-이상
ADMIN_PASSWORD=강력한-관리자-비밀번호
TEACHER_PASSWORD=강력한-교사-비밀번호

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT 설정
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

#### 프론트엔드 (`.env.production`)
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 2. Google OAuth 설정 업데이트

Google Cloud Console에서 운영 환경 URL 추가:
- **승인된 자바스크립트 원본**: `https://yourdomain.com`
- **승인된 리디렉션 URI**: `https://yourdomain.com`

---

## 배포 방법

### 방법 1: Docker를 사용한 배포 (권장)

#### 1-1. Dockerfile 작성

**백엔드 Dockerfile** (`backend/Dockerfile`)
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 포트 노출
EXPOSE 8001

# 서버 실행
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

**프론트엔드 Dockerfile** (`frontend/Dockerfile`)
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

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
```

**프론트엔드 nginx.conf** (`frontend/nginx.conf`)
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA 라우팅 지원
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 프록시 (선택사항)
    location /api {
        proxy_pass http://backend:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**docker-compose.yml** (프로젝트 루트)
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: assignment_db
      POSTGRES_USER: assignment_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U assignment_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://assignment_user:${DB_PASSWORD}@db:5432/assignment_db
      SECRET_KEY: ${SECRET_KEY}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      TEACHER_PASSWORD: ${TEACHER_PASSWORD}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
    ports:
      - "8001:8001"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 1-2. 배포 실행

```bash
# 환경 변수 파일 생성
cp .env.example .env
# .env 파일 편집

# Docker 이미지 빌드 및 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f
```

---

### 방법 2: VPS 서버 직접 배포

#### 2-1. 서버 준비 (Ubuntu 예시)

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y python3.10 python3-pip postgresql postgresql-contrib nginx certbot python3-certbot-nginx

# Node.js 설치 (nvm 사용)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### 2-2. PostgreSQL 설정

```bash
# PostgreSQL 접속
sudo -u postgres psql

# 데이터베이스 및 사용자 생성
CREATE DATABASE assignment_db;
CREATE USER assignment_user WITH PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE assignment_db TO assignment_user;
\q
```

#### 2-3. 백엔드 배포

```bash
# 프로젝트 디렉토리 생성
mkdir -p /var/www/assignment
cd /var/www/assignment

# 코드 복사 (Git 사용 권장)
git clone your-repo-url backend
cd backend

# 가상환경 생성
python3 -m venv venv
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
nano .env
# .env 파일 내용 입력

# systemd 서비스 파일 생성
sudo nano /etc/systemd/system/assignment-backend.service
```

**systemd 서비스 파일** (`/etc/systemd/system/assignment-backend.service`)
```ini
[Unit]
Description=Assignment Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/assignment/backend
Environment="PATH=/var/www/assignment/backend/venv/bin"
ExecStart=/var/www/assignment/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# 서비스 시작
sudo systemctl daemon-reload
sudo systemctl enable assignment-backend
sudo systemctl start assignment-backend
sudo systemctl status assignment-backend
```

#### 2-4. 프론트엔드 빌드 및 배포

```bash
# 프론트엔드 디렉토리로 이동
cd /var/www/assignment/frontend

# 의존성 설치 및 빌드
npm install
npm run build

# 빌드된 파일을 Nginx로 서빙
sudo cp -r dist/* /var/www/html/
```

#### 2-5. Nginx 설정

```bash
sudo nano /etc/nginx/sites-available/assignment
```

**Nginx 설정 파일** (`/etc/nginx/sites-available/assignment`)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # 프론트엔드
    root /var/www/html;
    index index.html;

    # SPA 라우팅
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 프록시
    location /api {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# 설정 활성화
sudo ln -s /etc/nginx/sites-available/assignment /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 2-6. HTTPS 설정 (Let's Encrypt)

```bash
# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 자동 갱신 설정 (이미 자동 설정됨)
sudo certbot renew --dry-run
```

---

### 방법 3: 클라우드 서비스 배포

#### 3-1. AWS 배포

**Elastic Beanstalk 사용:**
1. AWS Console → Elastic Beanstalk
2. 새 애플리케이션 생성
3. Python 플랫폼 선택
4. 코드 업로드 및 배포

**EC2 + RDS 사용:**
- EC2 인스턴스에 애플리케이션 배포
- RDS PostgreSQL 데이터베이스 생성
- Application Load Balancer로 로드 밸런싱
- Route 53으로 DNS 설정

#### 3-2. Google Cloud Platform 배포

**Cloud Run 사용:**
```bash
# Docker 이미지 빌드
gcloud builds submit --tag gcr.io/PROJECT_ID/assignment-backend
gcloud builds submit --tag gcr.io/PROJECT_ID/assignment-frontend

# Cloud Run에 배포
gcloud run deploy assignment-backend \
  --image gcr.io/PROJECT_ID/assignment-backend \
  --platform managed \
  --region asia-northeast3

gcloud run deploy assignment-frontend \
  --image gcr.io/PROJECT_ID/assignment-frontend \
  --platform managed \
  --region asia-northeast3
```

#### 3-3. Azure 배포

**App Service 사용:**
1. Azure Portal → App Services
2. 새 웹앱 생성
3. 배포 센터에서 GitHub Actions 또는 FTP 설정
4. PostgreSQL 데이터베이스 연결

---

## 보안 강화

### 1. 환경 변수 보안
- `.env` 파일을 Git에 커밋하지 않음
- `.gitignore`에 추가:
```
.env
.env.local
.env.production
*.db
__pycache__/
*.pyc
```

### 2. 데이터베이스 보안
- 강력한 비밀번호 사용
- 방화벽 설정 (특정 IP만 접근 허용)
- SSL/TLS 연결 사용

### 3. API 보안
- CORS 설정 제한 (운영 환경 도메인만 허용)
- Rate Limiting 추가 (선택사항)
- HTTPS 필수 사용

### 4. JWT 보안
- `SECRET_KEY`를 충분히 길고 복잡하게 설정
- 토큰 만료 시간 적절히 설정
- Refresh Token 구현 (선택사항)

---

## 백업 전략

### 1. 데이터베이스 백업

**PostgreSQL 자동 백업 스크립트** (`backup.sh`)
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/assignment"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# 데이터베이스 백업
pg_dump -U assignment_user assignment_db | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# 30일 이상 된 백업 삭제
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
```

**Cron 설정 (매일 새벽 2시)**
```bash
crontab -e
# 추가:
0 2 * * * /path/to/backup.sh
```

### 2. 파일 백업
- 업로드된 엑셀 파일
- 로그 파일
- 설정 파일

---

## 모니터링 및 로깅

### 1. 로그 관리

**백엔드 로그:**
- systemd journal: `sudo journalctl -u assignment-backend -f`
- 파일 로그: 로깅 라이브러리 사용 (예: `structlog`)

**프론트엔드 로그:**
- 브라우저 콘솔
- 에러 추적 서비스 (Sentry 등) 연동

### 2. 모니터링

**추천 도구:**
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Application Monitoring**: New Relic, Datadog
- **Error Tracking**: Sentry

---

## 업데이트 및 유지보수

### 1. 코드 업데이트

```bash
# 백엔드 업데이트
cd /var/www/assignment/backend
git pull
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart assignment-backend

# 프론트엔드 업데이트
cd /var/www/assignment/frontend
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
```

### 2. 데이터베이스 마이그레이션

```bash
# Alembic 사용 (선택사항)
alembic upgrade head
```

---

## 트러블슈팅

### 일반적인 문제

1. **502 Bad Gateway**
   - 백엔드 서버가 실행 중인지 확인: `sudo systemctl status assignment-backend`
   - 포트 충돌 확인: `sudo netstat -tlnp | grep 8001`

2. **데이터베이스 연결 오류**
   - PostgreSQL 서비스 확인: `sudo systemctl status postgresql`
   - 연결 정보 확인: `.env` 파일의 `DATABASE_URL`

3. **CORS 오류**
   - `backend/app/main.py`의 `allow_origins`에 프론트엔드 도메인 추가

4. **Google OAuth 오류**
   - Google Cloud Console에서 리디렉션 URI 확인
   - 환경 변수 확인

---

## 체크리스트

배포 전 확인사항:

- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 생성 및 연결 테스트
- [ ] Google OAuth 설정 업데이트
- [ ] HTTPS 인증서 발급
- [ ] 백업 스크립트 설정
- [ ] 로그 모니터링 설정
- [ ] 보안 설정 확인
- [ ] 성능 테스트
- [ ] 사용자 매뉴얼 작성

---

## 추가 리소스

- [FastAPI 배포 가이드](https://fastapi.tiangolo.com/deployment/)
- [React 배포 가이드](https://react.dev/learn/start-a-new-react-project#production-builds)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [Nginx 문서](https://nginx.org/en/docs/)


