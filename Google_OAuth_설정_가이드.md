# Google OAuth 설정 가이드

## 🔴 문제: redirect_uri_mismatch 오류

데스크톱 앱에서 Google 로그인 시 발생하는 오류입니다.

## 🔍 원인

Google Cloud Console에 등록된 redirect URI와 실제 사용하는 URI가 일치하지 않습니다.

## ✅ 해결 방법

### 1단계: Google Cloud Console 접속

1. https://console.cloud.google.com/ 접속
2. 프로젝트 선택 (또는 새로 생성)

### 2단계: OAuth 2.0 클라이언트 ID 설정

1. **API 및 서비스** → **사용자 인증 정보** 이동
2. 기존 OAuth 2.0 클라이언트 ID 클릭 (또는 새로 생성)
3. **승인된 리디렉션 URI** 섹션 확인

### 3단계: Redirect URI 추가

다음 URI들을 추가해야 합니다:

#### 웹 애플리케이션용
```
http://localhost:5173
http://localhost:8001
https://assign-nu-weld.vercel.app
https://your-backend.onrender.com
```

#### 데스크톱 앱용 (Electron)
```
http://localhost
http://localhost:5173
http://127.0.0.1:5173
file://
```

### 4단계: JavaScript 원본 추가

**승인된 JavaScript 원본**에 다음 추가:
```
http://localhost:5173
http://localhost:8001
https://assign-nu-weld.vercel.app
https://your-backend.onrender.com
```

### 5단계: 저장 및 적용

1. **저장** 버튼 클릭
2. 변경사항이 적용되기까지 몇 분 소요될 수 있음

## 🔧 데스크톱 앱 전용 설정

Electron 앱에서는 `http://localhost` 또는 `file://` 프로토콜을 사용합니다.

### 옵션 1: Custom Protocol 사용 (권장)

Electron에서 `app://` 같은 커스텀 프로토콜을 사용하면 더 안전합니다.

### 옵션 2: localhost 사용

Google Cloud Console에 `http://localhost`를 추가합니다.

## 📝 현재 설정 확인

현재 백엔드에서 사용하는 redirect URI를 확인하려면:

1. `backend/app/api/auth.py` 파일 확인
2. Google OAuth 설정 확인
3. 프론트엔드에서 사용하는 redirect URI 확인

## 🚀 빠른 해결

가장 빠른 해결 방법:

1. Google Cloud Console 접속
2. OAuth 2.0 클라이언트 ID 편집
3. **승인된 리디렉션 URI**에 다음 추가:
   ```
   http://localhost
   http://localhost:5173
   http://127.0.0.1:5173
   ```
4. 저장

## ⚠️ 주의사항

- 변경사항 적용까지 몇 분 소요될 수 있습니다
- 테스트 전에 브라우저 캐시를 삭제하세요
- 데스크톱 앱을 재시작하세요

## 🔄 대안: 데스크톱 앱에서 Google 로그인 비활성화

데스크톱 앱에서는 일반 로그인만 사용하고 Google 로그인을 비활성화할 수도 있습니다.

