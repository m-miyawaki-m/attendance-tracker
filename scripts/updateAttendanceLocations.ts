// scripts/updateAttendanceLocations.ts
// 勤怠データの位置情報を福岡市内のランダムな場所に更新するスクリプト

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

// 福岡市内の主要エリアの座標（中心点）
const fukuokaLocations = [
  { name: '博多駅周辺', lat: 33.5904, lng: 130.4217 },
  { name: '天神地区', lat: 33.5904, lng: 130.3991 },
  { name: '大濠公園周辺', lat: 33.5813, lng: 130.3779 },
  { name: '西新地区', lat: 33.5847, lng: 130.3546 },
  { name: '六本松地区', lat: 33.5815, lng: 130.3897 },
  { name: '薬院地区', lat: 33.5819, lng: 130.4048 },
  { name: '渡辺通地区', lat: 33.5848, lng: 130.4005 },
  { name: '中洲地区', lat: 33.5929, lng: 130.4084 },
  { name: '呉服町周辺', lat: 33.5946, lng: 130.4167 },
  { name: '箱崎地区', lat: 33.6128, lng: 130.4205 },
]

// ランダムな福岡市内の位置情報を生成
function getRandomFukuokaLocation() {
  const baseLocation = fukuokaLocations[Math.floor(Math.random() * fukuokaLocations.length)]

  // 中心点から±0.01度（約1km）の範囲でランダムにオフセット
  const latOffset = (Math.random() - 0.5) * 0.02
  const lngOffset = (Math.random() - 0.5) * 0.02

  return {
    latitude: baseLocation.lat + latOffset,
    longitude: baseLocation.lng + lngOffset,
    accuracy: Math.floor(Math.random() * 20) + 5, // 5-25メートルの精度
  }
}

async function updateAttendanceLocations() {
  console.log('🔄 Updating attendance locations to Fukuoka city...\\n')

  try {
    // 全勤怠データを取得
    const attendancesSnapshot = await db.collection('attendances').get()
    console.log(`Total attendances: ${attendancesSnapshot.docs.length}`)

    let updatedCount = 0

    for (const doc of attendancesSnapshot.docs) {
      const data = doc.data()

      // checkInがある場合のみ位置情報を更新
      if (data.checkIn) {
        const location = getRandomFukuokaLocation()

        const updateData: any = {
          checkInLocation: location,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }

        // checkOutがある場合も同じ位置情報を設定
        if (data.checkOut) {
          updateData.checkOutLocation = location
        }

        await db.collection('attendances').doc(doc.id).update(updateData)
        updatedCount++

        // 進捗表示
        if (updatedCount % 50 === 0) {
          console.log(`Updated ${updatedCount} attendances...`)
        }
      }
    }

    console.log(`\\n✨ Location update completed successfully!`)
    console.log(`📊 Summary:`)
    console.log(`  - Total attendances: ${attendancesSnapshot.docs.length}`)
    console.log(`  - Updated attendances: ${updatedCount}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error updating attendance locations:', error)
    process.exit(1)
  }
}

updateAttendanceLocations()
