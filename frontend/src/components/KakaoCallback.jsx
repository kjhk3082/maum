import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleRedirectResult } from '../firebase/authService'
import { useTheme } from '../App'

function KakaoCallback({ onLogin }) {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()

  useEffect(() => {
    const processCallback = async () => {
      const result = await handleRedirectResult()
      if (result.success) {
        onLogin(result.user)
        navigate('/')
      } else {
        navigate('/login')
      }
    }
    
    processCallback()
  }, [navigate, onLogin])

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode ? '#1a1a1a' : '#f7fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          카카오 로그인 처리 중...
        </p>
      </div>
    </div>
  )
}

export default KakaoCallback 