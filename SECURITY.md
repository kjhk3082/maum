# 🛡️ 보안 가이드라인

## 🚨 중요한 보안 설정

### **환경변수 설정**

`.env.local` 파일을 생성하고 다음 환경변수들을 설정하세요:

```env
# OpenAI API 설정
VITE_OPENAI_API_KEY=sk-proj-your-openai-api-key

# 카카오 로그인 설정 (JavaScript 키)
VITE_KAKAO_API_KEY=your-kakao-javascript-key

# Firebase 설정
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### **⚠️ 주의사항**

1. **절대 하드코딩 금지**: API 키를 코드에 직접 넣지 마세요
2. **환경변수 파일 Git 제외**: `.env.local` 파일은 절대 Git에 커밋하지 마세요
3. **키 로테이션**: 주기적으로 API 키를 교체하세요
4. **최소 권한 원칙**: 필요한 최소한의 권한만 부여하세요

### **Firebase 보안 규칙**

`firestore.rules` 파일에 다음 규칙을 적용하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 일기 컬렉션: 본인만 접근 가능
    match /diaries/{diaryId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // 사용자 컬렉션: 본인만 접근 가능
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

### **배포 시 주의사항**

1. **GitHub Secrets 사용**: 환경변수를 GitHub Secrets에 저장
2. **도메인 제한**: Firebase, 카카오 설정에서 도메인 제한
3. **HTTPS 사용**: 반드시 HTTPS로 배포
4. **API 키 모니터링**: 사용량 및 비정상 접근 모니터링

## 🔥 즉시 해야 할 조치

### **1. API 키 재발급**
현재 노출된 API 키들을 모두 재발급하세요:

- **Firebase**: Firebase Console > 프로젝트 설정 > 웹 앱 > 키 재생성
- **카카오**: 카카오 개발자 콘솔 > 앱 설정 > 앱 키 > 재생성
- **OpenAI**: OpenAI Platform > API Keys > 새 키 생성

### **2. 환경변수 설정**
```bash
# 1. 환경변수 파일 생성
cp .env.example .env.local

# 2. 새로운 API 키들로 수정
nano .env.local

# 3. Git에서 제외 확인
echo ".env.local" >> .gitignore
```

### **3. Firestore 보안 규칙 배포**
```bash
# Firebase CLI로 보안 규칙 배포
firebase deploy --only firestore:rules
```

### **4. 도메인 제한 설정**

**Firebase 콘솔**:
- Authentication > Settings > Authorized domains
- 배포 도메인만 추가 (localhost 제거)

**카카오 개발자 콘솔**:
- 앱 설정 > 플랫폼 > Web
- 사이트 도메인에 배포 도메인만 추가

## 📊 보안 체크리스트

- [ ] 하드코딩된 API 키 모두 제거
- [ ] 환경변수 파일 설정 완료
- [ ] Firestore 보안 규칙 적용
- [ ] 새로운 API 키 발급 완료
- [ ] 도메인 제한 설정 완료
- [ ] GitHub Secrets 설정 완료
- [ ] HTTPS 배포 확인
- [ ] API 사용량 모니터링 설정

## 🆘 보안 사고 대응

### **API 키 유출 시**
1. **즉시 키 비활성화**
2. **새 키 발급 및 교체**
3. **사용량 및 로그 점검**
4. **피해 범위 파악**
5. **재발 방지 대책 수립**

### **데이터 유출 시**
1. **즉시 접근 차단**
2. **영향받은 사용자 파악**
3. **데이터 무결성 검증**
4. **사용자 알림 및 조치**
5. **보안 강화 조치**

---

**⚠️ 이 가이드라인을 반드시 따라서 보안 사고를 예방하세요!** 