// scripts/exportEmulatorData.ts
// Firebase Emulatorからデータをエクスポートするスクリプト

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

interface ExportedUser {
  uid: string
  email: string
  displayName: string
  userData: {
    name: string
    email: string
    role: string
    department: string
    position: string
    employeeNumber: string
    managerId: string | null
  }
}

interface ExportedAttendance {
  userId: string
  date: string
  checkIn: string | null
  checkInLocation: { latitude: number; longitude: number } | null
  checkOut: string | null
  checkOutLocation: { latitude: number; longitude: number } | null
  workingMinutes: number
  status: string
  note: string
}

interface ExportedData {
  exportedAt: string
  source: 'emulator'
  users: ExportedUser[]
  attendances: ExportedAttendance[]
}

async function exportEmulatorData() {
  console.log('📦 Exporting data from Firebase Emulator...')
  console.log(`📍 Firestore: ${process.env.FIRESTORE_EMULATOR_HOST}`)
  console.log(`🔐 Auth: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`)
  console.log('')

  try {
    // 1. Auth ユーザーを取得
    console.log('🔐 Fetching Auth users from Emulator...')
    const authUsers = await auth.listUsers()
    console.log(`  Found ${authUsers.users.length} auth users`)

    // 2. Firestore ユーザーデータを取得
    console.log('👥 Fetching Firestore users...')
    const usersSnapshot = await db.collection('users').get()
    console.log(`  Found ${usersSnapshot.size} user documents`)

    // 3. Auth と Firestore のデータを結合
    const users: ExportedUser[] = []
    for (const authUser of authUsers.users) {
      const userDoc = usersSnapshot.docs.find((doc) => doc.id === authUser.uid)
      if (userDoc) {
        const userData = userDoc.data()
        users.push({
          uid: authUser.uid,
          email: authUser.email || '',
          displayName: authUser.displayName || userData.name || '',
          userData: {
            name: userData.name || '',
            email: userData.email || authUser.email || '',
            role: userData.role || 'employee',
            department: userData.department || '',
            position: userData.position || '',
            employeeNumber: userData.employeeNumber || '',
            managerId: userData.managerId || null,
          },
        })
      }
    }
    console.log(`  Matched ${users.length} users`)

    // 4. 勤怠データを取得
    console.log('📅 Fetching attendance records...')
    const attendancesSnapshot = await db.collection('attendances').get()
    console.log(`  Found ${attendancesSnapshot.size} attendance records`)

    const attendances: ExportedAttendance[] = attendancesSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        userId: data.userId,
        date: data.date,
        checkIn: data.checkIn?.toDate()?.toISOString() || null,
        checkInLocation: data.checkInLocation || null,
        checkOut: data.checkOut?.toDate()?.toISOString() || null,
        checkOutLocation: data.checkOutLocation || null,
        workingMinutes: data.workingMinutes || 0,
        status: data.status || 'present',
        note: data.note || '',
      }
    })

    // 5. データをファイルに保存
    const exportData: ExportedData = {
      exportedAt: new Date().toISOString(),
      source: 'emulator',
      users,
      attendances,
    }

    const outputPath = path.join(__dirname, 'emulator-export-data.json')
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2))

    console.log('')
    console.log('✅ Export completed!')
    console.log(`📁 Data saved to: ${outputPath}`)
    console.log('')
    console.log('📊 Summary:')
    console.log(`   - Users: ${users.length}`)
    console.log(`   - Attendances: ${attendances.length}`)
    console.log('')
    console.log('💡 Next steps:')
    console.log('   To upload to production: npm run upload:to-production')
  } catch (error) {
    console.error('❌ Error exporting data:', error)
    process.exit(1)
  }

  process.exit(0)
}

exportEmulatorData()
