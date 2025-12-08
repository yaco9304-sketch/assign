from typing import List, Tuple, Dict
from app.models import Teacher, GradeSetting, Preference

EXCLUDE_PATTERNS = [
  ("휴직", "제13조: 휴직"),
  ("병가", "제13조: 병가 30일 이상"),
  ("파견", "제13조: 파견"),
  ("연수", "제13조: 연수"),
  ("산전", "제13조: 임신/산전"),
  ("임신", "제13조: 임신"),
  ("출산", "제13조: 출산 예정"),
  ("고령", "제13조: 고령 교사"),
]

# 제12조② 업무부장/학년부장/교과전담 우선 점수
ROLE_POINTS = {
  "업무1부장": 6.0,
  "업무2부장": 5.0,
  "업무3부장": 4.3,
  "학년부장": 2.0,
  "교과전담": 3.0,
}

# 제12조④ 특수 사유 우선 배정 패턴
PRIORITY_PATTERNS = [
  ("원로", "제12조④: 원로교사"),
  ("요양", "제12조④: 요양 필요"),
  ("건강", "제12조④: 건강 사유"),
  ("군입대", "제12조③/제14조③: 군 입대"),
  ("출산", "제12조④: 출산 예정"),
  ("임신", "제12조④: 임신"),
]


def apply_exclusions(teachers: List[Teacher], year: int):
  kept, excluded, logs = [], [], []
  for t in teachers:
    cond = (t.special_conditions or "").lower()
    reason = None
    for key, msg in EXCLUDE_PATTERNS:
      if key in cond:
        reason = msg
        break
    if reason:
      excluded.append(t)
      logs.append((t.id, "exclude", reason))
    else:
      kept.append(t)
  return kept, excluded, logs


def apply_priority_rules(teachers: List[Teacher], settings: List[GradeSetting], year: int):
  assigned: List[Tuple[Teacher, int, str, str]] = []
  remaining: List[Teacher] = teachers[:]
  logs = []

  # 1) 특수 사유 우선 (제12조④)
  pri_candidates = []
  still = []
  for t in remaining:
    reason = None
    cond = (t.special_conditions or "").lower()
    for key, msg in PRIORITY_PATTERNS:
      if key in cond:
        reason = msg
        break
    if reason:
      pri_candidates.append((t, reason))
    else:
      still.append(t)
  remaining = still

  # 특수 사유자는 1지망→2지망→3지망 순으로 우선 배정
  for t, reason in pri_candidates:
    prefs = []
    if hasattr(t, "preferred_grade_primary") and getattr(t, "preferred_grade_primary"):
      prefs.append(getattr(t, "preferred_grade_primary"))
    if hasattr(t, "preferred_grade_secondary") and getattr(t, "preferred_grade_secondary"):
      prefs.append(getattr(t, "preferred_grade_secondary"))
    if hasattr(t, "preferred_grade_third") and getattr(t, "preferred_grade_third"):
      prefs.append(getattr(t, "preferred_grade_third"))
    
    # 우선은 current_grade 유지 시도, 없으면 1지망→2지망→3지망 순
    target_grade = t.current_grade
    hope_detail = ""
    if not target_grade and prefs:
      target_grade = prefs[0]
      hope_detail = " (1지망 반영)"
    elif target_grade:
      hope_detail = " (현재 학년 유지)"
    
    if target_grade:
      desc = f"{reason}{hope_detail}"
      assigned.append((t, target_grade, "규정우선", desc))
      logs.append((t.id, "rule_12_4", reason))
    else:
      remaining.append(t)

  # 2) 업무부장/학년부장/교과전담 경합 시 점수 높은 순 (제12조②)
  # duty_role에 ROLE_POINTS 키워드를 포함한 교사만 선별
  def role_score(t: Teacher) -> float:
    if t.duty_role:
      for k, v in ROLE_POINTS.items():
        if k in t.duty_role:
          return v
    return 0.0

  role_sorted = sorted(
    [t for t in remaining if role_score(t) > 0],
    key=lambda x: role_score(x),
    reverse=True,
  )
  remaining = [t for t in remaining if role_score(t) == 0]

  for t in role_sorted:
    # 배정 학년은 1지망→2지망→3지망 순으로 시도, 없으면 current_grade 유지
    prefs = []
    if hasattr(t, "preferred_grade_primary") and getattr(t, "preferred_grade_primary"):
      prefs.append(getattr(t, "preferred_grade_primary"))
    if hasattr(t, "preferred_grade_secondary") and getattr(t, "preferred_grade_secondary"):
      prefs.append(getattr(t, "preferred_grade_secondary"))
    if hasattr(t, "preferred_grade_third") and getattr(t, "preferred_grade_third"):
      prefs.append(getattr(t, "preferred_grade_third"))
    
    target = prefs[0] if prefs else (t.current_grade or None)
    hope_detail = ""
    if target:
      if prefs and target == prefs[0]:
        hope_detail = " (1지망 반영)"
      elif len(prefs) > 1 and target == prefs[1]:
        hope_detail = " (2지망 반영)"
      elif len(prefs) > 2 and target == prefs[2]:
        hope_detail = " (3지망 반영)"
      elif target == t.current_grade:
        hope_detail = " (현재 학년 유지)"
      
      role_name = t.duty_role or "역할"
      desc = f"제12조② 역할 우선 ({role_name}){hope_detail}"
      assigned.append((t, target, "규정우선", desc))
      logs.append((t.id, "rule_12_2", f"역할 {t.duty_role or ''} 우선 배정"))
    else:
      remaining.append(t)

  return assigned, remaining, logs


def apply_rotation(teachers: List[Teacher], prefs_by_teacher: Dict[int, Preference]):
  updated: List[Teacher] = []
  for t in teachers:
    banned = set()
    if t.current_grade:
      prefs = prefs_by_teacher.get(t.id)
      wants_same = False
      if prefs:
        wants_same = (
          prefs.first_choice_grade == t.current_grade
          or prefs.second_choice_grade == t.current_grade
          or prefs.third_choice_grade == t.current_grade
        )
      # 1학년/6학년은 동일학년 희망 시 제한 완화
      if not (t.current_grade in {1, 6} and wants_same):
        banned.add(t.current_grade)
    t.banned_grades = banned  # type: ignore[attr-defined]
    updated.append(t)
  return updated


def apply_subject_rules(teachers: List[Teacher]):
  updated: List[Teacher] = []
  for t in teachers:
    if t.is_subject_teacher:
      # 교과전담은 기본적으로 담임 배제, 필요 시 관리자가 풀도록
      banned = getattr(t, "banned_grades", set())
      banned.update({1, 2, 3, 4, 5, 6})
      t.banned_grades = banned  # type: ignore[attr-defined]
    updated.append(t)
  return updated

