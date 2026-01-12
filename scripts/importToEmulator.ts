// scripts/importToEmulator.ts
// エクスポートした本番データをFirebase Emulatorにインポートするスクリプト

import admin from 'firebase-admin'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Emulatorに接続
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'attendance-tracker-cd612'

admin.initializeApp({
  projectId,
})

const auth = admin.auth()
const db = admin.firestore()

// デフォルトパスワード（本番のパスワードはエクスポートできないため）
const DEFAULT_PASSWORDS: Record<string, string> = {
  admin: 'adminadmin',
  user01: 'user01',
  default: 'password123',
}

function getPasswordForUser(email: string): string {
  if (email.includes('admin')) return DEFAULT_PASSWORDS.admin
  if (email.includes('user01')) return DEFAULT_PASSWORDS.user01
  return DEFAULT_PASSWORDS.default
}

async function importToEmulator() {
  console.log('📥 Importing data to Firebase Emulator...')
  console.log(`📍 Firestore: ${process.env.FIRESTORE_EMULATOR_HOST}`)
  console.log(`🔐 Auth: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`)
  console.log('')

  // エクスポートファイルを読み込む
  const dataPath = path.join(__dirname, 'emulator-seed-data.json')
  if (!fs.existsSync(dataPath)) {
    console.error('❌ emulator-seed-data.json not found!')
    console.error('Please run: npm run export:production first')
    process.exit(1)
  }

  const exportData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  console.log(`📦 Loading data exported at: ${exportData.exportedAt}`)
  console.log('')

  try {
    // 1. 既存データをクリア
    console.log('🧹 Clearing existing emulator data...')

    // Auth ユーザーをクリア
    const existingUsers = await auth.listUsers()
    for (const user of existingUsers.users) {
      await auth.deleteUser(user.uid)
    }
    console.log(`  Deleted ${existingUsers.users.length} auth users`)

    // Firestore をクリア（usersコレクション）
    const usersSnapshot = await db.collection('users').get()
    for (const doc of usersSnapshot.docs) {
      await doc.ref.delete()
    }
    console.log(`  Deleted ${usersSnapshot.size} user documents`)

    // Firestore をクリア（attendancesコレクション）
    const attendancesSnapshot = await db.collection('attendances').get()
    for (const doc of attendancesSnapshot.docs) {
      await doc.ref.delete()
    }
    console.log(`  Deleted ${attendancesSnapshot.size} attendance documents`)

    // 2. ユーザーをインポート
    console.log('')
    console.log('👥 Importing users...')
    for (const user of exportData.users) {
      const password = getPasswordForUser(user.email)

      // Auth ユーザー作成
      await auth.createUser({
        uid: user.uid,
        email: user.email,
        password: password,
        displayName: user.displayName,
        emailVerified: true,
      })

      // Firestore ユーザードキュメント作成
      await db.collection('users').doc(user.uid).set({
        ...user.userData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      console.log(`  ✓ ${user.email} (password: ${password})`)
    }

    // 3. 勤怠データをインポート
    console.log('')
    console.log('📅 Importing attendance records...')
    let importedCount = 0
    for (const attendance of exportData.attendances) {
      await db.collection('attendances').add({
        userId: attendance.userId,
        date: attendance.date,
        checkIn: attendance.checkIn
          ? admin.firestore.Timestamp.fromDate(new Date(attendance.checkIn))
          : null,
        checkInLocation: attendance.checkInLocation,
        checkOut: attendance.checkOut
          ? admin.firestore.Timestamp.fromDate(new Date(attendance.checkOut))
          : null,
        checkOutLocation: attendance.checkOutLocation,
        workingMinutes: attendance.workingMinutes,
        status: attendance.status,
        note: attendance.note,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      importedCount++
    }
    console.log(`  ✓ Imported ${importedCount} attendance records`)

    console.log('')
    console.log('✅ Import completed!')
    console.log('')
    console.log('📊 Summary:')
    console.log(`   - Users: ${exportData.users.length}`)
    console.log(`   - Attendances: ${exportData.attendances.length}`)
    console.log('')
    console.log('🔑 Login credentials:')
    console.log('   - admin@... → password: adminadmin')
    console.log('   - user01@... → password: user01')
    console.log('   - others → password: password123')
    console.log('')
    console.log('🌐 Emulator UI: http://localhost:4000')
  } catch (error) {
    console.error('❌ Error importing data:', error)
    process.exit(1)
  }

  process.exit(0)
}

importToEmulator()
