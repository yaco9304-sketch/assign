# Netlify 배포 가이드

## 📋 배포 전 준비사항

### 1. 백엔드 서버 확인
백엔드는 별도로 배포되어 있어야 합니다 (Render, Railway 등).
백엔드 URL을 확인하세요: `https://your-backend-url.onrender.com`

### 2. 환경 변수 준비
Netlify 대시보드에서 설정할 환경 변수:
- `VITE_API_BASE_URL`: 백엔드 API URL
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID

## 🚀 Netlify 배포 방법

### 방법 1: Netlify 웹 대시보드 사용 (권장)

1. **Netlify 계정 생성**
   - [Netlify](https://www.netlify.com/) 접속
   - GitHub 계정으로 로그인

2. **프로젝트 연결**
   - "Add new site" → "Import an existing project"
   - GitHub 저장소 선택
   - 브랜치: `main` 선택

3. **빌드 설정**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

4. **환경 변수 설정**
   - Site settings → Environment variables
   - 다음 변수 추가:
     ```
     VITE_API_BASE_URL=https://your-backend-url.onrender.com
     VITE_GOOGLE_CLIENT_ID=your-google-client-id
     ```

5. **프록시 설정 (netlify.toml) - 선택사항**
   - ⚠️ 이 단계는 **선택사항**입니다. 환경 변수로 API URL을 설정했다면 생략 가능합니다.
   - 프록시를 사용하면 `/api/*` 경로를 백엔드로 자동 전달합니다.
   - `netlify.toml` 파일을 열어서 백엔드 URL을 실제 URL로 변경:
     ```toml
     [[redirects]]
     from = "/api/*"
     to = "https://your-backend-url.onrender.com/:splat"
     ```
   - 💡 **프록시를 사용하지 않으려면**: 이 단계를 건너뛰고 환경 변수만 설정하면 됩니다.

6. **배포**
   - "Deploy site" 클릭
   - 배포 완료 대기

### 방법 2: Netlify CLI 사용

1. **Netlify CLI 설치**
   ```bash
   npm install -g netlify-cli
   ```

2. **로그인**
   ```bash
   netlify login
   ```

3. **프로젝트 초기화**
   ```bash
   cd frontend
   netlify init
   ```

4. **환경 변수 설정**
   ```bash
   netlify env:set VITE_API_BASE_URL https://your-backend-url.onrender.com
   netlify env:set VITE_GOOGLE_CLIENT_ID your-google-client-id
   ```

5. **배포**
   ```bash
   netlify deploy --prod
   ```

## ⚙️ 설정 파일

### netlify.toml
프로젝트 루트에 `netlify.toml` 파일이 생성되었습니다.

**중요:** 백엔드 URL을 실제 URL로 변경하세요:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.onrender.com/:splat"
```

### 환경 변수
Netlify 대시보드에서 다음 환경 변수를 설정하세요:

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `VITE_API_BASE_URL` | 백엔드 API URL | `https://your-backend.onrender.com` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID | `your-client-id.apps.googleusercontent.com` |

## 🔧 백엔드 CORS 설정

백엔드에서 Netlify 도메인을 허용해야 합니다.

**Render 백엔드 설정:**
1. Render 대시보드 → 환경 변수
2. `ALLOWED_ORIGINS`에 Netlify 도메인 추가:
   ```
   https://your-site.netlify.app,https://your-custom-domain.com
   ```

## 📝 배포 후 확인사항

1. **사이트 접속**
   - Netlify에서 제공하는 URL로 접속
   - 예: `https://your-site.netlify.app`

2. **Google OAuth 설정**
   - Google Cloud Console 접속
   - OAuth 2.0 클라이언트 ID 편집
   - "승인된 리디렉션 URI"에 Netlify URL 추가:
     ```
     https://your-site.netlify.app/login
     ```

3. **기능 테스트**
   - 로그인 기능 확인
   - API 연결 확인
   - Google 로그인 확인

## 🔄 커스텀 도메인 설정 (선택사항)

1. **Netlify 대시보드**
   - Site settings → Domain management
   - "Add custom domain" 클릭
   - 도메인 입력

2. **DNS 설정**
   - 도메인 제공업체에서 DNS 레코드 추가:
     - Type: `CNAME`
     - Name: `@` 또는 `www`
     - Value: `your-site.netlify.app`

## ⚠️ 주의사항

1. **환경 변수**
   - `VITE_` 접두사가 있는 변수만 프론트엔드에서 사용 가능
   - 빌드 시점에 주입되므로 배포 후 변경 시 재배포 필요

2. **프록시 설정**
   - `/api/*` 경로는 백엔드로 프록시됨
   - 백엔드 URL이 변경되면 `netlify.toml` 수정 후 재배포

3. **빌드 시간**
   - 첫 배포는 시간이 걸릴 수 있음
   - 이후 배포는 변경된 파일만 빌드

## 🐛 문제 해결

### 문제 1: 빌드 실패
**해결:**
- Netlify 빌드 로그 확인
- `package.json`의 빌드 스크립트 확인
- 의존성 설치 오류 확인

### 문제 2: API 연결 실패
**해결:**
- `VITE_API_BASE_URL` 환경 변수 확인
- 백엔드 CORS 설정 확인
- `netlify.toml`의 프록시 설정 확인

### 문제 3: Google 로그인 오류
**해결:**
- Google Cloud Console에 Netlify URL 등록 확인
- `VITE_GOOGLE_CLIENT_ID` 환경 변수 확인

## 📚 참고 자료

- [Netlify 공식 문서](https://docs.netlify.com/)
- [Netlify 환경 변수](https://docs.netlify.com/environment-variables/overview/)
- [Netlify 리디렉션](https://docs.netlify.com/routing/redirects/)

