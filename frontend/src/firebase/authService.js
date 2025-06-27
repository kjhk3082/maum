/**
 * Firebase Authentication 서비스
 * 카카오 JavaScript SDK 기반 로그인
 */

import { 
  signInWithCustomToken,
  signOut, 
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

/**
 * 카카오 SDK 로그인
 */
export const signInWithKakaoSDK = async () => {
  try {
    if (!window.Kakao) {
      throw new Error('카카오 SDK가 로드되지 않았습니다')
    }

    return new Promise((resolve, reject) => {
      window.Kakao.Auth.login({
        success: async (authObj) => {
          try {
            // 카카오 사용자 정보 가져오기
            window.Kakao.API.request({
              url: '/v2/user/me',
              success: async (res) => {
                const userInfo = {
                  id: res.id.toString(),
                  name: res.properties?.nickname || '카카오 사용자',
                  email: res.kakao_account?.email || '',
                  profileImage: res.properties?.profile_image || '',
                  loginType: 'kakao',
                  loginAt: new Date().toISOString(),
                  accessToken: authObj.access_token
                }

                // Firebase에 사용자 정보 저장 (Custom Token 없이 직접 저장)
                await saveUserToFirestore(userInfo)
                
                resolve({
                  success: true,
                  user: userInfo
                })
              },
              fail: (error) => {
                reject({
                  success: false,
                  error: error.msg || '사용자 정보 조회 실패'
                })
              }
            })
          } catch (error) {
            reject({
              success: false,
              error: error.message || '로그인 처리 중 오류 발생'
            })
          }
        },
        fail: (error) => {
          reject({
            success: false,
            error: error.error_description || '카카오 로그인 실패'
          })
        }
      })
    })
  } catch (error) {
    console.error('카카오 SDK 로그인 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 카카오 팝업 로그인 (Legacy - SDK 방식으로 대체)
 */
export const signInWithKakaoPopup = async () => {
  // SDK 방식으로 대체
  return await signInWithKakaoSDK()
}

/**
 * 리다이렉트 결과 처리 (카카오는 사용하지 않음)
 */
export const handleRedirectResult = async () => {
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
        await new Promise((resolve) => {
          window.Kakao.Auth.logout(() => {
            resolve()
          })
        })
      } catch (error) {
        console.warn('카카오 로그아웃 오류:', error)
      }
    }

    // Firebase 로그아웃 (실제로는 세션만 정리)
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
  return !!(window.Kakao && window.Kakao.isInitialized())
} 