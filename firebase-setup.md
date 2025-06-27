# 🔥 Firebase 서비스 계정 설정 가이드

## 1. Firebase Console 접속
- https://console.firebase.google.com
- 프로젝트 선택

## 2. 서비스 계정 키 생성
1. **프로젝트 설정** (톱니바퀴 아이콘) 클릭
2. **서비스 계정** 탭 클릭  
3. **새 비공개 키 생성** 클릭
4. **키 생성** 클릭 → JSON 파일 다운로드

## 3. GitHub Secret에 추가
- 다운로드된 JSON 파일 내용 전체를 복사
- GitHub → Settings → Secrets → Actions
- **FIREBASE_SERVICE_ACCOUNT** 이름으로 추가

## 4. Firebase 프로젝트 ID 확인
- Firebase Console → 프로젝트 설정 → 일반
- **프로젝트 ID** 복사 → **VITE_FIREBASE_PROJECT_ID**로 추가

## 5. 기타 Firebase 설정
```json
{
  "apiKey": "your-api-key",
  "authDomain": "your-project.firebaseapp.com", 
  "projectId": "your-project-id",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "your-app-id"
}
```

각 값을 GitHub Secrets에 개별적으로 추가 