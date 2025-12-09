# Google OAuth 데스크톱 앱 설정 가이드

## 🔴 문제: redirect_uri_mismatch 오류

데스크톱 앱(Electron)에서 Google 로그인 시 발생하는 오류입니다.

## ✅ 해결 방법

### 1단계: Google Cloud Console 접속

1. https://console.cloud.google.com/ 접속
2. 프로젝트 선택

### 2단계: OAuth 2.0 클라이언트 ID 편집

1. **API 및 서비스** → **사용자 인증 정보** 이동
2. 기존 OAuth 2.0 클라이언트 ID 클릭 (웹 애플리케이션)

### 3단계: Redirect URI 추가

**승인된 리디렉션 URI** 섹션에 다음을 추가:

```
http://localhost
http://localhost:5173
http://127.0.0.1:5173
file://
```

**중요:** 
- `http://localhost` (포트 없음) - 데스크톱 앱용
- `file://` - Electron 앱용

### 4단계: JavaScript 원본 추가

**승인된 JavaScript 원본**에 다음 추가:

```
http://localhost
http://localhost:5173
http://127.0.0.1:5173
```

### 5단계: 저장

1. **저장** 버튼 클릭
2. 변경사항 적용까지 1-2분 소요

## 🔧 코드 수정 완료

프론트엔드 코드에서 데스크톱 앱을 감지하고 적절한 redirect_uri를 설정하도록 수정했습니다.

## 📝 Windows 빌드 안내

Mac에서 Windows 실행 파일을 직접 만들 수 없습니다. 다음 방법을 사용하세요:

### 방법 1: Windows PC에서 빌드

1. Windows PC에서 프로젝트 클론
2. `cd desktop-app && npm install`
3. `npm run build:win`
4. `dist/학년 배정 시스템 Setup 1.0.0.exe` 생성

### 방법 2: GitHub Actions 사용 (자동 빌드)

GitHub Actions를 설정하면 자동으로 Windows/Mac 실행 파일을 빌드할 수 있습니다.

### 방법 3: Cross-compilation (복잡함)

Docker나 다른 도구를 사용할 수 있지만 복잡합니다.

## 🎯 빠른 해결

**지금 바로 해야 할 일:**

1. Google Cloud Console 접속
2. OAuth 2.0 클라이언트 ID 편집
3. **승인된 리디렉션 URI**에 추가:
   ```
   http://localhost
   ```
4. 저장

이렇게 하면 데스크톱 앱에서 Google 로그인이 작동합니다!

## ⚠️ 참고사항

- 변경사항 적용까지 몇 분 소요될 수 있습니다
- 데스크톱 앱을 재시작하세요
- 브라우저 캐시를 삭제할 필요는 없습니다 (데스크톱 앱이므로)

