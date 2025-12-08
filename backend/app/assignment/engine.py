from typing import List
from app import models
from app.models import Teacher, GradeSetting, Assignment, Preference
from app.assignment.rules import (
  apply_exclusions,
  apply_priority_rules,
  apply_rotation,
  apply_subject_rules,
  ROLE_POINTS,
)
from sqlalchemy.ext.asyncio import AsyncSession


def score_candidate(teacher: Teacher, grade: int, prefs: list[int]) -> tuple[int, dict]:
  """점수 계산 및 상세 내역 반환"""
  hope_score = 0
  hope_detail = ""
  if prefs:
    if grade == prefs[0]:
      hope_score = 10
      hope_detail = "1지망"
    elif len(prefs) > 1 and grade == prefs[1]:
      hope_score = 5
      hope_detail = "2지망"
    elif len(prefs) > 2 and grade == prefs[2]:
      hope_score = 2
      hope_detail = "3지망"
  
  grade_weight = {6: 6, 1: 5, 5: 4, 3: 3, 4: 3, 2: 2}.get(grade, 0)
  
  # 역할 점수: duty_role 필드 우선, 없으면 subject/special_conditions 텍스트 매칭
  role_score = 0
  role_detail = ""
  role_text = (teacher.duty_role or "") + " " + (teacher.special_conditions or "") + " " + (teacher.subject or "")
  for key, val in ROLE_POINTS.items():
    if key in role_text:
      if val > role_score:
        role_score = val
        role_detail = key
  
  penalty = -999 if grade in getattr(teacher, "banned_grades", set()) else 0
  total_score = hope_score + grade_weight + role_score + penalty
  
  details = {
    "hope_score": hope_score,
    "hope_detail": hope_detail,
    "grade_weight": grade_weight,
    "role_score": role_score,
    "role_detail": role_detail,
    "penalty": penalty,
    "total_score": total_score,
  }
  
  return total_score, details


async def run_assignment(session: AsyncSession, year: int):
  from sqlalchemy import select
  
  settings: List[GradeSetting] = (
    await session.execute(select(GradeSetting).where(GradeSetting.year == year))
  ).scalars().all()
  
  if not settings:
    raise ValueError(f"{year}년도 학급 설정이 없습니다. 먼저 학급 설정을 입력해주세요.")
  
  teachers: List[Teacher] = (
    await session.execute(select(Teacher))
  ).scalars().all()
  
  if not teachers:
    raise ValueError("교사 데이터가 없습니다.")
  
  prefs_by_teacher = {
    p.teacher_id: p
    for p in (
      await session.execute(select(Preference).where(Preference.year == year))
    ).scalars().all()
  }

  kept, excluded, logs_all = apply_exclusions(teachers, year)
  # 희망 정보를 teacher 객체에 힌트로 붙여 우선배정 활용
  for t in kept:
    pref = prefs_by_teacher.get(t.id)
    if pref:
      t.preferred_grade_primary = pref.first_choice_grade
      t.preferred_grade_secondary = pref.second_choice_grade
      t.preferred_grade_third = pref.third_choice_grade
  assigned, remaining, pri_logs = apply_priority_rules(kept, settings, year)
  logs_all.extend(pri_logs)

  remaining = apply_rotation(remaining, prefs_by_teacher)
  remaining = apply_subject_rules(remaining)

  # 슬롯 풀 생성
  slots: List[int] = []
  for s in settings:
    for _ in range(s.required_homerooms):
      slots.append(s.grade)
  
  if not slots:
    raise ValueError("필요 담임 수가 0입니다. 학급 설정에서 필요 담임 수를 입력해주세요.")

  # 1/2/3 지망 우선 배정
  for choice_idx in [0, 1, 2]:
    still = []
    for t in remaining:
      prefs = []
      pref = prefs_by_teacher.get(t.id)
      if pref:
        prefs = [
          pref.first_choice_grade,
          pref.second_choice_grade,
          pref.third_choice_grade,
        ]
        prefs = [p for p in prefs if p is not None]
      if choice_idx < len(prefs) and prefs[choice_idx] in slots and prefs[choice_idx] not in getattr(t, "banned_grades", set()):
        g = prefs[choice_idx]
        hope_rank = f"{choice_idx+1}지망"
        desc = f"{hope_rank} 반영 (희망 학년: {g}학년)"
        assigned.append((t, g, hope_rank, desc))
        slots.remove(g)
      else:
        still.append(t)
    remaining = still

  # 남은 슬롯 점수 기반 배정 (greedy)
  scored = []
  for t in remaining:
    prefs = []
    pref = prefs_by_teacher.get(t.id)
    if pref:
      prefs = [
        pref.first_choice_grade,
        pref.second_choice_grade,
        pref.third_choice_grade,
      ]
      prefs = [p for p in prefs if p is not None]
    best = None
    best_details = None
    for g in set(slots):
      sc, details = score_candidate(t, g, prefs)
      if best is None or sc > best[1]:
        best = (g, sc)
        best_details = details
    if best:
      scored.append((t, best[0], best[1], best_details))
  scored.sort(key=lambda x: x[2], reverse=True)
  for t, g, sc, details in scored:
    if g in slots:
      # 점수 상세 내역 구성
      desc_parts = []
      if details["hope_detail"]:
        desc_parts.append(f"희망: {details['hope_detail']}({details['hope_score']}점)")
      desc_parts.append(f"학년가중치: {details['grade_weight']}점")
      if details["role_detail"]:
        desc_parts.append(f"역할: {details['role_detail']}({details['role_score']}점)")
      desc_parts.append(f"총점: {details['total_score']}점")
      desc = " | ".join(desc_parts)
      assigned.append((t, g, "조정", desc))
      slots.remove(g)

  # DB 저장
  for t, g, atype, desc in assigned:
    # rule_reference 설정
    rule_ref = None
    if "규정우선" in atype:
      if "제12조④" in (desc or ""):
        rule_ref = "제12조④ (특수 사유 우선 배정)"
      elif "제12조②" in (desc or ""):
        rule_ref = "제12조② (역할 우선 배정)"
      elif "제13조" in (desc or ""):
        rule_ref = "제13조 (배정 제외)"
    elif "1지망" in atype or "2지망" in atype or "3지망" in atype:
      rule_ref = "제11조 (희망 학년 반영)"
    elif "조정" in atype:
      rule_ref = "제12조① (학년 순환 원칙) + 점수 기반 조정"
    
    a = Assignment(
      teacher_id=t.id,
      year=year,
      assigned_grade=g,
      assignment_type=atype,
      rule_reference=rule_ref,
      description=desc,
    )
    session.add(a)
    await session.flush()
    # 로그 기록
    log_msg = desc or atype
    session.add(
      models.AssignmentLog(
        assignment_id=a.id,
        step="assign",
        message=log_msg,
      )
    )
  await session.commit()
  return assigned, excluded, logs_all

