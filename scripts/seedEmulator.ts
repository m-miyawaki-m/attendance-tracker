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

// マネージャーのメールアドレス（後でUIDに変換）
// user01: 営業部マネージャー
// user03: 技術部マネージャー
// user05: 総務部マネージャー
const managerMapping: Record<number, string> = {
  // 営業部（user01の部下）: user02, user04, user08, user10, user14, user16, user20
  2: 'user01@example.com',
  4: 'user01@example.com',
  8: 'user01@example.com',
  10: 'user01@example.com',
  14: 'user01@example.com',
  16: 'user01@example.com',
  20: 'user01@example.com',
  // 技術部（user03の部下）: user06, user09, user12, user15, user18
  6: 'user03@example.com',
  9: 'user03@example.com',
  12: 'user03@example.com',
  15: 'user03@example.com',
  18: 'user03@example.com',
  // 総務部（user05の部下）: user07, user11, user13, user17, user19
  7: 'user05@example.com',
  11: 'user05@example.com',
  13: 'user05@example.com',
  17: 'user05@example.com',
  19: 'user05@example.com',
}

// 部署の割り当て
const getDepartment = (i: number): string => {
  // マネージャー
  if (i === 1) return '営業部'
  if (i === 3) return '技術部'
  if (i === 5) return '総務部'
  // 部下は上司と同じ部署
  if ([2, 4, 8, 10, 14, 16, 20].includes(i)) return '営業部'
  if ([6, 9, 12, 15, 18].includes(i)) return '技術部'
  if ([7, 11, 13, 17, 19].includes(i)) return '総務部'
  return '営業部'
}

// 役職の割り当て
const getPosition = (i: number): string => {
  if ([1, 3, 5].includes(i)) return '主任'
  return '一般'
}

// テストユーザーデータ
const testUsers: Array<{
  email: string
  password: string
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
}> = [
  {
    email: 'admin@example.com',
    password: 'adminadmin',
    displayName: '管理者',
    userData: {
      name: '管理者',
      email: 'admin@example.com',
      role: 'admin',
      department: '管理部',
      position: '部長',
      employeeNumber: 'ADMIN001',
      managerId: null,
    },
  },
  {
    email: 'user01@example.com',
    password: 'user01',
    displayName: '山田太郎',
    userData: {
      name: '山田太郎',
      email: 'user01@example.com',
      role: 'employee',
      department: '営業部',
      position: '主任',
      employeeNumber: 'EMP001',
      managerId: null,
    },
  },
  {
    email: 'user02@example.com',
    password: 'password123',
    displayName: '佐藤花子',
    userData: {
      name: '佐藤花子',
      email: 'user02@example.com',
      role: 'employee',
      department: '営業部',
      position: '一般',
      employeeNumber: 'EMP002',
      managerId: null, // 後でUIDに更新
    },
  },
]

// 名前リスト
const names = [
  '', '', '', // 0, 1, 2 は上で定義済み
  '鈴木一郎', '田中美咲', '高橋健太', '渡辺陽子', '伊藤次郎',
  '中村由美', '小林直樹', '加藤真理子', '吉田和也', '山本恵子',
  '松本浩二', '井上裕子', '木村貴之', '林智子', '斎藤正人',
  '清水明美', '山崎拓也', '森麻美',
]

// user03-user20を追加
for (let i = 3; i <= 20; i++) {
  const userNum = String(i).padStart(2, '0')
  testUsers.push({
    email: `user${userNum}@example.com`,
    password: 'password123',
    displayName: names[i] || `ユーザー${userNum}`,
    userData: {
      name: names[i] || `ユーザー${userNum}`,
      email: `user${userNum}@example.com`,
      role: 'employee',
      department: getDepartment(i),
      position: getPosition(i),
      employeeNumber: `EMP${userNum}`,
      managerId: null, // 後でUIDに更新
    },
  })
}

async function seedEmulator() {
  console.log('🌱 Seeding Firebase Emulator...')
  console.log(`📍 Firestore: ${process.env.FIRESTORE_EMULATOR_HOST}`)
  console.log(`🔐 Auth: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`)
  console.log(`🏢 Project ID: ${projectId}`)
  console.log('')

  try {
    // 既存のFirestoreデータをクリア
    console.log('🧹 Clearing existing Firestore data...')

    // usersコレクションをクリア
    const usersSnapshot = await db.collection('users').get()
    for (const doc of usersSnapshot.docs) {
      await doc.ref.delete()
    }
    console.log(`  ✓ Deleted ${usersSnapshot.size} users from Firestore`)

    // attendancesコレクションをクリア
    const attendancesSnapshot = await db.collection('attendances').get()
    for (const doc of attendancesSnapshot.docs) {
      await doc.ref.delete()
    }
    console.log(`  ✓ Deleted ${attendancesSnapshot.size} attendances from Firestore`)

    // 既存のAuthユーザーをクリア
    console.log('🧹 Clearing existing Auth users...')
    const existingUsers = await auth.listUsers()
    for (const user of existingUsers.users) {
      await auth.deleteUser(user.uid)
    }
    console.log(`  ✓ Deleted ${existingUsers.users.length} users from Auth`)

    // テストユーザーを作成
    // メールアドレスとUIDのマッピングを保存
    const emailToUid: Record<string, string> = {}

    for (const testUser of testUsers) {
      console.log(`👤 Creating user: ${testUser.email}`)

      // Authにユーザー作成
      const userRecord = await auth.createUser({
        email: testUser.email,
        password: testUser.password,
        displayName: testUser.displayName,
        emailVerified: true,
      })

      // メールアドレスとUIDのマッピングを保存
      emailToUid[testUser.email] = userRecord.uid

      console.log(`  ✓ Auth user created: ${userRecord.uid}`)

      // Firestoreにユーザーデータ保存
      await db.collection('users').doc(userRecord.uid).set({
        ...testUser.userData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      console.log(`  ✓ Firestore user data saved`)
    }

    // managerIdを更新
    console.log('\n👥 Updating manager relationships...')
    for (const [userNum, managerEmail] of Object.entries(managerMapping)) {
      const userEmail = `user${String(userNum).padStart(2, '0')}@example.com`
      const userId = emailToUid[userEmail]
      const managerId = emailToUid[managerEmail]

      if (userId && managerId) {
        await db.collection('users').doc(userId).update({
          managerId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        console.log(`  ✓ ${userEmail} -> ${managerEmail}`)
      }
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
