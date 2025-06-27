import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MessageCircle, Star, Heart, Sparkles, Shield, Zap, Layers, CheckCircle, Loader, XCircle } from 'lucide-react'
import { signInWithKakaoSDK, handleRedirectResult, checkKakaoSDK } from '../firebase/authService'
import { ThemeContext } from '../App'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginStatus, setLoginStatus] = useState('') // 로그인 상태: success, processing, error
  const { isDarkMode } = useContext(ThemeContext)

  useEffect(() => {
    // 로그인 페이지에서는 리다이렉트 처리 안함
    // KakaoCallback 컴포넌트에서 처리
  }, [navigate, onLogin])

  // 카카오 SDK 로그인
  const handleKakaoLogin = async () => {
    setIsLoading(true)
    setError('')
    setLoginStatus('processing')
    
    try {
      // 카카오 SDK 상태 확인
      if (!checkKakaoSDK()) {
        throw new Error('카카오 SDK가 초기화되지 않았습니다. 페이지를 새로고침해주세요.')
      }

      const result = await signInWithKakaoSDK()
      
      if (result.success) {
        setLoginStatus('success')
        setTimeout(() => {
          onLogin(result.user)
          navigate('/')
        }, 1500) // 성공 메시지를 잠시 보여준 후 이동
      } else {
        setLoginStatus('error')
        setError(result.error || '로그인에 실패했습니다')
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      setLoginStatus('error')
      setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode 
        ? 'radial-gradient(ellipse at top, #1a1a1a 0%, #0d0d0d 100%)' 
        : 'radial-gradient(ellipse at top, #f7fafc 0%, #edf2f7 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      
      {/* 고급스러운 배경 패턴 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDarkMode 
          ? 'radial-gradient(circle at 20% 50%, rgba(74, 144, 226, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.05) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.03) 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)',
        animation: 'breathe 8s ease-in-out infinite alternate'
      }} />

      {/* 떠다니는 장식 요소들 */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: isDarkMode 
          ? 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), transparent)'
          : 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), transparent)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 20s ease-in-out infinite'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '200px',
        height: '200px',
        background: isDarkMode 
          ? 'linear-gradient(45deg, rgba(168, 85, 247, 0.1), transparent)'
          : 'linear-gradient(45deg, rgba(168, 85, 247, 0.15), transparent)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'float 15s ease-in-out infinite reverse'
      }} />

      {/* 메인 컨테이너 */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        padding: '20px'
      }}>
        
        {/* 메인 카드 */}
        <div style={{
          background: isDarkMode 
            ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.95), rgba(20, 20, 20, 0.9))'
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
          backdropFilter: 'blur(40px)',
          borderRadius: '32px',
          padding: '48px 40px',
          boxShadow: isDarkMode
            ? '0 32px 64px rgba(0, 0, 0, 0.5), 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 32px 64px rgba(0, 0, 0, 0.12), 0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          border: isDarkMode 
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid rgba(255, 255, 255, 0.6)',
          position: 'relative'
        }}>
          
          {/* 상단 그라데이션 라인 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, #06d6a0, transparent)',
            borderRadius: '1px'
          }} />
          
          {/* 로고 섹션 */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            {/* 로고 컨테이너 */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '32px',
              position: 'relative'
            }}>
              <div style={{
                position: 'relative',
                padding: '16px',
                background: isDarkMode 
                  ? 'linear-gradient(145deg, #3b82f6, #1d4ed8)'
                  : 'linear-gradient(145deg, #3b82f6, #2563eb)',
                borderRadius: '24px',
                boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4), 0 8px 16px rgba(59, 130, 246, 0.2)',
                transform: 'perspective(1000px) rotateX(5deg)',
                transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) scale(1.05)'
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(59, 130, 246, 0.5), 0 10px 20px rgba(59, 130, 246, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(5deg) scale(1)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.4), 0 8px 16px rgba(59, 130, 246, 0.2)'
              }}
              >
                <img 
                  src="/app-icon.png" 
                  alt="마음일기" 
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '20px',
                    display: 'block'
                  }}
                />
                
                {/* 반짝임 오버레이 */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  width: '40px',
                  height: '40px',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)',
                  borderRadius: '50%',
                  filter: 'blur(8px)',
                  animation: 'shimmer 3s ease-in-out infinite'
                }} />
              </div>
            </div>
            
            {/* 앱 이름 */}
            <h1 style={{
              margin: '0 0 12px 0',
              fontSize: '42px',
              fontWeight: '700',
              background: isDarkMode 
                ? 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textAlign: 'center',
              letterSpacing: '-0.02em'
            }}>
              마음일기
            </h1>
            
            {/* 부제목 */}
            <p style={{
              margin: 0,
              fontSize: '18px',
              color: isDarkMode ? '#94a3b8' : '#64748b',
              fontWeight: '400',
              letterSpacing: '-0.01em'
            }}>
              당신의 감정을 기록하고 마음을 돌보세요
            </p>
          </div>

          {/* 로그인 상태 표시 */}
          {loginStatus && (
            <div style={{
              marginBottom: '32px',
              padding: '20px 24px',
              borderRadius: '20px',
              background: 
                loginStatus === 'success' 
                  ? (isDarkMode 
                      ? 'linear-gradient(145deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05))'
                      : 'linear-gradient(145deg, rgba(220, 252, 231, 0.8), rgba(187, 247, 208, 0.3))')
                  : loginStatus === 'error'
                    ? (isDarkMode 
                        ? 'linear-gradient(145deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))'
                        : 'linear-gradient(145deg, rgba(254, 226, 226, 0.8), rgba(252, 165, 165, 0.3))')
                    : (isDarkMode 
                        ? 'linear-gradient(145deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))'
                        : 'linear-gradient(145deg, rgba(219, 234, 254, 0.8), rgba(191, 219, 254, 0.3))'),
              border: `1px solid ${
                loginStatus === 'success' 
                  ? 'rgba(34, 197, 94, 0.2)'
                  : loginStatus === 'error'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(59, 130, 246, 0.2)'
              }`,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              {loginStatus === 'processing' && <Loader size={20} className="animate-spin" color="#3b82f6" />}
              {loginStatus === 'success' && <CheckCircle size={20} color="#22c55e" />}
              {loginStatus === 'error' && <XCircle size={20} color="#ef4444" />}
              
              <p style={{
                margin: 0,
                fontSize: '15px',
                color: 
                  loginStatus === 'success' 
                    ? '#22c55e'
                    : loginStatus === 'error'
                      ? '#ef4444'
                      : '#3b82f6',
                fontWeight: '500'
              }}>
                {loginStatus === 'processing' && '로그인 중입니다...'}
                {loginStatus === 'success' && '로그인 성공! 잠시 후 이동합니다'}
                {loginStatus === 'error' && (error || '로그인에 실패했습니다')}
              </p>
            </div>
          )}

          {/* 기능 소개 카드들 */}
          <div style={{ marginBottom: '40px' }}>
            {[
              { icon: Calendar, title: '캘린더 기반 일기', desc: '직관적인 달력에서 날짜를 선택해 쉽게 작성하세요', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
              { icon: Zap, title: 'AI 작성 도움', desc: 'GPT-4o AI가 키워드를 자연스러운 문장으로 확장해드려요', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
              { icon: Shield, title: '보안 & 프라이버시', desc: 'Firebase 클라우드로 안전하게 보호되는 개인 일기장', gradient: 'linear-gradient(135deg, #06d6a0, #048c73)' }
            ].map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '24px 28px',
                marginBottom: '16px',
                borderRadius: '20px',
                background: isDarkMode 
                  ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.2))'
                  : 'linear-gradient(145deg, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.6))',
                border: isDarkMode 
                  ? '1px solid rgba(255, 255, 255, 0.05)'
                  : '1px solid rgba(203, 213, 225, 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = isDarkMode 
                  ? '0 12px 24px rgba(0, 0, 0, 0.3)'
                  : '0 12px 24px rgba(0, 0, 0, 0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                {/* 호버시 그라데이션 오버레이 */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: feature.gradient,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  borderRadius: '20px',
                  pointerEvents: 'none'
                }} className="gradient-overlay" />
                
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: feature.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 2
                }}>
                  <feature.icon size={28} color="white" strokeWidth={1.5} />
                </div>
                
                <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: isDarkMode ? '#ffffff' : '#1e293b',
                    letterSpacing: '-0.01em'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '15px',
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    lineHeight: '1.5',
                    letterSpacing: '-0.005em'
                  }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 로그인 버튼들 */}
          <div style={{ marginBottom: '32px' }}>
            {/* 카카오 로그인 버튼 */}
            <button
              onClick={handleKakaoLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                padding: '20px 32px',
                background: 'linear-gradient(145deg, #FEE500, #FFCD00)',
                border: 'none',
                borderRadius: '20px',
                color: '#000000',
                fontSize: '17px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 12px 24px rgba(254, 229, 0, 0.3), 0 4px 8px rgba(254, 229, 0, 0.2)',
                marginBottom: '16px',
                opacity: isLoading ? 0.7 : 1,
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(254, 229, 0, 0.4), 0 8px 16px rgba(254, 229, 0, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(254, 229, 0, 0.3), 0 4px 8px rgba(254, 229, 0, 0.2)'
                }
              }}
            >
              {isLoading ? (
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '3px solid #000000',
                  borderTop: '3px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <>
                  <MessageCircle size={24} strokeWidth={2} />
                  <span style={{ letterSpacing: '-0.01em' }}>카카오로 시작하기</span>
                </>
              )}
            </button>


          </div>

          {/* 하단 안내 */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: isDarkMode ? '#64748b' : '#94a3b8',
              lineHeight: '1.5',
              letterSpacing: '-0.005em'
            }}>
              계속 진행하면 <span style={{ fontWeight: '500' }}>서비스 이용약관</span> 및<br/>
              <span style={{ fontWeight: '500' }}>개인정보처리방침</span>에 동의한 것으로 간주됩니다
            </p>
          </div>

          {/* 하단 Firebase 정보 */}
          <div style={{
            padding: '20px 24px',
            borderRadius: '16px',
            background: isDarkMode 
              ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.05), rgba(6, 120, 86, 0.03))'
              : 'linear-gradient(145deg, rgba(236, 253, 245, 0.8), rgba(209, 250, 229, 0.6))',
            border: '1px solid rgba(16, 185, 129, 0.1)',
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
                background: 'linear-gradient(45deg, #10b981, #059669)',
                animation: 'pulse-dot 2s ease-in-out infinite'
              }} />
              <h4 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: isDarkMode ? '#10b981' : '#047857'
              }}>
                Google Firebase 기반
              </h4>
            </div>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: isDarkMode ? '#6ee7b7' : '#065f46',
              lineHeight: '1.5',
              letterSpacing: '-0.005em'
            }}>
              엔터프라이즈급 보안과 실시간 동기화를 제공하는<br/>
              Google의 클라우드 플랫폼을 사용합니다
            </p>
          </div>
        </div>
      </div>

      {/* 고급 CSS 애니메이션 */}
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(1deg); }
          50% { transform: translateY(-10px) rotate(-1deg); }
          75% { transform: translateY(-30px) rotate(0.5deg); }
        }
        
        @keyframes shimmer {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
        
        .gradient-overlay:hover {
          opacity: 0.05 !important;
        }
      `}</style>
    </div>
  )
}

export default Login
