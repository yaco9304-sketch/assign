from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, preferences, admin
from app.db import engine, Base

app = FastAPI(title="Assignment Service")

# CORS 설정: 환경 변수로 허용할 origin 설정 가능
import os
allowed_origins = os.getenv(
  "ALLOWED_ORIGINS",
  "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5175"
).split(",")

app.add_middleware(
  CORSMiddleware,
  allow_origins=allowed_origins,
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

