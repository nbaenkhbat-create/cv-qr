import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBJZPLe_oFPly-QjnbSxnzjmJP3gb9kSmM',
  authDomain: 'cv-qr-6b8d4.firebaseapp.com',
  projectId: 'cv-qr-6b8d4',
  storageBucket: 'cv-qr-6b8d4.firebasestorage.app',
  messagingSenderId: '638258279203',
  appId: '1:638258279203:web:d0a6b57d2fcee9e7975296',
  measurementId: 'G-J6K6QZ41EL',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

isSupported().then((ok) => {
  if (ok) getAnalytics(app)
})
