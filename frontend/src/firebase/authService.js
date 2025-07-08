import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from './config';

// Firebase 인증 및 Firestore 인스턴스 초기화
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// Google 로그인 및 사용자 정보 저장
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Firestore에 사용자 정보 저장
    await saveUserToFirestore({
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      profileImage: user.photoURL,
    });

    // Firestore에서 사용자 정보 다시 가져옴 (createdAt 포함)
    const userDoc = await getUserFromFirestore(user.uid);

    // 사용자 정보 반환 (createdAt 포함)
    return {
      success: true,
      user: {
        uid: user.uid,
        id: user.uid,
        name: user.displayName,
        email: user.email,
        profileImage: user.photoURL,
        loginType: 'google',
        createdAt: userDoc.createdAt?.toDate?.()?.toISOString?.() || null,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
};

// 인증 상태 변경 시 호출되는 콜백 설정
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userData = await getUserFromFirestore(firebaseUser.uid);
      callback({
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        name: userData.displayName || firebaseUser.displayName || '',
        email: userData.email || firebaseUser.email || '',
        profileImage: userData.photoURL || firebaseUser.photoURL || '',
        loginType: 'google',
        createdAt: userData.createdAt?.toDate?.()?.toISOString?.() || null,
      });
    } else {
      callback(null);
    }
  });
};

// 로그아웃 함수
export const signOut = async () => {
  await firebaseSignOut(auth);
};

// Firestore에 사용자 정보 저장 (최초 가입 시 createdAt 추가, 이후에는 lastLoginAt만 갱신)
const saveUserToFirestore = async (userInfo) => {
  const userRef = doc(db, 'users', userInfo.uid);
  const userSnap = await getDoc(userRef);
//
  const base = {
    uid: userInfo.uid,
    email: userInfo.email,
    displayName: userInfo.name,
    photoURL: userInfo.profileImage,
    lastLoginAt: serverTimestamp(),
    loginType: 'google',
  };

  // 새 유저이거나 createdAt이 없는 경우 createdAt 추가
  if (!userSnap.exists() || !userSnap.data().createdAt) {
    base.createdAt = serverTimestamp();
  }

  await setDoc(userRef, base, { merge: true });
};

// Firestore에서 사용자 정보 조회
const getUserFromFirestore = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};
