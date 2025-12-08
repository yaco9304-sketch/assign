from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
  app_name: str = "Assignment Service"
  secret_key: str = Field("change-me", env="SECRET_KEY")
  db_url: str = Field("sqlite+aiosqlite:///./dev.db", env="DATABASE_URL")
  admin_password: str = Field("admin1234", env="ADMIN_PASSWORD")
  teacher_password: str = Field("teacher1234", env="TEACHER_PASSWORD")
  jwt_algorithm: str = "HS256"
  access_token_expire_minutes: int = 60 * 24
  google_client_id: str = Field("", env="GOOGLE_CLIENT_ID")
  google_client_secret: str = Field("", env="GOOGLE_CLIENT_SECRET")
  allowed_origins: str = Field(
    "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5175",
    env="ALLOWED_ORIGINS"
  )

  class Config:
    env_file = ".env"


settings = Settings()

