import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import CalendarModern from './components/CalendarModern'
import DiaryWrite from './components/DiaryWrite'
import DiaryView from './components/DiaryView'
import DiarySearch from './components/DiarySearch'
import StatsPage from './components/StatsPage'
import FAQ from './components/FAQ'
import Login from './components/Login'
import MyPage from './components/MyPage'
import AdminDashboard from './components/AdminDashboard'
import { onAuthStateChange, initializeAuth } from './firebase/authService'
import './App.css'

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

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    } else {
      setIsDarkMode(prefersDark)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')

    if (newTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    const setupAuth = async () => {
      await initializeAuth()

      const unsubscribe = onAuthStateChange((user) => {
        setUser(user)
        setIsLoggedIn(!!user)
        setIsLoading(false)
      })

      return unsubscribe
    }

    let unsubscribe
    setupAuth().then(unsub => {
      unsubscribe = unsub
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
  }

  const updateUserName = (newName) => {
    setUser((prevUser) => ({
      ...prevUser,
      name: newName
    }))
  }

  const themeValue = {
    isDarkMode,
    toggleTheme
  }

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
            <Route path="/mypage" element={
              isLoggedIn ? <MyPage user={user} onLogout={handleLogout} onUpdateUser={updateUserName} /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </Router>
      </div>
    </ThemeContext.Provider>
  )
}

export default App