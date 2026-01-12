// scripts/uploadToProduction.ts
// エクスポートしたEmulatorデータを本番Firebaseにアップロードするスクリプト
// ⚠️ 危険: 本番データを上書きする可能性があります

import admin from 'firebase-admin'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// service-account.jsonを使用して本番Firebaseに接続
const serviceAccountPath = path.resolve(__dirname, '../service-account.json')
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ service-account.json not found!')
  console.error('Please download it from Firebase Console > Project Settings > Service Accounts')
  process.exit(1)
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))

// コマンドライン引数を解析
const args = process.argv.slice(2)
const forceMode = args.includes('--force')
const initMode = args.includes('--init')
const mergeMode = args.includes('--merge')

function showUsage() {
  console.log(`
Usage: npm run upload:to-production [options]

Options:
  --init    Initialize production with emulator data (clears ALL existing data)
  --merge   Merge emulator data with existing production data (skip existing)
  --force   Skip confirmation prompt (use with caution!)

Examples:
  npm run upload:to-production --init          # Clear production and upload all data
  npm run upload:to-production --merge         # Add new data without deleting existing
  npm run upload:to-production --init --force  # Initialize without confirmation
`)
}

if (!initMode && !mergeMode) {
  console.log('⚠️  Please specify a mode: --init or --merge')
  showUsage()
  process.exit(1)
}

async function confirmAction(message: string): Promise<boolean> {
  if (forceMode) return true

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes')
    })
  })
}

async function uploadToProduction() {
  console.log('🚀 Upload to Production Firebase')
  console.log(`📦 Mode: ${initMode ? 'INITIALIZE (clear all)' : 'MERGE (add new)'}`)
  console.log('')

  // エクスポートファイルを読み込む
  const dataPath = path.join(__dirname, 'emulator-export-data.json')
  if (!fs.existsSync(dataPath)) {
    console.error('❌ emulator-export-data.json not found!')
    console.error('Please run: npm run export:emulator first')
    process.exit(1)
  }

  const exportData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

  if (exportData.source !== 'emulator') {
    console.error('❌ This file was not exported from emulator!')
    process.exit(1)
  }

  console.log(`📦 Loading data exported at: ${exportData.exportedAt}`)
  console.log(`   - Users: ${exportData.users.length}`)
  console.log(`   - Attendances: ${exportData.attendances.length}`)
  console.log('')

  // 確認プロンプト
  if (initMode) {
    console.log('⚠️  WARNING: This will DELETE ALL existing data in production!')
    console.log('   This action cannot be undone.')
    console.log('')

    const confirmed = await confirmAction('Are you sure you want to continue?')
    if (!confirmed) {
      console.log('❌ Cancelled.')
      process.exit(0)
    }
  } else {
    console.log('ℹ️  MERGE mode: Existing data will be preserved, only new data will be added.')
    console.log('')

    const confirmed = await confirmAction('Do you want to continue?')
    if (!confirmed) {
      console.log('❌ Cancelled.')
      process.exit(0)
    }
  }

  // Firebase初期化
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })

  const auth = admin.auth()
  const db = admin.firestore()

  try {
    // INIT モード: 既存データを削除
    if (initMode) {
      console.log('')
      console.log('🧹 Clearing existing production data...')

      // Auth ユーザーを削除
      const existingUsers = await auth.listUsers()
      for (const user of existingUsers.users) {
        await auth.deleteUser(user.uid)
      }
      console.log(`  Deleted ${existingUsers.users.length} auth users`)

      // Firestore users コレクションを削除
      const usersSnapshot = await db.collection('users').get()
      for (const doc of usersSnapshot.docs) {
        await doc.ref.delete()
      }
      console.log(`  Deleted ${usersSnapshot.size} user documents`)

      // Firestore attendances コレクションを削除
      const attendancesSnapshot = await db.collection('attendances').get()
      for (const doc of attendancesSnapshot.docs) {
        await doc.ref.delete()
      }
      console.log(`  Deleted ${attendancesSnapshot.size} attendance documents`)
    }

    // ユーザーをアップロード
    console.log('')
    console.log('👥 Uploading users...')
    let usersCreated = 0
    let usersSkipped = 0

    for (const user of exportData.users) {
      try {
        // Auth ユーザー作成
        await auth.createUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: true,
        })

        // Firestore ユーザードキュメント作成
        await db.collection('users').doc(user.uid).set({
          ...user.userData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        console.log(`  ✓ Created: ${user.email}`)
        usersCreated++
      } catch (error: any) {
        if (error.code === 'auth/uid-already-exists' || error.code === 'auth/email-already-exists') {
          if (mergeMode) {
            console.log(`  ⏭ Skipped (exists): ${user.email}`)
            usersSkipped++
          } else {
            throw error
          }
        } else {
          throw error
        }
      }
    }

    // 勤怠データをアップロード
    console.log('')
    console.log('📅 Uploading attendance records...')
    let attendancesCreated = 0

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
      attendancesCreated++
    }
    console.log(`  ✓ Created ${attendancesCreated} attendance records`)

    console.log('')
    console.log('✅ Upload completed!')
    console.log('')
    console.log('📊 Summary:')
    console.log(`   - Users created: ${usersCreated}`)
    if (mergeMode) {
      console.log(`   - Users skipped: ${usersSkipped}`)
    }
    console.log(`   - Attendances created: ${attendancesCreated}`)
    console.log('')
    console.log('⚠️  Note: User passwords are NOT uploaded.')
    console.log('   Users need to reset their passwords or you need to set them manually.')
  } catch (error) {
    console.error('❌ Error uploading data:', error)
    process.exit(1)
  }

  process.exit(0)
}

uploadToProduction()
