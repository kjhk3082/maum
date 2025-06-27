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

  const formatDate = (dateString) => {
    if (!dateString) return '알 수 없음'
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
                className="p-2 rounded-xl transition-all duration-200"
                style={{
                  background: isDarkMode 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 0, 0, 0.05)',
                  ':hover': {
                    background: isDarkMode 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <ArrowLeft size={20} className={isDarkMode ? 'text-white' : 'text-gray-800'} />
              </button>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                마이페이지
              </h1>
            </div>

            {/* 테마 토글 */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl transition-all duration-200"
              style={{
                background: isDarkMode 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.05)'
              }}
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 프로필 섹션 */}
        <div className="mb-8 p-6 rounded-2xl backdrop-blur-sm" style={{
          background: isDarkMode 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(255, 255, 255, 0.8)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
        }}>
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name}&background=0891b2&color=fff`}
                alt={user?.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-teal-500 text-white shadow-lg">
                <Camera size={16} />
              </button>
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`px-3 py-1 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="p-1 rounded-lg bg-green-500 text-white"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setDisplayName(user?.name || '')
                    }}
                    className="p-1 rounded-lg bg-red-500 text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {user?.name}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`p-1 rounded-lg ${
                      isDarkMode 
                        ? 'hover:bg-gray-700' 
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    <Edit3 size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                  </button>
                </div>
              )}
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                카카오 로그인 사용자
              </p>
            </div>
          </div>
        </div>

        {/* 정보 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* 이메일 */}
          <div className="p-6 rounded-2xl backdrop-blur-sm" style={{
            background: isDarkMode 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(255, 255, 255, 0.8)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
          }}>
            <div className="flex items-center gap-3 mb-2">
              <Mail size={20} className="text-teal-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                이메일
              </span>
            </div>
            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {user?.email || '이메일 정보 없음'}
            </p>
          </div>

          {/* 가입일 */}
          <div className="p-6 rounded-2xl backdrop-blur-sm" style={{
            background: isDarkMode 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(255, 255, 255, 0.8)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
          }}>
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={20} className="text-teal-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                가입일
              </span>
            </div>
            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {formatDate(user?.createdAt)}
            </p>
          </div>

          {/* 일기 개수 */}
          <div className="p-6 rounded-2xl backdrop-blur-sm" style={{
            background: isDarkMode 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(255, 255, 255, 0.8)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
          }}>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen size={20} className="text-teal-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                작성한 일기
              </span>
            </div>
            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {diaryCount}개
            </p>
          </div>

          {/* 계정 타입 */}
          <div className="p-6 rounded-2xl backdrop-blur-sm" style={{
            background: isDarkMode 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(255, 255, 255, 0.8)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
          }}>
            <div className="flex items-center gap-3 mb-2">
              <User size={20} className="text-teal-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                계정 타입
              </span>
            </div>
            <div className="flex items-center gap-2">
              <img 
                src="https://developers.kakao.com/assets/img/about/logos/kakao/kakao_login_medium_narrow.png" 
                alt="Kakao" 
                className="h-5"
              />
            </div>
          </div>
        </div>

        {/* 설정 섹션 */}
        <div className="space-y-4">
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            설정
          </h3>

          {/* 테마 설정 */}
          <button
            onClick={toggleTheme}
            className="w-full p-4 rounded-2xl backdrop-blur-sm flex items-center justify-between transition-all duration-200"
            style={{
              background: isDarkMode 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(255, 255, 255, 0.8)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
            }}
          >
            <div className="flex items-center gap-3">
              <Palette size={20} className="text-teal-500" />
              <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>
                테마 변경
              </span>
            </div>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isDarkMode ? '다크 모드' : '라이트 모드'}
            </span>
          </button>

          {/* 로그아웃 */}
          <button
            onClick={handleLogout}
            className="w-full p-4 rounded-2xl backdrop-blur-sm flex items-center justify-between transition-all duration-200 group"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <div className="flex items-center gap-3">
              <LogOut size={20} className="text-red-500" />
              <span className="text-red-500 font-medium">
                로그아웃
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MyPage 