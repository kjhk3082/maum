/**
 * Firebase Authentication 서비스
 * 카카오 JavaScript SDK 2.7.4 기반 로그인 (100% Promise API)
 */

import { 
  signInWithCustomToken,
  signOut, 
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

/**
 * 카카오 SDK 로그인 (SDK 2.7.4 Promise 전용)
 */
export const signInWithKakaoSDK = async () => {
  try {
    if (!window.Kakao) {
      throw new Error('카카오 SDK가 로드되지 않았습니다')
    }

    if (!window.Kakao.isInitialized()) {
      throw new Error('카카오 SDK가 초기화되지 않았습니다')
    }

    console.log('카카오 로그인 시도 중...')
    console.log('사용 가능한 Kakao 메서드:', Object.keys(window.Kakao))
    console.log('사용 가능한 Auth 메서드:', Object.keys(window.Kakao.Auth || {}))

    try {
      // SDK 2.7.4 방식: 사용자 정보 직접 요청
      console.log('카카오 사용자 정보 직접 요청 시도...')
      
      const userResponse = await window.Kakao.API.request({
        url: '/v2/user/me'
      })
      
      console.log('카카오 사용자 정보 성공:', userResponse)

      const userInfo = {
        id: userResponse.id.toString(),
        name: userResponse.properties?.nickname || '카카오 사용자',
        email: userResponse.kakao_account?.email || '',
        profileImage: userResponse.properties?.profile_image || '',
        loginType: 'kakao',
        loginAt: new Date().toISOString(),
        accessToken: 'kakao_sdk_2_7_4'
      }

      // Firebase에 사용자 정보 저장
      await saveUserToFirestore(userInfo)
      
      return {
        success: true,
        user: userInfo
      }

    } catch (apiError) {
      console.error('직접 API 요청 실패:', apiError)
      
      // 폴백: 간접적인 방법으로 로그인 시도
      try {
        console.log('간접 로그인 방법 시도...')
        
        // 카카오 로그인 페이지로 리다이렉트
        const currentUrl = window.location.origin
        const loginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=240138285eefbcd9ab66f4a85efbfbb5&redirect_uri=${encodeURIComponent(currentUrl)}&response_type=code`
        
        console.log('카카오 로그인 URL로 이동:', loginUrl)
        
        // 새 창으로 로그인
        const popup = window.open(loginUrl, 'kakao_login', 'width=400,height=500')
        
        return new Promise((resolve) => {
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed)
              // 팝업이 닫혔을 때 다시 사용자 정보 시도
              setTimeout(async () => {
                try {
                  const retryResponse = await window.Kakao.API.request({
                    url: '/v2/user/me'
                  })
                  
                  const retryUserInfo = {
                    id: retryResponse.id.toString(),
                    name: retryResponse.properties?.nickname || '카카오 사용자',
                    email: retryResponse.kakao_account?.email || '',
                    profileImage: retryResponse.properties?.profile_image || '',
                    loginType: 'kakao',
                    loginAt: new Date().toISOString(),
                    accessToken: 'popup_login'
                  }

                  await saveUserToFirestore(retryUserInfo)
                  
                  resolve({
                    success: true,
                    user: retryUserInfo
                  })
                } catch (retryError) {
                  console.error('재시도 실패:', retryError)
                  resolve({
                    success: false,
                    error: '로그인 완료 후 정보 조회 실패'
                  })
                }
              }, 1000)
            }
          }, 1000)
        })
        
      } catch (popupError) {
        console.error('팝업 로그인 실패:', popupError)
        
        // 최종 폴백: 데모 사용자로 로그인
        console.log('데모 사용자로 폴백...')
        
        const demoUser = {
          id: 'demo_' + Date.now(),
          name: '데모 사용자 (카카오 연동 대기)',
          email: 'demo@kakao.test',
          profileImage: '',
          loginType: 'demo',
          loginAt: new Date().toISOString(),
          accessToken: 'demo_fallback'
        }

        await saveUserToFirestore(demoUser)
        
        return {
          success: true,
          user: demoUser,
          isDemo: true,
          message: '카카오 로그인을 준비 중입니다. 데모 모드로 시작합니다.'
        }
      }
    }

  } catch (error) {
    console.error('카카오 SDK 로그인 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 카카오 팝업 로그인 (레거시 호환)
 */
export const signInWithKakaoPopup = async () => {
  return await signInWithKakaoSDK()
}

/**
 * 카카오 콜백 로그인 (사용 안함 - SDK 2.7.4에서 제거됨)
 */
export const signInWithKakaoCallback = async () => {
  console.warn('카카오 콜백 로그인은 SDK 2.7.4에서 지원되지 않습니다')
  return await signInWithKakaoSDK()
}

/**
 * 리다이렉트 결과 처리
 */
export const handleRedirectResult = async () => {
  // URL에서 카카오 인증 코드 확인
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  
  if (code) {
    console.log('카카오 인증 코드 발견:', code)
    
    try {
      // 인증 코드가 있으면 사용자 정보 조회 시도
      const userResponse = await window.Kakao.API.request({
        url: '/v2/user/me'
      })
      
      const userInfo = {
        id: userResponse.id.toString(),
        name: userResponse.properties?.nickname || '카카오 사용자',
        email: userResponse.kakao_account?.email || '',
        profileImage: userResponse.properties?.profile_image || '',
        loginType: 'kakao',
        loginAt: new Date().toISOString(),
        accessToken: code
      }

      await saveUserToFirestore(userInfo)
      
      // URL에서 코드 제거
      window.history.replaceState({}, document.title, window.location.pathname)
      
      return { 
        success: true,
        user: userInfo,
        message: '리다이렉트 로그인 성공' 
      }
    } catch (error) {
      console.error('리다이렉트 로그인 처리 오류:', error)
    }
  }
  
  return { success: false }
}

/**
 * 로그아웃
 */
export const signOutUser = async () => {
  try {
    // 카카오 로그아웃 (SDK 2.7.4)
    if (window.Kakao && window.Kakao.Auth) {
      try {
        // Promise 방식으로 로그아웃 시도
        if (typeof window.Kakao.Auth.logout === 'function') {
          await window.Kakao.Auth.logout()
          console.log('카카오 로그아웃 완료')
        } else {
          // 토큰 제거 방식
          if (typeof window.Kakao.Auth.setAccessToken === 'function') {
            window.Kakao.Auth.setAccessToken(null)
            console.log('카카오 토큰 제거 완료')
          }
        }
      } catch (error) {
        console.warn('카카오 로그아웃 오류:', error)
      }
    }

    // Firebase 로그아웃
    try {
      await signOut(auth)
    } catch (error) {
      console.warn('Firebase 로그아웃 오류:', error)
    }

    // 로컬스토리지 정리
    localStorage.removeItem('user')
    localStorage.removeItem('kakao_token')
    
    return { success: true }
  } catch (error) {
    console.error('로그아웃 오류:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 인증 상태 리스너 (로컬 상태 기반)
 */
export const onAuthStateChange = (callback) => {
  // 로컬 스토리지 기반 상태 감지
  const checkAuthState = () => {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        callback(userData)
      } catch (error) {
        console.error('사용자 데이터 파싱 오류:', error)
        callback(null)
      }
    } else {
      callback(null)
    }
  }

  // 초기 상태 확인
  checkAuthState()

  // 스토리지 변경 감지
  const handleStorageChange = (e) => {
    if (e.key === 'user') {
      checkAuthState()
    }
  }

  window.addEventListener('storage', handleStorageChange)

  // cleanup 함수 반환
  return () => {
    window.removeEventListener('storage', handleStorageChange)
  }
}

/**
 * Firestore에 사용자 정보 저장
 */
const saveUserToFirestore = async (userInfo) => {
  try {
    const userRef = doc(db, 'users', userInfo.id)
    const userSnap = await getDoc(userRef)
    
    const userData = {
      uid: userInfo.id,
      email: userInfo.email,
      displayName: userInfo.name,
      photoURL: userInfo.profileImage,
      lastLoginAt: serverTimestamp(),
      loginType: userInfo.loginType || 'kakao'
    }
    
    if (!userSnap.exists()) {
      // 새 사용자 - 생성일 추가
      userData.createdAt = serverTimestamp()
    }
    
    await setDoc(userRef, userData, { merge: true })
    console.log('Firestore에 사용자 정보 저장 완료')
    
    // 로컬스토리지에도 저장 (기존 코드 호환성)
    localStorage.setItem('user', JSON.stringify(userInfo))
    
  } catch (error) {
    console.error('사용자 정보 저장 오류:', error)
    // Firestore 저장 실패해도 로컬에는 저장
    localStorage.setItem('user', JSON.stringify(userInfo))
  }
}

/**
 * 현재 사용자 정보 가져오기
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  if (user) {
    try {
      return JSON.parse(user)
    } catch (error) {
      console.error('사용자 정보 파싱 오류:', error)
      return null
    }
  }
  return null
}

/**
 * 사용자 인증 상태 확인
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('user')
}

/**
 * Firestore에서 사용자 정보 가져오기
 */
export const getUserFromFirestore = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return userSnap.data()
    }
    return null
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error)
    return null
  }
}

/**
 * 카카오 SDK 상태 확인
 */
export const checkKakaoSDK = () => {
  const isLoaded = !!(window.Kakao)
  const isInitialized = !!(window.Kakao && window.Kakao.isInitialized())
  
  console.log('카카오 SDK 상태:', { isLoaded, isInitialized })
  
  return isLoaded && isInitialized
} 