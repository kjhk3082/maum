import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MessageCircle, Star, Heart, Sparkles } from 'lucide-react'
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
    <div style={{
      minHeight: '100vh',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 50%, #1C1C1E 100%)'
        : 'linear-gradient(135deg, #F2F2F7 0%, #E5E5EA 50%, #F2F2F7 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 배경 장식 요소들 */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '200px',
        height: '200px',
        background: isDarkMode 
          ? 'radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(23, 162, 184, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
      
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '15%',
        width: '150px',
        height: '150px',
        background: isDarkMode 
          ? 'radial-gradient(circle, rgba(52, 199, 89, 0.1) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />

      {/* 떠다니는 아이콘들 */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '20%',
        color: isDarkMode ? 'rgba(255, 107, 53, 0.3)' : 'rgba(23, 162, 184, 0.3)',
        animation: 'bounce 3s ease-in-out infinite'
      }}>
        <Heart size={24} />
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '15%',
        color: isDarkMode ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 107, 53, 0.3)',
        animation: 'bounce 4s ease-in-out infinite'
      }}>
        <Star size={20} />
      </div>
      
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '5%',
        color: isDarkMode ? 'rgba(255, 214, 10, 0.3)' : 'rgba(52, 199, 89, 0.3)',
        animation: 'bounce 5s ease-in-out infinite'
      }}>
        <Sparkles size={18} />
      </div>

      {/* 메인 컨테이너 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          margin: '0 auto'
        }}>
          {/* 메인 카드 */}
          <div style={{
            background: isDarkMode 
              ? 'rgba(44, 44, 46, 0.8)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '40px 32px',
            boxShadow: isDarkMode
              ? '0 20px 40px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.1) inset'
              : '0 20px 40px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(255, 255, 255, 0.8) inset',
            border: isDarkMode 
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.05)',
            position: 'relative'
          }}>
            
            {/* 로고 섹션 */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              {/* 앱 아이콘 */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  position: 'relative',
                  padding: '8px',
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, #FF6B35 0%, #D74E2B 100%)'
                    : 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  transform: 'perspective(1000px) rotateX(10deg)',
                  transition: 'all 0.3s ease'
                }}>
                  <img 
                    src="/app-icon.png" 
                    alt="마음일기" 
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '16px',
                      display: 'block'
                    }}
                  />
                  
                  {/* 반짝임 효과 */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    width: '20px',
                    height: '20px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '50%',
                    filter: 'blur(4px)',
                    animation: 'shimmer 2s ease-in-out infinite'
                  }} />
                </div>
              </div>
              
              {/* 앱 이름 */}
              <h1 style={{
                margin: '0 0 8px 0',
                fontSize: '32px',
                fontWeight: '700',
                background: isDarkMode 
                  ? 'linear-gradient(135deg, #FFFFFF 0%, #E5E5EA 100%)'
                  : 'linear-gradient(135deg, #1D1D1F 0%, #48484A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textAlign: 'center'
              }}>
                마음일기
              </h1>
              
              {/* 부제목 */}
              <p style={{
                margin: 0,
                fontSize: '17px',
                color: isDarkMode ? '#99999D' : '#6D6D70',
                fontWeight: '400'
              }}>
                하루를 기록하고 감정을 정리하세요
              </p>
            </div>

            {/* 오류 메시지 */}
            {error && (
              <div style={{
                marginBottom: '24px',
                padding: '16px',
                borderRadius: '16px',
                background: isDarkMode 
                  ? 'rgba(255, 59, 48, 0.1)'
                  : 'rgba(255, 59, 48, 0.05)',
                border: '1px solid rgba(255, 59, 48, 0.2)',
                textAlign: 'center'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#FF3B30',
                  fontWeight: '500'
                }}>
                  {error}
                </p>
              </div>
            )}

            {/* 기능 소개 */}
            <div style={{ marginBottom: '32px' }}>
              {[
                { icon: Calendar, title: '📅 달력 기반 일기', desc: '캘린더에서 날짜를 선택해 쉽게 작성하세요' },
                { icon: Sparkles, title: '🤖 AI 작성 도움', desc: 'AI가 키워드를 문장으로 확장해드려요' },
                { icon: Heart, title: '📊 감정 통계', desc: '하루의 감정을 기록하고 분석해보세요' }
              ].map((feature, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 20px',
                  marginBottom: '12px',
                  borderRadius: '16px',
                  background: isDarkMode 
                    ? 'rgba(58, 58, 60, 0.3)'
                    : 'rgba(242, 242, 247, 0.8)',
                  border: isDarkMode 
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : '1px solid rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, #FF6B35 0%, #D74E2B 100%)'
                      : 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}>
                    <feature.icon size={24} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: isDarkMode ? '#FFFFFF' : '#1D1D1F'
                    }}>
                      {feature.title}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: isDarkMode ? '#99999D' : '#6D6D70',
                      lineHeight: '1.4'
                    }}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 로그인 버튼들 */}
            <div style={{ marginBottom: '24px' }}>
              {/* 카카오 로그인 버튼 */}
              <button
                onClick={handleKakaoLogin}
                disabled={isLoading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '16px 24px',
                  background: '#FEE500',
                  border: 'none',
                  borderRadius: '16px',
                  color: '#000000',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(254, 229, 0, 0.3)',
                  marginBottom: '12px',
                  opacity: isLoading ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(254, 229, 0, 0.4)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(254, 229, 0, 0.3)'
                  }
                }}
              >
                {isLoading ? (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #000000',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <>
                    <MessageCircle size={20} />
                    <span>카카오로 로그인</span>
                  </>
                )}
              </button>

              {/* 데모 로그인 버튼 (개발/테스트용) */}
              {import.meta.env.DEV && (
                <button
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '14px 24px',
                    background: isDarkMode 
                      ? 'rgba(58, 58, 60, 0.8)'
                      : 'rgba(242, 242, 247, 0.8)',
                    border: isDarkMode 
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '16px',
                    color: isDarkMode ? '#FFFFFF' : '#1D1D1F',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isLoading ? 0.7 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.background = isDarkMode 
                        ? 'rgba(72, 72, 74, 0.8)'
                        : 'rgba(229, 229, 234, 0.8)'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.background = isDarkMode 
                        ? 'rgba(58, 58, 60, 0.8)'
                        : 'rgba(242, 242, 247, 0.8)'
                    }
                  }}
                >
                  {isLoading ? (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: `2px solid ${isDarkMode ? '#FFFFFF' : '#1D1D1F'}`,
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : (
                    <>
                      <Calendar size={18} />
                      <span>데모 로그인</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 하단 안내 */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: isDarkMode ? '#6D6D70' : '#8E8E93',
                lineHeight: '1.4'
              }}>
                로그인하면 서비스 이용약관 및<br/>
                개인정보처리방침에 동의한 것으로 간주됩니다
              </p>
            </div>
          </div>

          {/* Firebase 정보 카드 */}
          <div style={{
            marginTop: '24px',
            background: isDarkMode 
              ? 'rgba(44, 44, 46, 0.6)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            border: isDarkMode 
              ? '1px solid rgba(255, 255, 255, 0.05)'
              : '1px solid rgba(0, 0, 0, 0.03)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#34C759',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
              <h4 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: isDarkMode ? '#FFFFFF' : '#1D1D1F'
              }}>
                Firebase 기반 실제 서비스
              </h4>
            </div>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: isDarkMode ? '#99999D' : '#6D6D70',
              lineHeight: '1.5'
            }}>
              Google Firebase를 사용한 실제 클라우드 서비스입니다.<br/>
              카카오 OAuth로 안전하게 로그인하고 모든 데이터는<br/>
              실시간으로 동기화됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes shimmer {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}

export default Login
