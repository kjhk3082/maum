// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration (환경변수만 사용)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, 
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// 환경변수 누락 시 오류 발생
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.')
}

console.log('🔥 Firebase 설정 로드:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  usingEnvVars: !!import.meta.env.VITE_FIREBASE_API_KEY
})

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Analytics는 브라우저 환경에서만 초기화
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

export default app 