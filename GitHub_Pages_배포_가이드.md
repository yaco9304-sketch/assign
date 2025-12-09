# GitHub Pages 배포 가이드

## 📋 배포 전 준비사항

### 1. 백엔드 서버 확인
백엔드는 별도로 배포되어 있어야 합니다 (Render, Railway 등).
백엔드 URL을 확인하세요: `https://your-backend-url.onrender.com`

### 2. GitHub 리포지토리 확인
- 리포지토리 이름을 확인하세요 (예: `assign`)
- GitHub Pages URL은 `https://username.github.io/repository-name` 형식입니다

### 3. 환경 변수 준비
GitHub Secrets에 저장할 환경 변수:
- `VITE_API_BASE_URL`: 백엔드 API URL
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID

## 🚀 GitHub Pages 배포 방법

### 방법 1: GitHub Actions 자동 배포 (권장)

#### 1단계: GitHub Secrets 설정

1. **GitHub 리포지토리 접속**
   - Settings → Secrets and variables → Actions

2. **환경 변수 추가**
   - "New repository secret" 클릭
   - 다음 변수들을 각각 추가:
     ```
     VITE_API_BASE_URL=https://your-backend-url.onrender.com
     VITE_GOOGLE_CLIENT_ID=your-google-client-id
     ```

#### 2단계: GitHub Actions 워크플로우 확인

`.github/workflows/deploy.yml` 파일이 자동으로 생성되었습니다.
이 파일은 `main` 브랜치에 푸시할 때마다 자동으로 배포합니다.

#### 3단계: 배포 실행

1. **코드 푸시**
   ```bash
   git add .
   git commit -m "feat: GitHub Pages 배포 설정"
   git push origin main
   ```

2. **Actions 탭에서 확인**
   - GitHub 리포지토리 → Actions 탭
   - "Deploy to GitHub Pages" 워크플로우 실행 확인
   - 빌드 완료 대기 (약 2-3분)

#### 4단계: GitHub Pages 활성화

1. **Settings → Pages**
   - Source: "GitHub Actions" 선택
   - 또는 "Deploy from a branch" → `gh-pages` 브랜치 선택

2. **사이트 URL 확인**
   - 배포 완료 후 URL 확인:
     - `https://username.github.io/repository-name`
     - 또는 커스텀 도메인 설정 시 해당 도메인

### 방법 2: 수동 배포 (gh-pages 패키지)

#### 1단계: gh-pages 패키지 설치

```bash
cd frontend
npm install --save-dev gh-pages
```

#### 2단계: package.json 스크립트 추가

`frontend/package.json`에 다음 스크립트 추가:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### 3단계: 환경 변수 설정

빌드 전에 환경 변수 설정:
```bash
export VITE_API_BASE_URL=https://your-backend-url.onrender.com
export VITE_GOOGLE_CLIENT_ID=your-google-client-id
npm run deploy
```

또는 `.env.production` 파일 생성:
```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

#### 4단계: 배포 실행

```bash
cd frontend
npm run deploy
```

## ⚙️ 설정 파일

### vite.config.ts
리포지토리 이름에 따라 `base` 경로가 설정되어 있습니다.

**현재 설정:**
- 리포지토리 이름이 `assign`이므로: `base: "/assign/"`
- 루트 도메인(`username.github.io`)을 사용하는 경우: `base: "/"`로 변경 필요

**base 경로 변경 방법:**
`frontend/vite.config.ts` 파일에서:
```typescript
base: process.env.GITHUB_PAGES_BASE || "/assign/",
```
이 부분을 수정하거나, 환경 변수 `GITHUB_PAGES_BASE`를 설정하세요.

### .github/workflows/deploy.yml
GitHub Actions 워크플로우 파일이 자동 생성되었습니다.

**주요 기능:**
- `main` 브랜치 푸시 시 자동 배포
- GitHub Secrets에서 환경 변수 읽기
- Vite 빌드 실행
- `gh-pages` 브랜치에 배포

## 🔧 백엔드 CORS 설정

백엔드에서 GitHub Pages 도메인을 허용해야 합니다.

**Render 백엔드 설정:**
1. Render 대시보드 → 환경 변수
2. `ALLOWED_ORIGINS`에 GitHub Pages URL 추가:
   ```
   https://username.github.io,https://username.github.io/repository-name
   ```

## 📝 배포 후 확인사항

### 1. 사이트 접속
- GitHub Pages URL로 접속
- 예: `https://username.github.io/repository-name`

### 2. Google OAuth 설정
- Google Cloud Console 접속
- OAuth 2.0 클라이언트 ID 편집
- "승인된 리디렉션 URI"에 GitHub Pages URL 추가:
  ```
  https://username.github.io/repository-name/login
  ```

### 3. 기능 테스트
- 로그인 기능 확인
- API 연결 확인
- Google 로그인 확인

## 🔄 커스텀 도메인 설정 (선택사항)

### 1. GitHub Pages 설정
1. Settings → Pages
2. "Custom domain" 입력
3. 도메인 입력 (예: `yourdomain.com`)

### 2. DNS 설정
도메인 제공업체에서 DNS 레코드 추가:
- Type: `CNAME`
- Name: `@` 또는 `www`
- Value: `username.github.io`

### 3. HTTPS 활성화
- GitHub Pages는 자동으로 HTTPS 인증서를 발급합니다
- "Enforce HTTPS" 옵션 활성화

## ⚠️ 주의사항

### 1. 환경 변수
- `VITE_` 접두사가 있는 변수만 프론트엔드에서 사용 가능
- 빌드 시점에 주입되므로 GitHub Secrets에 저장 필요
- 배포 후 변경 시 재배포 필요

### 2. Base 경로
- 리포지토리 이름이 변경되면 `vite.config.ts`의 `base` 경로도 변경 필요
- 루트 도메인(`username.github.io`)을 사용하면 `base: "/"`로 설정

### 3. SPA 라우팅
- GitHub Pages는 기본적으로 404 페이지를 표시합니다
- `404.html` 파일이 자동 생성되어 SPA 라우팅을 지원합니다

### 4. 빌드 시간
- 첫 배포는 시간이 걸릴 수 있음 (약 2-3분)
- 이후 배포는 변경된 파일만 빌드

## 🐛 문제 해결

### 문제 1: 빌드 실패
**증상:** GitHub Actions에서 빌드 실패

**해결:**
- Actions 탭에서 빌드 로그 확인
- GitHub Secrets에 환경 변수가 올바르게 설정되었는지 확인
- `vite.config.ts`의 `base` 경로 확인

### 문제 2: 404 에러
**증상:** 페이지 새로고침 시 404 에러

**해결:**
- `404.html` 파일이 `gh-pages` 브랜치에 있는지 확인
- `vite.config.ts`의 `base` 경로가 올바른지 확인

### 문제 3: API 연결 실패
**해결:**
- `VITE_API_BASE_URL` GitHub Secret 확인
- 백엔드 CORS 설정 확인
- 브라우저 콘솔에서 네트워크 에러 확인

### 문제 4: Google 로그인 오류
**해결:**
- Google Cloud Console에 GitHub Pages URL 등록 확인
- `VITE_GOOGLE_CLIENT_ID` GitHub Secret 확인
- `redirect_uri`가 GitHub Pages URL과 일치하는지 확인

### 문제 5: 리소스 로드 실패 (CSS/JS 파일 404)
**증상:** 페이지는 열리지만 스타일이 적용되지 않음

**해결:**
- `vite.config.ts`의 `base` 경로 확인
- 브라우저 개발자 도구에서 실제 요청 URL 확인
- `base` 경로가 리포지토리 이름과 일치하는지 확인

## 📚 참고 자료

- [GitHub Pages 공식 문서](https://docs.github.com/en/pages)
- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [gh-pages 패키지](https://github.com/tschaub/gh-pages)

## 🔄 자동 배포 설정 확인

GitHub Actions가 제대로 설정되었는지 확인:

1. **워크플로우 파일 확인**
   - `.github/workflows/deploy.yml` 파일이 있는지 확인

2. **GitHub Secrets 확인**
   - Settings → Secrets and variables → Actions
   - 필요한 환경 변수가 모두 설정되었는지 확인

3. **배포 상태 확인**
   - Actions 탭에서 최근 워크플로우 실행 상태 확인
   - 초록색 체크 표시가 있으면 성공

4. **Pages 설정 확인**
   - Settings → Pages
   - Source가 "GitHub Actions" 또는 "Deploy from a branch"로 설정되어 있는지 확인

