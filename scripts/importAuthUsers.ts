// scripts/importAuthUsers.ts
// Firebase CLIのauth:importを使用してユーザーを一括登録するスクリプト
// このスクリプトはauth:import用のJSONファイルを生成します

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Firestoreから取得したユーザーデータを読み込む
const usersExportPath = path.join(__dirname, 'users-export.json')
const users = JSON.parse(fs.readFileSync(usersExportPath, 'utf8'))

// Firebase auth:import形式に変換
// デフォルトパスワードを設定
const defaultPassword = 'password123'

const authUsers = users.map((user: any) => ({
  localId: user.id,
  email: user.email,
  emailVerified: false,
  passwordHash: Buffer.from(defaultPassword).toString('base64'),
  salt: Buffer.from('').toString('base64'),
  createdAt: new Date().getTime().toString(),
  lastSignedInAt: new Date().getTime().toString(),
  displayName: user.name,
  disabled: false
}))

const authImportData = {
  users: authUsers
}

// ファイルに出力
const outputPath = path.join(__dirname, 'auth-import.json')
fs.writeFileSync(outputPath, JSON.stringify(authImportData, null, 2))

console.log(`✅ Generated auth import file: ${outputPath}`)
console.log(`📊 Total users: ${authUsers.length}`)
console.log(`\n⚠️  Note: This file uses a simple password hash.`)
console.log(`To import, run: npx firebase auth:import ${outputPath} --hash-algo=STANDARD_SCRYPT`)
console.log(`\nAlternatively, use Firebase Admin SDK with service account key for more control.`)
