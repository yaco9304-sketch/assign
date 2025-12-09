const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 데스크톱 앱 빌드 시작...\n');

// 1. 프론트엔드 빌드
console.log('1️⃣ 프론트엔드 빌드 중...');
try {
  execSync('npm run build', { 
    cwd: path.join(__dirname, '..', 'frontend'),
    stdio: 'inherit'
  });
  console.log('✅ 프론트엔드 빌드 완료\n');
} catch (error) {
  console.error('❌ 프론트엔드 빌드 실패:', error.message);
  process.exit(1);
}

// 2. 빌드된 파일을 renderer 디렉토리로 복사
console.log('2️⃣ 빌드 파일 복사 중...');
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const rendererDir = path.join(__dirname, 'renderer');

// renderer 디렉토리 생성
if (!fs.existsSync(rendererDir)) {
  fs.mkdirSync(rendererDir, { recursive: true });
}

// 파일 복사 함수
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// dist 폴더 내용을 renderer로 복사
if (fs.existsSync(frontendDist)) {
  // 기존 renderer 내용 삭제
  if (fs.existsSync(rendererDir)) {
    fs.rmSync(rendererDir, { recursive: true, force: true });
  }
  fs.mkdirSync(rendererDir, { recursive: true });
  
  // 복사
  copyRecursiveSync(frontendDist, rendererDir);
  console.log('✅ 파일 복사 완료\n');
} else {
  console.error('❌ frontend/dist 디렉토리를 찾을 수 없습니다.');
  process.exit(1);
}

// 3. Electron 빌드
console.log('3️⃣ Electron 앱 빌드 중...');
try {
  execSync('npm run build', { 
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('✅ Electron 빌드 완료\n');
} catch (error) {
  console.error('❌ Electron 빌드 실패:', error.message);
  process.exit(1);
}

console.log('🎉 모든 빌드 완료!');
console.log('📦 실행 파일 위치: desktop-app/dist/');


