# Google OAuth 설정 필수 가이드

## ⚠️ 중요: Google Cloud Console 설정 필요

데스크톱 앱에서 Google 로그인이 작동하려면 **반드시** Google Cloud Console에 `http://localhost`를 등록해야 합니다.

## 📋 설정 방법

### 1. Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택

### 2. OAuth 2.0 클라이언트 ID 설정
1. **API 및 서비스** → **사용자 인증 정보** 이동
2. 기존 OAuth 2.0 클라이언트 ID를 **편집** (또는 새로 생성)
3. **애플리케이션 유형**: "데스크톱 앱" 선택

### 3. 승인된 리디렉션 URI 추가
**"승인된 리디렉션 URI"** 섹션에 다음을 **반드시** 추가:

```
http://localhost
http://localhost/
http://localhost:8001
```

**중요:**
- `http://localhost` (포트 없음) - **필수**
- `http://localhost/` (슬래시 포함) - 선택
- `http://localhost:8001` (백엔드 포트) - 선택

### 4. 승인된 JavaScript 원본 (웹 앱용)
웹 버전도 사용한다면 다음도 추가:

```
https://your-domain.com
http://localhost:5173
```

### 5. 저장
설정을 저장하고 **최소 5분** 정도 기다린 후 다시 시도하세요.

## 🔍 확인 방법

### 현재 설정 확인
1. Google Cloud Console → **사용자 인증 정보**
2. OAuth 2.0 클라이언트 ID 클릭
3. **승인된 리디렉션 URI** 목록 확인
4. `http://localhost`가 있는지 확인

### 오류 메시지 확인
앱에서 Google 로그인 시도 시:
- `redirect_uri_mismatch` 오류 → Google Cloud Console 설정 확인
- `access_denied` → 사용자가 로그인 취소
- 기타 오류 → 콘솔 로그 확인

## 🛠️ 문제 해결

### 문제 1: "redirect_uri_mismatch" 오류
**원인:** Google Cloud Console에 `http://localhost`가 등록되지 않음

**해결:**
1. Google Cloud Console 접속
2. OAuth 2.0 클라이언트 ID 편집
3. "승인된 리디렉션 URI"에 `http://localhost` 추가
4. 저장 후 5분 대기

### 문제 2: 설정 후에도 오류 발생
**해결:**
1. 브라우저 캐시 삭제
2. Google 계정에서 앱 권한 제거 후 재시도
3. 앱 재시작

### 문제 3: 웹에서는 작동하지만 데스크톱 앱에서 안 됨
**원인:** 데스크톱 앱용 redirect_uri가 등록되지 않음

**해결:**
- `http://localhost`를 "승인된 리디렉션 URI"에 추가

## 📝 체크리스트

- [ ] Google Cloud Console 접속
- [ ] OAuth 2.0 클라이언트 ID 편집
- [ ] "승인된 리디렉션 URI"에 `http://localhost` 추가
- [ ] 설정 저장
- [ ] 5분 대기
- [ ] 앱 재시작
- [ ] Google 로그인 재시도

## 💡 참고

- Google OAuth 설정 변경은 즉시 반영되지 않을 수 있습니다 (최대 5분)
- 여러 redirect_uri를 등록할 수 있습니다
- 데스크톱 앱과 웹 앱 모두 사용하려면 두 가지 모두 등록해야 합니다

