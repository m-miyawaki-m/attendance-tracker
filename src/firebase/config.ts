// src/firebase/config.ts
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Firebase初期化
const app = initializeApp(firebaseConfig)

// Firebase Auth
export const auth = getAuth(app)

// Firestore
export const db = getFirestore(app)

// ローカル環境の場合、Firebase Emulatorに接続
// Vercelビルド環境（VERCEL=1）では本番Firebaseに接続
const isVercel = import.meta.env.VERCEL === '1' || import.meta.env.VERCEL === 'true'
const isDevelopment = import.meta.env.DEV && !isVercel

// テスト環境かどうかを判定
const isTest = import.meta.env.MODE === 'test' || typeof (import.meta as any).vitest !== 'undefined'

if (isDevelopment && !isTest) {
  // Emulatorへの接続は一度だけ実行
  // auth.configが存在しない場合もあるため、オプショナルチェーンを使用
  if (!auth.config?.emulatorConfig) {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    console.log('🔧 Connected to Auth Emulator')
  }

  // Firestoreも同様
  if (!(db as any)._settings?.host?.includes('localhost')) {
    connectFirestoreEmulator(db, 'localhost', 8080)
    console.log('🔧 Connected to Firestore Emulator')
  }

  console.log('🚀 Running in LOCAL mode with Firebase Emulators')
} else if (!isTest) {
  console.log('☁️  Running in PRODUCTION mode with Firebase')
}