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
import { useUserStore } from '@/stores/userStore'
import { useAdminAttendanceStore } from '@/stores/adminAttendanceStore'
import { ATTENDANCE_STATUS } from '@/constants'
import type { DataTableHeader } from '@/types'

// Stores
const userStore = useUserStore()
const attendanceStore = useAdminAttendanceStore()

const today = new Date().toISOString().split('T')[0]
const selectedDate = ref<string>(today || '')

// Storeのstateを使用
const users = computed(() => userStore.employees)
const attendances = computed(
  () => attendanceStore.getAttendancesByDateFromCache(selectedDate.value) || [],
)
const loading = computed(() => userStore.loading || attendanceStore.loading)

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

// 初期データ取得
onMounted(async () => {
  try {
    await Promise.all([
      userStore.fetchUsers(),
      attendanceStore.fetchAttendancesByDate(selectedDate.value),
    ])
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})

// 日付変更時に勤怠データを再取得
const handleDateChange = async () => {
  try {
    await attendanceStore.fetchAttendancesByDate(selectedDate.value)
  } catch (error) {
    console.error('Error fetching attendances:', error)
  }
}

// 従業員出勤状況リスト
const employeeAttendanceList = computed(() => {
  return users.value.map((user) => {
    const attendance = attendances.value.find((att) => att.userId === user.id)

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
