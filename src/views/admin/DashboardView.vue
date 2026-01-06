<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">管理者ダッシュボード</h1>
      </v-col>
    </v-row>

    <!-- サマリーカード -->
    <v-row>
      <v-col cols="12" md="3">
        <v-card color="primary" dark>
          <v-card-text>
            <div class="text-center">
              <v-icon size="48">mdi-account-group</v-icon>
              <p class="text-h4 mt-2">{{ summary.totalEmployees }}</p>
              <p class="text-subtitle-1">従業員数</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="success" dark>
          <v-card-text>
            <div class="text-center">
              <v-icon size="48">mdi-clock-check</v-icon>
              <p class="text-h4 mt-2">{{ summary.todayPresent }}</p>
              <p class="text-subtitle-1">本日出勤中</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="warning" dark>
          <v-card-text>
            <div class="text-center">
              <v-icon size="48">mdi-alert</v-icon>
              <p class="text-h4 mt-2">{{ summary.todayLateEarly }}</p>
              <p class="text-subtitle-1">遅刻・早退</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="info" dark>
          <v-card-text>
            <div class="text-center">
              <v-icon size="48">mdi-calendar-month</v-icon>
              <p class="text-h4 mt-2">{{ summary.monthlyTotalHours }}</p>
              <p class="text-subtitle-1">今月の総勤務時間</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- グラフエリア -->
    <v-row>
      <!-- 月次出勤率推移 -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-line</v-icon>
            月次出勤率推移
          </v-card-title>
          <v-card-text>
            <apexchart
              type="line"
              height="300"
              :options="attendanceRateOptions"
              :series="chartData.attendanceRate.series"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 部署別平均勤務時間 -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-bar</v-icon>
            部署別平均勤務時間
          </v-card-title>
          <v-card-text>
            <apexchart
              type="bar"
              height="300"
              :options="avgWorkHoursOptions"
              :series="chartData.averageWorkHours.series"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 遅刻・早退の推移 -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-timeline-variant</v-icon>
            遅刻・早退の推移
          </v-card-title>
          <v-card-text>
            <apexchart
              type="line"
              height="300"
              :options="lateEarlyLeaveOptions"
              :series="chartData.lateEarlyLeave.series"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 当日の出勤状況 -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-donut</v-icon>
            当日の出勤状況
          </v-card-title>
          <v-card-text>
            <apexchart
              type="donut"
              height="300"
              :options="departmentStatusOptions"
              :series="chartData.departmentStatus.series"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { mockChartData, mockUsers, mockAttendances } from '@/data/mockData'
import type { ApexChartOptions } from '@/types'

// サマリーデータを計算
const summary = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayAttendances = mockAttendances.filter((att) => att.date === today)

  const totalEmployees = mockUsers.filter((user) => user.role === 'employee').length
  const todayPresent = todayAttendances.filter((att) => att.status === 'present').length
  const todayLate = todayAttendances.filter((att) => att.status === 'late').length
  const todayEarlyLeave = todayAttendances.filter((att) => att.status === 'early_leave').length

  // 今月の総勤務時間を計算（モックデータから）
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthlyAttendances = mockAttendances.filter((att) => att.date.startsWith(currentMonth))
  const totalMinutes = monthlyAttendances.reduce((sum, att) => sum + att.workingMinutes, 0)
  const totalHours = Math.floor(totalMinutes / 60)

  return {
    totalEmployees,
    todayPresent,
    todayLateEarly: todayLate + todayEarlyLeave,
    monthlyTotalHours: totalHours,
  }
})

// グラフデータ
const chartData = mockChartData

// 月次出勤率推移のオプション
const attendanceRateOptions: ApexChartOptions = {
  chart: {
    type: 'line',
    toolbar: {
      show: false,
    },
  },
  xaxis: {
    categories: chartData.attendanceRate.categories,
  },
  yaxis: {
    title: {
      text: '出勤率 (%)',
    },
    min: 0,
    max: 100,
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  colors: ['#4CAF50'],
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 5,
  },
}

// 部署別平均勤務時間のオプション
const avgWorkHoursOptions: ApexChartOptions = {
  chart: {
    type: 'bar',
    toolbar: {
      show: false,
    },
  },
  xaxis: {
    categories: chartData.averageWorkHours.categories,
  },
  yaxis: {
    title: {
      text: '平均勤務時間 (時間)',
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      dataLabels: {
        position: 'top',
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val: number) {
      return val + '時間'
    },
    offsetY: -20,
    style: {
      fontSize: '12px',
      colors: ['#304758'],
    },
  },
  colors: ['#2196F3'],
}

// 遅刻・早退の推移のオプション
const lateEarlyLeaveOptions: ApexChartOptions = {
  chart: {
    type: 'line',
    toolbar: {
      show: false,
    },
  },
  xaxis: {
    categories: chartData.lateEarlyLeave.categories,
  },
  yaxis: {
    title: {
      text: '件数',
    },
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  colors: ['#FF9800', '#03A9F4'],
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 5,
  },
  legend: {
    position: 'top',
  },
}

// 当日の出勤状況のオプション
const departmentStatusOptions: ApexChartOptions = {
  chart: {
    type: 'donut',
  },
  labels: chartData.departmentStatus.labels,
  colors: ['#4CAF50', '#F44336'],
  legend: {
    position: 'bottom',
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: '合計',
            formatter: function (w: any) {
              return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
            },
          },
        },
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val: number) {
      return val.toFixed(1) + '%'
    },
  },
}
</script>

<style scoped></style>
