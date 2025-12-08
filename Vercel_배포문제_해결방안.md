# Vercel 배포 문제 해결 방안

## 🔍 문제 원인

GitHub Status Checks에서 다음 오류 확인:
- **"Vercel - No GitHub account was found matching the commit author email address"**

커밋 작성자 이메일 주소가 GitHub 계정과 일치하지 않아 Vercel 자동 배포가 실패했습니다.

---

## ✅ 해결 방법

### 방법 1: Vercel에서 수동 배포 (가장 빠름, 즉시 해결) ⚡

**단계:**

1. **Vercel 대시보드 접속**
   - https://vercel.com 접속
   - 로그인 (GitHub 계정)

2. **프로젝트 선택**
   - 프로젝트 목록에서 `assign` 선택

3. **Deployments 탭 이동**
   - 상단 메뉴에서 "Deployments" 탭 클릭

4. **수동 배포 실행**
   - **옵션 A**: 첫 번째 배포 항목 클릭 → "Redeploy" 버튼 클릭
   - **옵션 B**: 우측 상단 "Deploy" 버튼 클릭 → "Deploy from GitHub" 선택 → 브랜치 "main" 선택 → "Deploy" 클릭

5. **배포 완료 확인**
   - 배포 상태가 "Building" → "Ready"로 변경되는지 확인
   - 커밋 메시지 `Fix: 학년부장 희망 → 학년부장으로 변경` 확인

**장점:**
- 즉시 해결 가능
- 추가 설정 불필요

---

### 방법 2: Git 이메일 주소 수정 (장기적 해결) 🔧

**단계:**

1. **GitHub 계정 이메일 확인**
   - GitHub → Settings → Emails
   - 사용 중인 이메일 주소 확인

2. **Git 이메일 설정**
   ```bash
   # 전역 설정 (모든 저장소에 적용)
   git config --global user.email "your-github-email@example.com"
   git config --global user.name "Your Name"
   
   # 또는 이 프로젝트에만 적용
   git config user.email "your-github-email@example.com"
   git config user.name "Your Name"
   ```

3. **설정 확인**
   ```bash
   git config user.email
   git config user.name
   ```

4. **새로운 커밋 생성 및 푸시**
   ```bash
   # 작은 변경사항 추가 (예: 주석 추가)
   git add .
   git commit -m "chore: update git config"
   git push origin main
   ```

5. **Vercel 자동 배포 확인**
   - GitHub에서 Status checks가 "success"로 변경되는지 확인
   - Vercel에서 자동 배포가 시작되는지 확인

**장점:**
- 앞으로 모든 커밋이 자동 배포됨
- GitHub와 Vercel 연동이 정상 작동

---

### 방법 3: Vercel 설정 변경 (고급) ⚙️

**단계:**

1. **Vercel 프로젝트 → Settings → Git**
2. **"Ignore Build Step" 확인**
   - 필요시 빌드 스킵 조건 설정
3. **Vercel 웹훅 재설정**
   - GitHub 저장소 → Settings → Webhooks
   - Vercel 웹훅 삭제 후 재생성

**참고:** 이 방법은 권장하지 않습니다. 방법 1 또는 2를 사용하는 것이 좋습니다.

---

## 🎯 추천 순서

1. **즉시 해결**: 방법 1 (Vercel 수동 배포)
2. **장기 해결**: 방법 2 (Git 이메일 설정)

---

## 📝 확인 사항

### Git 이메일이 GitHub 계정과 일치하는지 확인

```bash
# 현재 Git 이메일 확인
git config user.email

# GitHub 계정 이메일과 비교
# GitHub → Settings → Emails에서 확인
```

### GitHub에서 커밋 이메일 확인

1. GitHub 저장소 → Commits
2. 커밋 클릭 → "View commit details"
3. 작성자 이메일 확인

---

## ⚠️ 주의사항

- **이메일 주소는 정확히 일치해야 합니다** (대소문자 구분 없음)
- **GitHub에서 이메일을 비공개로 설정한 경우**, `username@users.noreply.github.com` 형식 사용
- **이미 푸시된 커밋의 이메일은 변경할 수 없습니다** (새 커밋만 영향)

---

## 🚀 빠른 해결 체크리스트

- [ ] Vercel 대시보드 접속
- [ ] 프로젝트 'assign' 선택
- [ ] Deployments 탭 클릭
- [ ] 첫 번째 배포 항목 클릭 또는 "Deploy" 버튼 클릭
- [ ] "Redeploy" 또는 최신 커밋 선택하여 배포
- [ ] 배포 완료 확인 (Ready 상태)
- [ ] 사이트에서 변경사항 확인

---

## 💡 추가 팁

### Git 이메일을 GitHub noreply 이메일로 설정

GitHub에서 이메일을 비공개로 설정한 경우:

```bash
git config --global user.email "yaco9304-sketch@users.noreply.github.com"
```

이메일 형식: `{username}@users.noreply.github.com`

### 이미 푸시된 커밋의 작성자 변경 (고급)

```bash
# 최근 커밋의 작성자 변경
git commit --amend --author="Your Name <your-email@example.com>" --no-edit
git push --force origin main
```

**주의:** `--force` 사용 시 주의 필요

