/**
 * Firebase Authentication 서비스 - 카카오 로그인만
 */

import { 
  signInAnonymously,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { auth, db } from './config'

/**
 * 앱 시작 시 Firebase 초기화 (데모 사용자만 제거)
 */
export const initializeAuth = async () => {
  try {
    const currentUser = auth.currentUser
    if (currentUser) {
      // Firestore에서 사용자 정보 확인
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      const userData = userDoc.data()
      
      // 카카오 로그인 사용자가 아닌 경우에만 로그아웃
      if (!userData || !userData.kakaoId || userData.loginType !== 'kakao') {
        await signOut(auth)
        console.log('Firebase 초기화 - 데모 사용자 로그아웃')
      } else {
        console.log('Firebase 초기화 - 카카오 사용자 유지:', userData.kakaoId)
      }
    }
  } catch (error) {
    console.log('Firebase 초기화 오류:', error.message)
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
    
    // 카카오 SDK v2에서 사용 가능한 메서드 확인
    console.log('Kakao.Auth 메서드들:', Object.keys(window.Kakao.Auth))
    
    // SDK v2에서는 authorize 사용 (현재 페이지에서 처리)
    window.Kakao.Auth.authorize({
      redirectUri: window.location.origin + '/',
      scope: 'profile_nickname,profile_image,account_email',
      throughTalk: false // 카카오톡 사용 안함
    })
    
    // authorize는 페이지를 이동시키므로 Promise 불필요
    return { 
      success: true,
      message: '카카오 로그인 페이지로 이동합니다...'
    }
    
  } catch (error) {
    console.error('카카오 로그인 오류:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 리다이렉트 결과 처리
 */
export const handleRedirectResult = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const error = urlParams.get('error')
  
  if (error) {
    console.error('카카오 로그인 오류:', error)
    return { 
      success: false,
      error: '카카오 로그인이 취소되었습니다.'
    }
  }
  
  if (code) {
    console.log('카카오 인증 코드 발견:', code)
    
    try {
      // 토큰 교환
      const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: '240138285eefbcd9ab66f4a85efbfbb5',
          redirect_uri: window.location.origin + '/',
          code: code
        })
      })
      
      const tokenData = await tokenResponse.json()
      
      if (tokenData.access_token) {
        console.log('토큰 교환 성공')
        
        // 사용자 정보 요청
        const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        })
        
        const userData = await userResponse.json()
        console.log('사용자 정보 조회 성공:', userData)
        
        const userInfo = {
          id: userData.id.toString(),
          uid: userData.id.toString(),
          name: userData.properties?.nickname || '카카오 사용자',
          email: userData.kakao_account?.email || '',
          profileImage: userData.properties?.profile_image || '',
          loginType: 'kakao',
          accessToken: tokenData.access_token
        }

        // Firebase에 저장
        await saveUserToFirestore(userInfo)
        
        // URL에서 code 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname)
        
        return { 
          success: true,
          user: userInfo,
          message: '카카오 로그인 성공!'
        }
      } else {
        throw new Error('토큰 교환 실패')
      }
      
    } catch (error) {
      console.error('카카오 로그인 처리 실패:', error)
      return {
        success: false,
        error: '카카오 로그인 처리 중 문제가 발생했습니다.'
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
    // 로컬스토리지에서 기존 UID 확인 (임시 해결책)
    const existingUid = localStorage.getItem(`kakao_uid_${userInfo.id}`)
    
    let firebaseUid
    let authResult
    
    if (existingUid) {
      // 기존 UID가 있으면 새로운 익명 로그인 후 해당 UID 사용
      console.log('기존 카카오 사용자 UID 발견:', existingUid)
      authResult = await signInAnonymously(auth)
      firebaseUid = existingUid // 로컬에 저장된 UID 사용
    } else {
      // 새로운 사용자인 경우
      console.log('새로운 카카오 사용자, Firebase 계정 생성...')
      authResult = await signInAnonymously(auth)
      firebaseUid = authResult.user.uid
      console.log('새 Firebase UID 생성:', firebaseUid)
      
      // 로컬에 매핑 저장
      localStorage.setItem(`kakao_uid_${userInfo.id}`, firebaseUid)
    }
    
    const userRef = doc(db, 'users', firebaseUid)
    
    // 기존 문서 확인 (권한 오류 방지)
    let userSnap
    try {
      userSnap = await getDoc(userRef)
    } catch (error) {
      console.log('기존 문서 조회 실패, 새 문서로 생성')
      userSnap = { exists: () => false }
    }
    
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