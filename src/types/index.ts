// src/types/index.ts

export interface User {
  id: string
  name: string
  email: string
  role: 'employee' | 'admin'
  department: string
  position?: string
  employeeNumber?: string
  managerId: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface Location {
  latitude: number
  longitude: number
  accuracy: number
}

export interface Attendance {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  checkIn: Date
  checkInLocation: Location
  checkOut: Date | null
  checkOutLocation: Location | null
  workingMinutes: number
  status: AttendanceStatus
  note: string
  createdAt?: Date
  updatedAt?: Date
}

export type AttendanceStatus = 'present' | 'late' | 'early_leave' | 'absent'

export interface EditLog {
  id: string
  attendanceId: string
  editedBy: string
  editedByName?: string
  editedAt: Date
  fieldChanged: string
  oldValue: any
  newValue: any
  reason: string
}

export interface StatusConfig {
  text: string
  color: string
}

export interface ChartData {
  attendanceRate: {
    categories: string[]
    series: Array<{
      name: string
      data: number[]
    }>
  }
  averageWorkHours: {
    categories: string[]
    series: Array<{
      name: string
      data: number[]
    }>
  }
  lateEarlyLeave: {
    categories: string[]
    series: Array<{
      name: string
      data: number[]
    }>
  }
  departmentStatus: {
    labels: string[]
    series: number[]
  }
}

export interface Summary {
  todayAttendanceRate: number
  averageWorkHours: number
  todayLateCount: number
  todayEarlyLeaveCount: number
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
}

// データテーブルのヘッダー型
export interface DataTableHeader {
  title: string
  key: string
  sortable?: boolean
  align?: 'start' | 'center' | 'end'
}

// グラフオプション型（ApexCharts）
export interface ApexChartOptions {
  chart?: any
  xaxis?: any
  yaxis?: any
  colors?: string[]
  stroke?: any
  fill?: any
  dataLabels?: any
  markers?: any
  tooltip?: any
  plotOptions?: any
  legend?: any
  labels?: string[]
}
