// scripts/exportProductionData.ts
// 本番Firebaseからデータを取得してEmulator用シードデータとして保存するスクリプト

import admin from 'firebase-admin'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()
const auth = admin.auth()

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
  checkIn: string // ISO string
  checkInLocation: { latitude: number; longitude: number } | null
  checkOut: string | null
  checkOutLocation: { latitude: number; longitude: number } | null
  workingMinutes: number
  status: string
  note: string
}

interface ExportedData {
  exportedAt: string
  users: ExportedUser[]
  attendances: ExportedAttendance[]
}

async function exportProductionData() {
  console.log('📦 Exporting data from Production Firebase...')
  console.log('')

  try {
    // 1. Auth ユーザーを取得
    console.log('🔐 Fetching Auth users...')
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
      users,
      attendances,
    }

    const outputPath = path.join(__dirname, 'emulator-seed-data.json')
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
    console.log('   1. Start emulator: npm run firebase:emulators')
    console.log('   2. Import data: npm run seed:emulator:from-export')
  } catch (error) {
    console.error('❌ Error exporting data:', error)
    process.exit(1)
  }

  process.exit(0)
}

exportProductionData()
