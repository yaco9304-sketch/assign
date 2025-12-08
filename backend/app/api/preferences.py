from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db import get_session
from app import models
from app.schemas import PreferenceCreate, PreferenceOut
from app.core.security import get_current_user

router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.get("/me", response_model=PreferenceOut | None)
async def get_my_preference(
  year: int,
  session: AsyncSession = Depends(get_session),
  user=Depends(get_current_user),
):
  if user.get("role") != "teacher":
    raise HTTPException(status_code=403, detail="teacher only")
  teacher_id = user.get("teacher_id")
  stmt = select(models.Preference).where(
    models.Preference.year == year, models.Preference.teacher_id == teacher_id
  )
  res = await session.execute(stmt)
  pref = res.scalars().first()
  return pref


@router.post("/me", response_model=PreferenceOut)
async def upsert_my_preference(
  payload: PreferenceCreate,
  session: AsyncSession = Depends(get_session),
  user=Depends(get_current_user),
):
  if user.get("role") != "teacher":
    raise HTTPException(status_code=403, detail="teacher only")
  teacher_id = user.get("teacher_id")
  stmt = select(models.Preference).where(
    models.Preference.year == payload.year, models.Preference.teacher_id == teacher_id
  )
  res = await session.execute(stmt)
  pref = res.scalars().first()
  if pref:
    pref.first_choice_grade = payload.first_choice_grade
    pref.second_choice_grade = payload.second_choice_grade
    pref.third_choice_grade = payload.third_choice_grade
    pref.wants_grade_head = payload.wants_grade_head
    pref.wants_subject_teacher = payload.wants_subject_teacher
    pref.wants_duty_head = payload.wants_duty_head
    pref.comment = payload.comment
  else:
    pref = models.Preference(
      teacher_id=teacher_id,
      year=payload.year,
      first_choice_grade=payload.first_choice_grade,
      second_choice_grade=payload.second_choice_grade,
      third_choice_grade=payload.third_choice_grade,
      wants_grade_head=payload.wants_grade_head,
      wants_subject_teacher=payload.wants_subject_teacher,
      wants_duty_head=payload.wants_duty_head,
      comment=payload.comment,
    )
    session.add(pref)
  await session.commit()
  await session.refresh(pref)
  return pref

