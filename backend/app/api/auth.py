from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.core.security import create_access_token, get_current_user
from app.core.security_enhanced import check_rate_limit, sanitize_string
from app.db import get_session
from app import models
from app.schemas import LoginRequest, TeacherUpdate
from pydantic import BaseModel
import httpx

router = APIRouter(prefix="/auth", tags=["auth"])


class GoogleTokenRequest(BaseModel):
  token: str


@router.post("/login")
async def login(req: LoginRequest, request: Request, session: AsyncSession = Depends(get_session)):
  # Rate limiting 체크
  client_ip = request.client.host if request.client else "unknown"
  if not check_rate_limit(f"login:{client_ip}", max_requests=5, window_seconds=300):
    raise HTTPException(
      status_code=429,
      detail="Too many login attempts. Please try again later."
    )
  
  # 입력 sanitization
  name = sanitize_string(req.name) if req.name else None
  password = req.password
  
  # 비밀번호 길이 검증
  if len(password) > 200:
    raise HTTPException(status_code=400, detail="Invalid input")
  
  role = req.role
  if role == "admin":
    if password != settings.admin_password:
      raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"role": "admin"})
    return {"token": token, "role": "admin"}

  # teacher login (shared password) + ensure teacher exists
  if password != settings.teacher_password:
    raise HTTPException(status_code=401, detail="Invalid credentials")

  if name:
    stmt = select(models.Teacher).where(models.Teacher.name == name)
    res = await session.execute(stmt)
    teacher = res.scalars().first()
    if not teacher:
      teacher = models.Teacher(name=name)
      session.add(teacher)
      await session.commit()
      await session.refresh(teacher)
  else:
    raise HTTPException(status_code=400, detail="Name is required for teacher login")

  token = create_access_token({"role": "teacher", "teacher_id": teacher.id})
  return {"token": token, "role": "teacher", "teacher_id": teacher.id}


@router.post("/google")
async def google_login(req: GoogleTokenRequest, session: AsyncSession = Depends(get_session)):
  """구글 OAuth 토큰으로 로그인"""
  import logging
  import traceback
  logger = logging.getLogger(__name__)
  
  # 설정 확인
  logger.info(f"Checking GOOGLE_CLIENT_ID: length={len(settings.google_client_id) if settings.google_client_id else 0}")
  
  if not settings.google_client_id:
    logger.error("Google OAuth not configured: GOOGLE_CLIENT_ID is empty")
    raise HTTPException(status_code=500, detail="Google OAuth not configured")
  
  logger.info(f"Received Google token request (token length: {len(req.token) if req.token else 0})")
  
  # 구글 Access Token으로 사용자 정보 가져오기
  google_id = None
  email = None
  name = None
  
  try:
    async with httpx.AsyncClient(timeout=10.0) as client:
      # Access token으로 userinfo 가져오기
      resp = await client.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {req.token}"}
      )
      logger.info(f"Google API response status: {resp.status_code}")
      
      if resp.status_code != 200:
        error_text = resp.text[:500] if resp.text else "No error message"
        logger.error(f"Google API error: {resp.status_code}, {error_text}")
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {resp.status_code}")
      
      user_info = resp.json()
      logger.info(f"Google user_info received: {user_info.get('email', 'no email')}")
      
      google_id = user_info.get("id")
      email = user_info.get("email")
      name = user_info.get("name", email.split("@")[0] if email else "Unknown")
      
      if not google_id:
        logger.error(f"Missing google_id in user_info: {user_info}")
        raise HTTPException(status_code=401, detail="Invalid Google token: missing user ID")
        
  except HTTPException:
    raise
  except httpx.TimeoutException as e:
    logger.exception(f"Google API timeout: {e}")
    raise HTTPException(status_code=504, detail="Google API timeout")
  except Exception as e:
    logger.error(f"Google token verification failed: {type(e).__name__}: {str(e)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    raise HTTPException(status_code=401, detail=f"Google token verification failed: {str(e)}")
  
  # 교사 찾기 또는 생성
  stmt = select(models.Teacher).where(
    (models.Teacher.google_id == google_id) | (models.Teacher.email == email)
  )
  res = await session.execute(stmt)
  teacher = res.scalars().first()
  
  if not teacher:
    teacher = models.Teacher(name=name, email=email, google_id=google_id)
    session.add(teacher)
    await session.commit()
    await session.refresh(teacher)
  else:
    # 기존 교사 정보 업데이트
    if not teacher.google_id:
      teacher.google_id = google_id
    if not teacher.email:
      teacher.email = email
    if not teacher.name or teacher.name != name:
      teacher.name = name
    await session.commit()
    await session.refresh(teacher)
  
  token = create_access_token({"role": "teacher", "teacher_id": teacher.id})
  return {"token": token, "role": "teacher", "teacher_id": teacher.id, "name": teacher.name}


@router.get("/me")
async def get_me(session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
  if user.get("role") != "teacher":
    raise HTTPException(status_code=403, detail="Forbidden")
  teacher_id = user.get("teacher_id")
  stmt = select(models.Teacher).where(models.Teacher.id == teacher_id)
  res = await session.execute(stmt)
  teacher = res.scalars().first()
  if not teacher:
    raise HTTPException(status_code=404, detail="Not found")
  return {
    "id": teacher.id,
    "name": teacher.name,
    "email": teacher.email,
    "current_grade": teacher.current_grade,
    "current_class": teacher.current_class,
    "school_join_year": teacher.school_join_year,
    "hire_year": teacher.hire_year,
    "is_homeroom_current": teacher.is_homeroom_current,
    "is_subject_teacher": teacher.is_subject_teacher,
    "duty_role": teacher.duty_role,
    "grade_history": teacher.grade_history,
  }


@router.put("/me")
async def update_me(
  payload: TeacherUpdate,
  session: AsyncSession = Depends(get_session),
  user=Depends(get_current_user),
):
  if user.get("role") != "teacher":
    raise HTTPException(status_code=403, detail="Forbidden")
  teacher_id = user.get("teacher_id")
  stmt = select(models.Teacher).where(models.Teacher.id == teacher_id)
  res = await session.execute(stmt)
  teacher = res.scalars().first()
  if not teacher:
    raise HTTPException(status_code=404, detail="Not found")
  
  # 입력 검증 및 sanitization은 Pydantic 스키마에서 처리됨
  if payload.current_grade is not None:
    teacher.current_grade = payload.current_grade
  if payload.current_class is not None:
    teacher.current_class = payload.current_class
  if payload.school_join_year is not None:
    teacher.school_join_year = payload.school_join_year
  if payload.hire_year is not None:
    teacher.hire_year = payload.hire_year
  if payload.is_homeroom_current is not None:
    teacher.is_homeroom_current = payload.is_homeroom_current
  if payload.is_subject_teacher is not None:
    teacher.is_subject_teacher = payload.is_subject_teacher
  if payload.duty_role is not None:
    teacher.duty_role = payload.duty_role
  if payload.grade_history is not None:
    # grade_history는 이미 Pydantic에서 검증됨
    teacher.grade_history = payload.grade_history
  
  await session.commit()
  await session.refresh(teacher)
  
  return {
    "id": teacher.id,
    "name": teacher.name,
    "email": teacher.email,
    "current_grade": teacher.current_grade,
    "current_class": teacher.current_class,
    "school_join_year": teacher.school_join_year,
    "hire_year": teacher.hire_year,
    "is_homeroom_current": teacher.is_homeroom_current,
    "is_subject_teacher": teacher.is_subject_teacher,
    "duty_role": teacher.duty_role,
    "grade_history": teacher.grade_history,
  }

