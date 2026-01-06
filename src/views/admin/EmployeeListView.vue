<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">従業員管理</h1>
      </v-col>
    </v-row>

    <!-- 月選択 -->
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="selectedMonth"
          label="対象月"
          type="month"
          prepend-icon="mdi-calendar"
          variant="outlined"
          density="compact"
        />
      </v-col>
    </v-row>

    <!-- 従業員一覧 -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-account-group</v-icon>
            従業員一覧
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="employeeList"
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
              <template #[`item.attendanceStatus`]="{ item }">
                <div class="d-flex flex-wrap ga-1">
                  <v-chip size="small" color="success" variant="outlined">
                    正常: {{ item.attendanceStatus.present }}
                  </v-chip>
                  <v-chip size="small" color="warning" variant="outlined">
                    遅刻: {{ item.attendanceStatus.late }}
                  </v-chip>
                  <v-chip size="small" color="info" variant="outlined">
                    早退: {{ item.attendanceStatus.early_leave }}
                  </v-chip>
                  <v-chip size="small" color="error" variant="outlined">
                    欠勤: {{ item.attendanceStatus.absent }}
                  </v-chip>
                </div>
              </template>
              <template #[`item.note`]="{ item }">
                {{ item.note || '-' }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockUsers, mockAttendances } from '@/data/mockData'
import type { DataTableHeader } from '@/types'

// 現在の年月を取得
const today = new Date()
const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
const selectedMonth = ref<string>(currentYearMonth)

// データテーブルのヘッダー
const headers: DataTableHeader[] = [
  { title: '社員番号', key: 'employeeNumber', sortable: true },
  { title: '名前', key: 'name', sortable: true },
  { title: '役職', key: 'position', sortable: true },
  { title: '当月の出勤ステータス', key: 'attendanceStatus', sortable: false },
  { title: '備考', key: 'note', sortable: false },
]

// 従業員一覧（月次集計）
const employeeList = computed(() => {
  return mockUsers
    .filter((user) => user.role === 'employee')
    .map((user) => {
      // 選択された月の勤怠データを取得
      const monthAttendances = mockAttendances.filter(
        (att) =>
          att.userId === user.id &&
          att.date.startsWith(selectedMonth.value),
      )

      // ステータスごとの件数を集計
      const attendanceStatus = {
        present: 0,
        late: 0,
        early_leave: 0,
        absent: 0,
      }

      monthAttendances.forEach((att) => {
        if (att.status === 'present') {
          attendanceStatus.present++
        } else if (att.status === 'late') {
          attendanceStatus.late++
        } else if (att.status === 'early_leave') {
          attendanceStatus.early_leave++
        } else if (att.status === 'absent') {
          attendanceStatus.absent++
        }
      })

      return {
        employeeNumber: user.employeeNumber || '-',
        name: user.name,
        position: user.position,
        department: user.department,
        attendanceStatus: attendanceStatus,
        note: '',
      }
    })
})
</script>

<style scoped></style>
