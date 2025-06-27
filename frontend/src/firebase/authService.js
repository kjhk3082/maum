/**
 * Firebase Authentication 서비스 - 간단한 카카오 로그인
 */

import { 
  signInAnonymously,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

/**
 * 간단한 카카오 로그인 (원래 잘 되던 방식)
 */
export const signInWithKakaoSDK = async () => {
  try {
    console.log('카카오 로그인 시작...')
    
    // 카카오 로그인 URL
    const loginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=240138285eefbcd9ab66f4a85efbfbb5&redirect_uri=https://maumilgi-1a4cb.web.app/kakao-callback&response_type=code&scope=profile_nickname,profile_image,account_email`
    
    // 팝업 창 열기 (한 개만)
    const popup = window.open(
      loginUrl, 
      'kakao_login', 
      'width=500,height=600,scrollbars=yes,resizable=yes'
    )
    
    console.log('카카오 로그인 팝업 열림')
    
    // 팝업 완료까지 기다리기 (간단한 방식)
    return new Promise((resolve) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          console.log('팝업 창이 닫혔습니다.')
          resolve({ success: true })
        }
      }, 1000)
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
 * 카카오 콜백 처리 (간단한 방식)
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
          redirect_uri: 'https://maumilgi-1a4cb.web.app/kakao-callback',
          code: code
        })
      })
      
      const tokenData = await tokenResponse.json()
      console.log('토큰 교환 성공')
      
      // 사용자 정보 요청
      const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      })
      
      const userData = await userResponse.json()
      console.log('사용자 정보 조회 성공')
      
      const userInfo = {
        id: userData.id.toString(),
        uid: userData.id.toString(),
        name: userData.properties?.nickname || '카카오 사용자',
        email: userData.kakao_account?.email || '',
        profileImage: userData.properties?.profile_image || '',
        loginType: 'kakao',
        accessToken: tokenData.access_token
      }

      // Firebase에만 저장 (로컬스토리지 사용 안함)
      await saveUserToFirestore(userInfo)
      
      // 홈으로 이동
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
      
      return { 
        success: true,
        user: userInfo,
        message: '카카오 로그인 성공!',
        redirect: true
      }
      
    } catch (error) {
      console.error('카카오 로그인 처리 실패:', error)
      
      // 로그인 페이지로 이동 (데모 모드 사용 안함)
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
      
      return {
        success: false,
        error: '카카오 로그인 처리 중 문제가 발생했습니다.',
        redirect: true
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
 * 인증 상태 리스너 (Firebase 기반)
 */
export const onAuthStateChange = (callback) => {
  // Firebase 인증 상태 리스너
  const unsubscribeFirebase = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      // Firebase 사용자가 있으면 Firestore에서 상세 정보 가져오기
      getUserFromFirestore(firebaseUser.uid)
        .then(userData => {
          if (userData) {
            const userInfo = {
              uid: firebaseUser.uid,
              id: userData.kakaoId || firebaseUser.uid,
              name: userData.displayName || '사용자',
              email: userData.email || '',
              profileImage: userData.photoURL || '',
              loginType: userData.loginType || 'kakao'
            }
            callback(userInfo)
          } else {
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