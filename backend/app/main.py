from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.api import auth, preferences, admin
from app.db import engine, Base
import logging

app = FastAPI(title="Assignment Service")

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS 설정: 환경 변수로 허용할 origin 설정 가능
from app.core.config import settings

# CORS 설정 강화
allowed_origins = settings.allowed_origins.split(",") if settings.allowed_origins else []
# 프로덕션에서는 "*" 사용 금지
if "*" in allowed_origins and settings.allowed_origins:
  logger.warning("CORS allow_origins에 '*'가 포함되어 있습니다. 프로덕션에서는 특정 도메인만 허용하세요.")

app.add_middleware(
  CORSMiddleware,
  allow_origins=allowed_origins if allowed_origins else ["*"],
  allow_credentials=True,
  allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # 필요한 메서드만 허용
  allow_headers=["Authorization", "Content-Type"],  # 필요한 헤더만 허용
  expose_headers=["*"],
  max_age=3600,  # preflight 요청 캐시 시간
)

# 전역 예외 처리
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
  """입력 검증 오류 처리 (상세 정보 노출 방지)"""
  logger.warning(f"Validation error: {exc.errors()}")
  return JSONResponse(
    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
    content={"detail": "Invalid input data"},
  )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
  """일반 예외 처리 (상세 정보 노출 방지)"""
  logger.error(f"Unhandled exception: {exc}", exc_info=True)
  return JSONResponse(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    content={"detail": "An error occurred"},
  )


@app.on_event("startup")
async def on_startup():
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)


app.include_router(auth.router)
app.include_router(preferences.router)
app.include_router(admin.router)

