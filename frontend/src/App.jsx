import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import CalendarModern from './components/CalendarModern'
import DiaryWrite from './components/DiaryWrite'
import DiaryView from './components/DiaryView'
import DiarySearch from './components/DiarySearch'
import StatsPage from './components/StatsPage'
import FAQ from './components/FAQ'
import Login from './components/Login'
import KakaoCallback from './components/KakaoCallback'
import { onAuthStateChange, getCurrentUser } from './firebase/authService'
import './App.css'

// 다크모드 컨텍스트
export const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  // 다크모드 초기 설정
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    } else {
      setIsDarkMode(prefersDark)
    }
  }, [])

  // 다크모드 토글
  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    
    // 문서 클래스 변경
    if (newTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 다크모드 클래스 적용
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Firebase 인증 상태 리스너
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user)
      setIsLoggedIn(!!user)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // 앱 초기화 시 더미 데이터 정리 (한 번만 실행)
  useEffect(() => {
    const cleanupDummyData = () => {
      const dummyDataCleared = localStorage.getItem('dummyDataCleared')
      if (!dummyDataCleared) {
        const existingData = JSON.parse(localStorage.getItem('diaryEntries') || '{}')
        const dummyTitles = [
          '새로운 시작', '조금 힘든 하루', '돌파구를 찾다', '평온한 일상', 
          '성취감', '좋은 하루', '새로운 프로젝트 시작', '평온한 하루', 
          '친구들과의 시간', '동마구를 찾다'
        ]
        
        // 더미 데이터 제거
        const cleanedData = {}
        Object.entries(existingData).forEach(([date, diary]) => {
          if (!dummyTitles.includes(diary.title)) {
            cleanedData[date] = diary
          }
        })
        
        localStorage.setItem('diaryEntries', JSON.stringify(cleanedData))
        localStorage.setItem('dummyDataCleared', 'true')
        
        const removedCount = Object.keys(existingData).length - Object.keys(cleanedData).length
        if (removedCount > 0) {
          console.log('🧹 더미 데이터 정리 완료:', removedCount, '개 제거')
        }
      }
    }

    cleanupDummyData()
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
  }

  const themeValue = {
    isDarkMode,
    toggleTheme
  }

  // 로딩 중 화면
  if (isLoading) {
    return (
      <ThemeContext.Provider value={themeValue}>
        <div className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              마음일기를 불러오는 중...
            </p>
          </div>
        </div>
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className={`App ${isDarkMode ? 'dark' : 'light'}`}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
            <Route path="/" element={
              isLoggedIn ? (
                <CalendarModern onLogout={handleLogout} user={user} />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } />
            <Route path="/write/:date" element={
              isLoggedIn ? <DiaryWrite user={user} /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/diary/:date" element={
              isLoggedIn ? <DiaryView user={user} /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/search" element={
              isLoggedIn ? <DiarySearch user={user} /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/stats" element={
              isLoggedIn ? <StatsPage user={user} /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </Router>
      </div>
    </ThemeContext.Provider>
  )
}

export default App
