// src/data/mockData.ts
import type { User, Attendance, EditLog, ChartData, Summary } from '@/types'
import { ATTENDANCE_STATUS, DEPARTMENTS } from '@/constants'

/**
 * モックユーザーデータ
 *
 * @deprecated このデータはモック認証 (src/stores/auth.ts) でのみ使用されます。
 * 実際の運用では Firebase Authentication と Firestore の users コレクションを使用してください。
 */
export const mockUsers: User[] = [
  {
    id: 'SCRmr8ic0ed8XETzaMdec4scqZs2',
    name: '管理者',
    email: 'admin@example.com',
    role: 'admin',
    department: '総務部',
    position: '管理者',
    employeeNumber: 'ADMIN001',
    managerId: null,
  },
  {
    id: 'W6i8UM3962WfSuKAnVPupU1Aeh53',
    name: '山田太郎',
    email: 'user01@example.com',
    role: 'employee',
    department: '営業部',
    position: '一般社員',
    employeeNumber: 'EMP001',
    managerId: null,
  },
  {
    id: 'user02_1767797399707_3on6m',
    name: '清水花子',
    email: 'user02@example.com',
    role: 'employee',
    department: '開発部',
    position: 'マネージャー',
    employeeNumber: 'EMP02',
    managerId: null,
  },
  {
    id: 'user03_1767797399915_mhzqu7',
    name: '吉田正人',
    email: 'user03@example.com',
    role: 'employee',
    department: '開発部',
    position: '課長補佐',
    employeeNumber: 'EMP03',
    managerId: null,
  },
  {
    id: 'user04_1767797400125_jklqi',
    name: '木村恵子',
    email: 'user04@example.com',
    role: 'employee',
    department: '人事部',
    position: '課長補佐',
    employeeNumber: 'EMP04',
    managerId: null,
  },
  {
    id: 'user05_1767797400334_jz8pk',
    name: '斎藤明美',
    email: 'user05@example.com',
    role: 'employee',
    department: '経理部',
    position: 'シニアエンジニア',
    employeeNumber: 'EMP05',
    managerId: null,
  },
  {
    id: 'user06_1767797400521_qabl7l',
    name: '鈴木美咲',
    email: 'user06@example.com',
    role: 'employee',
    department: '経理部',
    position: '課長補佐',
    employeeNumber: 'EMP06',
    managerId: null,
  },
  {
    id: 'user07_1767797400757_knxemd',
    name: '中村次郎',
    email: 'user07@example.com',
    role: 'employee',
    department: '人事部',
    position: 'プロジェクトリーダー',
    employeeNumber: 'EMP07',
    managerId: null,
  },
  {
    id: 'user08_1767797400965_y4vegn',
    name: '加藤明美',
    email: 'user08@example.com',
    role: 'employee',
    department: '開発部',
    position: '課長補佐',
    employeeNumber: 'EMP08',
    managerId: null,
  },
  {
    id: 'user09_1767797401172_2h9dgg',
    name: '井上花子',
    email: 'user09@example.com',
    role: 'employee',
    department: '営業部',
    position: '一般社員',
    employeeNumber: 'EMP09',
    managerId: null,
  },
  {
    id: 'user10_1767797401332_f5pauc',
    name: '井上真理子',
    email: 'user10@example.com',
    role: 'employee',
    department: 'マーケティング部',
    position: '一般社員',
    employeeNumber: 'EMP10',
    managerId: null,
  },
  {
    id: 'user11_1767797401484_eud18j',
    name: '小林恵子',
    email: 'user11@example.com',
    role: 'employee',
    department: '総務部',
    position: '主任',
    employeeNumber: 'EMP11',
    managerId: null,
  },
  {
    id: 'user12_1767797401639_qibwx',
    name: '小林貴之',
    email: 'user12@example.com',
    role: 'employee',
    department: '営業部',
    position: '主任',
    employeeNumber: 'EMP12',
    managerId: null,
  },
  {
    id: 'user13_1767797401790_bguyy',
    name: '鈴木麻美',
    email: 'user13@example.com',
    role: 'employee',
    department: 'マーケティング部',
    position: '課長補佐',
    employeeNumber: 'EMP13',
    managerId: null,
  },
  {
    id: 'user14_1767797401942_o881i',
    name: '吉田浩二',
    email: 'user14@example.com',
    role: 'employee',
    department: 'マーケティング部',
    position: '一般社員',
    employeeNumber: 'EMP14',
    managerId: null,
  },
  {
    id: 'user15_1767797402095_nuwzf',
    name: '山田直樹',
    email: 'user15@example.com',
    role: 'employee',
    department: '開発部',
    position: '主任',
    employeeNumber: 'EMP15',
    managerId: null,
  },
  {
    id: 'user16_1767797402265_lhmbdb',
    name: '山崎直樹',
    email: 'user16@example.com',
    role: 'employee',
    department: '営業部',
    position: '主任',
    employeeNumber: 'EMP16',
    managerId: null,
  },
  {
    id: 'user17_1767797402417_77fzfd',
    name: '山本和也',
    email: 'user17@example.com',
    role: 'employee',
    department: '総務部',
    position: 'マネージャー',
    employeeNumber: 'EMP17',
    managerId: null,
  },
  {
    id: 'user18_1767797402569_hcbzea',
    name: '井上智子',
    email: 'user18@example.com',
    role: 'employee',
    department: '開発部',
    position: 'マネージャー',
    employeeNumber: 'EMP18',
    managerId: null,
  },
  {
    id: 'user19_1767797402737_ltp00o',
    name: '林明美',
    email: 'user19@example.com',
    role: 'employee',
    department: '総務部',
    position: 'シニアエンジニア',
    employeeNumber: 'EMP19',
    managerId: null,
  },
  {
    id: 'user20_1767797402890_va9fdr',
    name: '山田真理子',
    email: 'user20@example.com',
    role: 'employee',
    department: '開発部',
    position: '一般社員',
    employeeNumber: 'EMP20',
    managerId: null,
  }
]

/**
 * モック勤怠データ
 *
 * @deprecated このデータは現在使用されていません。
 * 実際の運用では Firestore の attendances コレクションを使用してください。
 */
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

/**
 * モックグラフデータ
 *
 * @deprecated このデータは現在使用されていません。
 * 実際のダッシュボードは Firestore から取得したデータを集計して表示します。
 */
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

/**
 * モックサマリーデータ
 *
 * @deprecated このデータは現在使用されていません。
 * 実際のダッシュボードは Firestore から取得したデータを集計して表示します。
 */
export const mockSummary: Summary = {
  todayAttendanceRate: 90,
  averageWorkHours: 8.5,
  todayLateCount: 2,
  todayEarlyLeaveCount: 1,
}

/**
 * モック編集履歴データ
 *
 * @deprecated このデータは現在使用されていません。
 * 実際の運用では Firestore の editLogs コレクションを使用してください。
 */
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

// ステータス定義（後方互換性のため再エクスポート）
// @deprecated 直接 @/constants からインポートしてください
export const statusConfig = ATTENDANCE_STATUS

// 部署リスト（後方互換性のため再エクスポート）
// @deprecated 直接 @/constants からインポートしてください
export const departments = DEPARTMENTS
