/**
 * Firebase Authentication 서비스
 * 카카오 JavaScript SDK 2.7.4 기반 로그인 (올바른 인증 플로우)
 */

import { 
  signInWithCustomToken,
  signInAnonymously,
  signOut, 
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

/**
 * 카카오 SDK 로그인 (모바일 최적화 - 팝업 우선)
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
    
    // 모바일 환경 감지
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    console.log('모바일 환경:', isMobile)

    if (isMobile) {
      // 모바일에서는 팝업 방식 우선 사용
      return await signInWithKakaoPopup()
    }

    // 데스크톱에서는 팝업 방식 사용 (원래 잘 되던 방식)
    try {
      console.log('데스크톱 환경 - 팝업 로그인 시도...')
      return await signInWithKakaoPopup()
    } catch (authError) {
      console.error('팝업 로그인 실패:', authError)
      return {
        success: false,
        error: authError.message || '로그인에 실패했습니다.'
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

// 팝업 상태 관리
let kakaoPopup = null
let isPopupInProgress = false

/**
 * 카카오 팝업 로그인 (모바일 최적화)
 */
export const signInWithKakaoPopup = async () => {
  // 중복 팝업 방지
  if (isPopupInProgress) {
    console.log('이미 로그인 진행 중입니다.')
    return {
      success: false,
      error: '이미 로그인이 진행 중입니다.'
    }
  }
  try {
    console.log('팝업 로그인 방식 시도...')
    
    const currentUrl = window.location.origin
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    // 카카오 로그인 URL 생성
    const loginUrl = new URL('https://kauth.kakao.com/oauth/authorize')
    loginUrl.searchParams.append('client_id', '240138285eefbcd9ab66f4a85efbfbb5')
    loginUrl.searchParams.append('redirect_uri', currentUrl + '/kakao-callback')
    loginUrl.searchParams.append('response_type', 'code')
    loginUrl.searchParams.append('scope', 'profile_nickname,profile_image,account_email')
    
    console.log('카카오 로그인 URL:', loginUrl.toString())
    
    if (isMobile) {
      // 모바일에서는 현재 창에서 리디렉션
      console.log('모바일 환경 - 현재 창에서 로그인')
      
      isPopupInProgress = true
      
      // 현재 URL을 세션에 저장
      sessionStorage.setItem('login_return_url', window.location.href)
      
      // 현재 창에서 카카오 로그인으로 이동
      window.location.href = loginUrl.toString()
      
      return new Promise(() => {}) // pending 상태로 유지
    } else {
      // 데스크톱에서는 팝업 창 사용
      console.log('데스크톱 환경 - 팝업 창 로그인')
      
      isPopupInProgress = true
      kakaoPopup = window.open(
        loginUrl.toString(), 
        'kakao_login', 
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )
      
      return new Promise((resolve) => {
        const checkClosed = setInterval(() => {
          if (kakaoPopup.closed) {
            clearInterval(checkClosed)
            isPopupInProgress = false
            console.log('팝업 창이 닫혔습니다.')
            
            // 팝업이 닫혔을 때 로그인 상태 확인
            setTimeout(async () => {
              try {
                const authStatus = window.Kakao.Auth.getStatusInfo()
                console.log('팝업 후 인증 상태:', authStatus)
                
                if (authStatus.status === 'connected') {
                  const userResponse = await window.Kakao.API.request({
                    url: '/v2/user/me'
                  })
                  
                  console.log('팝업 로그인 성공, 사용자 정보:', userResponse)
                  
                  const userInfo = {
                    id: userResponse.id.toString(),
                    uid: userResponse.id.toString(),
                    name: userResponse.properties?.nickname || '카카오 사용자',
                    email: userResponse.kakao_account?.email || '',
                    profileImage: userResponse.properties?.profile_image || '',
                    loginType: 'kakao',
                    loginAt: new Date().toISOString(),
                    accessToken: 'popup_login'
                  }

                  await saveUserToFirestore(userInfo)
                  
                  resolve({
                    success: true,
                    user: userInfo
                  })
                } else {
                  console.log('팝업 로그인 실패')
                  resolve({
                    success: false,
                    error: '로그인이 취소되었습니다.'
                  })
                }
              } catch (error) {
                console.error('팝업 후 사용자 정보 조회 실패:', error)
                resolve(await createDemoUser())
              }
            }, 1000)
          }
        }, 1000)
        
        // 30초 후 자동 타임아웃
        setTimeout(() => {
          if (!kakaoPopup.closed) {
            kakaoPopup.close()
          }
          clearInterval(checkClosed)
          isPopupInProgress = false
          console.log('팝업 로그인 타임아웃')
          resolve({
            success: false,
            error: '로그인 시간이 초과되었습니다.'
          })
        }, 30000)
      })
    }
    
  } catch (error) {
    console.error('팝업 로그인 오류:', error)
    isPopupInProgress = false
    return {
      success: false,
      error: '로그인 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 데모 사용자 생성
 */
const createDemoUser = async () => {
  console.log('데모 사용자 생성...')
  
  const demoUser = {
    id: 'demo_' + Date.now(),
    uid: 'demo_' + Date.now(), // uid 필드 추가
    name: '데모 사용자 (카카오 연동 준비중)',
    email: 'demo@maumilgi.app',
    profileImage: '/app-icon.png',
    loginType: 'demo',
    loginAt: new Date().toISOString(),
    accessToken: 'demo_mode'
  }

  await saveUserToFirestore(demoUser)
  
  return {
    success: true,
    user: demoUser,
    isDemo: true,
    message: '카카오 로그인을 준비 중입니다. 데모 모드로 체험해보세요!'
  }
}

/**
 * 카카오 콜백 로그인 (레거시 호환)
 */
export const signInWithKakaoCallback = async () => {
  console.warn('카카오 콜백 로그인은 SDK 2.7.4에서 지원되지 않습니다')
  return await signInWithKakaoSDK()
}

/**
 * 리다이렉트 결과 처리 (모바일 최적화)
 */
export const handleRedirectResult = async () => {
  // URL에서 카카오 인증 코드 확인
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const error = urlParams.get('error')
  
  // 카카오 콜백 URL인지 확인
  const isKakaoCallback = window.location.pathname === '/kakao-callback' || code || error
  
  if (error) {
    console.error('카카오 로그인 오류:', error)
    
    // 원래 페이지로 이동 (모바일 고려)
    const returnUrl = sessionStorage.getItem('login_return_url') || '/'
    sessionStorage.removeItem('login_return_url')
    
    if (window.location.pathname === '/kakao-callback') {
      window.location.href = returnUrl
    }
    
    return { 
      success: false,
      error: '카카오 로그인이 취소되었습니다.'
    }
  }
  
  if (code) {
    console.log('카카오 인증 코드 발견:', code)
    
    try {
      // 인증 코드로 액세스 토큰 교환
      console.log('인증 코드를 액세스 토큰으로 교환 중...')
      
      const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: '240138285eefbcd9ab66f4a85efbfbb5',
          redirect_uri: window.location.origin + '/kakao-callback',
          code: code
        })
      })
      
      if (!tokenResponse.ok) {
        throw new Error(`토큰 교환 실패: ${tokenResponse.status}`)
      }
      
      const tokenData = await tokenResponse.json()
      console.log('토큰 교환 성공:', tokenData)
      
      // 사용자 정보 요청 (액세스 토큰 사용)
      const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      })
      
      if (!userResponse.ok) {
        throw new Error(`사용자 정보 조회 실패: ${userResponse.status}`)
      }
      
      const userData = await userResponse.json()
      console.log('사용자 정보 조회 성공:', userData)
      
      const userInfo = {
        id: userData.id.toString(),
        uid: userData.id.toString(),
        name: userData.properties?.nickname || '카카오 사용자',
        email: userData.kakao_account?.email || '',
        profileImage: userData.properties?.profile_image || '',
        loginType: 'kakao',
        loginAt: new Date().toISOString(),
        accessToken: tokenData.access_token
      }

      await saveUserToFirestore(userInfo)
      
      // 모바일에서 원래 페이지로 이동
      const returnUrl = sessionStorage.getItem('login_return_url') || '/'
      sessionStorage.removeItem('login_return_url')
      
      if (window.location.pathname === '/kakao-callback') {
        // 콜백 페이지에서는 원래 페이지로 리디렉션
        setTimeout(() => {
          window.location.href = returnUrl
        }, 1000)
      } else {
        // URL에서 코드 제거
        window.history.replaceState({}, document.title, window.location.pathname)
      }
      
      return { 
        success: true,
        user: userInfo,
        message: '카카오 로그인 성공!',
        redirect: window.location.pathname === '/kakao-callback'
      }
      
    } catch (error) {
      console.error('토큰 교환 또는 API 호출 실패:', error)
      
      // 원래 페이지로 이동 (모바일 고려)
      const returnUrl = sessionStorage.getItem('login_return_url') || '/'
      sessionStorage.removeItem('login_return_url')
      
      if (window.location.pathname === '/kakao-callback') {
        setTimeout(() => {
          window.location.href = returnUrl
        }, 2000)
      } else {
        window.history.replaceState({}, document.title, window.location.pathname)
      }
      
      const demoUser = await createDemoUser()
      return {
        ...demoUser,
        message: '카카오 로그인 처리 중 문제가 발생했습니다. 데모 모드로 시작합니다.',
        redirect: window.location.pathname === '/kakao-callback'
      }
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
        // 카카오 로그아웃 오류는 무시 (401 Unauthorized는 정상적인 경우)
        console.log('카카오 로그아웃 오류 (무시됨):', error)
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
    // 1단계: Firebase Auth에 Anonymous 로그인 (인증 토큰 생성)
    console.log('Firebase Auth Anonymous 로그인 시도...')
    const authResult = await signInAnonymously(auth)
    console.log('Firebase Auth 로그인 성공:', authResult.user.uid)
    
    // 2단계: 카카오 사용자 정보를 Firebase UID와 연결
    const firebaseUid = authResult.user.uid
    const userRef = doc(db, 'users', firebaseUid)
    const userSnap = await getDoc(userRef)
    
    const userData = {
      uid: firebaseUid,
      kakaoId: userInfo.id, // 카카오 ID 별도 저장
      email: userInfo.email,
      displayName: userInfo.name,
      photoURL: userInfo.profileImage,
      lastLoginAt: serverTimestamp(),
      loginType: userInfo.loginType || 'kakao'
    }
    
    // 로컬스토리지 저장용 사용자 정보 (Firebase UID 사용)
    const localUserInfo = {
      ...userInfo,
      uid: firebaseUid, // Firebase UID 사용
      firebaseUid: firebaseUid,
      kakaoId: userInfo.id
    }
    
    if (!userSnap.exists()) {
      // 새 사용자 - 생성일 추가
      userData.createdAt = serverTimestamp()
    }
    
    await setDoc(userRef, userData, { merge: true })
    console.log('Firebase Auth 로그인 및 Firestore 저장 완료')
    
    // 로컬스토리지에도 저장 (Firebase UID 포함)
    localStorage.setItem('user', JSON.stringify(localUserInfo))
    
      } catch (error) {
      console.error('Firebase Auth 로그인 또는 사용자 정보 저장 오류:', error)
      
      // Firebase 로그인 실패 시에도 로컬에는 저장 (데모 모드)
      const localUserInfo = {
        ...userInfo,
        uid: userInfo.id,
        isDemo: true // 데모 모드 표시
      }
      localStorage.setItem('user', JSON.stringify(localUserInfo))
      console.log('데모 모드로 로컬 저장 완료')
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