// scripts/registerAuthUsers.ts
// FirestoreのユーザーをFirebase Authenticationに登録するスクリプト

import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

// __dirnameの代替を用意（ES Modules対応）
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// .envファイルを読み込む
dotenv.config()

// Firebase Admin SDKを初期化
// サービスアカウントキーを読み込む
const serviceAccountPath = path.join(__dirname, '../service-account.json')
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))

initializeApp({
  credential: cert(serviceAccount),
})

const auth = getAuth()
const db = getFirestore()

async function registerUsers() {
  try {
    console.log('Fetching users from Firestore...')
    const usersSnapshot = await db.collection('users').get()

    console.log(`Found ${usersSnapshot.size} users`)

    let successCount = 0
    let errorCount = 0
    const errors: any[] = []

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data()
      const userId = doc.id

      try {
        // デフォルトパスワードを設定（実際の運用では各ユーザーにパスワードリセットリンクを送信）
        const defaultPassword = 'password123'

        // Authenticationにユーザーを作成
        await auth.createUser({
          uid: userId,
          email: userData.email,
          password: defaultPassword,
          displayName: userData.name,
          emailVerified: false,
        })

        console.log(`✓ Created auth user: ${userData.email}`)
        successCount++
      } catch (error: any) {
        if (error.code === 'auth/uid-already-exists') {
          console.log(`- User already exists: ${userData.email}`)
        } else if (error.code === 'auth/email-already-exists') {
          console.log(`- Email already exists: ${userData.email}`)
        } else {
          console.error(`✗ Error creating user ${userData.email}:`, error.message)
          errors.push({ email: userData.email, error: error.message })
          errorCount++
        }
      }
    }

    console.log('\n=== Summary ===')
    console.log(`Successfully created: ${successCount} users`)
    console.log(`Errors: ${errorCount} users`)

    if (errors.length > 0) {
      console.log('\n=== Errors ===')
      errors.forEach((err) => {
        console.log(`${err.email}: ${err.error}`)
      })
    }

    console.log('\n=== Important ===')
    console.log('All users have been created with default password: password123')
    console.log('Please send password reset emails to all users in production.')
  } catch (error) {
    console.error('Error registering users:', error)
  }
}

// スクリプト実行
registerUsers()
