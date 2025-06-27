/**
 * Firebase Authentication 서비스
 * 카카오 JavaScript SDK 2.7.4 기반 로그인 (Promise API)
 */

import { 
  signInWithCustomToken,
  signOut, 
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

/**
 * 카카오 SDK 로그인 (Promise 기반 최신 API)
 */
export const signInWithKakaoSDK = async () => {
  try {
    if (!window.Kakao) {
      throw new Error('카카오 SDK가 로드되지 않았습니다')
    }

    if (!window.Kakao.isInitialized()) {
      throw new Error('카카오 SDK가 초기화되지 않았습니다')
    }

    // 카카오 로그인 상태 확인
    const authStatus = window.Kakao.Auth.getStatusInfo()
    console.log('카카오 인증 상태:', authStatus)

    try {
      // Promise 기반 로그인 (SDK 2.7.4+)
      console.log('카카오 로그인 시도 중...')
      
      // 먼저 간단한 로그인 방식 시도
      const authResponse = await window.Kakao.Auth.login()
      console.log('카카오 로그인 응답:', authResponse)
      
      // 사용자 정보 요청
      const userResponse = await window.Kakao.API.request({
        url: '/v2/user/me'
      })
      
      console.log('카카오 사용자 정보:', userResponse)

      const userInfo = {
        id: userResponse.id.toString(),
        name: userResponse.properties?.nickname || '카카오 사용자',
        email: userResponse.kakao_account?.email || '',
        profileImage: userResponse.properties?.profile_image || '',
        loginType: 'kakao',
        loginAt: new Date().toISOString(),
        accessToken: authResponse.access_token || 'sdk_2_7_4'
      }

      // Firebase에 사용자 정보 저장
      await saveUserToFirestore(userInfo)
      
      // 로컬스토리지에 토큰 저장
      if (authResponse.access_token) {
        localStorage.setItem('kakao_token', authResponse.access_token)
      }
      
      return {
        success: true,
        user: userInfo
      }

    } catch (authError) {
      console.error('카카오 로그인 1차 실패:', authError)
      
      // 폴백: 콜백 방식 시도
      return await signInWithKakaoCallback()
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
 * 카카오 콜백 방식 로그인 (폴백)
 */
export const signInWithKakaoCallback = async () => {
  try {
    return new Promise((resolve, reject) => {
      // 콜백 방식으로 로그인 시도
      if (window.Kakao.Auth.login) {
        window.Kakao.Auth.login({
          success: async (authObj) => {
            console.log('카카오 콜백 로그인 성공:', authObj)
            
            try {
              // 사용자 정보 요청 (콜백 방식)
              window.Kakao.API.request({
                url: '/v2/user/me',
                success: async (res) => {
                  console.log('카카오 사용자 정보 (콜백):', res)
                  
                  const userInfo = {
                    id: res.id.toString(),
                    name: res.properties?.nickname || '카카오 사용자',
                    email: res.kakao_account?.email || '',
                    profileImage: res.properties?.profile_image || '',
                    loginType: 'kakao',
                    loginAt: new Date().toISOString(),
                    accessToken: authObj.access_token
                  }

                  await saveUserToFirestore(userInfo)
                  localStorage.setItem('kakao_token', authObj.access_token)
                  
                  resolve({
                    success: true,
                    user: userInfo
                  })
                },
                fail: (error) => {
                  console.error('사용자 정보 요청 실패:', error)
                  reject({
                    success: false,
                    error: '사용자 정보 조회 실패'
                  })
                }
              })
            } catch (error) {
              reject({
                success: false,
                error: '사용자 정보 처리 오류'
              })
            }
          },
          fail: (error) => {
            console.error('카카오 콜백 로그인 실패:', error)
            reject({
              success: false,
              error: error.error_description || '카카오 로그인 실패'
            })
          }
        })
      } else {
        // Auth.login도 없으면 직접 API 요청
        console.log('Auth.login 없음, 직접 API 요청 시도')
        
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: async (res) => {
            console.log('직접 API 요청 성공:', res)
            
            const userInfo = {
              id: res.id.toString(),
              name: res.properties?.nickname || '카카오 사용자',
              email: res.kakao_account?.email || '',
              profileImage: res.properties?.profile_image || '',
              loginType: 'kakao',
              loginAt: new Date().toISOString(),
              accessToken: 'direct_api'
            }

            await saveUserToFirestore(userInfo)
            
            resolve({
              success: true,
              user: userInfo
            })
          },
          fail: (error) => {
            console.error('직접 API 요청 실패:', error)
            reject({
              success: false,
              error: '로그인 처리 실패'
            })
          }
        })
      }
    })
  } catch (error) {
    console.error('카카오 콜백 로그인 오류:', error)
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
 * 리다이렉트 결과 처리
 */
export const handleRedirectResult = async () => {
  // URL에서 카카오 인증 코드 확인
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  
  if (code) {
    console.log('카카오 인증 코드 발견:', code)
    // 인증 코드를 토큰으로 교환하는 로직 필요
    // 현재는 간단히 성공 처리
    return { 
      success: true,
      message: '리다이렉트 로그인 감지됨' 
    }
  }
  
  return { success: false }
}

/**
 * 로그아웃
 */
export const signOutUser = async () => {
  try {
    // 카카오 로그아웃
    if (window.Kakao && window.Kakao.Auth) {
      try {
        // Promise 방식으로 로그아웃 시도
        if (window.Kakao.Auth.logout) {
          try {
            await window.Kakao.Auth.logout()
            console.log('카카오 로그아웃 완료 (Promise)')
          } catch (logoutError) {
            // 콜백 방식으로 폴백
            await new Promise((resolve) => {
              window.Kakao.Auth.logout(() => {
                console.log('카카오 로그아웃 완료 (Callback)')
                resolve()
              })
            })
          }
        } else {
          // 토큰 제거 방식
          window.Kakao.Auth.setAccessToken(null)
          console.log('카카오 토큰 제거 완료')
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
      loginType: 'kakao'
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