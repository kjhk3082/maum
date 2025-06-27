// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9vHmOfRRe_deSWKMEIQEtDbXoUaDnJmQ",
  authDomain: "maumilgi-1a4cb.firebaseapp.com",
  projectId: "maumilgi-1a4cb",
  storageBucket: "maumilgi-1a4cb.firebasestorage.app",
  messagingSenderId: "43173390015",
  appId: "1:43173390015:web:c93ba810fcb0972616880a",
  measurementId: "G-3KXTHTNKPC"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const analytics = getAnalytics(app)

export default app 