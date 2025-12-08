from pydantic import BaseModel


class LoginRequest(BaseModel):
  name: str | None = None
  password: str
  role: str = "teacher"


class TeacherUpdate(BaseModel):
  current_grade: int | None = None
  current_class: str | None = None  # 한글 입력 가능 (예: "1반", "2반")
  school_join_year: int | None = None
  hire_year: int | None = None  # 총 경력(발령 연도)
  is_homeroom_current: bool | None = None
  is_subject_teacher: bool | None = None
  duty_role: str | None = None  # 업무부장 여부
  grade_history: str | None = None  # 본교 근무 기간 동안 담임한 학년 이력 (JSON 형식: [{"year": 2023, "grade": 1}, ...])


class PreferenceCreate(BaseModel):
  year: int
  first_choice_grade: int | None = None  # 교과전담 선택 시 null
  second_choice_grade: int | None = None
  third_choice_grade: int | None = None
  wants_grade_head: bool = False  # 학년부장 희망
  wants_subject_teacher: bool = False  # 교과전담 희망
  wants_duty_head: bool = False  # 업무부장 희망 (교과전담 희망 시)
  comment: str | None = None


class PreferenceOut(BaseModel):
  year: int
  first_choice_grade: int | None  # 교과전담 선택 시 null
  second_choice_grade: int | None
  third_choice_grade: int | None
  wants_grade_head: bool
  wants_subject_teacher: bool
  wants_duty_head: bool
  comment: str | None

  class Config:
    from_attributes = True


class GradeSettingIn(BaseModel):
  year: int
  grade: int
  class_count: int
  required_homerooms: int
  required_subject_teachers: int = 0  # 교과전담 필요 수
  required_duty_heads: int = 0  # 업무부장 필요 수


class AssignmentOut(BaseModel):
  teacher_id: int
  year: int
  assigned_grade: int
  assignment_type: str
  rule_reference: str | None
  description: str | None

  class Config:
    from_attributes = True


class AdminSettingIn(BaseModel):
  year: int
  total_teachers: int


class AdminSettingOut(BaseModel):
  year: int
  total_teachers: int

  class Config:
    from_attributes = True

