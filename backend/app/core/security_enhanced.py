"""
보안 강화 모듈
- Rate limiting
- 입력 검증
- 보안 헬퍼 함수
"""
from functools import lru_cache
from typing import Dict, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import re


# Rate limiting을 위한 간단한 인메모리 저장소 (프로덕션에서는 Redis 사용 권장)
_rate_limit_store: Dict[str, list] = defaultdict(list)


def check_rate_limit(identifier: str, max_requests: int = 5, window_seconds: int = 60) -> bool:
    """
    Rate limiting 체크
    - identifier: IP 주소 또는 사용자 ID
    - max_requests: 허용할 최대 요청 수
    - window_seconds: 시간 윈도우 (초)
    
    Returns:
        True: 요청 허용
        False: 요청 거부 (rate limit 초과)
    """
    now = datetime.now()
    window_start = now - timedelta(seconds=window_seconds)
    
    # 오래된 기록 제거
    requests = _rate_limit_store[identifier]
    requests[:] = [req_time for req_time in requests if req_time > window_start]
    
    # 요청 수 체크
    if len(requests) >= max_requests:
        return False
    
    # 새 요청 기록
    requests.append(now)
    return True


def sanitize_string(value: Optional[str], max_length: int = 1000) -> Optional[str]:
    """
    문자열 sanitization (XSS 방지)
    - HTML 태그 제거
    - 길이 제한
    - 특수 문자 이스케이프는 프론트엔드에서 처리
    """
    if not value:
        return None
    
    # 길이 제한
    if len(value) > max_length:
        value = value[:max_length]
    
    # 기본적인 HTML 태그 제거 (프론트엔드에서 React가 자동으로 처리하지만 추가 보안)
    value = re.sub(r'<[^>]+>', '', value)
    
    return value.strip()


def validate_year(year: int) -> bool:
    """연도 검증 (현재 연도 ± 10년 범위)"""
    current_year = datetime.now().year
    return current_year - 10 <= year <= current_year + 10


def validate_grade(grade: Optional[int]) -> bool:
    """학년 검증 (1-6)"""
    if grade is None:
        return True
    return 1 <= grade <= 6


def validate_file_size(file_size: int, max_size_mb: int = 10) -> bool:
    """파일 크기 검증"""
    max_size_bytes = max_size_mb * 1024 * 1024
    return file_size <= max_size_bytes


def validate_file_extension(filename: str, allowed_extensions: list[str] = [".xlsx", ".xls"]) -> bool:
    """파일 확장자 검증"""
    if not filename:
        return False
    filename_lower = filename.lower()
    return any(filename_lower.endswith(ext) for ext in allowed_extensions)


def validate_json_string(json_str: Optional[str]) -> bool:
    """JSON 문자열 검증"""
    if not json_str:
        return True
    
    try:
        import json
        parsed = json.loads(json_str)
        # 너무 큰 JSON 방지
        if len(json_str) > 10000:
            return False
        return isinstance(parsed, (dict, list))
    except (json.JSONDecodeError, TypeError):
        return False





