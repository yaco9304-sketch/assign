# Google OAuth "승인된 JavaScript 원본" 설정

## 🔴 문제

`redirect_uri`는 이미 등록되어 있는데도 여전히 `redirect_uri_mismatch` 오류가 발생합니다.

## ✅ 해결 방법

Google OAuth는 **"승인된 JavaScript 원본"**도 설정해야 합니다!

### 1단계: Google Cloud Console 접속

1. https://console.cloud.google.com/ 접속
2. 프로젝트 선택
3. **APIs & Services** → **Credentials** 클릭

### 2단계: OAuth 2.0 클라이언트 ID 편집

1. 클라이언트 ID `179482574440-uj4h62t9pit8go2udlnieq6ifb67gms6` 클릭
2. 편집 모드로 들어가기

### 3단계: "승인된 JavaScript 원본" 확인 및 추가

**"승인된 JavaScript 원본"** 섹션을 찾으세요 (리디렉션 URI 위 또는 아래에 있을 수 있습니다).

다음 URL을 추가하세요:

```
https://yaco9304-sketch.github.io
```

**⚠️ 중요:**
- `https://` 사용 (http가 아님)
- 슬래시(`/`) 없음
- 대소문자 정확히 일치

### 4단계: "승인된 리디렉션 URI" 재확인

"승인된 리디렉션 URI" 섹션에도 다음이 있는지 확인:

```
https://yaco9304-sketch.github.io
```

### 5단계: 저장

1. **"저장" 또는 "Save"** 버튼 클릭
2. 저장 완료 메시지 확인
3. 페이지 새로고침하여 변경사항이 유지되는지 확인

### 6단계: 대기 및 테스트

1. **최소 5-10분 대기** (Google 서버 반영 시간)
2. **브라우저 완전히 종료 후 재시작**
3. **시크릿 모드로 테스트**

## 📋 최종 체크리스트

- [ ] "승인된 JavaScript 원본"에 `https://yaco9304-sketch.github.io` 추가
- [ ] "승인된 리디렉션 URI"에 `https://yaco9304-sketch.github.io` 확인
- [ ] "저장" 버튼 클릭
- [ ] 저장 완료 확인
- [ ] 최소 5-10분 대기
- [ ] 브라우저 완전히 종료 후 재시작
- [ ] 시크릿 모드로 테스트

## 💡 참고

Google OAuth는 두 가지를 모두 설정해야 합니다:
1. **승인된 JavaScript 원본** - JavaScript에서 OAuth를 호출할 수 있는 도메인
2. **승인된 리디렉션 URI** - OAuth 콜백을 받을 수 있는 URI

둘 다 설정되어 있어야 정상 작동합니다!



