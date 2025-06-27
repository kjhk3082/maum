/**
 * 카카오 로그인 서비스
 * REST API를 사용한 카카오 OAuth 구현
 */

const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY
const REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`

// 환경변수 체크
if (!KAKAO_API_KEY) {
  console.warn('⚠️ 카카오 API 키가 설정되지 않았습니다. .env.local 파일을 확인하세요.')
}

/**
 * 카카오 로그인 URL 생성
 */
export const getKakaoLoginUrl = () => {
  if (!KAKAO_API_KEY) {
    throw new Error('카카오 API 키가 설정되지 않았습니다.')
  }

  const params = new URLSearchParams({
    client_id: KAKAO_API_KEY,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'profile_nickname,profile_image,account_email'
  })
  
  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`
}

/**
 * 인가코드로 액세스 토큰 요청
 */
export const getKakaoToken = async (code) => {
  try {
    if (!KAKAO_API_KEY) {
      throw new Error('카카오 API 키가 설정되지 않았습니다.')
    }

    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_API_KEY,
        redirect_uri: REDIRECT_URI,
        code: code
      })
    })

    if (!response.ok) {
      throw new Error('토큰 요청 실패')
    }

    return await response.json()
  } catch (error) {
    console.error('카카오 토큰 요청 오류:', error)
    throw error
  }
}

/**
 * 카카오 사용자 정보 조회
 */
export const getKakaoUserInfo = async (accessToken) => {
  try {
    const response = await fetch('https://kapi.kakao.com/v2/user/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    if (!response.ok) {
      throw new Error('사용자 정보 조회 실패')
    }

    const data = await response.json()
    
    // 사용자 정보 가공
    return {
      id: data.id.toString(),
      name: data.properties?.nickname || '카카오 사용자',
      email: data.kakao_account?.email || '',
      profileImage: data.properties?.profile_image || '',
      loginType: 'kakao',
      loginAt: new Date().toISOString(),
      accessToken: accessToken
    }
  } catch (error) {
    console.error('카카오 사용자 정보 조회 오류:', error)
    throw error
  }
}

/**
 * 카카오 로그아웃
 */
export const kakaoLogout = async (accessToken) => {
  try {
    await fetch('https://kapi.kakao.com/v1/user/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  } catch (error) {
    console.error('카카오 로그아웃 오류:', error)
  }
}

/**
 * 로컬스토리지에서 카카오 사용자 정보 관리
 */
export const saveKakaoUser = (userInfo) => {
  localStorage.setItem('user', JSON.stringify(userInfo))
  localStorage.setItem('kakao_token', userInfo.accessToken)
}

export const getKakaoUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const removeKakaoUser = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('kakao_token')
}

/**
 * 카카오 SDK를 사용한 간편 로그인 (선택사항)
 */
export const initKakaoSDK = () => {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_API_KEY)
  }
}

export const kakaoSDKLogin = () => {
  return new Promise((resolve, reject) => {
    if (!window.Kakao) {
      reject(new Error('카카오 SDK가 로드되지 않았습니다'))
      return
    }

    window.Kakao.Auth.login({
      success: (authObj) => {
        // 사용자 정보 가져오기
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (res) => {
            const userInfo = {
              id: res.id.toString(),
              name: res.properties?.nickname || '카카오 사용자',
              email: res.kakao_account?.email || '',
              profileImage: res.properties?.profile_image || '',
              loginType: 'kakao',
              loginAt: new Date().toISOString(),
              accessToken: authObj.access_token
            }
            resolve(userInfo)
          },
          fail: (error) => {
            reject(error)
          }
        })
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
} 