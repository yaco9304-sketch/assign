from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings


security_scheme = HTTPBearer()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
  to_encode = data.copy()
  expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
  to_encode.update({"exp": expire})
  return jwt.encode(to_encode, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str):
  try:
    return jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
  except jwt.PyJWTError:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)):
  try:
    payload = decode_token(credentials.credentials)
    
    # 토큰 페이로드 검증
    if not isinstance(payload, dict):
      raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    # role 검증
    role = payload.get("role")
    if role not in ["admin", "teacher"]:
      raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    # teacher_id 검증 (teacher 역할인 경우)
    if role == "teacher":
      teacher_id = payload.get("teacher_id")
      if not teacher_id or not isinstance(teacher_id, int):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    return payload  # contains role, teacher_id (for teacher role)
  except HTTPException:
    raise
  except Exception as e:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


