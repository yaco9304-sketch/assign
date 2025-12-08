# 구글 로그인 설정 방법

## 1. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성

### 1.1 Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 또는 새 프로젝트 생성

### 1.2 OAuth 동의 화면 설정
1. 좌측 메뉴에서 **"API 및 서비스"** > **"OAuth 동의 화면"** 선택
2. 사용자 유형 선택: **"외부"** (또는 내부 조직용이면 "내부")
3. 앱 정보 입력:
   - 앱 이름: "학년 배정 시스템" (또는 원하는 이름)
   - 사용자 지원 이메일: 본인 이메일
   - 개발자 연락처 정보: 본인 이메일
4. **"저장 후 계속"** 클릭
5. 범위(Scopes)는 기본값으로 두고 **"저장 후 계속"** 클릭
6. 테스트 사용자 추가 (필요시): **"저장 후 계속"** 클릭
7. 요약 확인 후 **"대시보드로 돌아가기"** 클릭

### 1.3 OAuth 2.0 클라이언트 ID 생성
1. 좌측 메뉴에서 **"API 및 서비스"** > **"사용자 인증 정보"** 선택
2. 상단의 **"+ 사용자 인증 정보 만들기"** 클릭
3. **"OAuth 클라이언트 ID"** 선택
4. 애플리케이션 유형: **"웹 애플리케이션"** 선택
5. 이름: "학년 배정 시스템 웹 클라이언트" (또는 원하는 이름)
6. 승인된 자바스크립트 원본:
   - `http://localhost:5175`
   - `http://localhost:5173`
   - `http://localhost:5174`
   - (프로덕션 도메인이 있으면 추가)
7. 승인된 리디렉션 URI:
   - `http://localhost:5175`
   - `http://localhost:5173`
   - `http://localhost:5174`
   - (프로덕션 도메인이 있으면 추가)
8. **"만들기"** 클릭
9. 생성된 **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사

## 2. 백엔드 환경 변수 설정

### 2.1 `.env` 파일 생성/수정
`backend/` 디렉토리에 `.env` 파일을 생성하거나 수정합니다:

```bash
cd backend
touch .env  # 파일이 없으면 생성
```

### 2.2 환경 변수 추가
`.env` 파일에 다음 내용을 추가합니다:

```env
GOOGLE_CLIENT_ID=여기에_클라이언트_ID_붙여넣기
GOOGLE_CLIENT_SECRET=여기에_클라이언트_보안_비밀번호_붙여넣기
```

**예시:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

## 3. 프론트엔드 환경 변수 설정

### 3.1 `.env` 파일 생성/수정
`frontend/` 디렉토리에 `.env` 파일을 생성하거나 수정합니다:

```bash
cd frontend
touch .env  # 파일이 없으면 생성
```

### 3.2 환경 변수 추가
`.env` 파일에 다음 내용을 추가합니다:

```env
VITE_GOOGLE_CLIENT_ID=여기에_클라이언트_ID_붙여넣기
```

**참고:** 프론트엔드는 클라이언트 ID만 필요합니다. 클라이언트 보안 비밀번호는 백엔드에만 저장합니다.

**예시:**
```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

## 4. 서버 재시작

### 4.1 백엔드 서버 재시작
```bash
cd backend
# 기존 서버 종료 후
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### 4.2 프론트엔드 서버 재시작
```bash
cd frontend
# 기존 서버 종료 후
npm run dev -- --host --port 5175
```

## 5. 테스트

1. 브라우저에서 `http://localhost:5175/login` 접속
2. 역할을 **"교사"**로 선택
3. **"Continue with Google"** 버튼 클릭
4. 구글 로그인 팝업에서 계정 선택 및 로그인
5. 로그인 성공 시 `/my-preference` 페이지로 이동

## 문제 해결

### 문제: "구글 로그인을 불러오는 중입니다" 메시지가 계속 표시됨
- **해결:** 브라우저 콘솔(F12)에서 오류 확인
- Google API 스크립트가 제대로 로드되었는지 확인
- `VITE_GOOGLE_CLIENT_ID` 환경 변수가 올바르게 설정되었는지 확인

### 문제: "Invalid client" 오류
- **해결:** Google Cloud Console에서 클라이언트 ID 확인
- 승인된 자바스크립트 원본에 `http://localhost:5175`가 포함되어 있는지 확인

### 문제: CORS 오류
- **해결:** Google Cloud Console에서 승인된 리디렉션 URI 확인
- 백엔드 CORS 설정 확인 (이미 `localhost:5175` 포함됨)

## 보안 참고사항

- **클라이언트 보안 비밀번호**는 절대 프론트엔드 코드나 공개 저장소에 노출하지 마세요
- 프로덕션 환경에서는 HTTPS를 사용하세요
- Google Cloud Console에서 사용하지 않는 클라이언트 ID는 삭제하세요

