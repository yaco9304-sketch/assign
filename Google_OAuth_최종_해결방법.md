# Google OAuth redirect_uri_mismatch 최종 해결 방법

## 🔴 확인된 정보

**에러 URL에서 확인한 클라이언트 ID:**
```
179482574440-uj4h62t9pit8go2udlnieq6ifb67gms6.apps.googleusercontent.com
```

**실제 사용되는 redirect_uri:**
```
https://yaco9304-sketch.github.io
```

## ✅ 해결 단계

### 1단계: 올바른 클라이언트 ID 확인

**중요:** 에러 URL에서 확인한 클라이언트 ID가 Google Cloud Console에서 편집 중인 클라이언트 ID와 **정확히 일치**해야 합니다!

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/

2. **APIs & Services → Credentials**

3. **OAuth 2.0 클라이언트 ID 목록에서 다음 클라이언트 ID 찾기:**
   ```
   179482574440-uj4h62t9pit8go2udlnieq6ifb67gms6.apps.googleusercontent.com
   ```

4. **이 클라이언트 ID를 클릭하여 편집**

### 2단계: 승인된 리디렉션 URI 확인 및 수정

**"승인된 리디렉션 URI"** 섹션에 다음이 **정확히** 등록되어 있는지 확인:

```
https://yaco9304-sketch.github.io
```

**⚠️ 중요 체크리스트:**
- [ ] `https://` (http가 아님)
- [ ] 슬래시(`/`) 없음 - `https://yaco9304-sketch.github.io` (O) / `https://yaco9304-sketch.github.io/` (X)
- [ ] 대소문자 정확히 일치
- [ ] 공백 없음
- [ ] 오타 없음

### 3단계: URI 7번 처리

URI 7번이 비어있으면:
- **방법 1:** URI 7번 삭제 (권장)
- **방법 2:** URI 7번에 `https://yaco9304-sketch.github.io/` 입력

### 4단계: 저장 및 확인

1. **"저장" 또는 "Save" 버튼 클릭**
2. **저장 완료 메시지 확인**
3. **페이지 새로고침하여 변경사항이 저장되었는지 확인**

### 5단계: 변경사항 적용 대기

1. **최소 5분 대기** (Google 서버에 변경사항 반영 시간)
2. **브라우저 완전히 종료 후 재시작** (캐시 완전 삭제)
3. **또는 시크릿 모드로 테스트**

### 6단계: GitHub Secrets 확인

GitHub Secrets에 등록된 클라이언트 ID가 올바른지 확인:

1. **GitHub 리포지토리 → Settings → Secrets and variables → Actions**

2. **`VITE_GOOGLE_CLIENT_ID` Secret 확인**
   - 값이 `179482574440-uj4h62t9pit8go2udlnieq6ifb67gms6.apps.googleusercontent.com`와 일치하는지 확인

3. **일치하지 않으면:**
   - Google Cloud Console에서 올바른 클라이언트 ID 확인
   - GitHub Secrets 업데이트
   - 워크플로우 재실행 (코드 푸시)

## 🐛 여전히 문제가 있다면

### 확인 사항

1. **클라이언트 ID 일치 확인**
   - 에러 URL의 client_id: `179482574440-uj4h62t9pit8go2udlnieq6ifb67gms6.apps.googleusercontent.com`
   - Google Cloud Console에서 편집 중인 클라이언트 ID와 일치하는가?
   - GitHub Secrets의 `VITE_GOOGLE_CLIENT_ID`와 일치하는가?

2. **URI 정확성 확인**
   - Google Cloud Console에 등록된 URI: `https://yaco9304-sketch.github.io`
   - 실제 사용되는 URI: `https://yaco9304-sketch.github.io`
   - **정확히 일치해야 함!**

3. **저장 확인**
   - Google Cloud Console에서 "저장" 버튼을 클릭했는가?
   - 저장 후 페이지를 새로고침하여 변경사항이 유지되는지 확인했는가?

4. **시간 대기**
   - 저장 후 최소 5분 이상 기다렸는가?
   - Google 서버에 변경사항이 반영되는데 시간이 걸립니다.

### 추가 디버깅

브라우저 개발자 도구(F12) → Console에서 다음 확인:

```
=== Google OAuth Redirect URI Debug ===
window.location.origin: https://yaco9304-sketch.github.io
Final redirectUri: https://yaco9304-sketch.github.io
```

이 값이 Google Cloud Console에 **정확히** 등록되어 있어야 합니다.

## 📝 최종 체크리스트

- [ ] Google Cloud Console에서 클라이언트 ID `179482574440-uj4h62t9pit8go2udlnieq6ifb67gms6` 찾기
- [ ] "승인된 리디렉션 URI"에 `https://yaco9304-sketch.github.io` 정확히 등록
- [ ] URI 7번 처리 (삭제 또는 채우기)
- [ ] "저장" 버튼 클릭
- [ ] 저장 완료 확인
- [ ] 최소 5분 대기
- [ ] 브라우저 완전히 종료 후 재시작
- [ ] 시크릿 모드로 테스트
- [ ] GitHub Secrets의 클라이언트 ID 확인

## 💡 팁

만약 여전히 문제가 발생한다면:
1. Google Cloud Console에서 **새로운 OAuth 2.0 클라이언트 ID 생성**
2. GitHub Secrets 업데이트
3. 새 클라이언트 ID로 테스트

