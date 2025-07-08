import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, Mail, Calendar, BookOpen, LogOut,
  Edit3, Check, X, Camera, Palette, Moon, Sun
} from 'lucide-react'
import { signOutUser } from '../firebase/authService'
import { getDiaryCount } from '../firebase/diaryService'
import { useTheme } from '../App'

function MyPage({ user, onLogout }) {
  const navigate = useNavigate()
  const { isDarkMode, toggleTheme } = useTheme()
  const [diaryCount, setDiaryCount] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.name || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 일기 개수 가져오기
    const fetchDiaryCount = async () => {
      if (user?.uid) {
        const count = await getDiaryCount(user.uid)
        setDiaryCount(count)
      }
    }
    fetchDiaryCount()
  }, [user])

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
      // TODO: 프로필 업데이트 로직 구현
      console.log('프로필 업데이트:', displayName)
      setIsEditing(false)
    } catch (error) {
      console.error('프로필 업데이트 실패:', error)
    } finally {
      setLoading(false)
    }
  }
  const formatDate = (dateVal) => {
    if (!dateVal) return '알 수 없음'
    const d = typeof dateVal === 'string'
      ? new Date(dateVal)
      : dateVal.toDate ? dateVal.toDate() : new Date(dateVal)
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen" style={{
      background: isDarkMode
        ? 'linear-gradient(to bottom, #1a1a1a 0%, #2d2d2d 100%)'
        : 'linear-gradient(to bottom, #f0f9ff 0%, #e0f2fe 100%)'
    }}>
      {/* 헤더 */}
      <div className="sticky top-0 z-10 backdrop-blur-lg border-b" style={{
        background: isDarkMode
          ? 'rgba(26, 26, 26, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: isDarkMode
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.05)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = isDarkMode
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = isDarkMode
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.05)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <ArrowLeft size={36} color={isDarkMode ? '#ffffff' : '#1e293b'} />
              </button>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                마이페이지
              </h1>
            </div>

            {/* 테마 토글 */}
            <button
              onClick={toggleTheme}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: isDarkMode
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.1)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = isDarkMode
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {isDarkMode ? (
                <Sun size={36} color="#fbbf24" />
              ) : (
                <Moon size={36} color="#64748b" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 프로필 섹션 */}
        <div className="mb-8 p-8 rounded-3xl backdrop-blur-sm shadow-xl" style={{
          background: isDarkMode
            ? 'linear-gradient(145deg, rgba(44, 44, 46, 0.8), rgba(28, 28, 30, 0.9))'
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
          boxShadow: isDarkMode
            ? '0 20px 40px rgba(0, 0, 0, 0.3)'
            : '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: 'linear-gradient(145deg, #17A2B8, #138496)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 24px rgba(23, 162, 184, 0.3)'
              }}>
                <img
                  src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=ffffff&color=17A2B8&size=200`}
                  alt={user?.name}
                  style={{
                    width: '132px',
                    height: '132px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <button
                className="absolute bottom-4 right-4 transition-all duration-200"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #17A2B8, #138496)',
                  color: 'white',
                  border: '4px solid white',
                  boxShadow: '0 12px 24px rgba(23, 162, 184, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)'
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(23, 162, 184, 0.5)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(23, 162, 184, 0.4)'
                }}
              >
                <Camera size={32} />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      background: isDarkMode ? 'rgba(58, 58, 60, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      color: isDarkMode ? '#ffffff' : '#1d1d1f',
                      fontSize: '16px',
                      fontWeight: '600',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#17A2B8'
                      e.target.style.boxShadow = '0 0 0 4px rgba(23, 162, 184, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '16px',
                        background: 'linear-gradient(145deg, #22c55e, #16a34a)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        boxShadow: '0 8px 20px rgba(34, 197, 94, 0.4)'
                      }}
                    >
                      <Check size={32} />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setDisplayName(user?.name || '')
                      }}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '16px',
                        background: 'linear-gradient(145deg, #ef4444, #dc2626)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)'
                      }}
                    >
                      <X size={32} />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">
                    <h2 style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      margin: '0',
                      color: isDarkMode ? '#ffffff' : '#1d1d1f',
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #ffffff, #e2e8f0)'
                        : 'linear-gradient(135deg, #1e293b, #475569)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {user?.name || 'Unknown User'}
                    </h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: isDarkMode
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.05)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = isDarkMode
                          ? 'rgba(255, 255, 255, 0.15)'
                          : 'rgba(0, 0, 0, 0.1)'
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = isDarkMode
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.05)'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      <Edit3 size={28} color={isDarkMode ? '#94a3b8' : '#64748b'} />
                    </button>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    {user?.loginType === 'google' ? (
                      <>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: isDarkMode ? '#94a3b8' : '#64748b'
                        }}>
                          Google 로그인 사용자
                        </span>
                      </>
                    ) : (
                      <>
                        <img
                          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAyMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiNGRkVCMDAiLz4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAyMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiNGRkVCMDAiLz4KPC9zdmc+"
                          alt="Kakao"
                          style={{ width: '32px', height: '32px' }}
                        />
                        <span style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: isDarkMode ? '#94a3b8' : '#64748b'
                        }}>
                          카카오 로그인 사용자
                        </span>
                      </>
                    )}
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: isDarkMode ? '#64748b' : '#94a3b8',
                    margin: '0',
                    fontWeight: '400'
                  }}>
                    {user?.email || '이메일 정보 없음'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ────────── 정보 카드 2×2 ────────── */}
        <div
          className="grid grid-cols-2 gap-6 mb-8"
          style={{ fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif" }}
        >
          {[
            { icon: Mail, color: '#17A2B8', label: '이메일', value: user?.email || '정보 없음' },
            { icon: Calendar, color: '#8B5CF6', label: '가입일', value: formatDate(user?.createdAt) },
            { icon: BookOpen, color: '#06D6A0', label: '작성한 일기', value: `${diaryCount}개` },
            { icon: User, color: '#F59E0B', label: '계정 타입', value: user?.loginType === 'google' ? 'Google' : 'Kakao' }
          ].map(({ icon: Icon, color, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center rounded-2xl shadow-md w-44 h-44 backdrop-blur-md transition-transform duration-200 hover:-translate-y-1"
              style={{
                background: isDarkMode
                  ? 'linear-gradient(145deg, rgba(44,44,46,.6), rgba(28,28,30,.8))'
                  : 'linear-gradient(145deg, rgba(255,255,255,.9), rgba(248,250,252,.7))',
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.05)'}`,
                boxShadow: isDarkMode
                  ? '0 8px 24px rgba(0,0,0,.25)'
                  : '0 8px 24px rgba(0,0,0,.08)'
              }}
            >
              <div
                className="mb-3 flex items-center justify-center rounded-xl"
                style={{
                  width: 56, height: 56,
                  background: `linear-gradient(145deg, ${color}66, ${color})`,
                  boxShadow: `0 6px 16px ${color}55`
                }}
              >
                <Icon size={28} color="white" />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: isDarkMode ? '#e2e8f0' : '#475569' }}
              >
                {label}
              </span>
              <span
                className="text-lg font-semibold"
                style={{ color: isDarkMode ? '#ffffff' : '#1e293b' }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>



        {/* 설정 섹션 */}
        <div className="space-y-6">
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '24px',
            color: isDarkMode ? '#ffffff' : '#1e293b',
            background: isDarkMode
              ? 'linear-gradient(135deg, #ffffff, #e2e8f0)'
              : 'linear-gradient(135deg, #1e293b, #475569)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            설정
          </h3>

          {/* 테마 설정 */}
          <button
            onClick={toggleTheme}
            style={{
              width: '100%',
              padding: '20px 24px',
              borderRadius: '20px',
              background: isDarkMode
                ? 'linear-gradient(145deg, rgba(44, 44, 46, 0.6), rgba(28, 28, 30, 0.8))'
                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.7))',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
              boxShadow: isDarkMode
                ? '0 8px 24px rgba(0, 0, 0, 0.2)'
                : '0 8px 24px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 12px 32px rgba(0, 0, 0, 0.3)'
                : '0 12px 32px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 8px 24px rgba(0, 0, 0, 0.2)'
                : '0 8px 24px rgba(0, 0, 0, 0.06)'
            }}
          >
            <div className="flex items-center gap-4">
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(145deg, #a855f7, #9333ea)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(168, 85, 247, 0.4)'
              }}>
                <Palette size={32} color="white" />
              </div>
              <span style={{
                fontSize: '18px',
                fontWeight: '600',
                color: isDarkMode ? '#ffffff' : '#1e293b'
              }}>
                테마 변경
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: isDarkMode
                  ? 'linear-gradient(145deg, #374151, #1f2937)'
                  : 'linear-gradient(145deg, #fbbf24, #f59e0b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDarkMode
                  ? '0 8px 20px rgba(55, 65, 81, 0.4)'
                  : '0 8px 20px rgba(251, 191, 36, 0.4)'
              }}>
                {isDarkMode ? (
                  <Moon size={28} color="#94a3b8" />
                ) : (
                  <Sun size={28} color="white" />
                )}
              </div>
              <span style={{
                fontSize: '16px',
                fontWeight: '500',
                color: isDarkMode ? '#94a3b8' : '#64748b'
              }}>
                {isDarkMode ? '다크 모드' : '라이트 모드'}
              </span>
            </div>
          </button>

          {/* 로그아웃 */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '20px 24px',
              borderRadius: '20px',
              background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.background = 'linear-gradient(145deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(239, 68, 68, 0.25)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.background = 'linear-gradient(145deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
            }}
          >
            <div className="flex items-center gap-4">
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(145deg, #ef4444, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)'
              }}>
                <LogOut size={32} color="white" />
              </div>
              <span style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#ef4444'
              }}>
                로그아웃
              </span>
            </div>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#ef4444',
              animation: 'pulse 2s infinite'
            }}></div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MyPage 