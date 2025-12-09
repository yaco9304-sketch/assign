# Docker 배포 가이드

## 📋 개요

이 가이드는 Docker와 Docker Compose를 사용하여 전체 애플리케이션(백엔드 + 프론트엔드 + 데이터베이스)을 배포하는 방법을 설명합니다.

## 🚀 빠른 시작

### 1. 필수 요구사항

- Docker 20.10 이상
- Docker Compose 2.0 이상
- 최소 2GB RAM
- 최소 5GB 디스크 공간

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
# 데이터베이스 설정
DB_PASSWORD=your-secure-db-password

# 백엔드 보안 설정
SECRET_KEY=your-32-character-secret-key-minimum
ADMIN_PASSWORD=your-admin-password-min-8-chars
TEACHER_PASSWORD=your-teacher-password-min-8-chars

# Google OAuth 설정
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 프론트엔드 환경 변수 (빌드 시점에 주입)
VITE_API_BASE_URL=http://localhost:8001

# CORS 설정 (프론트엔드 도메인)
ALLOWED_ORIGINS=http://localhost,http://localhost:80,https://your-domain.com
```

**⚠️ 보안 주의사항:**
- `.env` 파일은 절대 Git에 커밋하지 마세요
- 프로덕션에서는 강력한 비밀번호 사용
- `SECRET_KEY`는 최소 32자 이상 권장
- `ADMIN_PASSWORD`와 `TEACHER_PASSWORD`는 최소 8자 이상 권장

### 3. 빌드 및 실행

```bash
# 전체 스택 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그만 확인
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. 접속 확인

- **프론트엔드**: http://localhost
- **백엔드 API**: http://localhost:8001
- **API 문서**: http://localhost:8001/docs

## 📦 서비스 구성

### 백엔드 (FastAPI)
- **포트**: 8001
- **이미지**: Python 3.10-slim 기반
- **데이터베이스**: PostgreSQL (비동기)

### 프론트엔드 (React + Vite)
- **포트**: 80
- **이미지**: Node.js 18 + Nginx 기반
- **빌드**: 멀티 스테이지 빌드

### 데이터베이스 (PostgreSQL)
- **포트**: 5432
- **이미지**: PostgreSQL 15 Alpine
- **볼륨**: 데이터 영구 저장

## 🔧 상세 설정

### 환경 변수 상세 설명

#### 데이터베이스
- `DB_PASSWORD`: PostgreSQL 데이터베이스 비밀번호

#### 백엔드 보안
- `SECRET_KEY`: JWT 토큰 서명에 사용되는 비밀키 (최소 32자 권장)
- `ADMIN_PASSWORD`: 관리자 기본 비밀번호 (최소 8자 권장)
- `TEACHER_PASSWORD`: 교사 기본 비밀번호 (최소 8자 권장)

#### Google OAuth
- `GOOGLE_CLIENT_ID`: Google Cloud Console에서 발급받은 클라이언트 ID
- `GOOGLE_CLIENT_SECRET`: Google Cloud Console에서 발급받은 클라이언트 시크릿

#### CORS
- `ALLOWED_ORIGINS`: 허용할 프론트엔드 도메인 (쉼표로 구분)
  - 예: `http://localhost,https://your-domain.com`
  - 프로덕션에서는 `*` 사용 금지

### 프론트엔드 환경 변수

프론트엔드는 빌드 시점에 환경 변수가 주입됩니다.

**현재 설정:**
- `frontend/Dockerfile`에 ARG와 ENV가 이미 설정되어 있습니다
- `docker-compose.yml`에서 빌드 인자로 전달됩니다

**환경 변수:**
- `VITE_API_BASE_URL`: 백엔드 API URL (기본값: `http://localhost:8001`)
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID

**설정 방법:**
`.env` 파일에 다음을 추가:
```env
VITE_API_BASE_URL=http://localhost:8001
```

또는 프로덕션 환경에서는:
```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

**주의사항:**
- 프론트엔드 환경 변수는 빌드 시점에 주입되므로, 변경 후 재빌드가 필요합니다
- `VITE_` 접두사가 있는 변수만 프론트엔드에서 사용 가능합니다

## 🐳 Docker Compose 명령어

### 기본 명령어

```bash
# 서비스 시작 (백그라운드)
docker-compose up -d

# 서비스 중지
docker-compose stop

# 서비스 중지 및 컨테이너 제거
docker-compose down

# 서비스 중지, 컨테이너 제거, 볼륨 삭제
docker-compose down -v

# 서비스 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart backend
```

### 빌드 관련

```bash
# 이미지 재빌드
docker-compose build

# 캐시 없이 재빌드
docker-compose build --no-cache

# 특정 서비스만 재빌드
docker-compose build backend
```

### 로그 및 디버깅

```bash
# 모든 서비스 로그 확인
docker-compose logs -f

# 특정 서비스 로그만 확인
docker-compose logs -f backend

# 최근 100줄 로그 확인
docker-compose logs --tail=100

# 컨테이너 내부 접속
docker-compose exec backend bash
docker-compose exec frontend sh
```

### 데이터베이스 관리

```bash
# PostgreSQL 컨테이너 접속
docker-compose exec db psql -U assignment_user -d assignment_db

# 데이터베이스 백업
docker-compose exec db pg_dump -U assignment_user assignment_db > backup.sql

# 데이터베이스 복원
docker-compose exec -T db psql -U assignment_user assignment_db < backup.sql
```

## 🌐 프로덕션 배포

### 1. 환경 변수 보안 강화

프로덕션 환경에서는 다음을 반드시 설정하세요:

```env
# 강력한 비밀번호 생성 (최소 32자)
SECRET_KEY=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -hex 16)
ADMIN_PASSWORD=$(openssl rand -hex 8)
TEACHER_PASSWORD=$(openssl rand -hex 8)
```

### 2. HTTPS 설정 (Nginx 리버스 프록시)

프로덕션에서는 Nginx 리버스 프록시를 사용하여 HTTPS를 설정하는 것을 권장합니다.

**nginx.conf 예시:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://backend:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. 리소스 제한 설정

`docker-compose.yml`에 리소스 제한 추가:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 4. 자동 재시작 설정

이미 `restart: unless-stopped`가 설정되어 있어 컨테이너가 자동으로 재시작됩니다.

### 5. 로그 관리

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 🔍 문제 해결

### 문제 1: 포트 충돌

**증상:** `port is already allocated` 에러

**해결:**
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :80
lsof -i :8001
lsof -i :5432

# docker-compose.yml에서 포트 변경
ports:
  - "8080:80"  # 프론트엔드
  - "8002:8001"  # 백엔드
```

### 문제 2: 데이터베이스 연결 실패

**증상:** `connection refused` 또는 `database does not exist`

**해결:**
1. 데이터베이스 컨테이너가 실행 중인지 확인:
   ```bash
   docker-compose ps
   ```

2. 데이터베이스 로그 확인:
   ```bash
   docker-compose logs db
   ```

3. `.env` 파일의 `DB_PASSWORD` 확인

4. 데이터베이스 컨테이너 재시작:
   ```bash
   docker-compose restart db
   ```

### 문제 3: 프론트엔드에서 API 호출 실패

**증상:** CORS 에러 또는 404 에러

**해결:**
1. `ALLOWED_ORIGINS` 환경 변수 확인
2. 프론트엔드의 API base URL 확인
3. 백엔드 로그 확인:
   ```bash
   docker-compose logs backend
   ```

### 문제 4: 빌드 실패

**증상:** `npm install` 또는 `pip install` 실패

**해결:**
1. 캐시 없이 재빌드:
   ```bash
   docker-compose build --no-cache
   ```

2. 네트워크 문제 확인:
   ```bash
   docker-compose exec backend ping google.com
   ```

3. Docker 이미지 정리 후 재빌드:
   ```bash
   docker system prune -a
   docker-compose build
   ```

### 문제 5: 볼륨 권한 문제

**증상:** `permission denied` 에러

**해결:**
```bash
# 볼륨 권한 수정
sudo chown -R $USER:$USER ./backend
sudo chown -R $USER:$USER ./frontend
```

## 📊 모니터링

### 헬스 체크

데이터베이스는 이미 헬스 체크가 설정되어 있습니다. 백엔드와 프론트엔드에도 추가 가능:

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 리소스 사용량 확인

```bash
# 컨테이너 리소스 사용량 확인
docker stats

# 특정 컨테이너만 확인
docker stats backend frontend db
```

## 🔄 업데이트 및 배포

### 코드 업데이트 후 재배포

```bash
# 1. 코드 변경사항 확인
git pull origin main

# 2. 이미지 재빌드
docker-compose build

# 3. 서비스 재시작
docker-compose up -d

# 4. 로그 확인
docker-compose logs -f
```

### 데이터베이스 마이그레이션

현재는 자동 마이그레이션이 없으므로, 필요시 수동으로 스키마를 업데이트해야 합니다.

## 📚 추가 자료

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
- [FastAPI 배포 가이드](https://fastapi.tiangolo.com/deployment/)
- [PostgreSQL Docker 이미지](https://hub.docker.com/_/postgres)

## ⚠️ 주의사항

1. **보안**: 프로덕션에서는 반드시 강력한 비밀번호 사용
2. **백업**: 정기적으로 데이터베이스 백업 수행
3. **모니터링**: 로그와 리소스 사용량을 정기적으로 확인
4. **업데이트**: 보안 패치를 정기적으로 적용
5. **환경 변수**: `.env` 파일을 Git에 커밋하지 마세요

