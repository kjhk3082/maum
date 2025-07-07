
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  BookOpen,
  LogOut,
  Edit3,
  Check,
  X,
  Camera,
  Palette,
  Moon,
  Sun,
} from 'lucide-react'
import { signOutUser } from '../firebase/authService'
import { getDiaryCount } from '../firebase/diaryService'
import { useTheme } from '../App'

/**
 * MyPage – 사용자 프로필 & 설정 화면 (정사각형 카드 4개 레이아웃)
 * 2025-07-07
 */
function MyPage({ user, onLogout }) {
  const navigate = useNavigate()
  const { isDarkMode, toggleTheme } = useTheme()
  const [diaryCount, setDiaryCount] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.name || '')
  const [loading, setLoading] = useState(false)

  /* ---------------- hooks ---------------- */
  useEffect(() => {
    const fetchDiaryCount = async () => {
      if (user?.uid) {
        const count = await getDiaryCount(user.uid)
        setDiaryCount(count)
      }
    }
    fetchDiaryCount()
  }, [user])

  /* -------------- handlers -------------- */
  const handleLogout = async () => {
    const result = await signOutUser()
    if (result.success) {
      onLogout()
      navigate('/login')
    }
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      // TODO: Firebase profile update
      setIsEditing(false)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '알 수 없음'

  /* ---------- style helpers ---------- */
  const cardBase = {
    padding: '24px',
    borderRadius: '20px',
    aspectRatio: '1',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  }
  const lightCard = {
    background:
      'linear-gradient(145deg,rgba(255,255,255,0.9),rgba(248,250,252,0.7))',
    border: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  }
  const darkCard = {
    background:
      'linear-gradient(145deg,rgba(44,44,46,0.6),rgba(28,28,30,0.8))',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  }
  const cardStyle = isDarkMode ? { ...cardBase, ...darkCard } : { ...cardBase, ...lightCard }

  /* ------------------------------------ */
  return (
    <div
      className='min-h-screen'
      style={{
        background: isDarkMode
          ? 'linear-gradient(to bottom,#1a1a1a 0%,#2d2d2d 100%)'
          : 'linear-gradient(to bottom,#f0f9ff 0%,#e0f2fe 100%)',
      }}
    >
      {/* ============ HEADER ============ */}
      <header
        className='sticky top-0 z-10 backdrop-blur-lg border-b'
        style={{
          background: isDarkMode ? 'rgba(26,26,26,0.8)' : 'rgba(255,255,255,0.8)',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }}
      >
        <div className='max-w-4xl mx-auto flex items-center justify-between px-4 py-4'>
          {/* back btn & title */}
          <div className='flex items-center gap-4'>
            <button
              onClick={() => navigate('/')}
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = isDarkMode
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.1)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = isDarkMode
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.05)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <ArrowLeft size={36} color={isDarkMode ? '#fff' : '#1e293b'} />
            </button>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              마이페이지
            </h1>
          </div>

          {/* theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = isDarkMode
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.1)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = isDarkMode
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.05)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {isDarkMode ? <Sun size={36} color='#fbbf24' /> : <Moon size={36} color='#64748b' />}
          </button>
        </div>
      </header>

      {/* ============ MAIN ============ */}
      {/* ... rest of JSX (same as earlier) */}
    </div>
  )
}

export default MyPage
