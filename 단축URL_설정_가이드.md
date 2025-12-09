# 단축 URL을 Google OAuth Redirect URI로 사용하기

## 📋 설정 방법

### 1. 환경 변수 설정

`frontend/.env` 파일을 생성하거나 수정하여 다음을 추가:

```env
VITE_GOOGLE_REDIRECT_URI=https://buly.kr/DlKZ7LB
```

### 2. Google Cloud Console 설정

**중요:** Google Cloud Console에도 단축 URL을 등록해야 합니다.

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **API 및 서비스** → **사용자 인증 정보**
3. OAuth 2.0 클라이언트 ID 편집
4. **"승인된 리디렉션 URI"**에 다음 추가:
   ```
   https://buly.kr/DlKZ7LB
   ```
5. 저장

### 3. 단축 URL이 실제로 어디로 가는지 확인

단축 URL이 실제로 어디로 리디렉션되는지 확인:

```bash
curl -I https://buly.kr/DlKZ7LB
```

**중요:** 
- 단축 URL이 `http://localhost`로 리디렉션되면 → Google Cloud Console에 `http://localhost`도 등록 필요
- 단축 URL이 다른 URL로 리디렉션되면 → 그 URL도 Google Cloud Console에 등록 필요

### 4. 프론트엔드 재빌드

환경 변수를 변경했으므로 프론트엔드를 재빌드해야 합니다:

```bash
cd frontend
npm run build
```

### 5. 데스크톱 앱 재빌드

```bash
cd desktop-app
npm run build:mac
```

## ⚠️ 주의사항

### 단축 URL 사용 시 고려사항

1. **리디렉션 체인 확인**
   - 단축 URL이 여러 번 리디렉션될 수 있습니다
   - 최종 리디렉션 URL도 Google Cloud Console에 등록해야 합니다

2. **보안**
   - 단축 URL이 공개되어 있으면 누구나 사용할 수 있습니다
   - 가능하면 직접 URL 사용 권장

3. **안정성**
   - 단축 URL 서비스가 다운되면 로그인이 작동하지 않습니다
   - `http://localhost` 사용 권장 (데스크톱 앱)

### 권장 설정

**데스크톱 앱:**
- `http://localhost` 사용 (기본값)
- 단축 URL 불필요

**웹 앱:**
- 현재 origin 사용 (기본값)
- 또는 단축 URL 사용 가능

## 🔍 문제 해결

### 문제 1: "redirect_uri_mismatch" 오류
**원인:** Google Cloud Console에 단축 URL이 등록되지 않음

**해결:**
1. Google Cloud Console 접속
2. OAuth 2.0 클라이언트 ID 편집
3. "승인된 리디렉션 URI"에 `https://buly.kr/DlKZ7LB` 추가
4. 저장 후 5분 대기

### 문제 2: 단축 URL이 다른 URL로 리디렉션됨
**해결:**
- 최종 리디렉션 URL도 Google Cloud Console에 등록

### 문제 3: 환경 변수가 적용되지 않음
**해결:**
1. `.env` 파일 위치 확인 (`frontend/.env`)
2. 프론트엔드 재빌드 (`npm run build`)
3. 데스크톱 앱 재빌드

## 📝 체크리스트

- [ ] `frontend/.env` 파일에 `VITE_GOOGLE_REDIRECT_URI` 설정
- [ ] Google Cloud Console에 단축 URL 등록
- [ ] 단축 URL의 최종 리디렉션 URL 확인
- [ ] 프론트엔드 재빌드
- [ ] 데스크톱 앱 재빌드
- [ ] Google 로그인 테스트

