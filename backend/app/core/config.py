from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
  app_name: str = "Assignment Service"
  secret_key: str = Field("change-me", env="SECRET_KEY")  # 프로덕션에서는 최소 32자 권장
  db_url: str = Field("sqlite+aiosqlite:///./dev.db", env="DATABASE_URL")
  admin_password: str = Field("admin1234", env="ADMIN_PASSWORD")  # 프로덕션에서는 최소 8자 권장
  teacher_password: str = Field("teacher1234", env="TEACHER_PASSWORD")  # 프로덕션에서는 최소 8자 권장
  jwt_algorithm: str = "HS256"
  access_token_expire_minutes: int = 60 * 24
  google_client_id: str = Field("", env="GOOGLE_CLIENT_ID")
  google_client_secret: str = Field("", env="GOOGLE_CLIENT_SECRET")
  allowed_origins: str = Field(
    "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5175",
    env="ALLOWED_ORIGINS"
  )
  
  @property
  def is_production(self) -> bool:
    """프로덕션 환경 여부 확인"""
    return self.secret_key != "change-me" and len(self.secret_key) >= 32
  
  def validate_security(self):
    """보안 설정 검증"""
    import warnings
    if not self.is_production:
      warnings.warn("SECRET_KEY가 기본값입니다. 프로덕션에서는 반드시 변경하세요.")
    if len(self.admin_password) < 8:
      warnings.warn("ADMIN_PASSWORD가 너무 짧습니다. 최소 8자 이상 권장합니다.")
    if len(self.teacher_password) < 8:
      warnings.warn("TEACHER_PASSWORD가 너무 짧습니다. 최소 8자 이상 권장합니다.")

  class Config:
    env_file = ".env"


settings = Settings()
settings.validate_security()  # 시작 시 보안 설정 검증

