from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, preferences, admin
from app.db import engine, Base

app = FastAPI(title="Assignment Service")

# CORS 설정: 환경 변수로 허용할 origin 설정 가능
from app.core.config import settings

app.add_middleware(
  CORSMiddleware,
  allow_origins=settings.allowed_origins.split(",") if settings.allowed_origins else ["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
  expose_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)


app.include_router(auth.router)
app.include_router(preferences.router)
app.include_router(admin.router)

