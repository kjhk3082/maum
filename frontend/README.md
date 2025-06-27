# maum - 일기장 프론트엔드 (Demo Mode)

maumilgi - 캘린더 기반 일기 작성 웹 애플리케이션의 프론트엔드입니다. 현재 **데모 모드**로 구성되어 백엔드 없이 독립적으로 실행 가능합니다.

## 🎯 현재 상태 (Frontend-Only Demo)

이 프론트엔드는 완전히 독립적으로 실행되며 모든 데이터는 브라우저의 localStorage에 저장됩니다.

### 🌟 데모에서 사용 가능한 기능
- ✅ 캘린더 기반 일기 조회 및 작성
- ✅ 과거 날짜 일기 작성 및 수정
- ✅ 18:00-24:00 시간 제한 (오늘 일기만)
- ✅ 감정 선택 (😊😢😠😴😰)
- ✅ 일기 검색 (키워드 + 감정 필터)
- ✅ AI 작성 도움 (데모용 간단 제안)
- ✅ 이미지 첨부 (UI만, 실제 업로드 없음)
- ✅ 애플 스타일 모던 UI

### 📝 미리 로드된 데모 데이터
- 2025년 6월 1일: "새로운 시작"
- 2025년 6월 10일: "맛있는 하루"  
- 2025년 6월 15일: "우울한 하루"

## 🛠 기술 스택
- React 18 + Vite
- Tailwind CSS
- React Router DOM
- Lucide React Icons

## 🚀 실행 방법

### 필수 요구사항
- Node.js 18+ 
- npm 또는 yarn

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 🔄 백엔드 연동 준비

모든 백엔드 API 호출 코드가 주석으로 보존되어 있어 쉽게 복원 가능합니다.

### 백엔드 연동 시 할 일:
1. `src/services/api.js`에서 API 주석 해제
2. 각 컴포넌트에서 주석된 API 호출 코드 활성화:
   - `CalendarModern.jsx`
   - `DiaryWrite.jsx` 
   - `DiarySearch.jsx`
3. localStorage 기반 로직을 API 호출로 교체

### 백엔드 API 엔드포인트 (예상)
```javascript
// 주석 해제하여 사용할 API들
diaryAPI.getDiary(date)           // 특정 날짜 일기 조회
diaryAPI.createDiary(data)        // 일기 생성  
diaryAPI.updateDiary(date, data)  // 일기 수정
diaryAPI.deleteDiary(date)        // 일기 삭제
diaryAPI.searchDiaries(keyword)   // 키워드 검색
diaryAPI.searchByEmotion(emotion) // 감정별 검색
diaryAPI.checkWritableTime(date)  // 작성 가능 시간 체크
```

## 📁 프로젝트 구조
```
src/
├── components/
│   ├── CalendarModern.jsx    # 메인 캘린더 화면
│   ├── DiaryWrite.jsx        # 일기 작성/수정
│   ├── DiaryView.jsx         # 일기 조회
│   └── DiarySearch.jsx       # 일기 검색
├── services/
│   └── api.js               # API 호출 설정 (주석 처리)
└── App.jsx                  # 라우팅 설정
```

## 🎨 UI/UX 특징
- 애플 스타일 현대적 디자인
- 글래스모피즘 효과
- 반응형 레이아웃
- 부드러운 애니메이션
- 직관적인 날짜 네비게이션

## 🔮 향후 계획
1. Spring Boot 백엔드 연동
2. JWT 인증 시스템
3. 카카오 OAuth 로그인
4. AWS S3 이미지 업로드
5. 실제 AI 작성 도움 (GPT-4)
6. PostgreSQL 데이터 저장

## 📝 참고사항
- 현재는 완전한 클라이언트 사이드 애플리케이션
- 브라우저를 새로고침해도 데이터 유지 (localStorage)
- 미래 날짜 작성 제한 적용
- 오늘 일기는 18:00-24:00만 작성 가능
