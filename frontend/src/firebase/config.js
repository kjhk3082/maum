// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration (환경변수 사용)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB9vHmOfRRe_deSWKMEIQEtDbXoUaDnJmQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "maumilgi-1a4cb.firebaseapp.com", 
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "maumilgi-1a4cb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "maumilgi-1a4cb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "43173390015",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:43173390015:web:c93ba810fcb0972616880a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-3KXTHTNKPC"
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