from sqlalchemy import Integer, String, Boolean, ForeignKey, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base


class Teacher(Base):
  __tablename__ = "teachers"
  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  name: Mapped[str] = mapped_column(String, unique=True, index=True)
  email: Mapped[str | None] = mapped_column(String, nullable=True, unique=True, index=True)  # 구글 이메일
  google_id: Mapped[str | None] = mapped_column(String, nullable=True, unique=True, index=True)  # 구글 ID
  gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
  hire_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
  school_join_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
  current_grade: Mapped[int | None] = mapped_column(Integer, nullable=True)
  current_class: Mapped[str | None] = mapped_column(String, nullable=True)  # 한글 입력 가능 (예: "1반", "2반")
  is_homeroom_current: Mapped[bool] = mapped_column(Boolean, default=False)
  is_subject_teacher: Mapped[bool] = mapped_column(Boolean, default=False)
  duty_role: Mapped[str | None] = mapped_column(String, nullable=True)  # 업무부장/학년부장/교과전담 등
  subject: Mapped[str | None] = mapped_column(String, nullable=True)
  special_conditions: Mapped[str | None] = mapped_column(String, nullable=True)
  grade_history: Mapped[str | None] = mapped_column(Text, nullable=True)  # 본교 근무 기간 동안 담임한 학년 이력 (JSON 형식: [{"year": 2023, "grade": 1}, ...])

  preferences: Mapped[list["Preference"]] = relationship(back_populates="teacher")
  assignments: Mapped[list["Assignment"]] = relationship(back_populates="teacher")


class Preference(Base):
  __tablename__ = "preferences"
  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"))
  year: Mapped[int] = mapped_column(Integer, index=True)
  first_choice_grade: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 교과전담 선택 시 null
  second_choice_grade: Mapped[int | None] = mapped_column(Integer, nullable=True)
  third_choice_grade: Mapped[int | None] = mapped_column(Integer, nullable=True)
  wants_grade_head: Mapped[bool] = mapped_column(Boolean, default=False)  # 학년부장 희망
  wants_subject_teacher: Mapped[bool] = mapped_column(Boolean, default=False)  # 교과전담 희망
  wants_duty_head: Mapped[bool] = mapped_column(Boolean, default=False)  # 업무부장 희망 (교과전담 희망 시)
  comment: Mapped[str | None] = mapped_column(String, nullable=True)

  teacher: Mapped[Teacher] = relationship(back_populates="preferences")


class GradeSetting(Base):
  __tablename__ = "grade_settings"
  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  year: Mapped[int] = mapped_column(Integer, index=True)
  grade: Mapped[int] = mapped_column(Integer)
  class_count: Mapped[int] = mapped_column(Integer)
  required_homerooms: Mapped[int] = mapped_column(Integer)
  required_subject_teachers: Mapped[int] = mapped_column(Integer, default=0, server_default="0")  # 교과전담 필요 수
  required_duty_heads: Mapped[int] = mapped_column(Integer, default=0, server_default="0")  # 업무부장 필요 수


class Assignment(Base):
  __tablename__ = "assignments"
  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"))
  year: Mapped[int] = mapped_column(Integer, index=True)
  assigned_grade: Mapped[int] = mapped_column(Integer)
  assignment_type: Mapped[str] = mapped_column(String)
  rule_reference: Mapped[str | None] = mapped_column(String, nullable=True)
  description: Mapped[str | None] = mapped_column(String, nullable=True)

  teacher: Mapped[Teacher] = relationship(back_populates="assignments")
  logs: Mapped[list["AssignmentLog"]] = relationship(back_populates="assignment")


class AssignmentLog(Base):
  __tablename__ = "assignment_logs"
  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  assignment_id: Mapped[int] = mapped_column(ForeignKey("assignments.id"))
  step: Mapped[str] = mapped_column(String)
  message: Mapped[str] = mapped_column(String)

  assignment: Mapped[Assignment] = relationship(back_populates="logs")


class AdminSetting(Base):
  __tablename__ = "admin_settings"
  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  year: Mapped[int] = mapped_column(Integer, unique=True, index=True)
  total_teachers: Mapped[int] = mapped_column(Integer, default=0)  # 전체 교사 수

