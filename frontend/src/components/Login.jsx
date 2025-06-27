import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MessageCircle, Heart, Sparkles, Star, Moon, Sun } from 'lucide-react'
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
    <div className={`min-h-screen relative overflow-hidden ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* 애니메이션 배경 요소들 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 떠다니는 하트들 */}
        <div className="absolute top-20 left-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
          <Heart className={`w-6 h-6 ${isDarkMode ? 'text-pink-400' : 'text-pink-300'} opacity-60`} />
        </div>
        <div className="absolute top-40 right-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
          <Star className={`w-4 h-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-300'} opacity-70`} />
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>
          <Sparkles className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-300'} opacity-50`} />
        </div>
        <div className="absolute top-60 right-40 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}>
          <Heart className={`w-3 h-3 ${isDarkMode ? 'text-pink-300' : 'text-pink-200'} opacity-40`} />
        </div>
        <div className="absolute bottom-20 right-10 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>
          <Star className={`w-6 h-6 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-200'} opacity-60`} />
        </div>

        {/* 그라데이션 원형 블러 효과 */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full filter blur-3xl opacity-30 ${
          isDarkMode ? 'bg-gradient-to-l from-purple-500 to-pink-500' : 'bg-gradient-to-l from-blue-300 to-purple-300'
        }`}></div>
        <div className={`absolute bottom-0 left-0 w-80 h-80 rounded-full filter blur-3xl opacity-20 ${
          isDarkMode ? 'bg-gradient-to-r from-teal-500 to-cyan-500' : 'bg-gradient-to-r from-teal-200 to-cyan-200'
        }`}></div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-md w-full">
          {/* 메인 카드 */}
          <div className={`${
            isDarkMode ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/70 border-white/80'
          } backdrop-blur-xl rounded-3xl p-8 shadow-2xl border`}>
            
            {/* 로고 및 제목 섹션 */}
            <div className="text-center mb-8">
              {/* 로고 애니메이션 */}
              <div className="relative mb-6 flex justify-center">
                <div className="relative">
                  <div className={`w-20 h-20 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-teal-400 to-cyan-400' 
                      : 'bg-gradient-to-br from-teal-500 to-cyan-500'
                  } rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-6 overflow-hidden`}>
                    <img 
                      src="/app-icon.png" 
                      alt="마음일기 로고" 
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                  </div>
                  {/* 로고 주변 반짝임 효과 */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl blur opacity-25 animate-pulse"></div>
                </div>
              </div>
              
              {/* 제목 */}
              <h1 className={`text-4xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                <span className="bg-gradient-to-r from-teal-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  마음일기
                </span>
              </h1>
              
              {/* 부제목 */}
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                ✨ 하루를 기록하고 감정을 정리하세요
              </p>
            </div>

            {/* 오류 메시지 */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl text-center">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* 기능 소개 카드들 */}
            <div className="space-y-3 mb-8">
              {[
                { icon: Calendar, title: '캘린더 기반 일기', desc: '달력에서 날짜를 선택해 쉽게 작성', color: 'from-blue-400 to-blue-500' },
                { icon: Sparkles, title: 'AI 작성 도움', desc: 'AI가 키워드를 문장으로 확장', color: 'from-purple-400 to-purple-500' },
                { icon: Heart, title: '감정 통계', desc: '하루의 감정을 기록하고 분석', color: 'from-pink-400 to-pink-500' },
              ].map((feature, index) => (
                <div key={index} className={`flex items-center space-x-4 p-4 rounded-xl ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-white/40'
                } backdrop-blur-sm border ${
                  isDarkMode ? 'border-gray-600/30' : 'border-white/60'
                } transition-all duration-300 hover:scale-105`}>
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 로그인 버튼들 */}
            <div className="space-y-4">
              {/* 카카오 로그인 버튼 */}
              <button
                onClick={handleKakaoLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                ) : (
                  <>
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-lg">카카오로 로그인</span>
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
                      ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                  } font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50`}
                >
                  {isLoading ? (
                    <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${
                      isDarkMode ? 'border-white' : 'border-gray-800'
                    }`}></div>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      <span>데모 로그인 (개발용)</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 이용약관 */}
            <div className="text-center mt-6">
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                로그인하면 <span className="underline">서비스 이용약관</span> 및 <span className="underline">개인정보처리방침</span>에 동의한 것으로 간주됩니다
              </p>
            </div>
          </div>

          {/* 하단 정보 카드 */}
          <div className={`mt-6 ${
            isDarkMode 
              ? 'bg-teal-900/30 border border-teal-700/50' 
              : 'bg-teal-50/70 border border-teal-200/80'
          } backdrop-blur-xl rounded-2xl p-6`}>
            <div className="text-center">
              <h4 className={`font-bold text-lg mb-2 ${
                isDarkMode ? 'text-teal-300' : 'text-teal-800'
              }`}>
                🔥 Firebase 기반 실제 서비스
              </h4>
              <p className={`text-sm leading-relaxed ${
                isDarkMode ? 'text-teal-200' : 'text-teal-700'
              }`}>
                Google Firebase를 사용한 실제 클라우드 서비스입니다.<br/>
                카카오 OAuth로 안전하게 로그인하고 모든 데이터는 실시간으로 동기화됩니다.
              </p>
            </div>
          </div>

          {/* 서비스 특징 */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { icon: '💝', text: '감정 기록' },
              { icon: '☁️', text: '클라우드 저장' },
              { icon: '📱', text: '반응형 디자인' }
            ].map((item, index) => (
              <div key={index} className={`text-center p-4 rounded-xl ${
                isDarkMode ? 'bg-gray-800/40' : 'bg-white/40'
              } backdrop-blur-sm border ${
                isDarkMode ? 'border-gray-700/30' : 'border-white/60'
              }`}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 파도 효과 */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
                opacity="0.25" 
                className={isDarkMode ? 'fill-purple-500' : 'fill-blue-200'}></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
                opacity="0.5" 
                className={isDarkMode ? 'fill-purple-400' : 'fill-blue-300'}></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
                className={isDarkMode ? 'fill-purple-300' : 'fill-blue-100'}></path>
        </svg>
      </div>
    </div>
  )
}

export default Login
