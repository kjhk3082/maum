# 🔐 GitHub Secrets 설정 완전 가이드

## 📍 설정 위치
https://github.com/kjhk3082/maum/settings/secrets/actions

## 🔑 추가할 모든 Secrets

### 1. OpenAI API
```
Name: VITE_OPENAI_API_KEY
Value: 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
```

### 2. 카카오 API
```
Name: VITE_KAKAO_API_KEY
Value: 240138285eefbcd9ab66f4a85efbfbb5
```

### 3. Firebase 클라이언트 설정
```
Name: VITE_FIREBASE_API_KEY
Value: AIzaSyB9vHmOfRRe_deSWKMEIQEtDbXoUaDnJmQ

Name: VITE_FIREBASE_AUTH_DOMAIN  
Value: maumilgi-1a4cb.firebaseapp.com

Name: VITE_FIREBASE_PROJECT_ID
Value: maumilgi-1a4cb

Name: VITE_FIREBASE_STORAGE_BUCKET
Value: maumilgi-1a4cb.firebasestorage.app

Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 43173390015

Name: VITE_FIREBASE_APP_ID
Value: 1:43173390015:web:c93ba810fcb0972616880a

Name: VITE_FIREBASE_MEASUREMENT_ID
Value: G-3KXTHTNKPC
```

### 4. Firebase 서비스 계정 (배포용)
```
Name: FIREBASE_SERVICE_ACCOUNT
Value: {Firebase Console에서 다운로드한 JSON 파일 전체 내용}
```

## 🔥 Firebase 서비스 계정 키 생성 단계

1. https://console.firebase.google.com 접속
2. maumilgi-1a4cb 프로젝트 선택
3. 프로젝트 설정 → 서비스 계정 탭
4. "새 비공개 키 생성" 클릭
5. JSON 파일 다운로드
6. 전체 JSON 내용을 FIREBASE_SERVICE_ACCOUNT에 추가

## ⚠️ 주의사항

- 서비스 계정 JSON은 절대 공개하면 안됨
- GitHub Secrets에만 저장
- 로컬 파일은 삭제 권장

## ✅ 설정 완료 후

1. git push 실행
2. GitHub Actions 탭에서 배포 진행 확인
3. Firebase Hosting URL에서 사이트 확인 