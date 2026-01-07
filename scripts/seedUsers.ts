// scripts/seedUsers.ts
// Firestoreにテストユーザーデータを追加するスクリプト

import admin from 'firebase-admin'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// .env.localを読み込む
dotenv.config({ path: resolve(__dirname, '../.env.local') })

// --- ここを以下のように書き換え ---
import { readFileSync } from 'fs'
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, '../service-account.json'), 'utf8'),
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})
// ------------------------------
const db = admin.firestore()

// ランダムな名前生成用データ
const lastNames = [
  '山田',
  '佐藤',
  '鈴木',
  '田中',
  '高橋',
  '渡辺',
  '伊藤',
  '中村',
  '小林',
  '加藤',
  '吉田',
  '山本',
  '松本',
  '井上',
  '木村',
  '林',
  '斎藤',
  '清水',
  '山崎',
  '森',
]

const firstNames = [
  '太郎',
  '花子',
  '一郎',
  '美咲',
  '健太',
  '陽子',
  '次郎',
  '由美',
  '直樹',
  '真理子',
  '和也',
  '恵子',
  '浩二',
  '裕子',
  '貴之',
  '智子',
  '正人',
  '明美',
  '拓也',
  '麻美',
]

const departments = ['営業部', '開発部', '総務部', '人事部', '経理部', 'マーケティング部']

const positions = [
  '一般社員',
  '主任',
  'シニアエンジニア',
  'プロジェクトリーダー',
  '課長補佐',
  'マネージャー',
]

// Firebase Authentication UIDをマッピング（既存の認証アカウント）
const authUidMapping: Record<string, string> = {
  'user01@example.com': 'W6i8UM3962WfSuKAnVPupU1Aeh53',
  'admin@example.com': 'SCRmr8ic0ed8XETzaMdec4scqZs2',
}

async function seedUsers() {
  console.log('🌱 Starting user data seeding...\n')

  try {
    // user01 (既存の認証アカウントに対応)
    const user01Data = {
      id: authUidMapping['user01@example.com'],
      name: '山田太郎',
      email: 'user01@example.com',
      role: 'employee' as const,
      department: '営業部',
      position: '一般社員',
      employeeNumber: 'EMP001',
      managerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('users').doc(user01Data.id).set(user01Data)
    console.log(`✅ Created: ${user01Data.email} (${user01Data.name})`)

    // admin (既存の認証アカウントに対応)
    const adminData = {
      id: authUidMapping['admin@example.com'],
      name: '管理者',
      email: 'admin@example.com',
      role: 'admin' as const,
      department: '総務部',
      position: '管理者',
      employeeNumber: 'ADMIN001',
      managerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('users').doc(adminData.id).set(adminData)
    console.log(`✅ Created: ${adminData.email} (${adminData.name})`)

    // user02 ~ user20 (認証なしのユーザーマスタデータ)
    for (let i = 2; i <= 20; i++) {
      const userNumber = String(i).padStart(2, '0')
      const email = `user${userNumber}@example.com`
      const userId = `user${userNumber}_${Date.now()}_${Math.random().toString(36).substring(7)}`

      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const name = `${lastName}${firstName}`

      const department = departments[Math.floor(Math.random() * departments.length)]
      const position = positions[Math.floor(Math.random() * positions.length)]

      const userData = {
        id: userId,
        name,
        email,
        role: 'employee' as const,
        department,
        position,
        employeeNumber: `EMP${userNumber}`,
        managerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.collection('users').doc(userData.id).set(userData)
      console.log(`✅ Created: ${userData.email} (${userData.name} - ${userData.department})`)

      // API制限を避けるため少し待機
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log('\n✨ User seeding completed successfully!')
    console.log(`📊 Total users created: 20`)
    console.log('\n📝 Note: user01とadminは既存の認証アカウントに対応しています')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding users:', error)
    process.exit(1)
  }
}

seedUsers()
