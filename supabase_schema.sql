-- Supabase 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

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
  grade_history TEXT,  -- 본교 근무 기간 동안 담임한 학년 이력 (JSON 형식: [{"year": 2023, "grade": 1}, ...])
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 희망 학년 테이블
CREATE TABLE preferences (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  first_choice_grade INTEGER,  -- 교과전담 선택 시 NULL 가능
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

-- Row Level Security (RLS) 활성화
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 공개 정책 (개발용 - 모든 사용자 접근 허용)
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

     git config --global user.email 'yaco9304@gmail.com'
   git config --global user.name yaco93'

