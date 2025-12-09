# 학년 배정 시스템 개발 정보

## 프로젝트 개요

학교 내부에서 사용하는 학년/학급 배정 웹서비스입니다. 교사들이 웹에서 희망 학년(1·2·3지망)을 입력하고, 관리자가 규정에 따라 자동으로 내년도 학년 배정을 계산하여 확인·출력하는 시스템입니다.

## 기술 스택

### 백엔드
- **언어**: Python 3.10+
- **프레임워크**: FastAPI 0.115.5
- **ORM**: SQLAlchemy 2.0.23
- **데이터베이스**: SQLite (개발) / PostgreSQL (운영)
- **인증**: JWT (PyJWT 2.8.0)
- **OAuth**: Google OAuth 2.0 (httpx 0.27.0)
- **엑셀 처리**: openpyxl 3.1.2

### 프론트엔드
- **언어**: TypeScript
- **프레임워크**: React 18+ (Next.js 없이 SPA)
- **빌드 도구**: Vite
- **상태 관리**: React Query (@tanstack/react-query)
- **라우팅**: React Router DOM
- **HTTP 클라이언트**: Axios

## 프로젝트 구조

```
xlsx/
├── backend/
│   ├── app/
│   │   ├── api/              # API 엔드포인트
│   │   │   ├── admin.py      # 관리자 API
│   │   │   ├── auth.py       # 인증 API
│   │   │   └── preferences.py # 희망 입력 API
│   │   ├── assignment/       # 배정 알고리즘
│   │   │   ├── engine.py     # 배정 엔진
│   │   │   └── rules.py      # 배정 규정 구현
│   │   ├── core/             # 핵심 설정
│   │   │   ├── config.py     # 환경 변수 설정
│   │   │   └── security.py   # JWT 인증
│   │   ├── db.py             # 데이터베이스 연결
│   │   ├── main.py           # FastAPI 앱
│   │   ├── models.py         # SQLAlchemy 모델
│   │   └── schemas.py        # Pydantic 스키마
│   ├── requirements.txt      # Python 의존성
│   └── dev.db               # SQLite 데이터베이스
│
├── frontend/
│   ├── src/
│   │   ├── components/        # 재사용 컴포넌트
│   │   │   ├── AdminHeader.tsx
│   │   │   └── TeacherHeader.tsx
│   │   ├── hooks/            # 커스텀 훅
│   │   │   └── useAuth.ts
│   │   ├── lib/              # 유틸리티
│   │   │   └── api.ts        # Axios 인스턴스
│   │   ├── pages/            # 페이지 컴포넌트
│   │   │   ├── LoginPage.tsx
│   │   │   ├── MyPreferencePage.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminSummary.tsx
│   │   │   ├── AdminSettings.tsx
│   │   │   └── AdminAssignments.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx          # 진입점
│   │   └── index.css         # 전역 스타일
│   ├── public/               # 정적 파일
│   │   └── 교사정보_업로드_양식.xlsx
│   └── package.json
│
└── 교사정보_업로드_양식.xlsx  # 엑셀 업로드 템플릿
```

## 데이터베이스 스키마

### teachers (교사)
- `id`: PK
- `name`: 이름 (unique)
- `email`: 이메일 (nullable, unique)
- `google_id`: 구글 ID (nullable, unique)
- `gender`: 성별
- `hire_year`: 총 경력(발령 연도)
- `school_join_year`: 본교 근무 시작 연도
- `current_grade`: 올해 학년
- `current_class`: 올해 학급 (한글 가능)
- `is_homeroom_current`: 올해 담임 여부
- `is_subject_teacher`: 교과전담 여부
- `duty_role`: 업무부장/학년부장 등
- `subject`: 교과명
- `special_conditions`: 특수 조건 (병가, 휴직, 임신 등)

### preferences (희망 학년)
- `id`: PK
- `teacher_id`: FK → teachers
- `year`: 배정 연도
- `first_choice_grade`: 1지망 학년
- `second_choice_grade`: 2지망 학년
- `third_choice_grade`: 3지망 학년
- `wants_grade_head`: 학년부장 희망
- `wants_subject_teacher`: 교과전담 희망
- `wants_duty_head`: 업무부장 희망
- `comment`: 기타 메모

### grade_settings (학년별 설정)
- `id`: PK
- `year`: 배정 연도
- `grade`: 학년 (1~6)
- `class_count`: 학급 수
- `required_homerooms`: 필요 담임 수
- `required_subject_teachers`: 필요 교과전담 수
- `required_duty_heads`: 필요 업무부장 수

### assignments (배정 결과)
- `id`: PK
- `teacher_id`: FK → teachers
- `year`: 배정 연도
- `assigned_grade`: 배정된 학년
- `assignment_type`: 배정 타입 (규정우선/1지망/2지망/3지망/조정)
- `rule_reference`: 적용 규정 조항
- `description`: 상세 근거

### admin_settings (관리자 설정)
- `id`: PK
- `year`: 배정 연도 (unique)
- `total_teachers`: 전체 교사 수

## 배정 알고리즘

### 배정 순서 (우선순위)

1. **제외 대상 필터링 (제13조)**
   - 휴직, 병가(30일 이상), 파견, 연수, 임신, 출산, 고령 교사 등

2. **우선 배정 규칙**
   - **제12조④**: 특수 사유 우선 배정
     - 원로교사, 요양 필요, 건강 사유, 군 입대, 출산 예정, 임신 등
     - 1지망 → 2지망 → 3지망 순으로 우선 배정
   - **제12조②**: 역할 우선 배정
     - 업무부장(6점) > 학년부장(2점) > 교과전담(3점) 순으로 점수 기반 배정

3. **학년 순환 규칙 (제12조①)**
   - 올해 담당 학년은 다음 해 배정에서 제외
   - 단, 1학년/6학년은 동일 학년 희망 시 예외

4. **교과전담 규칙**
   - 교과전담 교사는 담임 배정에서 제외

5. **희망 학년 배정**
   - 1지망 → 2지망 → 3지망 순으로 배정

6. **점수 기반 조정 배정**
   - 남은 슬롯은 다음 점수로 계산:
     - 희망 점수: 1지망(10점), 2지망(5점), 3지망(2점)
     - 학년 가중치: 6학년(6점), 1학년(5점), 5학년(4점), 3-4학년(3점), 2학년(2점)
     - 역할 점수: 업무부장(6점), 학년부장(2점), 교과전담(3점)
     - 제한 학년: -999점 (배정 불가)

### 점수 계산 함수

```python
def score_candidate(teacher: Teacher, grade: int, prefs: list[int]) -> tuple[int, dict]:
    """
    교사-학년 매칭 점수 계산
    
    Returns:
        (총점, 상세 내역 딕셔너리)
    """
    # 희망 점수: 1지망(10), 2지망(5), 3지망(2)
    # 학년 가중치: 6학년(6), 1학년(5), 5학년(4), 3-4학년(3), 2학년(2)
    # 역할 점수: 업무부장(6), 학년부장(2), 교과전담(3)
    # 제한 학년: -999
```

## API 엔드포인트

### 인증 (`/auth`)
- `POST /auth/login`: 관리자/교사 로그인
- `POST /auth/google`: 구글 OAuth 로그인
- `GET /auth/me`: 현재 교사 정보 조회
- `PUT /auth/me`: 현재 교사 정보 수정

### 희망 입력 (`/preferences`)
- `GET /preferences/me`: 내 희망 조회
- `POST /preferences/me`: 내 희망 저장/수정

### 관리자 (`/admin`)
- `GET /admin/dashboard`: 대시보드 요약 데이터
- `PUT /admin/dashboard/total-teachers`: 전체 교사 수 설정
- `GET /admin/summary`: 지망 현황 상세
- `GET /admin/settings`: 학년별 설정 조회
- `POST /admin/settings`: 학년별 설정 저장
- `POST /admin/assign`: 배정 실행
- `GET /admin/assignments`: 배정 결과 조회
- `GET /admin/assignments/export`: 배정 결과 CSV 다운로드
- `POST /admin/upload-teachers`: 교사 정보 엑셀 업로드

## 환경 변수 설정

### 백엔드 (`.env`)
```env
DATABASE_URL=sqlite+aiosqlite:///./dev.db
SECRET_KEY=your-secret-key
ADMIN_PASSWORD=admin1234
TEACHER_PASSWORD=teacher1234
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 프론트엔드 (`.env`)
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 실행 방법

### 백엔드
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

## 추가 개발 사항

### 업무점수 추가 기능

현재 배정 알고리즘에서 역할 점수는 다음과 같이 계산됩니다:

```python
ROLE_POINTS = {
    "업무1부장": 6.0,
    "업무2부장": 5.0,
    "업무3부장": 4.3,
    "학년부장": 2.0,
    "교과전담": 3.0,
}
```

#### 구현 위치
- `backend/app/assignment/rules.py`: `ROLE_POINTS` 딕셔너리 수정
- `backend/app/assignment/engine.py`: `score_candidate()` 함수에서 역할 점수 계산 부분

#### 추가 방법

1. **새로운 역할 추가**
   ```python
   ROLE_POINTS = {
       "업무1부장": 6.0,
       "업무2부장": 5.0,
       "업무3부장": 4.3,
       "학년부장": 2.0,
       "교과전담": 3.0,
       "새로운역할": 4.0,  # 추가
   }
   ```

2. **점수 조정**
   - 기존 역할의 점수를 변경하려면 `ROLE_POINTS` 딕셔너리의 값을 수정

3. **조건부 점수 적용**
   - 특정 조건에 따라 점수를 다르게 적용하려면 `score_candidate()` 함수 수정
   - 예: 경력에 따른 가중치, 특수 조건에 따른 보너스 등

4. **데이터베이스 연동**
   - 교사 정보의 `duty_role` 필드에 역할 정보 저장
   - 또는 별도의 역할 테이블 생성 후 조인

#### 예시: 경력 기반 점수 추가

```python
def score_candidate(teacher: Teacher, grade: int, prefs: list[int]) -> tuple[int, dict]:
    # ... 기존 코드 ...
    
    # 경력 기반 점수 추가
    experience_score = 0
    if teacher.hire_year:
        years_of_service = 2025 - teacher.hire_year
        if years_of_service >= 20:
            experience_score = 3
        elif years_of_service >= 10:
            experience_score = 2
        elif years_of_service >= 5:
            experience_score = 1
    
    total_score = hope_score + grade_weight + role_score + experience_score + penalty
    # ...
```

#### 테스트 방법

1. 배정 실행 후 결과 확인
2. `description` 필드에 점수 상세 내역이 기록되는지 확인
3. 역할 점수가 올바르게 반영되는지 확인

## 디버깅 가이드

### 일반적인 문제

1. **데이터베이스 스키마 불일치**
   - `dev.db` 삭제 후 서버 재시작 (자동 재생성)

2. **CORS 오류**
   - `backend/app/main.py`의 `allow_origins`에 프론트엔드 URL 추가

3. **Google OAuth 오류**
   - Google Cloud Console에서 리디렉션 URI 확인
   - `.env` 파일의 `GOOGLE_CLIENT_ID` 확인

4. **배정 결과가 없음**
   - 학급 설정(`grade_settings`) 확인
   - 교사 데이터 확인
   - 희망 입력 확인

### 로그 확인

- 백엔드: 서버 콘솔 출력 또는 `/tmp/backend.log`
- 프론트엔드: 브라우저 개발자 도구 콘솔

## 배포 고려사항

1. **데이터베이스**: SQLite → PostgreSQL 전환
2. **환경 변수**: 운영 환경에 맞게 설정
3. **HTTPS**: 프로덕션 환경에서는 HTTPS 필수
4. **보안**: JWT 시크릿 키 강화, 비밀번호 정책 강화
5. **백업**: 데이터베이스 정기 백업

## 라이선스

내부 사용 전용



