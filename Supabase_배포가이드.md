# Supabase + Vercel 무료 배포 가이드 (완전 무료!)

## 왜 Supabase를 사용하나요?

- ✅ **완전 무료**: 데이터베이스 무제한 (500MB까지)
- ✅ **백엔드 API 자동 생성**: PostgreSQL 기반 REST API
- ✅ **인증 기능 내장**: Google OAuth 등 지원
- ✅ **실시간 기능**: WebSocket 지원
- ✅ **파일 저장소**: 이미지/파일 업로드 지원
- ✅ **한국어 지원**: 한국어 문서 있음

**Railway vs Supabase:**
- Railway: 월 $5 크레딧 (제한 있음)
- Supabase: 완전 무료 (제한 거의 없음)

---

## 전체 과정 요약 (약 15분 소요)

1. Supabase 프로젝트 생성 (3분)
2. 데이터베이스 스키마 설정 (5분)
3. GitHub에 코드 올리기 (2분)
4. Vercel에서 프론트엔드 배포 (3분)
5. 환경 변수 설정 (2분)

---

## 1단계: Supabase 프로젝트 생성

### 1-1. Supabase 가입

1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub로 가입 (무료)

### 1-2. 새 프로젝트 생성

1. "New Project" 클릭
2. 설정:
   - **Name**: `assignment` (원하는 이름)
   - **Database Password**: 강력한 비밀번호 입력 (메모해두세요!)
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국에서 빠름)
   - **Pricing Plan**: Free 선택
3. "Create new project" 클릭
4. 프로젝트 생성 완료까지 약 2분 대기

### 1-3. 프로젝트 정보 확인

1. 프로젝트 대시보드에서 "Settings" → "API" 클릭
2. 다음 정보를 메모해두세요:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (긴 문자열)
   - **service_role key**: (나중에 필요할 수 있음)

---

## 2단계: 데이터베이스 스키마 설정

### 2-1. SQL Editor 열기

1. Supabase 대시보드 → "SQL Editor" 클릭
2. "New query" 클릭

### 2-2. 테이블 생성 SQL 실행

다음 SQL을 복사해서 실행:

```sql
-- 교사 테이블
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  google_id VARCHAR(255) UNIQUE,
  gender VARCHAR(10),
  hire_year INTEGER,
  school_join_year INTEGER,
  current_grade INTEGER,
  current_class VARCHAR(255),
  is_homeroom_current BOOLEAN DEFAULT FALSE,
  is_subject_teacher BOOLEAN DEFAULT FALSE,
  duty_role VARCHAR(255),
  subject VARCHAR(255),
  special_conditions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 희망 학년 테이블
CREATE TABLE preferences (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  first_choice_grade INTEGER,
  second_choice_grade INTEGER,
  third_choice_grade INTEGER,
  wants_grade_head BOOLEAN DEFAULT FALSE,
  wants_subject_teacher BOOLEAN DEFAULT FALSE,
  wants_duty_head BOOLEAN DEFAULT FALSE,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(teacher_id, year)
);

-- 학년별 설정 테이블
CREATE TABLE grade_settings (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  grade INTEGER NOT NULL,
  class_count INTEGER NOT NULL,
  required_homerooms INTEGER NOT NULL,
  required_subject_teachers INTEGER DEFAULT 0,
  required_duty_heads INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(year, grade)
);

-- 배정 결과 테이블
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  assigned_grade INTEGER NOT NULL,
  assignment_type VARCHAR(255) NOT NULL,
  rule_reference VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 배정 로그 테이블
CREATE TABLE assignment_logs (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  step VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 관리자 설정 테이블
CREATE TABLE admin_settings (
  id SERIAL PRIMARY KEY,
  year INTEGER UNIQUE NOT NULL,
  total_teachers INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_preferences_year ON preferences(year);
CREATE INDEX idx_preferences_teacher_id ON preferences(teacher_id);
CREATE INDEX idx_grade_settings_year ON grade_settings(year);
CREATE INDEX idx_assignments_year ON assignments(year);
CREATE INDEX idx_assignments_teacher_id ON assignments(teacher_id);
```

3. "Run" 버튼 클릭하여 실행
4. "Success. No rows returned" 메시지 확인

### 2-3. Row Level Security (RLS) 설정

보안을 위해 RLS를 설정합니다:

```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 공개 읽기/쓰기 정책 (개발용, 나중에 수정 필요)
CREATE POLICY "Enable all for authenticated users" ON teachers
  FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON preferences
  FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON grade_settings
  FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON assignments
  FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON assignment_logs
  FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON admin_settings
  FOR ALL USING (true);
```

**주의:** 위 정책은 모든 사용자가 모든 데이터에 접근할 수 있습니다. 운영 환경에서는 더 세밀한 정책이 필요합니다.

---

## 3단계: 백엔드 코드 수정 (Supabase 사용)

Supabase는 PostgreSQL을 직접 사용하므로, 기존 FastAPI 코드를 Supabase의 연결 문자열로 변경하면 됩니다.

### 3-1. Supabase 연결 정보 확인

1. Supabase 대시보드 → "Settings" → "Database"
2. "Connection string" → "URI" 선택
3. 연결 문자열 복사:
   - 예: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
   - `[YOUR-PASSWORD]`를 프로젝트 생성 시 입력한 비밀번호로 변경

### 3-2. 환경 변수 설정

백엔드 코드는 그대로 사용하고, 연결 문자열만 변경하면 됩니다.

---

## 4단계: GitHub에 코드 올리기

### 4-1. GitHub 저장소 생성

1. https://github.com 접속
2. "+" → "New repository"
3. 저장소 이름: `assignment`
4. "Create repository" 클릭

### 4-2. 코드 업로드

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

## 5단계: Railway에서 백엔드 배포 (Supabase DB 사용)

### 5-1. Railway 가입 및 프로젝트 생성

1. https://railway.app 접속
2. GitHub로 가입
3. "New Project" → "Deploy from GitHub repo"
4. 저장소 선택

### 5-2. 서비스 설정

1. 생성된 서비스 클릭
2. "Settings" → "Root Directory": `backend` 설정
3. "Deploy" 탭에서 자동 배포 확인

### 5-3. 환경 변수 설정

"Variables" 탭에서 다음 변수 추가:

```
DATABASE_URL = postgresql+asyncpg://postgres:비밀번호@db.xxxxx.supabase.co:5432/postgres
(Supabase에서 복사한 연결 문자열, 비밀번호는 프로젝트 생성 시 입력한 값)

SECRET_KEY = abcdefghijklmnopqrstuvwxyz1234567890
(랜덤 문자열, 최소 32자)

ADMIN_PASSWORD = admin1234
TEACHER_PASSWORD = teacher1234
GOOGLE_CLIENT_ID = your-google-client-id
GOOGLE_CLIENT_SECRET = your-google-client-secret

ALLOWED_ORIGINS = https://당신의-vercel-url.vercel.app
(Vercel 배포 후 추가)
```

**DATABASE_URL 형식:**
```
postgresql+asyncpg://postgres:[비밀번호]@db.[프로젝트ID].supabase.co:5432/postgres
```

### 5-4. 배포 확인

1. "Deployments" 탭에서 배포 상태 확인
2. "Logs" 탭에서 오류 확인
3. 배포 완료 후 URL 확인 (예: `assignment-production.up.railway.app`)

---

## 6단계: Vercel에서 프론트엔드 배포

### 6-1. Vercel 가입

1. https://vercel.com 접속
2. GitHub로 가입

### 6-2. 프로젝트 생성

1. "Add New..." → "Project"
2. 저장소 선택
3. 설정:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 6-3. 환경 변수 설정

```
VITE_API_BASE_URL = https://당신의-railway-url.up.railway.app
VITE_GOOGLE_CLIENT_ID = your-google-client-id
```

### 6-4. 배포 실행

"Deploy" 클릭 → 배포 완료 대기

---

## 7단계: Google OAuth 설정

1. Google Cloud Console 접속
2. OAuth 2.0 Client ID 설정
3. "승인된 자바스크립트 원본"에 Vercel URL 추가
4. "승인된 리디렉션 URI"에 Vercel URL 추가

---

## 비용 비교

| 서비스 | 데이터베이스 | 백엔드 | 비용 |
|--------|-------------|--------|------|
| Railway | PostgreSQL | FastAPI | 월 $5 크레딧 (제한 있음) |
| **Supabase** | **PostgreSQL** | **FastAPI** | **완전 무료** ✅ |
| Render | PostgreSQL | FastAPI | 완전 무료 (슬립 모드) |

**Supabase 장점:**
- ✅ 완전 무료 (500MB 데이터베이스)
- ✅ 자동 백업
- ✅ 실시간 기능
- ✅ 인증 기능 내장
- ✅ 파일 저장소

---

## Supabase 추가 기능 활용 (선택사항)

### 실시간 구독

Supabase는 실시간 기능을 제공합니다. 나중에 실시간 알림 등을 추가할 수 있습니다.

### 파일 저장소

엑셀 파일을 Supabase Storage에 저장할 수 있습니다.

### 인증 기능

Supabase의 인증 기능을 사용하면 Google OAuth를 더 쉽게 구현할 수 있습니다.

---

## 문제 해결

### "데이터베이스 연결 오류"

1. Supabase 연결 문자열 확인
2. 비밀번호가 올바른지 확인
3. Supabase 프로젝트가 활성화되어 있는지 확인

### "RLS 정책 오류"

데이터에 접근할 수 없다면 RLS 정책을 확인하세요. 위의 정책은 모든 사용자에게 접근을 허용합니다.

---

## 추천: Supabase 사용!

**왜 Supabase를 추천하나요?**
- ✅ 완전 무료
- ✅ 안정적
- ✅ 한국어 문서
- ✅ 추가 기능 많음
- ✅ 자동 백업

**Railway는 언제 사용하나요?**
- Supabase가 부족할 때
- 더 많은 제어가 필요할 때
- 다른 데이터베이스를 사용할 때

---

## 다음 단계

1. Supabase 프로젝트 생성
2. 데이터베이스 스키마 설정
3. Railway에서 백엔드 배포 (Supabase DB 연결)
4. Vercel에서 프론트엔드 배포
5. 테스트!

**총 비용: 0원 (완전 무료!) 🎉**



