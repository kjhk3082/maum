# 🔐 GitHub Secrets 설정 완전 가이드

## 📍 설정 위치
https://github.com/kjhk3082/maum/settings/secrets/actions

## 🔑 추가할 모든 Secrets

### 1. OpenAI API
```
Name: VITE_

### 2. 카카오 API
```
Name: VITE_KAKAO_API_KEY
Value: 
```

### 3. Firebase 클라이언트 설정
```

## ⚠️ 주의사항

- 서비스 계정 JSON은 절대 공개하면 안됨
- GitHub Secrets에만 저장
- 로컬 파일은 삭제 권장

## ✅ 설정 완료 후

1. git push 실행
2. GitHub Actions 탭에서 배포 진행 확인
3. Firebase Hosting URL에서 사이트 확인 