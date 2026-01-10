<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">チーム勤怠管理</h1>
      </v-col>
    </v-row>

    <!-- 主任選択 -->
    <v-row>
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedManagerId"
          :items="managers"
          item-title="label"
          item-value="id"
          label="主任を選択"
          prepend-icon="mdi-account-tie"
          variant="outlined"
          density="compact"
          clearable
        />
        <p class="text-caption mt-1">利用可能な主任: {{ managers.length }}人</p>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="selectedDate"
          label="日付"
          type="date"
          prepend-icon="mdi-calendar"
          variant="outlined"
          density="compact"
        />
      </v-col>
    </v-row>

    <!-- チームメンバーサマリー -->
    <v-row v-if="selectedManagerId">
      <v-col cols="12" md="3">
        <v-card color="primary" variant="tonal">
          <v-card-text>
            <div class="text-center">
              <v-icon size="40">mdi-account-group</v-icon>
              <p class="text-h5 mt-2">{{ teamSummary.totalMembers }}</p>
              <p class="text-subtitle-2">チームメンバー数</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="success" variant="tonal">
          <v-card-text>
            <div class="text-center">
              <v-icon size="40">mdi-check-circle</v-icon>
              <p class="text-h5 mt-2">{{ teamSummary.present }}</p>
              <p class="text-subtitle-2">正常出勤</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="warning" variant="tonal">
          <v-card-text>
            <div class="text-center">
              <v-icon size="40">mdi-clock-alert</v-icon>
              <p class="text-h5 mt-2">{{ teamSummary.lateEarly }}</p>
              <p class="text-subtitle-2">遅刻・早退</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="error" variant="tonal">
          <v-card-text>
            <div class="text-center">
              <v-icon size="40">mdi-close-circle</v-icon>
              <p class="text-h5 mt-2">{{ teamSummary.absent }}</p>
              <p class="text-subtitle-2">欠勤</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- チームメンバー勤怠一覧 -->
    <v-row v-if="selectedManagerId">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-account-multiple</v-icon>
            {{ selectedManagerName }}のチームメンバー勤怠状況
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="teamAttendanceList"
              :items-per-page="10"
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
              <template #[`item.workingHours`]="{ item }">
                {{ item.workingHours }}
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

    <!-- 主任未選択時のメッセージ -->
    <v-row v-else>
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center py-12">
            <v-icon size="64" color="grey-lighten-1">mdi-account-search</v-icon>
            <p class="text-h6 mt-4 text-grey">主任を選択してください</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useAdminAttendanceStore } from '@/stores/adminAttendanceStore'
import { ATTENDANCE_STATUS } from '@/constants'
import type { DataTableHeader } from '@/types'

// Stores
const userStore = useUserStore()
const attendanceStore = useAdminAttendanceStore()

const today = new Date().toISOString().split('T')[0]
const selectedDate = ref<string>(today || '')
const selectedManagerId = ref<string | null>(null)

// Storeのstateを使用
const attendances = computed(
  () => attendanceStore.getAttendancesByDateFromCache(selectedDate.value) || [],
)
const loading = computed(() => userStore.loading || attendanceStore.loading)

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

// 日付が変更されたら勤怠データを再取得
watch(selectedDate, async () => {
  try {
    await attendanceStore.fetchAttendancesByDate(selectedDate.value)
  } catch (error) {
    console.error('Error fetching attendances:', error)
  }
})

// 主任リスト（Storeから取得）
const managers = computed(() => {
  return userStore.managers.map((user) => ({
    id: user.id,
    name: user.name,
    label: `${user.name} (${user.department} - ${user.employeeNumber})`,
    department: user.department,
    employeeNumber: user.employeeNumber,
  }))
})

// 選択された主任の名前
const selectedManagerName = computed(() => {
  if (!selectedManagerId.value) return ''
  const manager = userStore.getUserById(selectedManagerId.value)
  return manager ? manager.name : ''
})

// データテーブルのヘッダー
const headers: DataTableHeader[] = [
  { title: '社員番号', key: 'employeeNumber', sortable: true },
  { title: '名前', key: 'name', sortable: true },
  { title: '役職', key: 'position', sortable: true },
  { title: '出勤時刻', key: 'checkIn', sortable: false },
  { title: '退勤時刻', key: 'checkOut', sortable: false },
  { title: '勤務時間', key: 'workingHours', sortable: false },
  { title: 'ステータス', key: 'status', sortable: false },
  { title: '備考', key: 'note', sortable: false },
]

// チームメンバーの勤怠一覧
const teamAttendanceList = computed(() => {
  if (!selectedManagerId.value) return []

  // 選択された主任の配下メンバーを取得（Storeから）
  const teamMembers = userStore.getTeamMembers(selectedManagerId.value)

  return teamMembers.map((user) => {
    const attendance = attendances.value.find(
      (att) => att.userId === user.id
    )

    // 勤務時間を計算
    let workingHours = '-'
    if (attendance?.workingMinutes) {
      const hours = Math.floor(attendance.workingMinutes / 60)
      const minutes = attendance.workingMinutes % 60
      workingHours = `${hours}:${minutes.toString().padStart(2, '0')}`
    }

    return {
      employeeNumber: user.employeeNumber || '-',
      name: user.name,
      position: user.position,
      checkIn: attendance?.checkIn || null,
      checkOut: attendance?.checkOut || null,
      workingHours: workingHours,
      note: attendance?.note || '',
      status: attendance ? attendance.status : 'absent',
    }
  })
})

// チームサマリー
const teamSummary = computed(() => {
  const list = teamAttendanceList.value
  return {
    totalMembers: list.length,
    present: list.filter((item) => item.status === 'present').length,
    lateEarly:
      list.filter((item) => item.status === 'late').length +
      list.filter((item) => item.status === 'early_leave').length,
    absent: list.filter((item) => item.status === 'absent').length,
  }
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
