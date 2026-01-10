<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">勤怠状況一覧</h1>
      </v-col>
    </v-row>

    <!-- 日付選択 -->
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="selectedDate"
          label="日付"
          type="date"
          prepend-icon="mdi-calendar"
          variant="outlined"
          density="compact"
          @change="handleDateChange"
        />
      </v-col>
    </v-row>

    <!-- 従業員出勤状況一覧 -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-account-multiple-check</v-icon>
            従業員出勤状況
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="employeeAttendanceList"
              :items-per-page="10"
              :loading="loading"
              class="elevation-0"
            >
              <template #[`item.employeeNumber`]="{ item }">
                {{ item.employeeNumber }}
              </template>
              <template #[`item.name`]="{ item }">
                {{ item.name }}
              </template>
              <template #[`item.position`]="{ item }">
                {{ item.position || '-' }}
              </template>
              <template #[`item.checkIn`]="{ item }">
                {{ item.checkIn ? formatTime(item.checkIn) : '-' }}
              </template>
              <template #[`item.checkOut`]="{ item }">
                {{ item.checkOut ? formatTime(item.checkOut) : '-' }}
              </template>
              <template #[`item.location`]="{ item }">
                {{ item.location || '-' }}
              </template>
              <template #[`item.note`]="{ item }">
                {{ item.note || '-' }}
              </template>
              <template #[`item.status`]="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small">
                  {{ getStatusText(item.status) }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { ATTENDANCE_STATUS } from '@/constants'
import type { DataTableHeader, User, Attendance } from '@/types'

const today = new Date().toISOString().split('T')[0]
const selectedDate = ref<string>(today || '')
const users = ref<User[]>([])
const attendances = ref<Attendance[]>([])
const loading = ref(true)

// データテーブルのヘッダー
const headers: DataTableHeader[] = [
  { title: '社員番号', key: 'employeeNumber', sortable: true },
  { title: '名前', key: 'name', sortable: true },
  { title: '役職', key: 'position', sortable: true },
  { title: '出勤時刻', key: 'checkIn', sortable: false },
  { title: '退勤時刻', key: 'checkOut', sortable: false },
  { title: '出勤場所', key: 'location', sortable: false },
  { title: 'ステータス', key: 'status', sortable: false },
  { title: '備考', key: 'note', sortable: false },
]

// Firestoreからデータを取得
onMounted(async () => {
  try {
    // ユーザー一覧を取得
    const usersSnapshot = await getDocs(collection(db, 'users'))
    users.value = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[]

    // 勤怠データを取得（選択された日付）
    await fetchAttendances()
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
})

// 日付が変更されたら勤怠データを再取得
const fetchAttendances = async () => {
  try {
    const attendancesQuery = query(
      collection(db, 'attendances'),
      where('date', '==', selectedDate.value)
    )
    const attendancesSnapshot = await getDocs(attendancesQuery)
    attendances.value = attendancesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // TimestampをDateに変換
      checkIn: doc.data().checkIn?.toDate(),
      checkOut: doc.data().checkOut?.toDate(),
    })) as Attendance[]
  } catch (error) {
    console.error('Error fetching attendances:', error)
  }
}

// 日付変更時に勤怠データを再取得
const handleDateChange = () => {
  fetchAttendances()
}

// 従業員出勤状況リスト
const employeeAttendanceList = computed(() => {
  return users.value
    .filter((user) => user.role === 'employee')
    .map((user) => {
      const attendance = attendances.value.find(
        (att) => att.userId === user.id
      )

      // 住所を取得（モックデータなので簡易的な住所を返す）
      let location = null
      if (attendance?.checkInLocation) {
        // 実際のアプリケーションでは逆ジオコーディングAPIを使用
        // ここではモックとして東京都内の住所を返す
        location = '東京都千代田区丸の内1-1-1'
      }

      return {
        employeeNumber: user.employeeNumber || '-',
        name: user.name,
        position: user.position,
        checkIn: attendance?.checkIn || null,
        checkOut: attendance?.checkOut || null,
        location: location,
        note: attendance?.note || '',
        status: attendance ? attendance.status : 'absent',
      }
    })
})

// フォーマット関数
const formatTime = (date: Date | string | null): string => {
  if (!date) return '-'
  return new Date(date).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusText = (status: string): string => {
  return ATTENDANCE_STATUS[status]?.text || status
}

const getStatusColor = (status: string): string => {
  return ATTENDANCE_STATUS[status]?.color || 'grey'
}
</script>

<style scoped></style>
