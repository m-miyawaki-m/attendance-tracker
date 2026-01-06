// src/data/mockData.ts
import type { User, Attendance, EditLog, StatusConfig, ChartData, Summary } from '@/types'

// ユーザーデータ
export const mockUsers: User[] = [
  {
    id: 'user001',
    name: '山田太郎',
    email: 'yamada@example.com',
    role: 'employee',
    department: '営業部',
    position: '営業担当',
    employeeNumber: 'EMP001',
    managerId: 'user003', // 鈴木主任の配下
  },
  {
    id: 'user002',
    name: '佐藤花子',
    email: 'sato@example.com',
    role: 'employee',
    department: '開発部',
    position: 'シニアエンジニア',
    employeeNumber: 'EMP002',
    managerId: 'user006', // 伊藤主任の配下
  },
  {
    id: 'user003',
    name: '鈴木一郎',
    email: 'suzuki@example.com',
    role: 'employee',
    department: '営業部',
    position: '主任',
    employeeNumber: 'EMP003',
    managerId: 'user010',
  },
  {
    id: 'user004',
    name: '田中美咲',
    email: 'tanaka@example.com',
    role: 'employee',
    department: '総務部',
    position: '総務担当',
    employeeNumber: 'EMP004',
    managerId: 'user007', // 渡辺主任の配下
  },
  {
    id: 'user005',
    name: '高橋健太',
    email: 'takahashi@example.com',
    role: 'employee',
    department: '開発部',
    position: 'ジュニアエンジニア',
    employeeNumber: 'EMP005',
    managerId: 'user006', // 伊藤主任の配下
  },
  {
    id: 'user006',
    name: '伊藤直樹',
    email: 'ito@example.com',
    role: 'employee',
    department: '開発部',
    position: '主任',
    employeeNumber: 'EMP006',
    managerId: 'user010',
  },
  {
    id: 'user007',
    name: '渡辺優子',
    email: 'watanabe@example.com',
    role: 'employee',
    department: '総務部',
    position: '主任',
    employeeNumber: 'EMP007',
    managerId: 'user010',
  },
  {
    id: 'user008',
    name: '中村誠',
    email: 'nakamura@example.com',
    role: 'employee',
    department: '営業部',
    position: '営業担当',
    employeeNumber: 'EMP008',
    managerId: 'user003', // 鈴木主任の配下
  },
  {
    id: 'user009',
    name: '小林麻衣',
    email: 'kobayashi@example.com',
    role: 'employee',
    department: '総務部',
    position: '総務担当',
    employeeNumber: 'EMP009',
    managerId: 'user007', // 渡辺主任の配下
  },
  {
    id: 'user010',
    name: '管理者権限',
    email: 'admin@example.com',
    role: 'admin',
    department: '管理部',
    position: '管理者',
    employeeNumber: 'ADM001',
    managerId: null,
  },
]

// 打刻データ
export const mockAttendances: Attendance[] = [
  {
    id: 'att001',
    userId: 'user001',
    date: '2026-01-05',
    checkIn: new Date('2026-01-05T09:00:00'),
    checkInLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 10 },
    checkOut: new Date('2026-01-05T18:00:00'),
    checkOutLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 12 },
    workingMinutes: 540,
    status: 'present',
    note: '',
  },
  {
    id: 'att002',
    userId: 'user001',
    date: '2026-01-04',
    checkIn: new Date('2026-01-04T09:15:00'),
    checkInLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 8 },
    checkOut: new Date('2026-01-04T18:30:00'),
    checkOutLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 15 },
    workingMinutes: 555,
    status: 'late',
    note: '',
  },
  {
    id: 'att003',
    userId: 'user001',
    date: '2026-01-03',
    checkIn: new Date('2026-01-03T08:55:00'),
    checkInLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 10 },
    checkOut: new Date('2026-01-03T17:45:00'),
    checkOutLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 10 },
    workingMinutes: 530,
    status: 'early_leave',
    note: '',
  },
  {
    id: 'att004',
    userId: 'user002',
    date: '2026-01-05',
    checkIn: new Date('2026-01-05T08:50:00'),
    checkInLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 12 },
    checkOut: new Date('2026-01-05T18:10:00'),
    checkOutLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 14 },
    workingMinutes: 560,
    status: 'present',
    note: '',
  },
  {
    id: 'att005',
    userId: 'user003',
    date: '2026-01-05',
    checkIn: new Date('2026-01-05T09:05:00'),
    checkInLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 9 },
    checkOut: null,
    checkOutLocation: null,
    workingMinutes: 0,
    status: 'present',
    note: '',
  },
  {
    id: 'att006',
    userId: 'user004',
    date: '2026-01-05',
    checkIn: new Date('2026-01-05T09:00:00'),
    checkInLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 11 },
    checkOut: new Date('2026-01-05T18:00:00'),
    checkOutLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 13 },
    workingMinutes: 540,
    status: 'present',
    note: '',
  },
  {
    id: 'att007',
    userId: 'user005',
    date: '2026-01-05',
    checkIn: new Date('2026-01-05T09:20:00'),
    checkInLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 7 },
    checkOut: null,
    checkOutLocation: null,
    workingMinutes: 0,
    status: 'late',
    note: '',
  },
  {
    id: 'att008',
    userId: 'user006',
    date: '2026-01-05',
    checkIn: new Date('2026-01-05T08:55:00'),
    checkInLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 10 },
    checkOut: new Date('2026-01-05T18:05:00'),
    checkOutLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 11 },
    workingMinutes: 550,
    status: 'present',
    note: '',
  },
  {
    id: 'att009',
    userId: 'user007',
    date: '2026-01-05',
    checkIn: new Date('2026-01-05T09:00:00'),
    checkInLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 9 },
    checkOut: new Date('2026-01-05T17:30:00'),
    checkOutLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 10 },
    workingMinutes: 510,
    status: 'early_leave',
    note: '',
  },
  {
    id: 'att010',
    userId: 'user008',
    date: '2026-01-05',
    checkIn: new Date('2026-01-05T08:58:00'),
    checkInLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 12 },
    checkOut: new Date('2026-01-05T18:15:00'),
    checkOutLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 13 },
    workingMinutes: 557,
    status: 'present',
    note: '',
  },
  {
    id: 'att011',
    userId: 'user009',
    date: '2026-01-05',
    checkIn: new Date('2026-01-05T09:10:00'),
    checkInLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 8 },
    checkOut: new Date('2026-01-05T18:00:00'),
    checkOutLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 9 },
    workingMinutes: 530,
    status: 'late',
    note: '',
  },
]

// グラフ用データ
export const mockChartData: ChartData = {
  attendanceRate: {
    categories: ['8月', '9月', '10月', '11月', '12月', '1月'],
    series: [
      {
        name: '出勤率',
        data: [95, 92, 96, 94, 97, 95],
      },
    ],
  },
  averageWorkHours: {
    categories: ['営業部', '開発部', '総務部', '管理部'],
    series: [
      {
        name: '平均勤務時間',
        data: [8.5, 9.2, 8.0, 8.3],
      },
    ],
  },
  lateEarlyLeave: {
    categories: ['11月', '12月', '1月'],
    series: [
      {
        name: '遅刻',
        data: [3, 5, 2],
      },
      {
        name: '早退',
        data: [1, 2, 1],
      },
    ],
  },
  departmentStatus: {
    labels: ['出勤', '欠勤'],
    series: [45, 5],
  },
}

// サマリーデータ
export const mockSummary: Summary = {
  todayAttendanceRate: 90,
  averageWorkHours: 8.5,
  todayLateCount: 2,
  todayEarlyLeaveCount: 1,
}

// 編集履歴
export const mockEditLogs: EditLog[] = [
  {
    id: 'log001',
    attendanceId: 'att001',
    editedBy: 'user010',
    editedByName: '管理者権限',
    editedAt: new Date('2026-01-05T10:00:00'),
    fieldChanged: 'checkIn',
    oldValue: '09:10',
    newValue: '09:00',
    reason: '本人からの申請により修正',
  },
  {
    id: 'log002',
    attendanceId: 'att002',
    editedBy: 'user010',
    editedByName: '管理者権限',
    editedAt: new Date('2026-01-04T15:30:00'),
    fieldChanged: 'checkOut',
    oldValue: '18:00',
    newValue: '18:30',
    reason: '残業対応のため修正',
  },
]

// ステータス定義
export const statusConfig: Record<string, StatusConfig> = {
  present: { text: '正常', color: 'success' },
  late: { text: '遅刻', color: 'warning' },
  early_leave: { text: '早退', color: 'info' },
  absent: { text: '欠勤', color: 'error' },
}

// 部署リスト
export const departments: string[] = ['営業部', '開発部', '総務部', '管理部']
