from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional
import re


class LoginRequest(BaseModel):
  name: str | None = Field(None, max_length=100)
  password: str = Field(..., min_length=1, max_length=200)
  role: str = Field("teacher", pattern="^(teacher|admin)$")
  
  @field_validator("name")
  @classmethod
  def validate_name(cls, v: Optional[str]) -> Optional[str]:
    if v is not None:
      v = v.strip()
      if len(v) > 100:
        raise ValueError("이름은 100자 이하여야 합니다.")
      # 특수 문자 제거 (XSS 방지)
      v = re.sub(r'[<>"\']', '', v)
    return v


class TeacherUpdate(BaseModel):
  current_grade: int | None = Field(None, ge=1, le=6)
  current_class: str | None = Field(None, max_length=50)
  school_join_year: int | None = Field(None, ge=1900, le=2100)
  hire_year: int | None = Field(None, ge=1900, le=2100)
  is_homeroom_current: bool | None = None
  is_subject_teacher: bool | None = None
  duty_role: str | None = Field(None, max_length=200)
  grade_history: str | None = Field(None, max_length=10000)  # JSON 형식
  
  @field_validator("current_class", "duty_role")
  @classmethod
  def sanitize_string_fields(cls, v: Optional[str]) -> Optional[str]:
    if v is not None:
      v = v.strip()
      # HTML 태그 제거
      v = re.sub(r'<[^>]+>', '', v)
    return v
  
  @field_validator("grade_history")
  @classmethod
  def validate_grade_history(cls, v: Optional[str]) -> Optional[str]:
    if v is not None:
      import json
      try:
        parsed = json.loads(v)
        if not isinstance(parsed, list):
          raise ValueError("grade_history는 배열 형식이어야 합니다.")
        if len(parsed) > 100:
          raise ValueError("grade_history는 최대 100개 항목까지 허용됩니다.")
        for item in parsed:
          if not isinstance(item, dict):
            raise ValueError("각 항목은 객체여야 합니다.")
          if "year" not in item or "grade" not in item:
            raise ValueError("각 항목은 year와 grade 필드를 포함해야 합니다.")
          if not (1900 <= item.get("year", 0) <= 2100):
            raise ValueError("year는 1900-2100 범위여야 합니다.")
          if not (1 <= item.get("grade", 0) <= 6):
            raise ValueError("grade는 1-6 범위여야 합니다.")
      except json.JSONDecodeError:
        raise ValueError("grade_history는 유효한 JSON 형식이어야 합니다.")
    return v


class PreferenceCreate(BaseModel):
  year: int = Field(..., ge=2000, le=2100)
  first_choice_grade: int | None = Field(None, ge=1, le=6)
  second_choice_grade: int | None = Field(None, ge=1, le=6)
  third_choice_grade: int | None = Field(None, ge=1, le=6)
  wants_grade_head: bool = False
  wants_subject_teacher: bool = False
  wants_duty_head: bool = False
  comment: str | None = Field(None, max_length=500)
  
  @field_validator("comment")
  @classmethod
  def sanitize_comment(cls, v: Optional[str]) -> Optional[str]:
    if v is not None:
      v = v.strip()
      # HTML 태그 제거
      v = re.sub(r'<[^>]+>', '', v)
    return v
  
  @model_validator(mode="after")
  def validate_preferences(self):
    """희망 학년 검증"""
    grades = [self.first_choice_grade, self.second_choice_grade, self.third_choice_grade]
    grades = [g for g in grades if g is not None]
    
    # 중복 학년 체크
    if len(grades) != len(set(grades)):
      raise ValueError("중복된 학년을 선택할 수 없습니다.")
    
    return self


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
  year: int = Field(..., ge=2000, le=2100)
  grade: int = Field(..., ge=1, le=6)
  class_count: int = Field(..., ge=0, le=20)
  required_homerooms: int = Field(..., ge=0, le=100)
  required_subject_teachers: int = Field(0, ge=0, le=50)
  required_duty_heads: int = Field(0, ge=0, le=20)


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
  year: int = Field(..., ge=2000, le=2100)
  total_teachers: int = Field(..., ge=0, le=1000)


class AdminSettingOut(BaseModel):
  year: int
  total_teachers: int
  is_closed: bool

  class Config:
    from_attributes = True


class ClosePreferenceRequest(BaseModel):
  year: int = Field(..., ge=2000, le=2100)
  is_closed: bool

