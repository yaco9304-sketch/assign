# 백엔드 CORS 설정 가이드

## 🔴 확인된 정보

**백엔드 URL:**
```
https://assign-hfvk.onrender.com
```

**GitHub Pages URL:**
```
https://yaco9304-sketch.github.io
```

## ✅ 해결 방법: Render 백엔드 CORS 설정

### 1단계: Render 대시보드 접속

1. https://dashboard.render.com/ 접속
2. 로그인

### 2단계: 백엔드 서비스 찾기

1. **Services** 섹션에서 백엔드 서비스 찾기
2. 서비스 이름이 `assign-hfvk` 또는 유사한 이름일 것입니다
3. 서비스 클릭

### 3단계: Environment 탭

1. 상단 메뉴에서 **"Environment"** 탭 클릭

### 4단계: ALLOWED_ORIGINS 환경 변수 설정

1. **기존 `ALLOWED_ORIGINS` 변수가 있는지 확인**
   - 있다면 "Edit" 클릭
   - 없다면 "Add Environment Variable" 클릭

2. **변수명:** `ALLOWED_ORIGINS`

3. **값 입력:**
   ```
   http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5175,https://yaco9304-sketch.github.io,https://yaco9304-sketch.github.io/assign
   ```

   **또는 기존 값에 추가:**
   - 기존 값이 있다면: `기존값,https://yaco9304-sketch.github.io,https://yaco9304-sketch.github.io/assign`
   - 쉼표로 구분하여 추가

4. **"Save Changes" 클릭**

### 5단계: 서비스 재시작 확인

1. Render가 자동으로 서비스를 재시작합니다
2. **"Events"** 탭에서 재시작 상태 확인
3. 재시작 완료까지 1-2분 소요

### 6단계: 테스트

1. GitHub Pages 사이트 접속: `https://yaco9304-sketch.github.io/assign`
2. Google 로그인 시도
3. CORS 오류가 해결되었는지 확인

## 📋 권장 ALLOWED_ORIGINS 값

**완전한 설정 값:**

```
http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5175,http://localhost:8001,https://yaco9304-sketch.github.io,https://yaco9304-sketch.github.io/assign
```

**설명:**
- `http://localhost:5173` - 로컬 개발 (Vite 기본 포트)
- `http://localhost:5174,5175` - 추가 개발 포트
- `http://localhost:8001` - 로컬 백엔드 직접 접근
- `https://yaco9304-sketch.github.io` - GitHub Pages 루트
- `https://yaco9304-sketch.github.io/assign` - GitHub Pages 앱 경로

## ⚠️ 주의사항

1. **쉼표로 구분**: 여러 URL은 쉼표(`,`)로 구분합니다
2. **공백 없음**: URL 사이에 공백이 없어야 합니다
3. **프로토콜 포함**: `http://` 또는 `https://`를 포함해야 합니다
4. **슬래시 주의**: 마지막 슬래시(`/`)는 선택사항이지만, 일관되게 사용하는 것을 권장합니다

## 🐛 문제 해결

### CORS 오류가 계속 발생하는 경우

1. **환경 변수 확인**
   - Render 대시보드 → Environment 탭
   - `ALLOWED_ORIGINS` 값이 정확한지 확인

2. **서비스 재시작 확인**
   - Events 탭에서 재시작 완료 확인
   - 재시작이 안 되었다면 수동으로 "Manual Deploy" 클릭

3. **브라우저 캐시 삭제**
   - 개발자 도구 → Application → Clear storage
   - 또는 시크릿 모드로 테스트

4. **네트워크 요청 확인**
   - 개발자 도구 → Network 탭
   - API 요청의 `Origin` 헤더 확인
   - 백엔드 응답의 `Access-Control-Allow-Origin` 헤더 확인

## 🧪 테스트 체크리스트

- [ ] Render 대시보드에서 `ALLOWED_ORIGINS` 환경 변수 설정
- [ ] GitHub Pages URL 포함 확인
- [ ] "Save Changes" 클릭
- [ ] 서비스 재시작 완료 대기 (1-2분)
- [ ] GitHub Pages 사이트에서 Google 로그인 테스트
- [ ] CORS 오류 해결 확인
