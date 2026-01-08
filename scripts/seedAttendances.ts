// scripts/seedAttendances.ts
// Firestoreにテスト用の勤怠データを追加するスクリプト

import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// サービスアカウントキーを読み込む
const serviceAccountPath = resolve(__dirname, '../service-account.json')
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

async function seedAttendances() {
  console.log('🌱 Starting attendance data seeding...\n')

  try {
    // ユーザー一覧を取得
    const usersSnapshot = await db.collection('users').get()
    const users = usersSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((user: any) => user.role === 'employee')

    console.log(`Found ${users.length} employees`)

    let totalAttendances = 0

    // 各ユーザーに対して過去30日分の勤怠データを作成
    for (const user of users) {
      const userId = user.id
      const today = new Date()

      // 過去30日分のデータを作成
      for (let i = 0; i < 30; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        const dateString = date.toISOString().split('T')[0]

        // ランダムで出勤状況を決定
        const rand = Math.random()
        let status: string
        let checkIn: Date | null = null
        let checkOut: Date | null = null
        let workingMinutes = 0

        if (rand < 0.8) {
          // 80%の確率で正常出勤
          status = 'present'
          checkIn = new Date(date)
          checkIn.setHours(9, 0, 0, 0)
          checkOut = new Date(date)
          checkOut.setHours(18, 0, 0, 0)
          workingMinutes = 540
        } else if (rand < 0.9) {
          // 10%の確率で遅刻
          status = 'late'
          checkIn = new Date(date)
          checkIn.setHours(9, 15 + Math.floor(Math.random() * 30), 0, 0)
          checkOut = new Date(date)
          checkOut.setHours(18, 0, 0, 0)
          workingMinutes = 540 - (checkIn.getMinutes() - 0)
        } else if (rand < 0.95) {
          // 5%の確率で早退
          status = 'early_leave'
          checkIn = new Date(date)
          checkIn.setHours(9, 0, 0, 0)
          checkOut = new Date(date)
          checkOut.setHours(17, 30, 0, 0)
          workingMinutes = 510
        } else {
          // 5%の確率で欠勤
          status = 'absent'
        }

        const attendanceData: any = {
          userId,
          date: dateString,
          status,
          note: '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }

        if (checkIn) {
          attendanceData.checkIn = admin.firestore.Timestamp.fromDate(checkIn)
          attendanceData.checkInLocation = {
            latitude: 35.6812 + (Math.random() - 0.5) * 0.01,
            longitude: 139.7671 + (Math.random() - 0.5) * 0.01,
            accuracy: 10,
          }
        }

        if (checkOut) {
          attendanceData.checkOut = admin.firestore.Timestamp.fromDate(checkOut)
          attendanceData.checkOutLocation = {
            latitude: 35.6812 + (Math.random() - 0.5) * 0.01,
            longitude: 139.7671 + (Math.random() - 0.5) * 0.01,
            accuracy: 10,
          }
        }

        if (workingMinutes > 0) {
          attendanceData.workingMinutes = workingMinutes
        }

        await db.collection('attendances').add(attendanceData)
        totalAttendances++

        // 進捗表示
        if (totalAttendances % 50 === 0) {
          console.log(`Created ${totalAttendances} attendances...`)
        }
      }
    }

    console.log(`\n✨ Attendance seeding completed successfully!`)
    console.log(`📊 Total attendances created: ${totalAttendances}`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding attendances:', error)
    process.exit(1)
  }
}

seedAttendances()
