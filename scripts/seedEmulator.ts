// scripts/seedEmulator.ts
// Firebase Emulatorにテストデータをシードするスクリプト

import admin from 'firebase-admin'

// Emulatorに接続
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'

// プロジェクトIDは.env.localから取得するか、デフォルト値を使用
const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'attendance-tracker-cd612'

admin.initializeApp({
  projectId,
})

const auth = admin.auth()
const db = admin.firestore()

// テストユーザーデータ
const testUsers = [
  {
    email: 'admin@example.com',
    password: 'password123',
    displayName: '管理者ユーザー',
    userData: {
      name: '管理者ユーザー',
      email: 'admin@example.com',
      role: 'admin',
      department: '管理部',
      position: '部長',
      employeeNumber: 'EMP001',
      managerId: null,
    },
  },
  {
    email: 'user1@example.com',
    password: 'password123',
    displayName: '山田太郎',
    userData: {
      name: '山田太郎',
      email: 'user1@example.com',
      role: 'employee',
      department: '営業部',
      position: '一般',
      employeeNumber: 'EMP002',
      managerId: null,
    },
  },
  {
    email: 'user2@example.com',
    password: 'password123',
    displayName: '佐藤花子',
    userData: {
      name: '佐藤花子',
      email: 'user2@example.com',
      role: 'employee',
      department: '営業部',
      position: '一般',
      employeeNumber: 'EMP003',
      managerId: null,
    },
  },
]

async function seedEmulator() {
  console.log('🌱 Seeding Firebase Emulator...')
  console.log(`📍 Firestore: ${process.env.FIRESTORE_EMULATOR_HOST}`)
  console.log(`🔐 Auth: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`)
  console.log(`🏢 Project ID: ${projectId}`)
  console.log('')

  try {
    // 既存のユーザーをクリア（オプション）
    console.log('🧹 Clearing existing users...')
    const existingUsers = await auth.listUsers()
    for (const user of existingUsers.users) {
      await auth.deleteUser(user.uid)
    }

    // テストユーザーを作成
    for (const testUser of testUsers) {
      console.log(`👤 Creating user: ${testUser.email}`)

      // Authにユーザー作成
      const userRecord = await auth.createUser({
        email: testUser.email,
        password: testUser.password,
        displayName: testUser.displayName,
        emailVerified: true,
      })

      console.log(`  ✓ Auth user created: ${userRecord.uid}`)

      // Firestoreにユーザーデータ保存
      await db.collection('users').doc(userRecord.uid).set({
        ...testUser.userData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      console.log(`  ✓ Firestore user data saved`)
    }

    // サンプル勤怠データを追加（オプション）
    console.log('\n📅 Creating sample attendance records...')
    const today = new Date()
    const userIds = (await auth.listUsers()).users.map((u) => u.uid)

    for (let i = 0; i < 5; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      for (const uid of userIds) {
        const checkIn = new Date(date)
        checkIn.setHours(9, 0, 0, 0)

        const checkOut = new Date(date)
        checkOut.setHours(18, 0, 0, 0)

        await db.collection('attendances').add({
          userId: uid,
          date: dateStr,
          checkIn: admin.firestore.Timestamp.fromDate(checkIn),
          checkInLocation: { latitude: 35.6812, longitude: 139.7671 },
          checkOut: admin.firestore.Timestamp.fromDate(checkOut),
          checkOutLocation: { latitude: 35.6812, longitude: 139.7671 },
          workingMinutes: 480, // 8時間
          status: 'present',
          note: '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      }

      console.log(`  ✓ Created attendance records for ${dateStr}`)
    }

    console.log('\n✅ Emulator seeding completed!')
    console.log('\n📝 Test Users:')
    testUsers.forEach((user) => {
      console.log(`   - ${user.email} / ${user.password}`)
    })
    console.log('\n🌐 Access Emulator UI: http://localhost:4000')
  } catch (error) {
    console.error('❌ Error seeding emulator:', error)
    process.exit(1)
  }

  process.exit(0)
}

seedEmulator()
