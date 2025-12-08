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
  payload = decode_token(credentials.credentials)
  return payload  # contains role, teacher_id (for teacher role)

