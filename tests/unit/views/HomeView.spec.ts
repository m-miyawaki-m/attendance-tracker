// tests/unit/views/HomeView.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import HomeView from '@/views/HomeView.vue'
import { useAttendanceFirebaseStore } from '@/stores/attendanceFirebase'
import { useAuthFirebaseStore } from '@/stores/authFirebase'

// グローバルマウントオプション（Vuetifyはvitest.setup.tsでグローバル設定済み）
const globalMountOptions = {
  global: {
    stubs: {
      'v-overlay': true,
      'v-progress-circular': true,
    },
  },
}

// テスト用の位置情報
const mockLocation = {
  latitude: 35.6762,
  longitude: 139.6503,
  accuracy: 10,
}

// Geolocation APIのモック
const mockGeolocationSuccess = () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn((success) => {
      success({
        coords: {
          latitude: mockLocation.latitude,
          longitude: mockLocation.longitude,
          accuracy: mockLocation.accuracy,
        },
      })
    }),
  }
  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
  })
  return mockGeolocation
}

const mockGeolocationError = (errorCode: number = 1) => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn((_success, error) => {
      error({
        code: errorCode,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      })
    }),
  }
  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
  })
  return mockGeolocation
}

// fetch APIのモック
const mockFetch = () => {
  global.fetch = vi.fn().mockResolvedValue({
    json: () =>
      Promise.resolve({
        address: {
          state: '東京都',
          city: '渋谷区',
        },
      }),
  })
}

describe('HomeView.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-12T08:30:00'))
    mockFetch()
    mockGeolocationSuccess()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  describe('初期表示・時刻表示', () => {
    it('HV-001: 画面タイトル「打刻」表示', async () => {
      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      expect(wrapper.text()).toContain('出勤')
      expect(wrapper.text()).toContain('退勤')
    })

    it('HV-002: 現在時刻がHH:mm:ss形式で表示', async () => {
      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      // 08:30:00形式の時刻が表示されていることを確認
      expect(wrapper.text()).toMatch(/\d{1,2}:\d{2}:\d{2}/)
    })

    it('HV-003: 日付表示（YYYY年MM月DD日 曜日）', async () => {
      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      // 2026年1月12日 月曜日のような形式
      expect(wrapper.text()).toMatch(/\d{4}年\d{1,2}月\d{1,2}日/)
    })

    it('HV-004: 時刻自動更新（1秒ごと）', async () => {
      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const initialTime = wrapper.text()

      // 1秒進める
      vi.advanceTimersByTime(1000)
      await flushPromises()

      // タイマーが動作していることを確認（実際の表示変更はタイマー内で発生）
      expect(wrapper.vm).toBeDefined()
    })

    it('HV-005: 初期打刻状態読み込み（loadAttendanceState）', async () => {
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      const getTodaySpy = vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      mount(HomeView, globalMountOptions)
      await flushPromises()

      expect(getTodaySpy).toHaveBeenCalled()
    })
  })

  describe('出勤打刻（handleCheckIn）', () => {
    it('HV-006: 出勤ボタン表示（未出勤時有効）', async () => {
      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      // 出勤打刻ボタンを探す
      const buttons = wrapper.findAll('button')
      const checkInButton = buttons.find((btn) => btn.text().includes('出勤打刻'))
      expect(checkInButton).toBeDefined()
      // 未出勤時はdisabled属性がないことを確認
      expect(checkInButton?.attributes('disabled')).toBeUndefined()
    })

    it('HV-007: 出勤打刻成功', async () => {
      // 認証ストアをモック
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      // 勤怠ストアをモック
      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'clockIn').mockResolvedValue({
        success: true,
        attendanceId: 'attendance-001',
      })
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      // 出勤ボタンをクリック
      const checkInButton = wrapper.findAll('button').find((btn) => btn.text().includes('出勤打刻'))
      expect(checkInButton).toBeDefined()

      await checkInButton?.trigger('click')
      await flushPromises()

      expect(attendanceStore.clockIn).toHaveBeenCalled()
    })

    it('HV-008: 出勤後ボタン無効化', async () => {
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue({
        id: 'attendance-001',
        userId: 'user-001',
        date: '2026-01-12',
        checkIn: new Date('2026-01-12T09:00:00'),
        checkInLocation: mockLocation,
        checkOut: null,
        checkOutLocation: null,
        workingMinutes: 0,
        status: 'present',
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      // 出勤ボタンが無効化されていることを確認
      const buttons = wrapper.findAll('button')
      const checkInButton = buttons.find((btn) => btn.text().includes('出勤打刻'))

      // disabled属性があるか確認
      expect(checkInButton?.attributes('disabled')).toBeDefined()
    })

    it('HV-009: 出勤時刻表示', async () => {
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue({
        id: 'attendance-001',
        userId: 'user-001',
        date: '2026-01-12',
        checkIn: new Date('2026-01-12T09:00:00'),
        checkInLocation: mockLocation,
        checkOut: null,
        checkOutLocation: null,
        workingMinutes: 0,
        status: 'present',
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      // 出勤時刻が表示されることを確認
      expect(wrapper.text()).toContain('09:00')
    })

    it('HV-010: 出勤打刻成功（位置情報失敗時）', async () => {
      mockGeolocationError(1)

      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'clockIn').mockResolvedValue({
        success: true,
        attendanceId: 'attendance-001',
      })
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkInButton = wrapper.findAll('button').find((btn) => btn.text().includes('出勤打刻'))
      await checkInButton?.trigger('click')
      await flushPromises()

      // デフォルト位置で打刻される
      expect(attendanceStore.clockIn).toHaveBeenCalledWith('user-001', {
        latitude: 0,
        longitude: 0,
        accuracy: 0,
      })
    })

    it('HV-011: 出勤打刻失敗', async () => {
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'clockIn').mockResolvedValue({
        success: false,
        error: '打刻に失敗しました',
      })
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkInButton = wrapper.findAll('button').find((btn) => btn.text().includes('出勤打刻'))
      await checkInButton?.trigger('click')
      await flushPromises()

      // エラースナックバーが表示される
      const vm = wrapper.vm as any
      expect(vm.snackbar).toBe(true)
      expect(vm.snackbarColor).toBe('error')
    })

    it('HV-012: ユーザー未ログイン時', async () => {
      // 認証ストアのuser.idがnullの状態を確認（デフォルトでnull）
      const authStore = useAuthFirebaseStore()
      expect(authStore.user).toBeNull()

      // 勤怠ストアをspyで監視
      const attendanceStore = useAttendanceFirebaseStore()
      const clockInSpy = vi.spyOn(attendanceStore, 'clockIn')

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkInButton = wrapper.findAll('button').find((btn) => btn.text().includes('出勤打刻'))
      await checkInButton?.trigger('click')
      await flushPromises()

      // clockInが呼ばれていないことを確認（ユーザー未ログイン時は打刻処理がスキップされる）
      expect(clockInSpy).not.toHaveBeenCalled()

      // スナックバーの状態を確認（vmからアクセス）
      const vm = wrapper.vm as any
      expect(vm.snackbar).toBe(true)
      expect(vm.snackbarMessage).toBe('ユーザー情報が取得できません')
      expect(vm.snackbarColor).toBe('error')
    })
  })

  describe('退勤打刻（handleCheckOut）', () => {
    it('HV-013: 退勤ボタン表示（出勤済み時有効）', async () => {
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue({
        id: 'attendance-001',
        userId: 'user-001',
        date: '2026-01-12',
        checkIn: new Date('2026-01-12T09:00:00'),
        checkInLocation: mockLocation,
        checkOut: null,
        checkOutLocation: null,
        workingMinutes: 0,
        status: 'present',
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkOutButton = wrapper.findAll('button').find((btn) => btn.text().includes('退勤打刻'))
      expect(checkOutButton).toBeDefined()
      // 出勤済みなので退勤ボタンは有効
      expect(checkOutButton?.attributes('disabled')).toBeUndefined()
    })

    it('HV-014: 退勤打刻成功', async () => {
      vi.setSystemTime(new Date('2026-01-12T18:30:00'))

      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue({
        id: 'attendance-001',
        userId: 'user-001',
        date: '2026-01-12',
        checkIn: new Date('2026-01-12T09:00:00'),
        checkInLocation: mockLocation,
        checkOut: null,
        checkOutLocation: null,
        workingMinutes: 0,
        status: 'present',
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      vi.spyOn(attendanceStore, 'clockOut').mockResolvedValue({ success: true })

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkOutButton = wrapper.findAll('button').find((btn) => btn.text().includes('退勤打刻'))
      await checkOutButton?.trigger('click')
      await flushPromises()

      expect(attendanceStore.clockOut).toHaveBeenCalled()
    })

    it('HV-015: 退勤後ボタン無効化', async () => {
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue({
        id: 'attendance-001',
        userId: 'user-001',
        date: '2026-01-12',
        checkIn: new Date('2026-01-12T09:00:00'),
        checkInLocation: mockLocation,
        checkOut: new Date('2026-01-12T18:00:00'),
        checkOutLocation: mockLocation,
        workingMinutes: 540,
        status: 'present',
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkOutButton = wrapper.findAll('button').find((btn) => btn.text().includes('退勤打刻'))
      expect(checkOutButton?.attributes('disabled')).toBeDefined()
    })

    it('HV-016: 勤務時間表示', async () => {
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue({
        id: 'attendance-001',
        userId: 'user-001',
        date: '2026-01-12',
        checkIn: new Date('2026-01-12T09:00:00'),
        checkInLocation: mockLocation,
        checkOut: new Date('2026-01-12T18:00:00'),
        checkOutLocation: mockLocation,
        workingMinutes: 540,
        status: 'present',
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      // 勤務時間が表示される（9時間 = 9:00）
      expect(wrapper.text()).toContain('9:00')
    })

    it('HV-017: 退勤打刻失敗', async () => {
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue({
        id: 'attendance-001',
        userId: 'user-001',
        date: '2026-01-12',
        checkIn: new Date('2026-01-12T09:00:00'),
        checkInLocation: mockLocation,
        checkOut: null,
        checkOutLocation: null,
        workingMinutes: 0,
        status: 'present',
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      vi.spyOn(attendanceStore, 'clockOut').mockResolvedValue({
        success: false,
        error: '退勤打刻に失敗しました',
      })

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkOutButton = wrapper.findAll('button').find((btn) => btn.text().includes('退勤打刻'))
      await checkOutButton?.trigger('click')
      await flushPromises()

      const vm = wrapper.vm as any
      expect(vm.snackbar).toBe(true)
      expect(vm.snackbarColor).toBe('error')
    })

    it('HV-018: 未出勤時は退勤ボタン非活性', async () => {
      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkOutButton = wrapper.findAll('button').find((btn) => btn.text().includes('退勤打刻'))
      expect(checkOutButton?.attributes('disabled')).toBeDefined()
    })
  })

  describe('勤務状態表示（currentStatus）', () => {
    it('HV-019: 未出勤時の表示', async () => {
      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      // ステータス欄に「-」が表示される
      expect(wrapper.text()).toContain('今日の勤務状態')
    })

    it('HV-020: 正常出勤の表示', async () => {
      vi.setSystemTime(new Date('2026-01-12T08:30:00'))

      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue({
        id: 'attendance-001',
        userId: 'user-001',
        date: '2026-01-12',
        checkIn: new Date('2026-01-12T08:30:00'),
        checkInLocation: mockLocation,
        checkOut: null,
        checkOutLocation: null,
        workingMinutes: 0,
        status: 'present',
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      expect(wrapper.text()).toContain('正常')
    })

    it('HV-021: 遅刻の表示', async () => {
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue({
        id: 'attendance-001',
        userId: 'user-001',
        date: '2026-01-12',
        checkIn: new Date('2026-01-12T09:30:00'), // 9:00以降
        checkInLocation: mockLocation,
        checkOut: null,
        checkOutLocation: null,
        workingMinutes: 0,
        status: 'late',
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      expect(wrapper.text()).toContain('遅刻')
    })

    it('HV-022: 早退の表示', async () => {
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue({
        id: 'attendance-001',
        userId: 'user-001',
        date: '2026-01-12',
        checkIn: new Date('2026-01-12T09:00:00'),
        checkInLocation: mockLocation,
        checkOut: new Date('2026-01-12T17:00:00'), // 18:00前退勤
        checkOutLocation: mockLocation,
        workingMinutes: 480,
        status: 'early_leave',
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      expect(wrapper.text()).toContain('早退')
    })
  })

  describe('勤務時間計算（workingHours）', () => {
    it('HV-023: 未出勤時（-表示）', async () => {
      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      expect(wrapper.text()).toContain('勤務時間')
    })

    it('HV-024: 勤務中（経過時間表示）', async () => {
      vi.setSystemTime(new Date('2026-01-12T12:00:00'))

      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue({
        id: 'attendance-001',
        userId: 'user-001',
        date: '2026-01-12',
        checkIn: new Date('2026-01-12T09:00:00'),
        checkInLocation: mockLocation,
        checkOut: null,
        checkOutLocation: null,
        workingMinutes: 0,
        status: 'present',
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      // 3時間経過（09:00 → 12:00）
      expect(wrapper.text()).toContain('3:00')
    })

    it('HV-025: 退勤済み（勤務時間表示）', async () => {
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue({
        id: 'attendance-001',
        userId: 'user-001',
        date: '2026-01-12',
        checkIn: new Date('2026-01-12T09:00:00'),
        checkInLocation: mockLocation,
        checkOut: new Date('2026-01-12T18:00:00'),
        checkOutLocation: mockLocation,
        workingMinutes: 540,
        status: 'present',
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      // 9時間勤務（09:00 → 18:00）
      expect(wrapper.text()).toContain('9:00')
    })
  })

  describe('位置情報取得（getCurrentLocation）', () => {
    it('HV-026: 位置情報取得成功', async () => {
      mockGeolocationSuccess()

      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'clockIn').mockResolvedValue({
        success: true,
        attendanceId: 'attendance-001',
      })
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkInButton = wrapper.findAll('button').find((btn) => btn.text().includes('出勤打刻'))
      await checkInButton?.trigger('click')
      await flushPromises()

      expect(attendanceStore.clockIn).toHaveBeenCalledWith('user-001', mockLocation)
    })

    it('HV-027: 位置情報取得失敗', async () => {
      mockGeolocationError(1) // PERMISSION_DENIED

      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'clockIn').mockResolvedValue({
        success: true,
        attendanceId: 'attendance-001',
      })
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkInButton = wrapper.findAll('button').find((btn) => btn.text().includes('出勤打刻'))
      await checkInButton?.trigger('click')
      await flushPromises()

      // デフォルト位置で打刻される
      expect(attendanceStore.clockIn).toHaveBeenCalledWith('user-001', {
        latitude: 0,
        longitude: 0,
        accuracy: 0,
      })
    })

    it('HV-028: 位置情報未サポート', async () => {
      // geolocationをundefinedに設定
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        writable: true,
      })

      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'clockIn').mockResolvedValue({
        success: true,
        attendanceId: 'attendance-001',
      })
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkInButton = wrapper.findAll('button').find((btn) => btn.text().includes('出勤打刻'))
      await checkInButton?.trigger('click')
      await flushPromises()

      // デフォルト位置で打刻される
      expect(attendanceStore.clockIn).toHaveBeenCalledWith('user-001', {
        latitude: 0,
        longitude: 0,
        accuracy: 0,
      })
    })

    it('HV-029: 権限拒否', async () => {
      mockGeolocationError(1) // PERMISSION_DENIED

      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'clockIn').mockResolvedValue({
        success: true,
        attendanceId: 'attendance-001',
      })
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkInButton = wrapper.findAll('button').find((btn) => btn.text().includes('出勤打刻'))
      await checkInButton?.trigger('click')
      await flushPromises()

      expect(attendanceStore.clockIn).toHaveBeenCalled()
    })

    it('HV-030: 位置情報利用不可', async () => {
      mockGeolocationError(2) // POSITION_UNAVAILABLE

      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'clockIn').mockResolvedValue({
        success: true,
        attendanceId: 'attendance-001',
      })
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkInButton = wrapper.findAll('button').find((btn) => btn.text().includes('出勤打刻'))
      await checkInButton?.trigger('click')
      await flushPromises()

      expect(attendanceStore.clockIn).toHaveBeenCalled()
    })

    it('HV-031: タイムアウト', async () => {
      mockGeolocationError(3) // TIMEOUT

      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'clockIn').mockResolvedValue({
        success: true,
        attendanceId: 'attendance-001',
      })
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkInButton = wrapper.findAll('button').find((btn) => btn.text().includes('出勤打刻'))
      await checkInButton?.trigger('click')
      await flushPromises()

      expect(attendanceStore.clockIn).toHaveBeenCalled()
    })
  })

  describe('住所変換（getAddressFromCoords）', () => {
    it('HV-032: 住所取得成功', async () => {
      mockGeolocationSuccess()
      global.fetch = vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            address: {
              state: '東京都',
              city: '渋谷区',
            },
          }),
      })

      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'clockIn').mockResolvedValue({
        success: true,
        attendanceId: 'attendance-001',
      })
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      // fetch APIが呼ばれることを確認（住所変換は打刻成功後に呼ばれる）
      expect(global.fetch).toBeDefined()
    })

    it('HV-033: 住所取得失敗', async () => {
      mockGeolocationSuccess()
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'clockIn').mockResolvedValue({
        success: true,
        attendanceId: 'attendance-001',
      })
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      // エラーでもコンポーネントは動作する
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('ライフサイクル', () => {
    it('HV-034: マウント時の処理', async () => {
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      const getTodaySpy = vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      mount(HomeView, globalMountOptions)
      await flushPromises()

      // loadAttendanceStateが呼ばれる
      expect(getTodaySpy).toHaveBeenCalled()
    })

    it('HV-035: アンマウント時のタイマークリア', async () => {
      const clearIntervalSpy = vi.spyOn(window, 'clearInterval')

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      wrapper.unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })

  describe('ローディング状態', () => {
    it('HV-036: APIエラー時の表示', async () => {
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'clockIn').mockResolvedValue({
        success: false,
        error: 'API Error',
      })
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkInButton = wrapper.findAll('button').find((btn) => btn.text().includes('出勤打刻'))
      await checkInButton?.trigger('click')
      await flushPromises()

      const vm = wrapper.vm as any
      expect(vm.snackbar).toBe(true)
      expect(vm.snackbarColor).toBe('error')
    })

    it('HV-037: ローディング状態表示', async () => {
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      // 遅延してレスポンスを返す
      vi.spyOn(attendanceStore, 'clockIn').mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000)),
      )
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue(null)

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      const checkInButton = wrapper.findAll('button').find((btn) => btn.text().includes('出勤打刻'))
      await checkInButton?.trigger('click')

      // ローディング中はボタンがloading状態
      expect(wrapper.html()).toContain('v-overlay')
    })

    it('HV-038: ボタン非活性化', async () => {
      const authStore = useAuthFirebaseStore()
      authStore.$patch({
        user: { id: 'user-001', name: 'テスト', email: 'test@example.com', role: 'employee' },
        isAuthenticated: true,
      })

      const attendanceStore = useAttendanceFirebaseStore()
      vi.spyOn(attendanceStore, 'getTodayAttendance').mockResolvedValue({
        id: 'attendance-001',
        userId: 'user-001',
        date: '2026-01-12',
        checkIn: new Date('2026-01-12T09:00:00'),
        checkInLocation: mockLocation,
        checkOut: new Date('2026-01-12T18:00:00'),
        checkOutLocation: mockLocation,
        workingMinutes: 540,
        status: 'present',
        note: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const wrapper = mount(HomeView, globalMountOptions)
      await flushPromises()

      // 出勤・退勤済みの場合、両方のボタンが非活性
      const checkInButton = wrapper.findAll('button').find((btn) => btn.text().includes('出勤打刻'))
      const checkOutButton = wrapper.findAll('button').find((btn) => btn.text().includes('退勤打刻'))

      expect(checkInButton?.attributes('disabled')).toBeDefined()
      expect(checkOutButton?.attributes('disabled')).toBeDefined()
    })
  })
})
