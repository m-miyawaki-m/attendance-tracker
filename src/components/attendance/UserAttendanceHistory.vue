<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">勤怠履歴</h1>
      </v-col>
    </v-row>

    <!-- 期間選択 -->
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="startDate"
          label="開始日"
          type="date"
          prepend-icon="mdi-calendar"
          variant="outlined"
          density="compact"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="endDate"
          label="終了日"
          type="date"
          prepend-icon="mdi-calendar"
          variant="outlined"
          density="compact"
        />
      </v-col>
    </v-row>

    <!-- 自分の出退勤履歴一覧 -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-history</v-icon>
            出退勤履歴
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="userAttendanceHistory"
              :items-per-page="10"
              :loading="attendanceStore.loading"
              class="elevation-0"
            >
              <template #[`item.date`]="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template #[`item.checkIn`]="{ item }">
                {{ item.checkIn ? formatTime(item.checkIn) : '-' }}
              </template>
              <template #[`item.checkOut`]="{ item }">
                {{ item.checkOut ? formatTime(item.checkOut) : '-' }}
              </template>
              <template #[`item.workingMinutes`]="{ item }">
                {{ formatWorkingHours(item.workingMinutes) }}
              </template>
              <template #[`item.status`]="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small">
                  {{ getStatusText(item.status) }}
                </v-chip>
              </template>
              <template #[`item.note`]="{ item }">
                {{ item.note || '-' }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 統計情報 -->
    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">総勤務日数</div>
            <div class="text-h5">{{ totalWorkDays }}日</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">総勤務時間</div>
            <div class="text-h5">{{ totalWorkHours }}時間</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">遅刻回数</div>
            <div class="text-h5">{{ lateCount }}回</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">早退回数</div>
            <div class="text-h5">{{ earlyLeaveCount }}回</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAttendanceFirebaseStore } from '@/stores/attendanceFirebase'
import { ATTENDANCE_STATUS } from '@/constants'
import type { DataTableHeader } from '@/types'

interface Props {
  userId: string
}

const props = defineProps<Props>()

// Pinia Store
const attendanceStore = useAttendanceFirebaseStore()

// 日付範囲の初期値（過去30日間）
const today = new Date()
const thirtyDaysAgo = new Date(today)
thirtyDaysAgo.setDate(today.getDate() - 30)

const startDate = ref<string>(String(thirtyDaysAgo.toISOString().split('T')[0]))
const endDate = ref<string>(String(today.toISOString().split('T')[0]))

// データテーブルのヘッダー
const headers: DataTableHeader[] = [
  { title: '日付', key: 'date', sortable: true },
  { title: '出勤時刻', key: 'checkIn', sortable: false },
  { title: '退勤時刻', key: 'checkOut', sortable: false },
  { title: '勤務時間', key: 'workingMinutes', sortable: false },
  { title: 'ステータス', key: 'status', sortable: false },
  { title: '備考', key: 'note', sortable: false },
]

// Storeから勤怠データを取得
const fetchAttendances = async () => {
  await attendanceStore.fetchAttendancesByDateRange(
    props.userId,
    startDate.value,
    endDate.value,
  )
}

onMounted(() => {
  fetchAttendances()
})

// 日付範囲が変更されたら再取得
watch([startDate, endDate], () => {
  fetchAttendances()
})

// ユーザーの出退勤履歴（ストアのキャッシュから取得）
const userAttendanceHistory = computed(() => {
  return attendanceStore.getAttendancesByDateRange(
    props.userId,
    startDate.value,
    endDate.value,
  )
})

// 統計情報
const totalWorkDays = computed(() => {
  return userAttendanceHistory.value.filter((att) => att.status !== 'absent').length
})

const totalWorkHours = computed(() => {
  const totalMinutes = userAttendanceHistory.value.reduce(
    (sum, att) => sum + (att.workingMinutes || 0),
    0,
  )
  return Math.round(totalMinutes / 60 * 10) / 10
})

const lateCount = computed(() => {
  return userAttendanceHistory.value.filter((att) => att.status === 'late').length
})

const earlyLeaveCount = computed(() => {
  return userAttendanceHistory.value.filter((att) => att.status === 'early_leave').length
})

// フォーマット関数
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })
}

const formatTime = (date: Date | string | null): string => {
  if (!date) return '-'
  return new Date(date).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatWorkingHours = (minutes: number): string => {
  if (!minutes) return '-'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}時間${mins}分`
}

const getStatusText = (status: string): string => {
  return ATTENDANCE_STATUS[status]?.text || status
}

const getStatusColor = (status: string): string => {
  return ATTENDANCE_STATUS[status]?.color || 'grey'
}
</script>

<style scoped></style>
