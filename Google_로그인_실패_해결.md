# Google 로그인 실패 문제 해결

## 🔴 문제: Google 로그인은 되는데 "구글 로그인 실패" 메시지 표시

Google 계정 선택까지는 되지만, 로그인 후 "구글 로그인 실패" 메시지가 나타납니다.

## 🔍 원인 분석

이 문제는 보통 다음 중 하나입니다:

1. **CORS 오류** - 백엔드가 GitHub Pages 도메인을 허용하지 않음
2. **백엔드 서버 문제** - 서버가 응답하지 않음
3. **네트워크 문제** - API 요청이 차단됨
4. **브라우저 확장 프로그램** - 광고 차단기 등이 API 요청 차단

## ✅ 해결 방법

### 1단계: 개발자 도구로 정확한 오류 확인

**데스크탑에서:**

1. **F12 키로 개발자 도구 열기**

2. **Console 탭 확인**
   - 빨간색 오류 메시지 확인
   - CORS 관련 오류 확인
   - API 요청 실패 오류 확인

3. **Network 탭 확인**
   - `auth/google` 요청 찾기
   - 요청 상태 확인 (200, 404, 500, CORS 오류 등)
   - 응답 내용 확인

### 2단계: CORS 오류 확인

**Console에서 다음과 같은 오류가 보이나요?**
```
Access to XMLHttpRequest at 'https://assign-hfvk.onrender.com/auth/google' 
from origin 'https://yaco9304-sketch.github.io' has been blocked by CORS policy
```

**해결:**
1. Render 대시보드 확인
   - 서비스 상태가 "Live"인지 확인
   - 최근 배포가 성공했는지 확인

2. `ALLOWED_ORIGINS` 환경 변수 확인
   - `https://yaco9304-sketch.github.io` 포함 확인
   - 저장 후 재시작 확인

3. 서비스 재시작
   - Render에서 "Manual Deploy" 클릭

### 3단계: 백엔드 서버 상태 확인

**Network 탭에서:**

1. **`auth/google` 요청 확인**
   - Status: 200 (성공)
   - Status: 500 (서버 오류)
   - Status: CORS 오류
   - Status: Failed (네트워크 오류)

2. **응답 내용 확인**
   - Response 탭 클릭
   - 오류 메시지 확인

### 4단계: 브라우저 확장 프로그램 확인

1. **시크릿 모드로 테스트**
   - Ctrl+Shift+N (Windows) 또는 Cmd+Shift+N (Mac)
   - 시크릿 모드에서 Google 로그인 테스트

2. **확장 프로그램 비활성화**
   - 광고 차단기 일시 비활성화
   - 다른 보안 확장 프로그램 비활성화

### 5단계: 네트워크 확인

1. **다른 네트워크로 테스트**
   - 모바일 핫스팟 사용
   - 다른 Wi-Fi 네트워크 사용

2. **방화벽 확인**
   - 회사/학교 네트워크인지 확인
   - 방화벽이 API 요청을 차단하는지 확인

## 🧪 단계별 진단

### 데스크탑에서 확인할 사항

1. **개발자 도구 열기** (F12)

2. **Console 탭에서 오류 메시지 확인**
   ```
   예시:
   - "CORS policy" 오류
   - "Network Error" 오류
   - "Failed to fetch" 오류
   - "500 Internal Server Error" 오류
   ```

3. **Network 탭에서 확인**
   - `auth/google` POST 요청 찾기
   - Status 코드 확인
   - Response 내용 확인

4. **오류 메시지 복사**
   - 정확한 오류 메시지를 복사하여 알려주세요

## 📋 체크리스트

- [ ] 개발자 도구에서 Console 오류 확인
- [ ] Network 탭에서 `auth/google` 요청 상태 확인
- [ ] CORS 오류인지 확인
- [ ] 백엔드 서버 상태 확인 (Render 대시보드)
- [ ] 시크릿 모드로 테스트
- [ ] 브라우저 확장 프로그램 비활성화
- [ ] 다른 네트워크로 테스트

## 💡 빠른 해결 시도

### 방법 1: 시크릿 모드

1. **시크릿 모드 열기**
   - Ctrl+Shift+N (Windows) 또는 Cmd+Shift+N (Mac)

2. **사이트 접속**
   - `https://yaco9304-sketch.github.io/assign`

3. **Google 로그인 테스트**

### 방법 2: 브라우저 캐시 삭제

1. **설정 → 개인정보 및 보안 → 인터넷 사용 기록 삭제**
2. **"캐시된 이미지 및 파일" 선택**
3. **"데이터 삭제" 클릭**
4. **다시 로그인 시도**

### 방법 3: Render 서비스 재시작

1. **Render 대시보드 접속**
2. **백엔드 서비스 선택**
3. **"Manual Deploy" 클릭**
4. **재시작 완료 대기 (1-2분)**
5. **다시 로그인 시도**

## 🐛 구체적인 오류별 해결

### CORS 오류인 경우

**오류 메시지:**
```
Access to XMLHttpRequest ... has been blocked by CORS policy
```

**해결:**
1. Render → Environment → `ALLOWED_ORIGINS` 확인
2. `https://yaco9304-sketch.github.io` 포함 확인
3. 서비스 재시작

### 500 Internal Server Error

**오류 메시지:**
```
500 Internal Server Error
```

**해결:**
1. Render 대시보드 → Logs 탭
2. 백엔드 로그 확인
3. 오류 원인 파악

### Network Error

**오류 메시지:**
```
Network Error
Failed to fetch
```

**해결:**
1. 백엔드 서버 상태 확인
2. 네트워크 연결 확인
3. 방화벽 설정 확인

## 📞 디버깅 정보 수집

데스크탑에서 다음 정보를 수집해주세요:

1. **Console 오류 메시지**
   - F12 → Console 탭 → 오류 메시지 복사

2. **Network 요청 상태**
   - F12 → Network 탭 → `auth/google` 요청 클릭
   - Status 코드 확인
   - Response 내용 확인

3. **브라우저 정보**
   - 브라우저 종류 및 버전

이 정보를 알려주시면 더 정확한 해결 방법을 제시할 수 있습니다.



