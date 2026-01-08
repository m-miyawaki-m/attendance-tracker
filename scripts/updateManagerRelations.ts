// scripts/updateManagerRelations.ts
// ユーザーにmanagerIdを設定して、主任-メンバーの関係を作成するスクリプト

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

async function updateManagerRelations() {
  console.log('🔄 Updating manager relations...\n')

  try {
    // 全ユーザーを取得
    const usersSnapshot = await db.collection('users').get()
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    console.log(`Total users: ${users.length}`)

    // 主任を見つける（position が「主任」）
    const managers = users.filter(
      (user: any) => user.position === '主任' && user.role === 'employee'
    )

    console.log(`Found ${managers.length} managers:`)
    managers.forEach((manager: any) => {
      console.log(`  - ${manager.name} (${manager.department})`)
    })

    if (managers.length === 0) {
      console.log('\n⚠️  No managers found. Creating some managers first...')

      // 主任がいない場合、いくつかのユーザーを主任に昇格
      const employeesToPromote = users
        .filter((user: any) => user.role === 'employee')
        .slice(0, 3) // 最初の3人を主任に

      for (const emp of employeesToPromote) {
        await db.collection('users').doc(emp.id).update({
          position: '主任',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        console.log(`  ✓ Promoted ${(emp as any).name} to 主任`)
        managers.push(emp)
      }
    }

    // 一般社員を主任に割り当て
    const employees = users.filter(
      (user: any) =>
        user.role === 'employee' &&
        user.position !== '主任' &&
        !managers.some((m: any) => m.id === user.id)
    )

    console.log(`\nAssigning ${employees.length} employees to managers...`)

    let assignedCount = 0
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i]
      // ラウンドロビンで主任を割り当て
      const manager = managers[i % managers.length]

      await db.collection('users').doc(employee.id).update({
        managerId: manager.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      console.log(`  ✓ Assigned ${(employee as any).name} to ${(manager as any).name}`)
      assignedCount++
    }

    console.log(`\n✨ Manager relations updated successfully!`)
    console.log(`📊 Summary:`)
    console.log(`  - Managers: ${managers.length}`)
    console.log(`  - Employees assigned: ${assignedCount}`)

    // 各主任のメンバー数を表示
    console.log(`\n📋 Team sizes:`)
    for (const manager of managers) {
      const teamSize = employees.filter((emp: any) => {
        return emp.id !== manager.id
      }).length / managers.length
      console.log(`  - ${(manager as any).name}: ~${Math.ceil(teamSize)} members`)
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error updating manager relations:', error)
    process.exit(1)
  }
}

updateManagerRelations()
