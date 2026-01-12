// tests/unit/views/admin/TeamView.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import TeamView from '@/views/admin/TeamView.vue'
import { useUserStore } from '@/stores/userStore'
import { useAdminAttendanceStore } from '@/stores/adminAttendanceStore'

// loggerをモック
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// テスト用ユーザーデータ
const mockUsers = [
  {
    id: 'manager-001',
    name: '山田太郎',
    email: 'yamada@example.com',
    role: 'employee',
    department: '営業部',
    position: '主任',
    employeeNumber: 'EMP001',
    managerId: null,
  },
  {
    id: 'manager-002',
    name: '鈴木一郎',
    email: 'suzuki@example.com',
    role: 'employee',
    department: '開発部',
    position: '主任',
    employeeNumber: 'EMP002',
    managerId: null,
  },
  {
    id: 'user-001',
    name: '佐藤花子',
    email: 'sato@example.com',
    role: 'employee',
    department: '営業部',
    position: '一般',
    employeeNumber: 'EMP003',
    managerId: 'manager-001',
  },
  {
    id: 'user-002',
    name: '田中次郎',
    email: 'tanaka@example.com',
    role: 'employee',
    department: '営業部',
    position: '一般',
    employeeNumber: 'EMP004',
    managerId: 'manager-001',
  },
  {
    id: 'user-003',
    name: '高橋三郎',
    email: 'takahashi@example.com',
    role: 'employee',
    department: '開発部',
    position: '一般',
    employeeNumber: 'EMP005',
    managerId: 'manager-002',
  },
]

// テスト用勤怠データ
const mockAttendances = [
  {
    id: 'att-001',
    userId: 'user-001',
    date: '2026-01-13',
    checkIn: new Date('2026-01-13T09:00:00'),
    checkOut: new Date('2026-01-13T18:00:00'),
    status: 'present',
    workingMinutes: 540,
  },
  {
    id: 'att-002',
    userId: 'user-002',
    date: '2026-01-13',
    checkIn: new Date('2026-01-13T09:30:00'),
    checkOut: new Date('2026-01-13T18:00:00'),
    status: 'late',
    workingMinutes: 510,
  },
]

describe('TeamView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-13T10:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function mountTeamView() {
    return mount(TeamView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              user: {
                users: mockUsers,
                loading: false,
                error: null,
              },
              adminAttendance: {
                attendancesByDate: new Map([['2026-01-13', mockAttendances]]),
                loading: false,
              },
            },
            stubActions: false,
          }),
        ],
      },
    })
  }

  describe('初期表示', () => {
    it('TV-001: タイトル表示', () => {
      const wrapper = mountTeamView()

      expect(wrapper.text()).toContain('チーム勤怠管理')
    })

    it('TV-002: 日付初期値', () => {
      const wrapper = mountTeamView()

      // 今日の日付がデフォルト値として設定される
      const dateField = wrapper.findComponent({ name: 'VTextField' })
      expect(dateField.exists()).toBe(true)
    })

    it('TV-003: 主任未選択時', () => {
      const wrapper = mountTeamView()

      expect(wrapper.text()).toContain('主任を選択してください')
    })

    it('TV-004: 主任セレクト', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()

      // managersを設定
      userStore.users = mockUsers as any

      await flushPromises()

      const select = wrapper.findComponent({ name: 'VSelect' })
      expect(select.exists()).toBe(true)
    })
  })

  describe('初期データ取得 (onMounted)', () => {
    it('TV-005: ユーザー取得', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()

      vi.spyOn(userStore, 'fetchUsers').mockResolvedValue()

      await flushPromises()

      expect(userStore.fetchUsers).toHaveBeenCalled()
    })

    it('TV-006: 勤怠取得', async () => {
      const wrapper = mountTeamView()
      const attendanceStore = useAdminAttendanceStore()

      vi.spyOn(attendanceStore, 'fetchAttendancesByDate').mockResolvedValue()

      await flushPromises()

      expect(attendanceStore.fetchAttendancesByDate).toHaveBeenCalledWith('2026-01-13')
    })

    it('TV-007: 並列実行', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()
      const attendanceStore = useAdminAttendanceStore()

      const fetchUsersSpy = vi.spyOn(userStore, 'fetchUsers').mockResolvedValue()
      const fetchAttendancesSpy = vi.spyOn(attendanceStore, 'fetchAttendancesByDate').mockResolvedValue()

      await flushPromises()

      // 両方のfetchが呼ばれる
      expect(fetchUsersSpy).toHaveBeenCalled()
      expect(fetchAttendancesSpy).toHaveBeenCalled()
    })

    it('TV-008: エラーハンドリング', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()
      const { logger } = await import('@/utils/logger')

      vi.spyOn(userStore, 'fetchUsers').mockRejectedValue(new Error('Network error'))

      await flushPromises()

      expect(logger.error).toHaveBeenCalled()
    })
  })

  describe('日付変更 (watch selectedDate)', () => {
    it('TV-009: 日付変更時の再取得', async () => {
      const wrapper = mountTeamView()
      const attendanceStore = useAdminAttendanceStore()

      const fetchSpy = vi.spyOn(attendanceStore, 'fetchAttendancesByDate').mockResolvedValue()

      // 日付を変更
      await wrapper.vm.$nextTick()
      ;(wrapper.vm as any).selectedDate = '2026-01-14'
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(fetchSpy).toHaveBeenCalledWith('2026-01-14')
    })

    it('TV-010: ログ出力', async () => {
      const wrapper = mountTeamView()
      const { logger } = await import('@/utils/logger')

      // 日付を変更
      ;(wrapper.vm as any).selectedDate = '2026-01-14'
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(logger.debug).toHaveBeenCalled()
    })
  })

  describe('主任選択 (watch selectedManagerId)', () => {
    it('TV-011: 主任選択時のログ', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()
      const { logger } = await import('@/utils/logger')

      userStore.users = mockUsers as any
      ;(wrapper.vm as any).selectedManagerId = 'manager-001'
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(logger.info).toHaveBeenCalled()
    })

    it('TV-012: 主任選択解除', async () => {
      const wrapper = mountTeamView()
      const { logger } = await import('@/utils/logger')

      // 一度選択してから解除
      ;(wrapper.vm as any).selectedManagerId = 'manager-001'
      await wrapper.vm.$nextTick()
      ;(wrapper.vm as any).selectedManagerId = null
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(logger.debug).toHaveBeenCalled()
    })
  })

  describe('主任リスト (managers computed)', () => {
    it('TV-013: 主任フィルタリング', () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()

      userStore.users = mockUsers as any

      const managers = (wrapper.vm as any).managers
      expect(managers.length).toBe(2)
      expect(managers.every((m: any) => m.name)).toBe(true)
    })

    it('TV-014: ラベル形式', () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()

      userStore.users = mockUsers as any

      const managers = (wrapper.vm as any).managers
      expect(managers[0].label).toContain('山田太郎')
      expect(managers[0].label).toContain('営業部')
      expect(managers[0].label).toContain('EMP001')
    })
  })

  describe('選択主任名 (selectedManagerName computed)', () => {
    it('TV-015: 主任未選択', () => {
      const wrapper = mountTeamView()

      const name = (wrapper.vm as any).selectedManagerName
      expect(name).toBe('')
    })

    it('TV-016: 主任選択済み', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()

      userStore.users = mockUsers as any
      ;(wrapper.vm as any).selectedManagerId = 'manager-001'
      await wrapper.vm.$nextTick()

      const name = (wrapper.vm as any).selectedManagerName
      expect(name).toBe('山田太郎')
    })
  })

  describe('チーム勤怠リスト (teamAttendanceList computed)', () => {
    it('TV-017: 主任未選択', () => {
      const wrapper = mountTeamView()

      const list = (wrapper.vm as any).teamAttendanceList
      expect(list).toHaveLength(0)
    })

    it('TV-018: チームメンバー取得', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()

      userStore.users = mockUsers as any
      ;(wrapper.vm as any).selectedManagerId = 'manager-001'
      await wrapper.vm.$nextTick()

      const list = (wrapper.vm as any).teamAttendanceList
      // manager-001の部下は2人
      expect(list.length).toBe(2)
    })

    it('TV-019: 勤怠データマッピング', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()
      const attendanceStore = useAdminAttendanceStore()

      userStore.users = mockUsers as any
      ;(attendanceStore as any).attendancesByDate = new Map([['2026-01-13', mockAttendances]])
      ;(wrapper.vm as any).selectedManagerId = 'manager-001'
      await wrapper.vm.$nextTick()

      const list = (wrapper.vm as any).teamAttendanceList
      const presentUser = list.find((item: any) => item.name === '佐藤花子')
      expect(presentUser.status).toBe('present')
    })

    it('TV-020: 勤怠データなし', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()
      const attendanceStore = useAdminAttendanceStore()

      userStore.users = mockUsers as any
      ;(attendanceStore as any).attendancesByDate = new Map() // 勤怠データなし
      ;(wrapper.vm as any).selectedManagerId = 'manager-002'
      await wrapper.vm.$nextTick()

      const list = (wrapper.vm as any).teamAttendanceList
      expect(list.every((item: any) => item.status === 'absent')).toBe(true)
    })

    it('TV-021: 勤務時間計算', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()
      const attendanceStore = useAdminAttendanceStore()

      userStore.users = mockUsers as any
      ;(attendanceStore as any).attendancesByDate = new Map([['2026-01-13', mockAttendances]])
      ;(wrapper.vm as any).selectedManagerId = 'manager-001'
      await wrapper.vm.$nextTick()

      const list = (wrapper.vm as any).teamAttendanceList
      const user = list.find((item: any) => item.name === '佐藤花子')
      // 540分 = 9時間00分
      expect(user.workingHours).toBe('9:00')
    })

    it('TV-022: 勤務時間なし', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()
      const attendanceStore = useAdminAttendanceStore()

      userStore.users = mockUsers as any
      ;(attendanceStore as any).attendancesByDate = new Map() // 勤怠データなし
      ;(wrapper.vm as any).selectedManagerId = 'manager-001'
      await wrapper.vm.$nextTick()

      const list = (wrapper.vm as any).teamAttendanceList
      expect(list.every((item: any) => item.workingHours === '-')).toBe(true)
    })
  })

  describe('チームサマリー (teamSummary computed)', () => {
    it('TV-023: 総メンバー数', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()

      userStore.users = mockUsers as any
      ;(wrapper.vm as any).selectedManagerId = 'manager-001'
      await wrapper.vm.$nextTick()

      const summary = (wrapper.vm as any).teamSummary
      expect(summary.totalMembers).toBe(2)
    })

    it('TV-024: 正常出勤数', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()
      const attendanceStore = useAdminAttendanceStore()

      userStore.users = mockUsers as any
      ;(attendanceStore as any).attendancesByDate = new Map([['2026-01-13', mockAttendances]])
      ;(wrapper.vm as any).selectedManagerId = 'manager-001'
      await wrapper.vm.$nextTick()

      const summary = (wrapper.vm as any).teamSummary
      expect(summary.present).toBe(1)
    })

    it('TV-025: 遅刻・早退数', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()
      const attendanceStore = useAdminAttendanceStore()

      userStore.users = mockUsers as any
      ;(attendanceStore as any).attendancesByDate = new Map([['2026-01-13', mockAttendances]])
      ;(wrapper.vm as any).selectedManagerId = 'manager-001'
      await wrapper.vm.$nextTick()

      const summary = (wrapper.vm as any).teamSummary
      expect(summary.lateEarly).toBe(1)
    })

    it('TV-026: 欠勤数', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()
      const attendanceStore = useAdminAttendanceStore()

      userStore.users = mockUsers as any
      ;(attendanceStore as any).attendancesByDate = new Map() // 勤怠データなし
      ;(wrapper.vm as any).selectedManagerId = 'manager-001'
      await wrapper.vm.$nextTick()

      const summary = (wrapper.vm as any).teamSummary
      expect(summary.absent).toBe(2)
    })
  })

  describe('サマリーカード表示', () => {
    it('TV-027: 主任選択時', async () => {
      const wrapper = mountTeamView()
      const userStore = useUserStore()

      userStore.users = mockUsers as any
      ;(wrapper.vm as any).selectedManagerId = 'manager-001'
      await wrapper.vm.$nextTick()
      await flushPromises()

      // 4つのサマリーカードが表示される
      expect(wrapper.text()).toContain('チームメンバー数')
      expect(wrapper.text()).toContain('正常出勤')
      expect(wrapper.text()).toContain('遅刻・早退')
      expect(wrapper.text()).toContain('欠勤')
    })

    it('TV-028: 主任未選択時', () => {
      const wrapper = mountTeamView()

      expect(wrapper.text()).toContain('主任を選択してください')
      // サマリーカードは表示されない
      expect(wrapper.text()).not.toContain('チームメンバー数')
    })
  })

  describe('ヘルパー関数', () => {
    it('TV-029: formatTime', () => {
      const wrapper = mountTeamView()

      const formatTime = (wrapper.vm as any).formatTime

      // Dateオブジェクト
      const result1 = formatTime(new Date('2026-01-05T09:30:00'))
      expect(result1).toBe('09:30')

      // null
      const result2 = formatTime(null)
      expect(result2).toBe('-')
    })
  })
})
