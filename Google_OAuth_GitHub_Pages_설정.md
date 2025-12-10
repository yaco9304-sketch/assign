# Google OAuth GitHub Pages 설정 가이드

## 🔴 문제: redirect_uri_mismatch 오류

GitHub Pages로 배포한 사이트에서 Google 로그인 시 `400 오류: redirect_uri_mismatch`가 발생합니다.

## ✅ 해결 방법

### 1단계: Google Cloud Console 접속

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택
3. **APIs & Services** → **Credentials** 클릭

### 2단계: OAuth 2.0 클라이언트 ID 편집

1. **OAuth 2.0 클라이언트 ID** 목록에서 사용 중인 클라이언트 ID 클릭
2. 또는 새로 생성한 클라이언트 ID 클릭

### 3단계: 승인된 리디렉션 URI 추가

**"승인된 리디렉션 URI"** 섹션에 다음 URL들을 추가하세요:

```
https://yaco9304-sketch.github.io/assign
https://yaco9304-sketch.github.io/assign/
```

**⚠️ 중요:**
- 슬래시(`/`) 포함 여부에 따라 다르게 인식될 수 있으므로 두 가지 모두 추가하는 것을 권장합니다
- 정확한 URL을 입력해야 합니다 (대소문자 구분)
- `http://`가 아닌 `https://`를 사용해야 합니다

### 4단계: 저장

1. **"저장"** 또는 **"Save"** 버튼 클릭
2. 변경사항이 적용되기까지 몇 분 정도 걸릴 수 있습니다

### 5단계: 테스트

1. GitHub Pages 사이트로 이동: `https://yaco9304-sketch.github.io/assign`
2. Google 로그인 버튼 클릭
3. 정상적으로 로그인되는지 확인

## 📋 추가 확인사항

### 현재 redirect_uri 확인

브라우저 개발자 도구(F12) → Console에서 다음 메시지를 확인하세요:

```
Google Login - isElectron: false, redirectUri: https://yaco9304-sketch.github.io
```

이 값이 Google Cloud Console에 등록된 URI와 정확히 일치해야 합니다.

### 여러 환경 지원

다음과 같이 여러 redirect URI를 등록할 수 있습니다:

```
http://localhost:5173          (로컬 개발)
http://localhost:8001           (로컬 개발 - 다른 포트)
https://yaco9304-sketch.github.io/assign   (GitHub Pages)
https://yaco9304-sketch.github.io/assign/  (GitHub Pages - 슬래시 포함)
```

## 🔧 코드 수정 (선택사항)

만약 redirect_uri가 정확히 일치하지 않는다면, `frontend/src/pages/LoginPage.tsx` 파일을 수정할 수 있습니다:

```typescript
} else {
  // 웹 앱에서는 현재 origin 사용
  redirectUri = window.location.origin;
}
```

이 부분을 다음과 같이 수정하면 base path를 포함할 수 있습니다:

```typescript
} else {
  // GitHub Pages의 경우 base path 제거
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  // /assign/login 같은 경우 /assign까지 포함
  if (pathname.startsWith('/assign')) {
    redirectUri = origin + '/assign';
  } else {
    redirectUri = origin;
  }
}
```

하지만 일반적으로는 `window.location.origin`만 사용하고, Google Cloud Console에 정확한 URL을 등록하는 것이 더 간단합니다.

## ⚠️ 주의사항

1. **변경사항 적용 시간**: Google Cloud Console에서 변경한 내용이 적용되기까지 1-5분 정도 걸릴 수 있습니다.

2. **캐시 문제**: 브라우저 캐시를 지우고 다시 시도해보세요.

3. **정확한 URL**: URL에 오타가 없도록 주의하세요. 특히:
   - `https://` (http가 아님)
   - 대소문자 구분
   - 슬래시(`/`) 위치

4. **테스트**: 변경 후 반드시 실제 사이트에서 테스트하세요.

## 🐛 여전히 문제가 있다면

1. **브라우저 콘솔 확인**: 개발자 도구(F12) → Console에서 redirect_uri 값 확인
2. **Google Cloud Console 확인**: 등록된 URI가 정확한지 다시 확인
3. **시간 대기**: 변경 후 몇 분 기다린 후 다시 시도
4. **캐시 삭제**: 브라우저 캐시 및 쿠키 삭제 후 재시도



