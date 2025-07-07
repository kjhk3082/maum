/**
 * Firebase Authentication 서비스 - Google 로그인
 */

import { 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp
} from 'firebase/firestore'
import { auth, db } from './config'

// Google 로그인 제공자 설정
const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')

/**
 * 앱 시작 시 Firebase 초기화
 */
export const initializeAuth = async () => {
  try {
    console.log('Firebase 인증 초기화 완료')
    // Google 로그인은 별도 초기화가 필요 없음
  } catch (error) {
    console.log('Firebase 초기화 오류:', error.message)
  }
}

/**
 * Google 로그인
 */
export const signInWithGoogle = async () => {
  try {
    console.log('Google 로그인 시작...')
    
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    
    console.log('Google 로그인 성공:', user.uid)
    
    // 사용자 정보를 Firestore에 저장
    await saveUserToFirestore({
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      profileImage: user.photoURL
    })
    
    return {
      success: true,
      user: {
        uid: user.uid,
        id: user.uid,
        name: user.displayName,
        email: user.email,
        profileImage: user.photoURL,
        loginType: 'google'
      },
      message: 'Google 로그인 성공!'
    }
    
  } catch (error) {
    console.error('Google 로그인 오류:', error)
    
    let errorMessage = 'Google 로그인에 실패했습니다.'
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = '로그인 창이 닫혔습니다.'
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = '팝업이 차단되었습니다. 팝업 차단을 해제해주세요.'
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
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
 * Firebase에 사용자 정보 저장
 */
const saveUserToFirestore = async (userInfo) => {
  try {
    const userRef = doc(db, 'users', userInfo.uid)
    
    // 기존 사용자 정보 확인
    const userSnap = await getDoc(userRef)
    
    const userData = {
      uid: userInfo.uid,
      email: userInfo.email,
      displayName: userInfo.name,
      photoURL: userInfo.profileImage,
      lastLoginAt: serverTimestamp(),
      loginType: 'google'
    }
    
    if (!userSnap.exists()) {
      userData.createdAt = serverTimestamp()
    }
    
    await setDoc(userRef, userData, { merge: true })
    console.log('Google 사용자 Firestore 저장 완료')
    
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



/**
 * 인증 상태 리스너 (Google 로그인)
 */
export const onAuthStateChange = (callback) => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // Firestore에서 사용자 정보 가져오기
        const userData = await getUserFromFirestore(firebaseUser.uid)
        
        if (userData && userData.loginType === 'google') {
          const userInfo = {
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            name: userData.displayName || firebaseUser.displayName || 'Google 사용자',
            email: userData.email || firebaseUser.email || '',
            profileImage: userData.photoURL || firebaseUser.photoURL || '',
            loginType: 'google'
          }
          callback(userInfo)
        } else {
          // Google 로그인이 아닌 사용자는 로그아웃
          callback(null)
        }
      } catch (error) {
        console.error('사용자 정보 조회 오류:', error)
        callback(null)
      }
    } else {
      callback(null)
    }
  })

  return unsubscribe
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

 