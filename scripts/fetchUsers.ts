// scripts/fetchUsers.ts
// Firestoreからユーザーデータを取得してmockData形式で出力するスクリプト

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'

// __dirnameの代替を用意（ES Modules対応）
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// .envファイルを読み込む
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// Firebase設定を読み込む
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

console.log('Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
})

// Firebaseを初期化
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function fetchUsers() {
  try {
    console.log('Fetching users from Firestore...')
    const usersSnapshot = await getDocs(collection(db, 'users'))

    const users = usersSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        position: data.position,
        employeeNumber: data.employeeNumber,
        managerId: data.managerId || null,
      }
    })

    console.log(`Fetched ${users.length} users`)
    console.log('\n=== Users Data ===')
    console.log(JSON.stringify(users, null, 2))

    // ファイルに出力
    const outputPath = path.join(__dirname, 'users-export.json')
    fs.writeFileSync(outputPath, JSON.stringify(users, null, 2))
    console.log(`\nData exported to: ${outputPath}`)

    // mockData.ts形式で出力
    const mockDataContent = generateMockDataContent(users)
    const mockDataPath = path.join(__dirname, 'mockData-generated.ts')
    fs.writeFileSync(mockDataPath, mockDataContent)
    console.log(`mockData format exported to: ${mockDataPath}`)

  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

function generateMockDataContent(users: any[]): string {
  const usersArrayContent = users
    .map(
      (user) => `  {
    id: '${user.id}',
    name: '${user.name}',
    email: '${user.email}',
    role: '${user.role}',
    department: '${user.department}',
    position: '${user.position}',
    employeeNumber: '${user.employeeNumber}',
    managerId: ${user.managerId ? `'${user.managerId}'` : 'null'},
  }`
    )
    .join(',\n')

  return `// Generated from Firestore users collection
import type { User } from '@/types'

export const mockUsers: User[] = [
${usersArrayContent}
]
`
}

// スクリプト実行
fetchUsers()
