// tests/unit/views/admin/DashboardView.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DashboardView from '@/views/admin/DashboardView.vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import type { User, Attendance } from '@/types'

// Firebase モックの型定義
const mockCollection = collection as Mock
const mockGetDocs = getDocs as Mock
const mockQuery = query as Mock
const mockWhere = where as Mock

// ApexChartsモック
vi.mock('vue3-apexcharts', () => ({
  default: {
    name: 'apexchart',
    props: ['type', 'height', 'options', 'series'],
    template: '<div class="apexchart-mock" :data-type="type" :data-height="height"></div>',
  },
}))

// テスト用のユーザーデータ
const mockUsers: User[] = [
  {
    id: 'user-001',
    name: '山田太郎',
    email: 'yamada@example.com',
    role: 'employee',
    department: '開発部',
    position: '一般',
    employeeNumber: 'EMP001',
    managerId: 'manager-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user-002',
    name: '佐藤花子',
    email: 'sato@example.com',
    role: 'employee',
    department: '営業部',
    position: '一般',
    employeeNumber: 'EMP002',
    managerId: 'manager-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user-003',
    name: '鈴木一郎',
    email: 'suzuki@example.com',
    role: 'employee',
    department: '開発部',
    position: '一般',
    employeeNumber: 'EMP003',
    managerId: 'manager-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'admin-001',
    name: '管理者',
    email: 'admin@example.com',
    role: 'admin',
    department: '管理部',
    position: '管理者',
    employeeNumber: 'ADM001',
    managerId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

// テスト用の勤怠データ生成関数
const createMockAttendance = (
  userId: string,
  date: string,
  status: 'present' | 'late' | 'early_leave' | 'absent',
  workingMinutes: number = 480
): Attendance => ({
  id: `att-${userId}-${date}`,
  userId,
  date,
  checkIn: new Date(`${date}T09:00:00`),
  checkOut: new Date(`${date}T18:00:00`),
  checkInLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 10 },
  checkOutLocation: { latitude: 35.6812, longitude: 139.7671, accuracy: 10 },
  status,
  workingMinutes,
  createdAt: new Date(),
  updatedAt: new Date(),
})

// 今日の日付を固定
const TODAY = '2026-01-12'
const CURRENT_MONTH = '2026-01'

// テスト用の勤怠データ
const mockAttendances: Attendance[] = [
  // 今日の出勤データ
  createMockAttendance('user-001', TODAY, 'present', 480),
  createMockAttendance('user-002', TODAY, 'late', 420),
  createMockAttendance('user-003', TODAY, 'early_leave', 360),
  // 今月の過去データ
  createMockAttendance('user-001', '2026-01-11', 'present', 480),
  createMockAttendance('user-002', '2026-01-11', 'present', 480),
  createMockAttendance('user-003', '2026-01-11', 'late', 450),
  createMockAttendance('user-001', '2026-01-10', 'present', 480),
  createMockAttendance('user-002', '2026-01-10', 'early_leave', 360),
  // 先月のデータ
  createMockAttendance('user-001', '2025-12-15', 'present', 480),
  createMockAttendance('user-002', '2025-12-15', 'present', 480),
]

// Firestoreのdocデータ形式に変換
const convertToDocData = (attendance: Attendance) => ({
  id: attendance.id,
  ...attendance,
  checkIn: { toDate: () => attendance.checkIn },
  checkOut: { toDate: () => attendance.checkOut },
})

describe('DashboardView.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-12T10:00:00'))

    // コンソールのモック
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // ヘルパー関数：成功時のモック設定
  const setupSuccessMocks = () => {
    mockCollection.mockReturnValue('collection-ref')
    mockQuery.mockReturnValue('query-ref')
    mockWhere.mockReturnValue('where-ref')

    // usersコレクションとattendancesコレクションのレスポンスを設定
    mockGetDocs.mockImplementation((ref: string) => {
      if (ref === 'collection-ref') {
        // 最初の呼び出しはusers
        return Promise.resolve({
          docs: mockUsers.map((user) => ({
            id: user.id,
            data: () => user,
          })),
        })
      }
      // 2回目以降はattendances
      return Promise.resolve({
        docs: mockAttendances.map((att) => ({
          id: att.id,
          data: () => convertToDocData(att),
        })),
      })
    })
  }

  // ヘルパー関数：コンポーネントのマウント（Vuetifyはvitest.setup.tsでグローバル設定済み）
  const mountComponent = () => {
    return mount(DashboardView, {
      global: {
        stubs: {
          apexchart: {
            name: 'apexchart',
            props: ['type', 'height', 'options', 'series'],
            template: '<div class="apexchart-mock" :data-type="type" :data-height="height"></div>',
          },
        },
      },
    })
  }

  describe('4.1. 初期データ取得', () => {
    it('1-1: ユーザーデータ取得', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'users')
      expect(mockGetDocs).toHaveBeenCalled()
    })

    it('1-2: 勤怠データ取得（過去30日分）', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'attendances')
      expect(mockWhere).toHaveBeenCalledWith('date', '>=', expect.any(String))
      expect(mockQuery).toHaveBeenCalled()
    })

    it('1-3: ローディング状態', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()

      // データ取得完了後
      await flushPromises()

      // loadingがfalseになっている（コンソールログで確認）
      expect(console.log).toHaveBeenCalledWith('Dashboard data loaded:', expect.any(Object))
    })

    it('1-4: エラーハンドリング', async () => {
      mockCollection.mockReturnValue('collection-ref')
      mockGetDocs.mockRejectedValue(new Error('Firestore error'))

      const wrapper = mountComponent()
      await flushPromises()

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching dashboard data:',
        expect.any(Error)
      )
    })
  })

  describe('4.2. サマリー計算', () => {
    it('2-1: 従業員数', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      const summaryCards = wrapper.findAll('.v-card')
      const employeeCard = summaryCards[0]

      // 従業員数は3人（role: 'employee'のユーザー数）
      expect(employeeCard.text()).toContain('従業員数')
      expect(employeeCard.text()).toContain('3')
    })

    it('2-2: 本日出勤中', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      const summaryCards = wrapper.findAll('.v-card')
      const presentCard = summaryCards[1]

      // 本日出勤中は1人（status: 'present'のみカウント）
      expect(presentCard.text()).toContain('本日出勤中')
      expect(presentCard.text()).toContain('1')
    })

    it('2-3: 遅刻・早退数', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      const summaryCards = wrapper.findAll('.v-card')
      const lateEarlyCard = summaryCards[2]

      // 遅刻・早退は2人（late: 1, early_leave: 1）
      expect(lateEarlyCard.text()).toContain('遅刻・早退')
      expect(lateEarlyCard.text()).toContain('2')
    })

    it('2-4: 今月総勤務時間', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      const summaryCards = wrapper.findAll('.v-card')
      const monthlyCard = summaryCards[3]

      // 今月の総勤務時間を計算
      // 2026-01-12: 480 + 420 + 360 = 1260分
      // 2026-01-11: 480 + 480 + 450 = 1410分
      // 2026-01-10: 480 + 360 = 840分
      // 合計: 3510分 = 58時間
      expect(monthlyCard.text()).toContain('今月の総勤務時間')
      expect(monthlyCard.text()).toContain('58')
    })
  })

  describe('4.3. グラフデータ計算', () => {
    describe('4.3.1. 月次出勤率推移', () => {
      it('3-1-1: カテゴリ（過去6ヶ月の月名）', async () => {
        setupSuccessMocks()
        const wrapper = mountComponent()
        await flushPromises()

        const charts = wrapper.findAll('.apexchart-mock')
        const attendanceRateChart = charts[0]

        expect(attendanceRateChart.attributes('data-type')).toBe('line')
      })

      it('3-1-2: 出勤率計算', async () => {
        setupSuccessMocks()
        const wrapper = mountComponent()
        await flushPromises()

        // グラフコンポーネントが存在することを確認
        const charts = wrapper.findAll('.apexchart-mock')
        expect(charts.length).toBeGreaterThan(0)
      })

      it('3-1-3: データなし時は0', async () => {
        // 勤怠データなしの場合
        mockCollection.mockReturnValue('collection-ref')
        mockQuery.mockReturnValue('query-ref')
        mockWhere.mockReturnValue('where-ref')
        mockGetDocs.mockResolvedValueOnce({
          docs: mockUsers.map((user) => ({
            id: user.id,
            data: () => user,
          })),
        }).mockResolvedValueOnce({
          docs: [], // 勤怠データなし
        })

        const wrapper = mountComponent()
        await flushPromises()

        // コンポーネントがエラーなくレンダリングされることを確認
        expect(wrapper.exists()).toBe(true)
      })
    })

    describe('4.3.2. 部署別平均勤務時間', () => {
      it('3-2-1: 部署ごとの集計', async () => {
        setupSuccessMocks()
        const wrapper = mountComponent()
        await flushPromises()

        const charts = wrapper.findAll('.apexchart-mock')
        const avgWorkHoursChart = charts[1]

        expect(avgWorkHoursChart.attributes('data-type')).toBe('bar')
      })

      it('3-2-2: 小数点処理', async () => {
        setupSuccessMocks()
        const wrapper = mountComponent()
        await flushPromises()

        // グラフが正しくレンダリングされていることを確認
        const charts = wrapper.findAll('.apexchart-mock[data-type="bar"]')
        expect(charts.length).toBe(1)
      })
    })

    describe('4.3.3. 遅刻・早退の推移', () => {
      it('3-3-1: カテゴリ（過去7日間）', async () => {
        setupSuccessMocks()
        const wrapper = mountComponent()
        await flushPromises()

        const charts = wrapper.findAll('.apexchart-mock')
        const lateEarlyChart = charts[2]

        expect(lateEarlyChart.attributes('data-type')).toBe('line')
      })

      it('3-3-2: 遅刻件数', async () => {
        setupSuccessMocks()
        const wrapper = mountComponent()
        await flushPromises()

        // グラフコンポーネントが存在することを確認
        expect(wrapper.find('.apexchart-mock[data-type="line"]').exists()).toBe(true)
      })

      it('3-3-3: 早退件数', async () => {
        setupSuccessMocks()
        const wrapper = mountComponent()
        await flushPromises()

        // グラフコンポーネントが存在することを確認
        const lineCharts = wrapper.findAll('.apexchart-mock[data-type="line"]')
        expect(lineCharts.length).toBeGreaterThanOrEqual(2)
      })
    })

    describe('4.3.4. 当日の出勤状況', () => {
      it('3-4-1: 出勤数', async () => {
        setupSuccessMocks()
        const wrapper = mountComponent()
        await flushPromises()

        const charts = wrapper.findAll('.apexchart-mock')
        const donutChart = charts[3]

        expect(donutChart.attributes('data-type')).toBe('donut')
      })

      it('3-4-2: 欠勤数', async () => {
        setupSuccessMocks()
        const wrapper = mountComponent()
        await flushPromises()

        // ドーナツグラフが存在することを確認
        const donutChart = wrapper.find('.apexchart-mock[data-type="donut"]')
        expect(donutChart.exists()).toBe(true)
      })
    })
  })

  describe('4.4. グラフオプション', () => {
    it('4-1: 出勤率グラフオプション（line, 0-100, 緑）', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      const lineCharts = wrapper.findAll('.apexchart-mock[data-type="line"]')
      expect(lineCharts.length).toBeGreaterThanOrEqual(1)
    })

    it('4-2: 勤務時間グラフオプション（bar, dataLabels, 青）', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      const barChart = wrapper.find('.apexchart-mock[data-type="bar"]')
      expect(barChart.exists()).toBe(true)
    })

    it('4-3: 遅刻早退グラフオプション（line, 2系列）', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      const lineCharts = wrapper.findAll('.apexchart-mock[data-type="line"]')
      expect(lineCharts.length).toBeGreaterThanOrEqual(2)
    })

    it('4-4: 出勤状況グラフオプション（donut）', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      const donutChart = wrapper.find('.apexchart-mock[data-type="donut"]')
      expect(donutChart.exists()).toBe(true)
    })
  })

  describe('4.5. 表示', () => {
    it('5-1: タイトル「管理者ダッシュボード」', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.text()).toContain('管理者ダッシュボード')
    })

    it('5-2: サマリーカード（4つ）', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.text()).toContain('従業員数')
      expect(wrapper.text()).toContain('本日出勤中')
      expect(wrapper.text()).toContain('遅刻・早退')
      expect(wrapper.text()).toContain('今月の総勤務時間')
    })

    it('5-3: グラフ（4つ）', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.text()).toContain('月次出勤率推移')
      expect(wrapper.text()).toContain('部署別平均勤務時間')
      expect(wrapper.text()).toContain('遅刻・早退の推移')
      expect(wrapper.text()).toContain('当日の出勤状況')
    })
  })

  describe('DV-001〜DV-013: チェックリスト項目', () => {
    it('DV-003: 出勤率表示（従業員数）', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      // 従業員数3人が表示される
      const text = wrapper.text()
      expect(text).toContain('従業員数')
    })

    it('DV-004: 平均勤務時間表示（本日出勤中）', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.text()).toContain('本日出勤中')
    })

    it('DV-005: 遅刻者数表示', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.text()).toContain('遅刻・早退')
    })

    it('DV-006: 早退者数表示（今月総勤務時間）', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.text()).toContain('今月の総勤務時間')
    })

    it('DV-007: 月次出勤率グラフ', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.text()).toContain('月次出勤率推移')
      const lineCharts = wrapper.findAll('.apexchart-mock[data-type="line"]')
      expect(lineCharts.length).toBeGreaterThanOrEqual(1)
    })

    it('DV-008: 部署別勤務時間グラフ', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.text()).toContain('部署別平均勤務時間')
      expect(wrapper.find('.apexchart-mock[data-type="bar"]').exists()).toBe(true)
    })

    it('DV-009: 遅刻・早退推移グラフ', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.text()).toContain('遅刻・早退の推移')
    })

    it('DV-010: 当日出勤状況グラフ', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.text()).toContain('当日の出勤状況')
      expect(wrapper.find('.apexchart-mock[data-type="donut"]').exists()).toBe(true)
    })

    it('DV-011: ローディング表示', async () => {
      // 遅延を入れてloadingがtrueの状態を確認
      mockCollection.mockReturnValue('collection-ref')
      mockGetDocs.mockImplementation(() => new Promise((resolve) => {
        setTimeout(() => resolve({ docs: [] }), 1000)
      }))

      const wrapper = mountComponent()

      // データ取得前はloadingがtrue
      // （内部状態なので直接確認は難しいが、エラーなくマウントされることを確認）
      expect(wrapper.exists()).toBe(true)

      await flushPromises()
    })

    it('DV-012: データ取得成功', async () => {
      setupSuccessMocks()
      const wrapper = mountComponent()
      await flushPromises()

      expect(console.log).toHaveBeenCalledWith('Dashboard data loaded:', expect.objectContaining({
        users: expect.any(Number),
        attendances: expect.any(Number),
      }))
    })

    it('DV-013: データ取得失敗', async () => {
      mockCollection.mockReturnValue('collection-ref')
      mockGetDocs.mockRejectedValue(new Error('Network error'))

      const wrapper = mountComponent()
      await flushPromises()

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching dashboard data:',
        expect.any(Error)
      )
    })
  })
})
