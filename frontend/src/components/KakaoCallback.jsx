import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, CheckCircle, XCircle, Loader } from 'lucide-react'
import { handleRedirectResult } from '../firebase/authService'
import { useTheme } from '../App'

function KakaoCallback({ onLogin }) {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [status, setStatus] = useState('processing') // processing, success, error
  const [message, setMessage] = useState('카카오 로그인을 처리하고 있습니다...')

  useEffect(() => {
    const processKakaoCallback = async () => {
      try {
        console.log('카카오 콜백 처리 시작...')
        
        const result = await handleRedirectResult()
        
        if (result.success) {
          console.log('카카오 로그인 성공:', result.user)
          setStatus('success')
          setMessage(result.message || '카카오 로그인 성공!')
          
          // 사용자 정보를 앱에 전달
          if (onLogin) {
            onLogin(result.user)
          }
          
          // 1초 후 홈으로 이동 (리디렉션이 설정되지 않은 경우)
          if (!result.redirect) {
            setTimeout(() => {
              navigate('/')
            }, 1500)
          }
          
        } else {
          console.error('카카오 로그인 실패:', result.error)
          setStatus('error')
          setMessage(result.error || '로그인 처리 중 오류가 발생했습니다.')
          
          // 3초 후 로그인 페이지로 이동
          setTimeout(() => {
            navigate('/login')
          }, 3000)
        }
        
      } catch (error) {
        console.error('카카오 콜백 처리 오류:', error)
        setStatus('error')
        setMessage('로그인 처리 중 예기치 않은 오류가 발생했습니다.')
        
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    }

    processKakaoCallback()
  }, [navigate, onLogin])

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader className="animate-spin" size={48} color="#17A2B8" />
      case 'success':
        return <CheckCircle size={48} color="#34C759" />
      case 'error':
        return <XCircle size={48} color="#FF3B30" />
      default:
        return <Loader className="animate-spin" size={48} color="#17A2B8" />
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)' 
        : 'linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: isDarkMode 
          ? 'rgba(44, 44, 46, 0.95)' 
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: isDarkMode 
          ? '0 20px 40px rgba(0, 0, 0, 0.3)' 
          : '0 20px 40px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        {/* 로고 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #17A2B8 0%, #138496 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(23, 162, 184, 0.3)'
          }}>
            <Calendar size={32} color="white" />
          </div>
        </div>

        {/* 앱 이름 */}
        <h1 style={{
          margin: '0 0 32px 0',
          fontSize: '24px',
          fontWeight: '700',
          color: isDarkMode ? '#FFFFFF' : '#17A2B8'
        }}>
          마음일기
        </h1>

        {/* 상태 아이콘 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          {getStatusIcon()}
        </div>

        {/* 메시지 */}
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '16px',
          color: isDarkMode ? '#E5E5E7' : '#666666',
          lineHeight: '1.5'
        }}>
          {message}
        </p>

        {/* 추가 안내 */}
        {status === 'processing' && (
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: isDarkMode ? '#8E8E93' : '#999999'
          }}>
            잠시만 기다려주세요...
          </p>
        )}

        {status === 'success' && (
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#34C759'
          }}>
            곧 홈 화면으로 이동합니다
          </p>
        )}

        {status === 'error' && (
          <div>
            <p style={{
              margin: '0 0 16px 0',
              fontSize: '14px',
              color: '#FF3B30'
            }}>
              로그인 페이지로 돌아갑니다
            </p>
            
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '12px 24px',
                background: isDarkMode 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.05)',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '12px',
                color: isDarkMode ? '#FFFFFF' : '#333333',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = isDarkMode 
                  ? 'rgba(255, 255, 255, 0.15)' 
                  : 'rgba(0, 0, 0, 0.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = isDarkMode 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.05)'
              }}
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default KakaoCallback 