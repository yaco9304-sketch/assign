# Google OAuth redirect_uri_mismatch 해결 체크리스트

## 🔴 현재 문제
Google 로그인 시 `400 오류: redirect_uri_mismatch` 발생

## ✅ 해결 단계

### 1단계: 실제 redirect_uri 확인

1. **GitHub Pages 사이트 접속**
   - `https://yaco9304-sketch.github.io/assign` 접속

2. **브라우저 개발자 도구 열기**
   - F12 키 또는 Cmd+Option+I (Mac)
   - 또는 우클릭 → "검사" / "Inspect"

3. **Console 탭 클릭**

4. **Google 로그인 버튼 클릭**

5. **Console에서 다음 메시지 확인**
   ```
   === Google OAuth Redirect URI Debug ===
   window.location.origin: https://yaco9304-sketch.github.io
   window.location.pathname: /assign/login
   Final redirectUri: https://yaco9304-sketch.github.io
   이 값이 Google Cloud Console에 등록되어 있어야 합니다!
   ```

6. **`Final redirectUri` 값 복사**
   - 예: `https://yaco9304-sketch.github.io`

### 2단계: Google Cloud Console 설정

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/

2. **프로젝트 선택**
   - 상단에서 올바른 프로젝트 선택

3. **APIs & Services → Credentials**
   - 왼쪽 메뉴에서 "APIs & Services" 클릭
   - "Credentials" 클릭

4. **OAuth 2.0 클라이언트 ID 찾기**
   - "OAuth 2.0 클라이언트 ID" 목록에서 사용 중인 클라이언트 ID 클릭
   - 또는 "웹 애플리케이션" 타입의 클라이언트 ID 클릭

5. **"승인된 리디렉션 URI" 섹션 찾기**

6. **1단계에서 확인한 redirect_uri 추가**
   - "URI 추가" 또는 "+ URI 추가" 클릭
   - **정확히** Console에서 확인한 값 입력:
     ```
     https://yaco9304-sketch.github.io
     ```

7. **추가로 다음 URI들도 추가 (안전을 위해)**
   ```
   https://yaco9304-sketch.github.io/
   https://yaco9304-sketch.github.io/assign
   https://yaco9304-sketch.github.io/assign/
   ```

8. **저장**
   - "저장" 또는 "Save" 버튼 클릭

### 3단계: 변경사항 적용 대기

1. **1-5분 대기**
   - Google Cloud Console의 변경사항이 적용되기까지 시간이 걸립니다

2. **브라우저 캐시 삭제 (선택사항)**
   - 개발자 도구(F12) → Application 탭 → Clear storage
   - 또는 시크릿 모드로 테스트

### 4단계: 테스트

1. **GitHub Pages 사이트 접속**
   - `https://yaco9304-sketch.github.io/assign`

2. **Google 로그인 버튼 클릭**

3. **정상 작동 확인**
   - Google 로그인 팝업이 정상적으로 열리고 로그인이 완료되어야 합니다

## ⚠️ 중요 체크리스트

- [ ] 브라우저 Console에서 실제 `redirectUri` 값 확인 완료
- [ ] Google Cloud Console에 **정확히 동일한** URI 등록 완료
- [ ] `https://` 사용 (http가 아님)
- [ ] 슬래시(`/`) 위치 정확히 확인
- [ ] 대소문자 정확히 일치
- [ ] 저장 후 1-5분 대기 완료
- [ ] 브라우저 캐시 삭제 또는 시크릿 모드로 테스트

## 🐛 여전히 문제가 있다면

### 확인 사항

1. **Console에서 실제 redirect_uri 값이 무엇인가요?**
   - 이 값을 알려주시면 정확히 안내할 수 있습니다

2. **Google Cloud Console에 등록한 URI가 정확한가요?**
   - Console에서 확인한 값과 **정확히 일치**해야 합니다
   - 공백, 슬래시, 대소문자 모두 확인

3. **올바른 프로젝트를 사용하고 있나요?**
   - Google Cloud Console에서 올바른 프로젝트를 선택했는지 확인

4. **올바른 클라이언트 ID를 사용하고 있나요?**
   - GitHub Secrets에 등록한 `VITE_GOOGLE_CLIENT_ID`가
   - Google Cloud Console에서 편집한 클라이언트 ID와 일치하는지 확인

### 추가 디버깅

브라우저 Console에서 다음 명령어 실행:

```javascript
console.log('Current origin:', window.location.origin);
console.log('Current pathname:', window.location.pathname);
```

이 값들을 Google Cloud Console에 등록하세요.



