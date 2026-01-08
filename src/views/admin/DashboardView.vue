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
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { ApexChartOptions, User, Attendance } from '@/types'

const users = ref<User[]>([])
const attendances = ref<Attendance[]>([])
const loading = ref(true)

// Firestoreからデータを取得
onMounted(async () => {
  try {
    // ユーザー一覧を取得
    const usersSnapshot = await getDocs(collection(db, 'users'))
    users.value = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[]

    // 過去30日分の勤怠データを取得（ダッシュボードの統計用）
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]

    const attendancesQuery = query(
      collection(db, 'attendances'),
      where('date', '>=', startDate)
    )
    const attendancesSnapshot = await getDocs(attendancesQuery)
    attendances.value = attendancesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      checkIn: doc.data().checkIn?.toDate(),
      checkOut: doc.data().checkOut?.toDate(),
    })) as Attendance[]

    console.log('Dashboard data loaded:', {
      users: users.value.length,
      attendances: attendances.value.length,
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
})

// サマリーデータを計算
const summary = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayAttendances = attendances.value.filter((att) => att.date === today)

  const totalEmployees = users.value.filter((user) => user.role === 'employee').length
  const todayPresent = todayAttendances.filter((att) => att.status === 'present').length
  const todayLate = todayAttendances.filter((att) => att.status === 'late').length
  const todayEarlyLeave = todayAttendances.filter((att) => att.status === 'early_leave').length

  // 今月の総勤務時間を計算
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthlyAttendances = attendances.value.filter((att) => att.date.startsWith(currentMonth))
  const totalMinutes = monthlyAttendances.reduce((sum, att) => sum + (att.workingMinutes || 0), 0)
  const totalHours = Math.floor(totalMinutes / 60)

  return {
    totalEmployees,
    todayPresent,
    todayLateEarly: todayLate + todayEarlyLeave,
    monthlyTotalHours: totalHours,
  }
})

// グラフデータを計算
const chartData = computed(() => {
  // 過去6ヶ月の月次出勤率を計算
  const attendanceRateData = calculateMonthlyAttendanceRate()

  // 部署別平均勤務時間を計算
  const avgWorkHoursData = calculateDepartmentAverageWorkHours()

  // 遅刻・早退の推移を計算
  const lateEarlyLeaveData = calculateLateEarlyLeaveTrend()

  // 当日の出勤状況を計算
  const departmentStatusData = calculateTodayAttendanceStatus()

  return {
    attendanceRate: attendanceRateData,
    averageWorkHours: avgWorkHoursData,
    lateEarlyLeave: lateEarlyLeaveData,
    departmentStatus: departmentStatusData,
  }
})

// 月次出勤率を計算（過去6ヶ月）
const calculateMonthlyAttendanceRate = () => {
  const categories: string[] = []
  const data: number[] = []

  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthStr = date.toISOString().slice(0, 7)
    const monthName = `${date.getMonth() + 1}月`

    const monthAttendances = attendances.value.filter((att) => att.date.startsWith(monthStr))
    const presentCount = monthAttendances.filter((att) =>
      att.status === 'present' || att.status === 'late' || att.status === 'early_leave'
    ).length
    const totalCount = monthAttendances.length
    const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

    categories.push(monthName)
    data.push(rate)
  }

  return {
    categories,
    series: [{ name: '出勤率', data }],
  }
}

// 部署別平均勤務時間を計算
const calculateDepartmentAverageWorkHours = () => {
  const departmentMap = new Map<string, { totalMinutes: number; count: number }>()

  // 今月のデータのみを対象
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthlyAttendances = attendances.value.filter((att) => att.date.startsWith(currentMonth))

  monthlyAttendances.forEach((att) => {
    const user = users.value.find((u) => u.id === att.userId)
    if (user && user.department && att.workingMinutes) {
      const dept = user.department
      const current = departmentMap.get(dept) || { totalMinutes: 0, count: 0 }
      departmentMap.set(dept, {
        totalMinutes: current.totalMinutes + att.workingMinutes,
        count: current.count + 1,
      })
    }
  })

  const categories: string[] = []
  const data: number[] = []

  departmentMap.forEach((value, dept) => {
    const avgHours = value.count > 0 ? Math.round((value.totalMinutes / value.count) / 60 * 10) / 10 : 0
    categories.push(dept)
    data.push(avgHours)
  })

  return {
    categories,
    series: [{ name: '平均勤務時間', data }],
  }
}

// 遅刻・早退の推移を計算（過去7日間）
const calculateLateEarlyLeaveTrend = () => {
  const categories: string[] = []
  const lateData: number[] = []
  const earlyLeaveData: number[] = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`

    const dayAttendances = attendances.value.filter((att) => att.date === dateStr)
    const lateCount = dayAttendances.filter((att) => att.status === 'late').length
    const earlyLeaveCount = dayAttendances.filter((att) => att.status === 'early_leave').length

    categories.push(dayLabel)
    lateData.push(lateCount)
    earlyLeaveData.push(earlyLeaveCount)
  }

  return {
    categories,
    series: [
      { name: '遅刻', data: lateData },
      { name: '早退', data: earlyLeaveData },
    ],
  }
}

// 当日の出勤状況を計算
const calculateTodayAttendanceStatus = () => {
  const today = new Date().toISOString().split('T')[0]
  const todayAttendances = attendances.value.filter((att) => att.date === today)

  const presentCount = todayAttendances.filter((att) =>
    att.status === 'present' || att.status === 'late' || att.status === 'early_leave'
  ).length
  const absentCount = todayAttendances.filter((att) => att.status === 'absent').length

  return {
    labels: ['出勤', '欠勤'],
    series: [presentCount, absentCount],
  }
}

// 月次出勤率推移のオプション
const attendanceRateOptions = computed<ApexChartOptions>(() => ({
  chart: {
    type: 'line',
    toolbar: {
      show: false,
    },
  },
  xaxis: {
    categories: chartData.value.attendanceRate.categories,
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
}))

// 部署別平均勤務時間のオプション
const avgWorkHoursOptions = computed<ApexChartOptions>(() => ({
  chart: {
    type: 'bar',
    toolbar: {
      show: false,
    },
  },
  xaxis: {
    categories: chartData.value.averageWorkHours.categories,
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
}))

// 遅刻・早退の推移のオプション
const lateEarlyLeaveOptions = computed<ApexChartOptions>(() => ({
  chart: {
    type: 'line',
    toolbar: {
      show: false,
    },
  },
  xaxis: {
    categories: chartData.value.lateEarlyLeave.categories,
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
}))

// 当日の出勤状況のオプション
const departmentStatusOptions = computed<ApexChartOptions>(() => ({
  chart: {
    type: 'donut',
  },
  labels: chartData.value.departmentStatus.labels,
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
}))
</script>

<style scoped></style>
