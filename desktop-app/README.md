# 학년 배정 시스템 - 데스크톱 앱

Electron 기반 데스크톱 애플리케이션입니다.

## 🚀 설치 및 실행

### 개발 모드

1. **의존성 설치**
```bash
cd desktop-app
npm install
```

2. **프론트엔드 개발 서버 실행** (별도 터미널)
```bash
cd ../frontend
npm run dev
```

3. **Electron 앱 실행**
```bash
cd desktop-app
npm run dev
```

### 프로덕션 빌드

#### Windows 실행 파일 생성
```bash
npm run build:win
```
생성 위치: `desktop-app/dist/학년 배정 시스템 Setup 1.0.0.exe`

#### Mac 실행 파일 생성
```bash
npm run build:mac
```
생성 위치: `desktop-app/dist/학년 배정 시스템-1.0.0.dmg`

#### 모든 플랫폼 빌드
```bash
npm run build:all
```

## 📦 배포

빌드된 파일을 배포하려면:

1. **Windows**: `dist/학년 배정 시스템 Setup 1.0.0.exe` 파일 배포
2. **Mac**: `dist/학년 배정 시스템-1.0.0.dmg` 파일 배포

사용자는 이 파일을 다운로드하여 설치하면 됩니다.

## 🔧 설정

### 백엔드 URL 설정

앱이 백엔드 서버에 연결하려면:
- 개발 모드: `http://localhost:8001` (기본값)
- 프로덕션: 환경 변수 또는 설정 파일에서 변경 가능

### 오프라인 모드

완전한 오프라인 지원을 위해서는:
1. 백엔드를 로컬에 포함시키거나
2. SQLite 데이터베이스를 로컬에 저장

## 📱 기능

- ✅ 완전한 오프라인 지원 (백엔드 포함 시)
- ✅ 네이티브 앱처럼 실행
- ✅ 자동 업데이트 (선택사항)
- ✅ 시스템 트레이 지원 (선택사항)

## 🛠️ 개발

### 프로젝트 구조
```
desktop-app/
├── main.js          # Electron 메인 프로세스
├── preload.js       # 보안 브릿지
├── package.json     # 설정 및 의존성
└── assets/          # 아이콘 등 리소스
```

### 프론트엔드 연동

프론트엔드는 `frontend/` 디렉토리에 있고, 빌드된 파일을 `desktop-app/renderer/`에 복사해야 합니다.

빌드 스크립트를 추가하면 자동으로 복사됩니다.




