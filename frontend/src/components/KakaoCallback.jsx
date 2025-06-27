import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getKakaoToken, getKakaoUserInfo, saveKakaoUser } from '../services/kakaoService'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

function KakaoCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('로그인 처리 중...')

  useEffect(() => {
    const processKakaoLogin = async () => {
      try {
        // URL에서 인가코드 추출
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          throw new Error(`카카오 로그인 취소: ${error}`)
        }

        if (!code) {
          throw new Error('인가코드가 없습니다')
        }

        setMessage('카카오 서버에서 토큰을 가져오는 중...')

        // 1. 인가코드로 액세스 토큰 요청
        const tokenData = await getKakaoToken(code)
        
        if (!tokenData.access_token) {
          throw new Error('액세스 토큰을 받지 못했습니다')
        }

        setMessage('사용자 정보를 가져오는 중...')

        // 2. 액세스 토큰으로 사용자 정보 요청
        const userInfo = await getKakaoUserInfo(tokenData.access_token)

        setMessage('로그인 정보를 저장하는 중...')

        // 3. 사용자 정보 저장
        saveKakaoUser(userInfo)

        setStatus('success')
        setMessage(`환영합니다, ${userInfo.name}님!`)

        // 2초 후 홈으로 이동
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 2000)

      } catch (error) {
        console.error('카카오 로그인 처리 오류:', error)
        setStatus('error')
        setMessage(error.message || '로그인 처리 중 오류가 발생했습니다')

        // 5초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 5000)
      }
    }

    processKakaoLogin()
  }, [searchParams, navigate])

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-16 h-16 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />
      default:
        return <Loader className="w-16 h-16 text-blue-500 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-gradient-to-br from-blue-50 to-blue-100'
      case 'success':
        return 'bg-gradient-to-br from-green-50 to-green-100'
      case 'error':
        return 'bg-gradient-to-br from-red-50 to-red-100'
      default:
        return 'bg-gradient-to-br from-blue-50 to-blue-100'
    }
  }

  return (
    <div className={`min-h-screen ${getStatusColor()} flex items-center justify-center px-4`}>
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* 상태 아이콘 */}
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>

          {/* 상태 메시지 */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {status === 'loading' && '카카오 로그인'}
            {status === 'success' && '로그인 성공!'}
            {status === 'error' && '로그인 실패'}
          </h2>

          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* 진행 표시 */}
          {status === 'loading' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          )}

          {/* 안내 메시지 */}
          <div className="text-sm text-gray-500">
            {status === 'success' && '잠시 후 홈 화면으로 이동합니다...'}
            {status === 'error' && '5초 후 로그인 페이지로 돌아갑니다...'}
            {status === 'loading' && '잠시만 기다려주세요...'}
          </div>
        </div>

        {/* 디버그 정보 (개발 모드에서만) */}
        {import.meta.env.DEV && (
          <div className="mt-4 bg-gray-100 rounded-lg p-4 text-xs text-gray-600">
            <h4 className="font-semibold mb-2">디버그 정보:</h4>
            <p>Code: {searchParams.get('code')?.substring(0, 20)}...</p>
            <p>Error: {searchParams.get('error') || 'None'}</p>
            <p>Status: {status}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default KakaoCallback 