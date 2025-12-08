# Render + Supabase 완전 무료 배포 가이드

## 전체 구성

- **데이터베이스**: Supabase (완전 무료)
- **백엔드**: Render (완전 무료, 슬립 모드)
- **프론트엔드**: Vercel (완전 무료)
- **총 비용**: 0원! 🎉

---

## 1단계: Supabase 프로젝트 생성

### 1-1. Supabase 가입

1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub로 가입 (무료)

### 1-2. 새 프로젝트 생성

1. "New Project" 클릭
2. 설정:
   - **Name**: `assignment`
   - **Database Password**: 강력한 비밀번호 입력 (메모!)
   - **Region**: `Northeast Asia (Seoul)` 선택
   - **Pricing Plan**: Free 선택
3. "Create new project" 클릭
4. 약 2분 대기

### 1-3. 데이터베이스 스키마 설정

1. Supabase 대시보드 → "SQL Editor" 클릭
2. "New query" 클릭
3. `supabase_schema.sql` 파일 내용을 복사해서 붙여넣기
4. "Run" 버튼 클릭
5. "Success" 메시지 확인

### 1-4. 연결 정보 확인

1. "Settings" → "Database" 클릭
2. "Connection string" → "URI" 선택
3. 연결 문자열 복사 (나중에 사용):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
   - `[YOUR-PASSWORD]`를 프로젝트 생성 시 입력한 비밀번호로 변경

---

## 2단계: GitHub에 코드 올리기

### 2-1. GitHub 저장소 생성

1. https://github.com 접속
2. "+" → "New repository"
3. 저장소 이름: `assignment`
4. "Create repository" 클릭

### 2-2. 코드 업로드

터미널에서:

```bash
cd /Users/yaco/Desktop/xlsx
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/당신의사용자명/assignment.git
git branch -M main
git push -u origin main
```

---

## 3단계: Render에서 백엔드 배포

### 3-1. Render 가입

1. https://render.com 접속
2. "Get Started for Free" 클릭
3. GitHub로 가입 (무료)

### 3-2. Web Service 생성

1. Render 대시보드 → "New +" 클릭
2. "Web Service" 선택
3. GitHub 저장소 연결:
   - "Connect account" → GitHub 권한 승인
   - 저장소 목록에서 `assignment` 선택
   - "Connect" 클릭

### 3-3. 서비스 설정

**기본 설정:**
- **Name**: `assignment-backend` (원하는 이름)
- **Region**: `Singapore` (한국에서 가까움)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **중요!**
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Plan:**
- **Free** 선택 (완전 무료!)

### 3-4. 환경 변수 설정

"Environment Variables" 섹션에서 다음 변수 추가:

```
DATABASE_URL = postgresql+asyncpg://postgres:비밀번호@db.xxxxx.supabase.co:5432/postgres
(Supabase 연결 문자열, 비밀번호는 프로젝트 생성 시 입력한 값)

SECRET_KEY = abcdefghijklmnopqrstuvwxyz1234567890
(랜덤 문자열, 최소 32자)

ADMIN_PASSWORD = admin1234
TEACHER_PASSWORD = teacher1234
GOOGLE_CLIENT_ID = your-google-client-id
GOOGLE_CLIENT_SECRET = your-google-client-secret

ALLOWED_ORIGINS = https://당신의-vercel-url.vercel.app,https://assign-nu-weld.vercel.app
(Vercel 배포 후 추가, 여러 도메인은 쉼표로 구분)
```

**⚠️ 중요:** `ALLOWED_ORIGINS`에는 Vercel에서 생성된 모든 도메인을 포함해야 합니다:
- `https://당신의-프로젝트명.vercel.app` (기본 도메인)
- `https://당신의-커스텀-도메인.com` (커스텀 도메인 사용 시)

**SECRET_KEY 생성:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3-5. 배포 실행

1. 모든 설정 확인
2. "Create Web Service" 클릭
3. 배포 진행 상황 확인 (약 3-5분 소요)
4. 배포 완료 후 URL 확인:
   - 예: `assignment-backend.onrender.com`
   - 이 URL을 메모해두세요!

**주의:** Render 무료 플랜은 15분 비활성 시 슬립 모드로 전환됩니다. 첫 요청 시 약 30초 정도 깨어나는 시간이 걸립니다.

---

## 4단계: Vercel에서 프론트엔드 배포

### 4-1. Vercel 가입

1. https://vercel.com 접속
2. "Sign Up" 클릭
3. "Continue with GitHub" 클릭
4. GitHub 권한 승인

### 4-2. 프로젝트 생성

1. Vercel 대시보드 → "Add New..." → "Project" 클릭
2. GitHub 저장소 목록에서 `assignment` 선택
3. "Import" 클릭

### 4-3. 프로젝트 설정

**중요한 설정:**

1. **Framework Preset**: Vite (자동 감지)
2. **Root Directory**: `frontend` ⚠️ **중요!**
   - "Edit" 클릭 → `frontend` 입력
3. **Build Command**: `npm run build` (자동, vercel.json이 자동으로 적용됨)
4. **Output Directory**: `dist` (자동, vercel.json이 자동으로 적용됨)

**참고:** `vercel.json` 파일이 있으면 자동으로 설정이 적용됩니다. Root Directory를 `frontend`로 설정하면 vercel.json의 명령어가 frontend 폴더 내에서 실행됩니다.

### 4-4. 환경 변수 설정

"Environment Variables" 섹션에서:

```
VITE_API_URL = https://assignment-backend.onrender.com
또는
VITE_API_BASE_URL = https://assignment-backend.onrender.com
(Render에서 생성한 백엔드 URL, 둘 중 하나만 설정해도 됨)
```

**⚠️ 중요:** 
- `VITE_API_URL` 또는 `VITE_API_BASE_URL` 중 하나를 반드시 설정해야 합니다.
- Render 백엔드 URL을 정확히 입력하세요.
- 환경 변수 설정 후 "Redeploy"를 클릭하여 재배포해야 합니다.

VITE_GOOGLE_CLIENT_ID = your-google-client-id
(Google Cloud Console에서 받은 값)
```

### 4-5. 배포 실행

1. "Deploy" 클릭
2. 배포 진행 상황 확인 (약 1-2분)
3. 배포 완료 후 URL 확인:
   - 예: `assignment.vercel.app`
   - 이 URL을 메모해두세요!

### 4-6. Render CORS 설정 업데이트

1. Render 대시보드 → 백엔드 서비스 → "Environment"
2. `ALLOWED_ORIGINS` 변수 수정:
   ```
   ALLOWED_ORIGINS = https://assignment.vercel.app
   ```
3. "Save Changes" 클릭
4. 자동으로 재배포됨

---

## 5단계: Google OAuth 설정

1. https://console.cloud.google.com 접속
2. 프로젝트 선택
3. "APIs & Services" → "Credentials"
4. OAuth 2.0 Client ID 클릭
5. "승인된 자바스크립트 원본"에 추가:
   - `https://assignment.vercel.app`
6. "승인된 리디렉션 URI"에 추가:
   - `https://assignment.vercel.app`
7. "저장" 클릭

---

## 6단계: 최종 확인

### 6-1. 접속 테스트

1. 브라우저에서 Vercel URL 접속
2. 로그인 페이지 확인

### 6-2. 기능 테스트

1. 관리자 로그인
2. Google 로그인
3. 모든 기능 테스트

---

## Render 무료 플랜 특징

### 장점
- ✅ 완전 무료
- ✅ 자동 배포 (GitHub 푸시 시)
- ✅ SSL 인증서 자동 제공
- ✅ 로그 확인 가능

### 제한사항
- ⚠️ 15분 비활성 시 슬립 모드 (첫 요청 시 약 30초 깨어나는 시간)
- ⚠️ 월 750시간 제한 (거의 충분함)

**슬립 모드 해결책:**
- UptimeRobot 같은 무료 모니터링 서비스 사용 (5분마다 핑)
- 또는 유료 플랜 ($7/월)으로 업그레이드

---

## 문제 해결

### "Render 배포 실패"

**확인사항:**
1. Root Directory가 `backend`로 설정되었는지 확인
2. Build Command가 올바른지 확인
3. 환경 변수가 모두 설정되었는지 확인
4. Logs 탭에서 오류 메시지 확인

### "슬립 모드 때문에 느려요"

**해결책:**
1. UptimeRobot 설정 (무료):
   - https://uptimerobot.com 가입
   - "Add New Monitor"
   - Monitor Type: HTTP(s)
   - URL: Render 백엔드 URL
   - Monitoring Interval: 5 minutes
   - 이렇게 하면 5분마다 요청이 가서 슬립 모드 방지

2. 또는 유료 플랜 ($7/월)으로 업그레이드

### "데이터베이스 연결 오류"

**확인사항:**
1. Supabase 연결 문자열이 올바른지 확인
2. 비밀번호가 정확한지 확인
3. Supabase 프로젝트가 활성화되어 있는지 확인

---

## 비용 요약

| 서비스 | 비용 | 제한 |
|--------|------|------|
| Supabase | 무료 | 500MB DB, 자동 백업 |
| Render | 무료 | 750시간/월, 슬립 모드 |
| Vercel | 무료 | 무제한 |
| **총합** | **0원** | - |

---

## 코드 업데이트 방법

코드를 수정한 후:

```bash
git add .
git commit -m "업데이트 내용"
git push
```

**자동 배포:**
- Render와 Vercel은 GitHub에 푸시하면 자동으로 재배포됩니다!
- 약 3-5분 후 자동 업데이트

---

## 체크리스트

배포 전:
- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 설정
- [ ] GitHub 저장소 생성 및 코드 업로드
- [ ] Render 계정 생성
- [ ] Vercel 계정 생성

배포 중:
- [ ] Render 백엔드 배포
- [ ] 환경 변수 설정 (Render)
- [ ] Vercel 프론트엔드 배포
- [ ] 환경 변수 설정 (Vercel)
- [ ] CORS 설정 업데이트
- [ ] Google OAuth URL 업데이트

배포 후:
- [ ] 접속 테스트
- [ ] 로그인 테스트
- [ ] 기능 테스트
- [ ] UptimeRobot 설정 (선택사항)

---

## 추천: Render + Supabase 조합!

**왜 이 조합인가요?**
- ✅ 완전 무료
- ✅ 안정적
- ✅ 자동 배포
- ✅ 슬립 모드만 주의하면 됨

**Railway 대신 Render를 사용하는 이유:**
- Railway: 월 $5 크레딧 (제한 있음)
- Render: 완전 무료 (슬립 모드만 있음)

**축하합니다! 완전 무료로 배포 완료! 🎉**

