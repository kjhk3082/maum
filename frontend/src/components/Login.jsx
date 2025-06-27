import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MessageCircle } from 'lucide-react'
import { signInWithKakaoSDK, handleRedirectResult, checkKakaoSDK } from '../firebase/authService'
import { ThemeContext } from '../App'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { isDarkMode } = useContext(ThemeContext)

  useEffect(() => {
    // 이미 로그인되어 있으면 홈으로 리다이렉트
    if (localStorage.getItem('user')) {
      navigate('/')
    }

    // 리다이렉트 결과 처리 (페이지 새로고침 시)
    const handleAuthRedirect = async () => {
      const result = await handleRedirectResult()
      if (result.success) {
        onLogin(result.user)
        navigate('/')
      }
    }

    handleAuthRedirect()
  }, [navigate, onLogin])

  // 카카오 SDK 로그인
  const handleKakaoLogin = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // 카카오 SDK 상태 확인
      if (!checkKakaoSDK()) {
        throw new Error('카카오 SDK가 초기화되지 않았습니다. 페이지를 새로고침해주세요.')
      }

      const result = await signInWithKakaoSDK()
      
      if (result.success) {
        onLogin(result.user)
        navigate('/')
      } else {
        setError(result.error || '로그인에 실패했습니다')
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  // 데모 로그인 (개발/테스트용)
  const handleDemoLogin = () => {
    setIsLoading(true)
    
    setTimeout(() => {
      const userData = {
        id: 'demo123',
        name: '테스트 사용자',
        email: 'demo@example.com',
        loginType: 'demo',
        loginAt: new Date().toISOString()
      }
      
      localStorage.setItem('user', JSON.stringify(userData))
      onLogin(userData)
      setIsLoading(false)
      navigate('/')
    }, 1500)
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDarkMode 
        ? 'bg-black' 
        : 'bg-gray-50'
    }`}>
      <div className="w-full max-w-sm mx-auto px-6">
        {/* 메인 카드 */}
        <div className={`${
          isDarkMode 
            ? 'bg-gray-900 border-gray-800' 
            : 'bg-white border-gray-200'
        } rounded-2xl p-8 shadow-lg border`}>
          
          {/* 로고 섹션 */}
          <div className="text-center mb-8">
            {/* 앱 아이콘 */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img 
                  src="/app-icon.png" 
                  alt="마음일기" 
                  className="w-20 h-20 rounded-2xl shadow-md"
                />
              </div>
            </div>
            
            {/* 앱 이름 */}
            <h1 className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              마음일기
            </h1>
            
            {/* 부제목 */}
            <p className={`text-lg ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              하루를 기록하고 감정을 정리하세요
            </p>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className={`mb-6 p-4 rounded-xl ${
              isDarkMode 
                ? 'bg-red-900/20 border border-red-800/50 text-red-400' 
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              <p className="text-sm text-center">{error}</p>
            </div>
          )}

          {/* 기능 소개 */}
          <div className="space-y-4 mb-8">
            <div className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <h3 className={`font-semibold mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                📅 달력 기반 일기
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                캘린더에서 날짜를 선택해 쉽게 작성하세요
              </p>
            </div>

            <div className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <h3 className={`font-semibold mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                🤖 AI 작성 도움
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                AI가 키워드를 문장으로 확장해드려요
              </p>
            </div>

            <div className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <h3 className={`font-semibold mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                📊 감정 통계
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                하루의 감정을 기록하고 분석해보세요
              </p>
            </div>
          </div>

          {/* 로그인 버튼들 */}
          <div className="space-y-3">
            {/* 카카오 로그인 버튼 */}
            <button
              onClick={handleKakaoLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-300 text-black font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-sm disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  <span>카카오로 로그인</span>
                </>
              )}
            </button>

            {/* 데모 로그인 버튼 (개발/테스트용) */}
            {import.meta.env.DEV && (
              <button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className={`w-full flex items-center justify-center space-x-3 ${
                  isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
                } font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${
                    isDarkMode ? 'border-white' : 'border-gray-900'
                  }`}></div>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span>데모 로그인</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* 하단 안내 */}
          <div className="text-center mt-6">
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              로그인하면 서비스 이용약관 및 개인정보처리방침에 동의한 것으로 간주됩니다
            </p>
          </div>
        </div>

        {/* Firebase 정보 카드 */}
        <div className={`mt-6 ${
          isDarkMode 
            ? 'bg-gray-900/50 border-gray-800' 
            : 'bg-white/80 border-gray-200'
        } rounded-2xl p-6 border backdrop-blur-sm`}>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h4 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Firebase 기반 실제 서비스
              </h4>
            </div>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Google Firebase를 사용한 실제 클라우드 서비스입니다.<br/>
              카카오 OAuth로 안전하게 로그인하고 모든 데이터는 실시간으로 동기화됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
