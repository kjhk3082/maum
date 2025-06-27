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
 * 카카오 SDK 로그인 (올바른 2.7.4 인증 플로우)
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
    console.log('사용 가능한 Auth 메서드:', Object.keys(window.Kakao.Auth || {}))

    try {
      // 1단계: 카카오 인증 (SDK 2.7.4 방식)
      console.log('카카오 인증 시작...')
      
      const authResponse = await window.Kakao.Auth.authorize({
        redirectUri: window.location.origin
      })
      
      console.log('카카오 인증 성공:', authResponse)
      
      // 2단계: 인증 후 사용자 정보 요청
      console.log('인증 완료, 사용자 정보 요청...')
      
      const userResponse = await window.Kakao.API.request({
        url: '/v2/user/me'
      })
      
      console.log('카카오 사용자 정보 성공:', userResponse)

      const userInfo = {
        id: userResponse.id.toString(),
        uid: userResponse.id.toString(),
        name: userResponse.properties?.nickname || '카카오 사용자',
        email: userResponse.kakao_account?.email || '',
        profileImage: userResponse.properties?.profile_image || '',
        loginType: 'kakao',
        loginAt: new Date().toISOString(),
        accessToken: authResponse.access_token || 'authorized'
      }

      // Firebase에 사용자 정보 저장
      await saveUserToFirestore(userInfo)
      
      return {
        success: true,
        user: userInfo
      }

    } catch (authError) {
      console.error('카카오 인증 실패:', authError)
      
      // 폴백 1: 간단한 authorize 방식
      try {
        console.log('간단 인증 방식 시도...')
        
        // 파라미터 없이 authorize 시도
        await window.Kakao.Auth.authorize()
        console.log('간단 인증 성공')
        
        // 사용자 정보 요청
        const userResponse = await window.Kakao.API.request({
          url: '/v2/user/me'
        })
        
        console.log('간단 인증 후 사용자 정보:', userResponse)

        const userInfo = {
          id: userResponse.id.toString(),
          uid: userResponse.id.toString(),
          name: userResponse.properties?.nickname || '카카오 사용자',
          email: userResponse.kakao_account?.email || '',
          profileImage: userResponse.properties?.profile_image || '',
          loginType: 'kakao',
          loginAt: new Date().toISOString(),
          accessToken: 'simple_auth'
        }

        await saveUserToFirestore(userInfo)
        
        return {
          success: true,
          user: userInfo
        }
        
      } catch (simpleError) {
        console.error('간단 인증도 실패:', simpleError)
        
        // 폴백 2: 팝업 방식 로그인
        return await signInWithKakaoPopup()
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
 * 카카오 팝업 로그인 (폴백 방식)
 */
export const signInWithKakaoPopup = async () => {
  try {
    console.log('팝업 로그인 방식 시도...')
    
    // 카카오 로그인 페이지로 리다이렉트
    const currentUrl = window.location.origin
    const loginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=240138285eefbcd9ab66f4a85efbfbb5&redirect_uri=${encodeURIComponent(currentUrl)}&response_type=code`
    
    console.log('카카오 로그인 URL:', loginUrl)
    
    // 새 창으로 로그인
    const popup = window.open(loginUrl, 'kakao_login', 'width=500,height=600')
    
    return new Promise((resolve) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          console.log('팝업 창이 닫혔습니다. 로그인 상태 확인 중...')
          
          // 팝업이 닫혔을 때 인증 상태 확인
          setTimeout(async () => {
            try {
              // 인증 상태 확인
              const authStatus = window.Kakao.Auth.getStatusInfo()
              console.log('팝업 후 인증 상태:', authStatus)
              
              if (authStatus.status === 'connected') {
                // 인증 성공 - 사용자 정보 요청
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
                // 인증 실패 - 데모 모드로 폴백
                console.log('팝업 로그인 실패, 데모 모드로 전환')
                resolve(await createDemoUser())
              }
            } catch (error) {
              console.error('팝업 후 사용자 정보 조회 실패:', error)
              resolve(await createDemoUser())
            }
          }, 2000) // 2초 대기 후 확인
        }
      }, 1000)
      
      // 30초 후 자동 타임아웃
      setTimeout(() => {
        if (!popup.closed) {
          popup.close()
        }
        clearInterval(checkClosed)
        console.log('팝업 로그인 타임아웃, 데모 모드로 전환')
        resolve(createDemoUser())
      }, 30000)
    })
    
  } catch (error) {
    console.error('팝업 로그인 오류:', error)
    return await createDemoUser()
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
 * 리다이렉트 결과 처리
 */
export const handleRedirectResult = async () => {
  // URL에서 카카오 인증 코드 확인
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  
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
          redirect_uri: window.location.origin,
          code: code
        })
      })
      
      if (!tokenResponse.ok) {
        throw new Error(`토큰 교환 실패: ${tokenResponse.status}`)
      }
      
      const tokenData = await tokenResponse.json()
      console.log('토큰 교환 성공:', tokenData)
      
      // SDK에 액세스 토큰 설정
      if (window.Kakao && window.Kakao.Auth && tokenData.access_token) {
        window.Kakao.Auth.setAccessToken(tokenData.access_token)
        console.log('SDK에 액세스 토큰 설정 완료')
        
        // 이제 사용자 정보 요청
        const userResponse = await window.Kakao.API.request({
          url: '/v2/user/me'
        })
        
        console.log('토큰 교환 후 사용자 정보:', userResponse)
        
        const userInfo = {
          id: userResponse.id.toString(),
          uid: userResponse.id.toString(),
          name: userResponse.properties?.nickname || '카카오 사용자',
          email: userResponse.kakao_account?.email || '',
          profileImage: userResponse.properties?.profile_image || '',
          loginType: 'kakao',
          loginAt: new Date().toISOString(),
          accessToken: tokenData.access_token
        }

        await saveUserToFirestore(userInfo)
        
        // URL에서 코드 제거
        window.history.replaceState({}, document.title, window.location.pathname)
        
        return { 
          success: true,
          user: userInfo,
          message: '카카오 로그인 성공!' 
        }
      } else {
        throw new Error('SDK 토큰 설정 실패')
      }
      
    } catch (error) {
      console.error('토큰 교환 또는 API 호출 실패:', error)
      
      // 토큰 교환 실패 시 데모 모드로 폴백
      console.log('토큰 교환 실패, 데모 모드로 전환')
      
      // URL에서 코드 제거
      window.history.replaceState({}, document.title, window.location.pathname)
      
      const demoUser = await createDemoUser()
      return {
        ...demoUser,
        message: '카카오 로그인 처리 중 문제가 발생했습니다. 데모 모드로 시작합니다.'
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