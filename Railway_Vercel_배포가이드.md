# Railway + Vercel 무료 배포 가이드

## 전체 과정 요약 (약 10-15분 소요)

1. GitHub에 코드 올리기 (5분)
2. Railway에서 백엔드 배포 (3분)
3. Vercel에서 프론트엔드 배포 (2분)
4. 환경 변수 설정 (5분)

---

## 1단계: GitHub에 코드 올리기

### 1-1. GitHub 계정 만들기 (없는 경우)

1. https://github.com 접속
2. "Sign up" 클릭
3. 이메일, 비밀번호 입력하여 가입

### 1-2. 새 저장소 만들기

1. GitHub 로그인 후 우측 상단 "+" 버튼 클릭
2. "New repository" 선택
3. 설정:
   - **Repository name**: `assignment` (원하는 이름)
   - **Description**: (선택사항) "학년 배정 시스템"
   - **Public** 선택 (무료로 사용하려면 Public 필요)
   - **Initialize this repository with a README** 체크 해제
4. "Create repository" 클릭

### 1-3. 로컬에서 코드 업로드

터미널에서 다음 명령어 실행:

```bash
# 프로젝트 폴더로 이동
cd /Users/yaco/Desktop/xlsx

# Git 초기화 (처음 한 번만)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit"

# GitHub 저장소 연결 (위에서 만든 저장소 URL 사용)
git remote add origin https://github.com/당신의사용자명/assignment.git

# 코드 업로드
git branch -M main
git push -u origin main
```

**주의사항:**
- `당신의사용자명`을 실제 GitHub 사용자명으로 변경
- 저장소 이름이 다르면 `assignment` 부분도 변경

**Git이 설치되어 있지 않은 경우:**
- Mac: Xcode Command Line Tools 설치: `xcode-select --install`
- 또는 Git 직접 설치: https://git-scm.com/downloads

---

## 2단계: Railway에서 백엔드 배포

### 2-1. Railway 가입

1. https://railway.app 접속
2. "Start a New Project" 클릭
3. "Login with GitHub" 클릭
4. GitHub 계정으로 로그인 및 권한 승인

### 2-2. 프로젝트 생성

1. Railway 대시보드에서 "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. GitHub 저장소 목록에서 `assignment` 선택
4. "Deploy Now" 클릭

### 2-3. 서비스 설정

Railway가 자동으로 Python 프로젝트를 감지하지만, 설정을 확인합니다:

1. 생성된 서비스 클릭
2. "Settings" 탭 클릭
3. 확인:
   - **Root Directory**: `backend` (중요!)
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Root Directory 설정 방법:**
- Settings → Source → Root Directory에 `backend` 입력
- "Save" 클릭

**참고:** `backend/railway.json` 파일이 있으면 자동으로 설정이 적용됩니다.

### 2-4. PostgreSQL 데이터베이스 추가

1. Railway 프로젝트 대시보드에서 "New" 버튼 클릭
2. "Database" → "Add PostgreSQL" 선택
3. 자동으로 데이터베이스가 생성되고 연결됨
4. 생성된 데이터베이스의 "Variables" 탭에서 `DATABASE_URL` 확인 (자동으로 백엔드 서비스에 연결됨)

### 2-5. 환경 변수 설정

백엔드 서비스의 "Variables" 탭에서 다음 변수 추가:

1. 백엔드 서비스 클릭 → "Variables" 탭
2. "New Variable" 클릭하여 하나씩 추가:

```
SECRET_KEY = abcdefghijklmnopqrstuvwxyz1234567890
(최소 32자의 랜덤 문자열, 원하는 값으로 변경)

ADMIN_PASSWORD = admin1234
(원하는 관리자 비밀번호)

TEACHER_PASSWORD = teacher1234
(원하는 교사 비밀번호)

GOOGLE_CLIENT_ID = your-google-client-id
(Google Cloud Console에서 받은 값)

GOOGLE_CLIENT_SECRET = your-google-client-secret
(Google Cloud Console에서 받은 값)

ALLOWED_ORIGINS = https://당신의-vercel-url.vercel.app,https://당신의-vercel-url.vercel.app/
(Vercel 배포 후 URL로 변경, 쉼표로 구분)
```

**SECRET_KEY 생성 방법:**
터미널에서:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2-6. 배포 확인

1. "Deployments" 탭에서 배포 상태 확인
2. "Logs" 탭에서 로그 확인 (오류가 없으면 성공)
3. 배포 완료 후 "Settings" → "Generate Domain" 클릭하여 URL 확인
   - 예: `assignment-production.up.railway.app`
   - 이 URL을 메모해두세요! (나중에 프론트엔드에서 사용)

---

## 3단계: Vercel에서 프론트엔드 배포

### 3-1. Vercel 가입

1. https://vercel.com 접속
2. "Sign Up" 클릭
3. "Continue with GitHub" 클릭
4. GitHub 계정으로 로그인 및 권한 승인

### 3-2. 프로젝트 생성

1. Vercel 대시보드에서 "Add New..." → "Project" 클릭
2. GitHub 저장소 목록에서 `assignment` 선택
3. "Import" 클릭

### 3-3. 프로젝트 설정

**중요한 설정:**

1. **Framework Preset**: Vite 선택 (자동 감지될 수 있음)
2. **Root Directory**: `frontend` (중요!)
   - "Edit" 클릭 → `frontend` 입력
3. **Build Command**: `npm run build` (자동 설정됨)
4. **Output Directory**: `dist` (자동 설정됨)

### 3-4. 환경 변수 설정

"Environment Variables" 섹션에서 다음 변수 추가:

1. "Add" 버튼 클릭하여 하나씩 추가:

```
VITE_API_BASE_URL = https://당신의-railway-url.up.railway.app
(2-6단계에서 메모한 Railway 백엔드 URL)

VITE_GOOGLE_CLIENT_ID = your-google-client-id
(Google Cloud Console에서 받은 값)
```

**주의:**
- Railway URL은 `https://`로 시작해야 함
- 마지막에 `/` 없이 입력

### 3-5. 배포 실행

1. 모든 설정 확인 후 "Deploy" 클릭
2. 배포 진행 상황 확인 (약 1-2분 소요)
3. 배포 완료 후 URL 확인
   - 예: `assignment.vercel.app`
   - 이 URL을 메모해두세요!

---

## 4단계: Google OAuth 설정 업데이트

### 4-1. Google Cloud Console 접속

1. https://console.cloud.google.com 접속
2. 프로젝트 선택

### 4-2. OAuth 설정 업데이트

1. "APIs & Services" → "Credentials" 클릭
2. OAuth 2.0 Client ID 클릭
3. "승인된 자바스크립트 원본"에 추가:
   - `https://당신의-vercel-url.vercel.app`
   - `https://당신의-vercel-url.vercel.app/` (슬래시 포함)
4. "승인된 리디렉션 URI"에 추가:
   - `https://당신의-vercel-url.vercel.app`
   - `https://당신의-vercel-url.vercel.app/`
5. "저장" 클릭

---

## 5단계: 최종 확인

### 5-1. 접속 테스트

1. 브라우저에서 Vercel URL 접속
   - 예: `https://assignment.vercel.app`
2. 로그인 페이지가 보이는지 확인

### 5-2. 기능 테스트

1. **관리자 로그인 테스트**
   - 역할: 관리자
   - 비밀번호: Railway에서 설정한 `ADMIN_PASSWORD`

2. **Google 로그인 테스트**
   - "Continue with Google" 버튼 클릭
   - Google 계정으로 로그인

3. **기능 확인**
   - 교사 정보 입력
   - 희망 학년 입력
   - 관리자 대시보드 확인
   - 배정 실행

---

## 문제 해결

### "Railway에서 배포 실패"

**로그 확인:**
1. Railway → 서비스 → "Logs" 탭
2. 오류 메시지 확인

**일반적인 문제:**
- **Root Directory 설정 안 됨**: Settings → Source → Root Directory에 `backend` 입력
- **포트 오류**: Start Command에 `--port $PORT` 확인
- **의존성 오류**: `requirements.txt` 파일 확인

### "Vercel에서 빌드 실패"

**로그 확인:**
1. Vercel → 프로젝트 → "Deployments" → 실패한 배포 클릭
2. "Build Logs" 확인

**일반적인 문제:**
- **Root Directory 설정 안 됨**: Settings → General → Root Directory에 `frontend` 입력
- **환경 변수 오류**: `VITE_API_BASE_URL` 확인
- **빌드 오류**: `package.json` 확인

### "API 연결 오류"

**확인사항:**
1. Railway 백엔드 URL이 올바른지 확인
2. `VITE_API_BASE_URL` 환경 변수가 올바른지 확인
3. Railway 백엔드가 실행 중인지 확인 (Logs 확인)
4. CORS 설정 확인 (Railway URL이 허용되어 있는지)

### "Google 로그인 실패"

**확인사항:**
1. Google Cloud Console에서 Vercel URL이 추가되었는지 확인
2. `VITE_GOOGLE_CLIENT_ID` 환경 변수 확인
3. Railway의 `GOOGLE_CLIENT_ID`와 일치하는지 확인

---

## 코드 업데이트 방법

코드를 수정한 후 다시 배포:

```bash
# 로컬에서
cd /Users/yaco/Desktop/xlsx
git add .
git commit -m "업데이트 내용"
git push
```

**자동 배포:**
- Railway와 Vercel은 GitHub에 푸시하면 자동으로 재배포됩니다!
- 약 2-3분 후 자동으로 업데이트됨

---

## 비용

- **Railway**: 월 $5 크레딧 무료 제공 (거의 무료)
- **Vercel**: 완전 무료 (개인 프로젝트)
- **총 비용**: **0원** (거의 무료)

---

## 다음 단계

배포가 완료되면:
1. ✅ 관리자 계정으로 로그인 테스트
2. ✅ 교사 계정으로 로그인 테스트
3. ✅ 엑셀 업로드 기능 테스트
4. ✅ 배정 실행 테스트
5. ✅ 모든 기능 정상 작동 확인

**축하합니다! 무료로 배포 완료했습니다! 🎉**

---

## 체크리스트

배포 전:
- [ ] GitHub 저장소 생성
- [ ] 코드 업로드 완료
- [ ] Railway 계정 생성
- [ ] Vercel 계정 생성
- [ ] Google OAuth 설정 확인

배포 중:
- [ ] Railway 백엔드 배포
- [ ] PostgreSQL 데이터베이스 추가
- [ ] 환경 변수 설정 (Railway)
- [ ] Vercel 프론트엔드 배포
- [ ] 환경 변수 설정 (Vercel)
- [ ] Google OAuth URL 업데이트

배포 후:
- [ ] 접속 테스트
- [ ] 로그인 테스트
- [ ] 기능 테스트
- [ ] 오류 확인

