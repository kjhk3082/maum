# 마음일기 프로젝트 코드 리뷰

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [핵심 기능 구현](#핵심-기능-구현)
3. [AI 텍스트 확장 시스템](#ai-텍스트-확장-시스템)
4. [드래그 텍스트 선택 & 하이라이트 시스템](#드래그-텍스트-선택--하이라이트-시스템)
5. [Firebase 인증 & 데이터베이스](#firebase-인증--데이터베이스)
6. [이미지 업로드 & 관리](#이미지-업로드--관리)
7. [UI/UX 개선사항](#uiux-개선사항)

---

## 🎯 프로젝트 개요

**마음일기**는 React + Firebase 기반의 현대적인 일기 웹 애플리케이션입니다.

### 기술 스택
- **Frontend**: React 19.1.0 + Vite, Tailwind CSS
- **Backend**: Firebase Firestore, Firebase Auth, Firebase Storage
- **AI**: OpenAI GPT-4o-mini API
- **배포**: GitHub Actions + Firebase Hosting

### 주요 특징
- 📅 캘린더 기반 일기 관리
- 🤖 AI 기반 텍스트 확장 기능
- 🖼️ 텍스트-이미지 연결 하이라이트 시스템
- 🔐 Google 소셜 로그인
- 📱 반응형 디자인

---

## 🚀 핵심 기능 구현

### 1. AI 텍스트 확장 시스템

#### 📁 파일: `frontend/src/services/openaiService.js`

```javascript
// OpenAI API 서비스 - 핵심 구조
export const openaiService = {
  async expandTextToDiary(textToExpand, emotion, customPrompt = null) {
    try {
      // 1. API 키 확인 - 실제 API vs 데모 모드
      if (OPENAI_API_KEY && OPENAI_API_KEY !== 'demo-mode') {
        return this.callRealAPI(textToExpand, emotion, customPrompt)
      } else {
        return this.getDemoExpansion(textToExpand, emotion)
      }
    } catch (error) {
      // 오류 시 데모 응답으로 폴백
      return this.getDemoExpansion(textToExpand, emotion)
    }
  }
}
```

**🔍 구현 포인트:**
1. **이중 안전망**: 실제 API 실패 시 데모 모드로 자동 전환
2. **매개변수 단순화**: `context` 객체 → 개별 매개변수로 변경하여 "Object Object" 오류 해결
3. **감정 기반 프롬프트**: 사용자 감정에 따른 맞춤형 텍스트 생성

#### 실제 API 호출 구조:

```javascript
async callRealAPI(textToExpand, emotion, customPrompt) {
  const systemPrompt = `당신은 일기 작성 전문가입니다. 
  사용자가 선택한 키워드나 문장을 자연스럽고 개성 있는 일기 문장으로 변환해주세요.
  
  ## 핵심 원칙:
  1. 개인적이고 진솔한 톤
  2. 구체적인 표현 (뻔한 표현 금지)
  3. 감각적 묘사 활용
  4. 30-80자 사이의 자연스러운 문장`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',  // 비용 효율적인 모델 선택
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 150,
      temperature: 0.7  // 창의성과 일관성의 균형
    })
  })
}
```

### 2. 드래그 텍스트 선택 & 하이라이트 시스템

#### 📁 파일: `frontend/src/components/DiaryWrite.jsx`

이 시스템은 사용자가 일기 내용에서 텍스트를 드래그하면 실시간으로 감지하고, 해당 텍스트에 이미지를 연결하거나 AI로 확장할 수 있게 해주는 핵심 기능입니다.

#### 텍스트 선택 감지 (이중 체크 시스템):

```javascript
const handleTextSelection = () => {
  console.log('🎯 handleTextSelection 호출됨')
  const contentTextarea = document.querySelector('#diary-content-textarea')
  
  // 방법 1: textarea에서 직접 선택 정보 가져오기
  if (contentTextarea && document.activeElement === contentTextarea) {
    const start = contentTextarea.selectionStart
    const end = contentTextarea.selectionEnd
    const selectedText = contentTextarea.value.substring(start, end).trim()
    
    if (selectedText && selectedText.length > 0) {
      console.log('✅ textarea에서 텍스트 선택됨:', selectedText)
      
      const textInfo = {
        text: selectedText,
        startOffset: start,
        endOffset: end,
        position: { top: 0, left: 0, width: 0, height: 0 }
      }
      
      setSelectedTextInfo(textInfo)
      setSelectedText(selectedText)
      return
    }
  }
  
  // 방법 2: window.getSelection() 백업 방법
  const selection = window.getSelection()
  const selectedText = selection.toString().trim()
  
  if (selectedText && selectedText.length > 0) {
    const range = selection.getRangeAt(0)
    
    // 더 정확한 범위 검증
    const isInTextarea = contentTextarea && (
      contentTextarea.contains(range.commonAncestorContainer) ||
      contentTextarea === range.commonAncestorContainer ||
      contentTextarea.contains(range.startContainer) ||
      contentTextarea.contains(range.endContainer)
    )
    
    if (isInTextarea) {
      // 선택된 텍스트 정보 저장 및 하이라이트 적용
      const textInfo = { /* ... */ }
      setSelectedTextInfo(textInfo)
      highlightSelectedText(range)  // 노란색 하이라이트 적용
    }
  }
}
```

**🔍 구현 포인트:**
1. **이중 체크 시스템**: textarea API + window.getSelection() 병행
2. **정확한 범위 검증**: startContainer, endContainer 모두 확인
3. **실시간 피드백**: 선택 즉시 노란색 하이라이트 표시

#### 이벤트 리스너 다중 등록:

```javascript
// textarea에 직접 이벤트 등록
<textarea
  onMouseUp={handleTextSelection}
  onKeyUp={handleTextSelection}
  onSelect={handleTextSelection}
  onSelectionChange={handleTextSelection}
/>

// document 레벨 이벤트 등록 (useEffect 내부)
useEffect(() => {
  const handleDocumentSelectionChange = () => {
    setTimeout(handleTextSelection, 10) // 약간의 지연으로 정확한 상태 확인
  }
  
  document.addEventListener('selectionchange', handleDocumentSelectionChange)
  return () => document.removeEventListener('selectionchange', handleDocumentSelectionChange)
}, [])
```

#### 하이라이트 적용 시스템:

```javascript
const highlightSelectedText = (range) => {
  try {
    removeTemporaryHighlight() // 기존 하이라이트 제거
    
    const span = document.createElement('span')
    span.className = 'temp-highlight'
    span.style.backgroundColor = 'rgba(255, 255, 0, 0.6)'
    span.style.borderRadius = '3px'
    span.style.padding = '1px 2px'
    
    try {
      range.surroundContents(span)  // 선택 영역을 span으로 감싸기
    } catch (e) {
      // 복잡한 선택의 경우 대체 방법 사용
      const contents = range.extractContents()
      span.appendChild(contents)
      range.insertNode(span)
    }
  } catch (error) {
    console.log('하이라이트 적용 실패:', error)
  }
}
```

### 3. 텍스트-이미지 연결 시스템

#### 하이라이트 생성 및 관리:

```javascript
const addImageToHighlight = (images, textInfo) => {
  const newHighlight = {
    id: Date.now(),
    text: textInfo.text,
    images: images,
    createdAt: new Date().toISOString()
  }

  // 기존 하이라이트 중 같은 텍스트가 있는지 확인
  const existingIndex = highlightedTexts.findIndex(h => h.text === textInfo.text)
  
  if (existingIndex >= 0) {
    // 기존 하이라이트에 이미지 추가
    const updatedHighlights = [...highlightedTexts]
    updatedHighlights[existingIndex] = {
      ...updatedHighlights[existingIndex],
      images: [...(updatedHighlights[existingIndex].images || []), ...images]
    }
    setHighlightedTexts(updatedHighlights)
  } else {
    // 새 하이라이트 추가
    setHighlightedTexts(prev => [...prev, newHighlight])
  }
}
```

#### 하이라이트 렌더링 (마커 시스템):

```javascript
const renderContentWithHighlights = (content) => {
  if (!highlightedTexts || highlightedTexts.length === 0) {
    return content
  }

  let processedContent = content
  const highlights = []

  // 1단계: 하이라이트된 텍스트들을 고유 마커로 대체
  highlightedTexts.forEach((highlight, index) => {
    const marker = `__HIGHLIGHT_${index}__`
    processedContent = processedContent.replace(
      new RegExp(highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      marker
    )
    highlights.push({ marker, highlight, index })
  })

  // 2단계: 마커를 실제 하이라이트 요소로 변환
  const parts = processedContent.split(/(__HIGHLIGHT_\d+__)/g)
  
  return parts.map((part, partIndex) => {
    const highlightMatch = highlights.find(h => h.marker === part)
    
    if (highlightMatch) {
      const { highlight } = highlightMatch
      return (
        <span
          key={partIndex}
          onClick={() => handleHighlightClick(highlight)}
          style={{
            backgroundColor: 'rgba(255, 215, 0, 0.5)',
            padding: '3px 6px',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {highlight.text}
          {highlight.images && highlight.images.length > 0 && (
            <span>📷{highlight.images.length}</span>
          )}
        </span>
      )
    }
    return part
  })
}
```

**🔍 구현 포인트:**
1. **마커 시스템**: 정규식 충돌 방지를 위한 임시 마커 사용
2. **중복 방지**: 같은 텍스트에 여러 이미지 추가 가능
3. **시각적 피드백**: 이미지 개수 표시, 호버 효과

### 4. Firebase 인증 시스템

#### 📁 파일: `frontend/src/firebase/authService.js`

```javascript
// Google 로그인 구현
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    
    // Firestore에 사용자 정보 저장
    const userData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || '사용자',
      profileImage: user.photoURL,
      loginType: 'google',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }
    
    await setDoc(doc(db, 'users', user.uid), userData, { merge: true })
    
    return { success: true, user: userData }
  } catch (error) {
    console.error('Google 로그인 오류:', error)
    return { success: false, error: error.message }
  }
}
```

#### 인증 상태 관리:

```javascript
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // Firestore에서 사용자 정보 조회
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        
        if (userDoc.exists()) {
          const userData = userDoc.data()
          
          // Google 로그인 사용자만 인정
          if (userData.loginType === 'google' && userData.kakaoId) {
            callback(userData)
          } else {
            console.log('❌ Google 로그인 사용자가 아님')
            callback(null)
          }
        } else {
          console.log('❌ 사용자 문서가 존재하지 않음')
          callback(null)
        }
      } catch (error) {
        console.error('❌ 사용자 정보 조회 실패:', error)
        callback(null)
      }
    } else {
      callback(null)
    }
  })
}
```

### 5. 이미지 업로드 & 압축 시스템

#### 📁 파일: `frontend/src/services/imageService.js`

```javascript
export const uploadCompressedImage = async (file, folder, maxWidth = 1200, quality = 0.8) => {
  try {
    // 1단계: 이미지 압축
    const compressedFile = await compressImage(file, maxWidth, quality)
    
    // 2단계: Firebase Storage 업로드
    const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
    const path = `${folder}/${filename}`
    const storageRef = ref(storage, path)
    
    const uploadTask = uploadBytesResumable(storageRef, compressedFile)
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // 업로드 진행률 계산
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log(`업로드 진행률: ${progress}%`)
        },
        (error) => reject({ success: false, error: error.message }),
        async () => {
          // 업로드 완료 시 다운로드 URL 획득
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve({
            success: true,
            data: {
              url: downloadURL,
              filename,
              path,
              size: compressedFile.size
            }
          })
        }
      )
    })
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

#### 이미지 압축 알고리즘:

```javascript
const compressImage = (file, maxWidth, quality) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // 비율 유지하며 크기 조정
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      
      // 고품질 리샘플링
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      // Blob으로 변환
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}
```

### 6. UI/UX 개선사항

#### 반응형 디자인 시스템:

```javascript
// 모바일 감지
const checkMobile = () => {
  return window.innerWidth <= 768 || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 동적 스타일 적용
const dynamicStyles = {
  container: {
    padding: isMobile ? '16px' : '32px',
    maxWidth: isMobile ? '100%' : '1200px'
  },
  button: {
    fontSize: isMobile ? '14px' : '16px',
    padding: isMobile ? '12px 20px' : '20px 28px'
  }
}
```

#### 다크모드 지원:

```javascript
const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('darkMode', JSON.stringify(newMode))
  }

  return { isDarkMode, toggleTheme }
}
```

#### 알림 시스템:

```javascript
const showNotification = (type, title, message = '', details = '', duration = 5000) => {
  setNotification({
    show: true,
    type,     // 'success', 'error', 'warning', 'info'
    title,
    message,
    details
  })

  // 자동 숨김
  setTimeout(() => {
    setNotification(prev => ({ ...prev, show: false }))
  }, duration)
}
```

---

## 🎨 아키텍처 특징

### 1. 컴포넌트 구조
```
App.jsx (메인 라우터)
├── Login.jsx (인증)
├── CalendarModern.jsx (메인 캘린더)
├── DiaryWrite.jsx (일기 작성/수정)
├── DiaryView.jsx (일기 보기)
├── MyPage.jsx (마이페이지)
└── Navbar.jsx (네비게이션)
```

### 2. 서비스 레이어
```
services/
├── openaiService.js (AI 텍스트 처리)
├── imageService.js (이미지 업로드/압축)
├── notificationService.js (푸시 알림)
└── kakaoService.js (카카오 API - 사용 중지)

firebase/
├── authService.js (인증)
├── diaryService.js (일기 CRUD)
├── storageService.js (파일 저장)
└── config.js (Firebase 설정)
```

### 3. 상태 관리
- **React useState/useEffect**: 컴포넌트 로컬 상태
- **Context API**: 테마, 사용자 정보 전역 상태
- **localStorage**: 테마 설정, 임시 데이터
- **Firebase Realtime**: 인증 상태, 데이터베이스

---

## 🔧 성능 최적화

### 1. 이미지 최적화
- **압축**: 1200px 최대 크기, 80% 품질
- **지연 로딩**: React.lazy() 사용
- **캐싱**: Firebase CDN 활용

### 2. 코드 분할
```javascript
// 라우트 기반 코드 분할
const DiaryWrite = lazy(() => import('./components/DiaryWrite'))
const MyPage = lazy(() => import('./components/MyPage'))

// Suspense로 로딩 처리
<Suspense fallback={<div>로딩 중...</div>}>
  <DiaryWrite />
</Suspense>
```

### 3. API 최적화
- **디바운싱**: 텍스트 선택 이벤트
- **캐싱**: OpenAI 응답 로컬 저장
- **에러 핸들링**: 자동 재시도 및 폴백

---

## 🚀 배포 및 CI/CD

### GitHub Actions 워크플로우:
```yaml
name: Deploy to Firebase Hosting
on:
  push:
    branches: [ main ]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Build
        run: |
          cd frontend
          npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: maumilgi-1a4cb
```

---

## 📈 향후 개선 계획

### 1. 기능 확장
- [ ] 일기 검색 및 필터링
- [ ] 감정 분석 차트
- [ ] 일기 공유 기능
- [ ] PWA 지원

### 2. 성능 개선
- [ ] Service Worker 캐싱
- [ ] 이미지 WebP 변환
- [ ] 데이터베이스 쿼리 최적화

### 3. 사용자 경험
- [ ] 음성 입력 지원
- [ ] 자동 저장 기능
- [ ] 오프라인 모드

---

## 🎯 결론

이 프로젝트는 현대적인 웹 개발 기술을 활용하여 사용자 친화적인 일기 애플리케이션을 구현했습니다. 특히 AI 기반 텍스트 확장과 혁신적인 텍스트-이미지 연결 시스템이 핵심 차별화 요소입니다.

**주요 성과:**
- ✅ 완전한 CRUD 기능 구현
- ✅ AI 기반 스마트 기능 통합
- ✅ 현대적이고 직관적인 UI/UX
- ✅ 안정적인 Firebase 백엔드
- ✅ 자동화된 CI/CD 파이프라인

이 코드베이스는 확장 가능하고 유지보수가 용이한 구조로 설계되어, 향후 추가 기능 개발에도 유연하게 대응할 수 있습니다. 