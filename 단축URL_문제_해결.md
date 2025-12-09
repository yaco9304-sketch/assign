# 단축 URL 404 오류 해결 방법

## 🔴 문제: 404 NOT_FOUND 오류

단축 URL을 Google OAuth `redirect_uri`로 사용하면 404 오류가 발생합니다.

### 원인

1. Google OAuth가 단축 URL로 리디렉션
2. 단축 URL 서버가 OAuth 콜백을 처리할 수 없음
3. 404 오류 발생

**중요:** Google OAuth의 `redirect_uri`는 **실제로 OAuth 콜백을 받을 수 있는 URL**이어야 합니다.

## ✅ 해결 방법

### 방법 1: 데스크톱 앱 - `http://localhost` 사용 (권장)

데스크톱 앱에서는 단축 URL 대신 `http://localhost`를 사용하세요.

**설정:**
1. `frontend/.env` 파일에서 `VITE_GOOGLE_REDIRECT_URI` 제거 또는 주석 처리
2. Google Cloud Console에 `http://localhost` 등록
3. 앱 재빌드

**장점:**
- 가장 안정적
- 추가 설정 불필요
- 데스크톱 앱 표준 방식

### 방법 2: 웹 앱 - 실제 도메인 URL 사용

웹 앱에서는 실제 도메인 URL을 사용하세요.

**설정:**
1. `frontend/.env` 파일에 실제 URL 설정:
   ```env
   VITE_GOOGLE_REDIRECT_URI=https://assign-nu-weld.vercel.app/login
   ```
2. Google Cloud Console에 실제 URL 등록
3. 프론트엔드 재빌드

### 방법 3: 단축 URL을 최종 URL로 변환

단축 URL이 어디로 가는지 확인하고, 그 최종 URL을 사용:

```bash
curl -I https://buly.kr/DlKZ7LB
```

결과: `https://assign-nu-weld.vercel.app/login`

이 경우:
- `frontend/.env`에 최종 URL 설정:
  ```env
  VITE_GOOGLE_REDIRECT_URI=https://assign-nu-weld.vercel.app/login
  ```
- Google Cloud Console에 최종 URL 등록

## 📋 권장 설정

### 데스크톱 앱
```env
# .env 파일에서 VITE_GOOGLE_REDIRECT_URI 제거
# 기본값인 http://localhost 사용
```

### 웹 앱
```env
VITE_GOOGLE_REDIRECT_URI=https://assign-nu-weld.vercel.app/login
```

## ⚠️ 주의사항

1. **단축 URL은 redirect_uri로 사용 불가**
   - 단축 URL 서버가 OAuth 콜백을 처리할 수 없음
   - 항상 실제 URL 사용

2. **Google Cloud Console 설정**
   - 사용하는 모든 redirect_uri를 Google Cloud Console에 등록
   - `http://localhost` (데스크톱 앱)
   - `https://assign-nu-weld.vercel.app/login` (웹 앱)

3. **환경 변수 변경 후 재빌드 필수**
   - 프론트엔드: `npm run build`
   - 데스크톱 앱: `npm run build:mac`

## 🔧 빠른 해결

데스크톱 앱에서 404 오류가 발생하면:

1. `frontend/.env` 파일 확인
2. `VITE_GOOGLE_REDIRECT_URI`가 있다면 제거 또는 주석 처리
3. Google Cloud Console에 `http://localhost` 등록 확인
4. 앱 재빌드

