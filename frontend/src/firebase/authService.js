/**
 * Firebase Authentication 서비스 - 카카오 로그인만
 */

import { 
  signInAnonymously,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

/**
 * 앱 시작 시 Firebase 초기화 (데모 사용자 제거)
 */
export const initializeAuth = async () => {
  try {
    // 기존 Firebase 사용자 로그아웃
    await signOut(auth)
    console.log('Firebase 초기화 완료 - 모든 사용자 로그아웃')
  } catch (error) {
    console.log('Firebase 초기화:', error.message)
  }
}

/**
 * 카카오 JavaScript SDK를 사용한 로그인
 */
export const signInWithKakaoSDK = async () => {
  try {
    console.log('카카오 로그인 시작...')
    
    // 카카오 SDK 확인
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      throw new Error('카카오 SDK가 초기화되지 않았습니다.')
    }
    
    return new Promise((resolve) => {
      // 팝업 방식으로 로그인
      window.Kakao.Auth.loginForm({
        success: function() {
          console.log('카카오 로그인 성공')
          
          // 사용자 정보 가져오기
          window.Kakao.API.request({
            url: '/v2/user/me',
            success: async (userData) => {
              console.log('사용자 정보 조회 성공:', userData)
              
              const userInfo = {
                id: userData.id.toString(),
                uid: userData.id.toString(),
                name: userData.properties?.nickname || '카카오 사용자',
                email: userData.kakao_account?.email || '',
                profileImage: userData.properties?.profile_image || '',
                loginType: 'kakao'
              }

              try {
                // Firebase에 저장
                await saveUserToFirestore(userInfo)
                
                resolve({ 
                  success: true, 
                  user: userInfo,
                  message: '로그인 성공!'
                })
              } catch (error) {
                console.error('Firebase 저장 오류:', error)
                resolve({
                  success: false,
                  error: '로그인 정보 저장 중 오류가 발생했습니다.'
                })
              }
            },
            fail: (error) => {
              console.error('사용자 정보 조회 실패:', error)
              resolve({
                success: false,
                error: '사용자 정보를 가져올 수 없습니다.'
              })
            }
          })
        },
        fail: function(error) {
          console.error('카카오 로그인 실패:', error)
          resolve({
            success: false,
            error: '카카오 로그인에 실패했습니다.'
          })
        }
      })
    })
    
  } catch (error) {
    console.error('카카오 로그인 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 리다이렉트 결과 처리 (카카오 SDK 사용 시 필요 없음)
 */
export const handleRedirectResult = async () => {
  // 카카오 SDK 사용 시에는 리다이렉트 처리가 필요 없음
  return { success: false }
}

/**
 * 로그아웃
 */
export const signOutUser = async () => {
  try {
    // Firebase 로그아웃만
    await signOut(auth)
    console.log('로그아웃 완료')
    
    return { success: true }
  } catch (error) {
    console.error('로그아웃 오류:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Firebase에만 사용자 정보 저장 (로컬스토리지 사용 안함)
 */
const saveUserToFirestore = async (userInfo) => {
  try {
    console.log('Firebase 로그인 시도...')
    const authResult = await signInAnonymously(auth)
    console.log('Firebase 로그인 성공:', authResult.user.uid)
    
    const firebaseUid = authResult.user.uid
    const userRef = doc(db, 'users', firebaseUid)
    const userSnap = await getDoc(userRef)
    
    const userData = {
      uid: firebaseUid,
      kakaoId: userInfo.id,
      email: userInfo.email,
      displayName: userInfo.name,
      photoURL: userInfo.profileImage,
      lastLoginAt: serverTimestamp(),
      loginType: 'kakao'
    }
    
    if (!userSnap.exists()) {
      userData.createdAt = serverTimestamp()
    }
    
    await setDoc(userRef, userData, { merge: true })
    console.log('Firestore 저장 완료')
    
  } catch (error) {
    console.error('Firebase 저장 오류:', error)
    throw error
  }
}

/**
 * 인증 상태 확인 (Firebase 기반)
 */
export const getCurrentUser = () => {
  return auth.currentUser
}

export const isAuthenticated = () => {
  return !!auth.currentUser
}

export const checkKakaoSDK = () => {
  return !!(window.Kakao && window.Kakao.isInitialized())
}

/**
 * 인증 상태 리스너 (카카오 로그인만 인정)
 */
export const onAuthStateChange = (callback) => {
  // Firebase 인증 상태 리스너
  const unsubscribeFirebase = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      // Firebase 사용자가 있으면 Firestore에서 상세 정보 가져오기
      getUserFromFirestore(firebaseUser.uid)
        .then(userData => {
          // 카카오 로그인한 사용자만 로그인 상태로 인정
          if (userData && userData.kakaoId && userData.loginType === 'kakao') {
            const userInfo = {
              uid: firebaseUser.uid,
              id: userData.kakaoId,
              name: userData.displayName || '카카오 사용자',
              email: userData.email || '',
              profileImage: userData.photoURL || '',
              loginType: 'kakao'
            }
            callback(userInfo)
          } else {
            // 카카오 로그인이 아닌 사용자는 로그아웃 처리
            callback(null)
          }
        })
        .catch(() => {
          callback(null)
        })
    } else {
      callback(null)
    }
  })

  return unsubscribeFirebase
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

// 레거시 호환용
export const signInWithKakaoPopup = () => signInWithKakaoSDK()
export const signInWithKakaoCallback = () => signInWithKakaoSDK() 