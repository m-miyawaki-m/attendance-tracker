// tests/unit/stores/attendanceFirebase.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAttendanceFirebaseStore } from '@/stores/attendanceFirebase'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  updateDoc,
  doc,
} from 'firebase/firestore'

// Firebase モックの型定義
const mockCollection = collection as Mock
const mockAddDoc = addDoc as Mock
const mockQuery = query as Mock
const mockWhere = where as Mock
const mockGetDocs = getDocs as Mock
const mockOrderBy = orderBy as Mock
const mockUpdateDoc = updateDoc as Mock
const mockDoc = doc as Mock

// テスト用の位置情報
const mockLocation = {
  latitude: 35.6762,
  longitude: 139.6503,
  accuracy: 10,
}

// Timestampモック
const createMockTimestamp = (date: Date) => ({
  toDate: () => date,
})

// テスト用の勤怠データ
const createMockAttendanceDoc = (overrides = {}) => {
  const baseDate = new Date('2026-01-12T09:00:00')
  return {
    id: 'attendance-001',
    data: () => ({
      userId: 'user-001',
      date: '2026-01-12',
      checkIn: createMockTimestamp(baseDate),
      checkInLocation: mockLocation,
      checkOut: null,
      checkOutLocation: null,
      workingMinutes: 0,
      status: 'present',
      note: '',
      createdAt: createMockTimestamp(baseDate),
      updatedAt: createMockTimestamp(baseDate),
      ...overrides,
    }),
  }
}

describe('attendanceFirebase Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // 日付をモック
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-12T08:30:00'))
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  describe('State初期値', () => {
    it('ATF-001: attendances初期値が空配列', () => {
      const store = useAttendanceFirebaseStore()
      expect(store.attendances).toEqual([])
    })

    it('ATF-001: attendancesByUser初期値が空Map', () => {
      const store = useAttendanceFirebaseStore()
      expect(store.attendancesByUser.size).toBe(0)
    })

    it('ATF-001: todayAttendance初期値がnull', () => {
      const store = useAttendanceFirebaseStore()
      expect(store.todayAttendance).toBeNull()
    })

    it('ATF-002: loading初期値がfalse', () => {
      const store = useAttendanceFirebaseStore()
      expect(store.loading).toBe(false)
    })
  })

  describe('clockIn アクション（出勤打刻）', () => {
    it('ATF-003: 出勤打刻成功', async () => {
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] })
      mockAddDoc.mockResolvedValue({ id: 'new-attendance-001' })

      const store = useAttendanceFirebaseStore()
      const result = await store.clockIn('user-001', mockLocation)

      expect(result.success).toBe(true)
      expect(result.attendanceId).toBe('new-attendance-001')
      expect(mockAddDoc).toHaveBeenCalled()
    })

    it('ATF-004: 出勤時刻記録（checkInに現在時刻）', async () => {
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] })
      mockAddDoc.mockResolvedValue({ id: 'new-attendance-001' })

      const store = useAttendanceFirebaseStore()
      await store.clockIn('user-001', mockLocation)

      expect(store.todayAttendance).not.toBeNull()
      expect(store.todayAttendance?.checkIn).toBeInstanceOf(Date)
    })

    it('ATF-005: 位置情報記録（checkInLocationに保存）', async () => {
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] })
      mockAddDoc.mockResolvedValue({ id: 'new-attendance-001' })

      const store = useAttendanceFirebaseStore()
      await store.clockIn('user-001', mockLocation)

      expect(store.todayAttendance?.checkInLocation).toEqual(mockLocation)
    })

    it('ATF-006: ステータス設定（9:00前出勤→status=present）', async () => {
      // 8:30に設定済み
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] })
      mockAddDoc.mockResolvedValue({ id: 'new-attendance-001' })

      const store = useAttendanceFirebaseStore()
      await store.clockIn('user-001', mockLocation)

      expect(store.todayAttendance?.status).toBe('present')
    })

    it('ATF-007: 遅刻判定（9:00以降出勤→status=late）', async () => {
      vi.setSystemTime(new Date('2026-01-12T09:30:00'))

      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] })
      mockAddDoc.mockResolvedValue({ id: 'new-attendance-001' })

      const store = useAttendanceFirebaseStore()
      await store.clockIn('user-001', mockLocation)

      expect(store.todayAttendance?.status).toBe('late')
    })

    it('ATF-003-dup: 出勤打刻失敗（既に打刻済み）', async () => {
      const mockDoc = createMockAttendanceDoc()
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [mockDoc],
      })

      const store = useAttendanceFirebaseStore()
      const result = await store.clockIn('user-001', mockLocation)

      expect(result.success).toBe(false)
      expect(result.error).toBe('すでに本日の出勤打刻があります')
    })

    it('ATF-004-err: Firestoreエラー時のエラーハンドリング', async () => {
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] })
      mockAddDoc.mockRejectedValue(new Error('Firestore error'))

      const store = useAttendanceFirebaseStore()
      const result = await store.clockIn('user-001', mockLocation)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Firestore error')
    })

    it('ATF-005-loading: loading状態の変化', async () => {
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] })
      mockAddDoc.mockResolvedValue({ id: 'new-attendance-001' })

      const store = useAttendanceFirebaseStore()

      expect(store.loading).toBe(false)

      const promise = store.clockIn('user-001', mockLocation)

      // 処理完了後
      await promise
      expect(store.loading).toBe(false)
    })
  })

  describe('clockOut アクション（退勤打刻）', () => {
    it('ATF-008: 退勤打刻成功（checkOut追加）', async () => {
      vi.setSystemTime(new Date('2026-01-12T18:30:00'))

      const mockAttendanceDoc = createMockAttendanceDoc()
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [mockAttendanceDoc],
      })
      mockDoc.mockReturnValue('attendance-doc-ref')
      mockUpdateDoc.mockResolvedValue(undefined)

      const store = useAttendanceFirebaseStore()
      const result = await store.clockOut('user-001', mockLocation)

      expect(result.success).toBe(true)
      expect(mockUpdateDoc).toHaveBeenCalled()
    })

    it('ATF-009: 勤務時間計算（workingMinutes）', async () => {
      // 09:00出勤、18:00退勤 = 540分
      vi.setSystemTime(new Date('2026-01-12T18:00:00'))

      const mockAttendanceDoc = createMockAttendanceDoc()
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [mockAttendanceDoc],
      })
      mockDoc.mockReturnValue('attendance-doc-ref')
      mockUpdateDoc.mockResolvedValue(undefined)

      const store = useAttendanceFirebaseStore()
      await store.clockOut('user-001', mockLocation)

      expect(store.todayAttendance?.workingMinutes).toBe(540)
    })

    it('ATF-010: 早退判定（18:00前退勤→status=early_leave）', async () => {
      vi.setSystemTime(new Date('2026-01-12T17:00:00'))

      const mockAttendanceDoc = createMockAttendanceDoc()
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [mockAttendanceDoc],
      })
      mockDoc.mockReturnValue('attendance-doc-ref')
      mockUpdateDoc.mockResolvedValue(undefined)

      const store = useAttendanceFirebaseStore()
      await store.clockOut('user-001', mockLocation)

      expect(store.todayAttendance?.status).toBe('early_leave')
    })

    it('ATF-010-late: 遅刻維持（出勤時late、18:00前退勤でもlate維持）', async () => {
      vi.setSystemTime(new Date('2026-01-12T17:00:00'))

      const mockAttendanceDoc = createMockAttendanceDoc({ status: 'late' })
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [mockAttendanceDoc],
      })
      mockDoc.mockReturnValue('attendance-doc-ref')
      mockUpdateDoc.mockResolvedValue(undefined)

      const store = useAttendanceFirebaseStore()
      await store.clockOut('user-001', mockLocation)

      expect(store.todayAttendance?.status).toBe('late')
    })

    it('ATF-011: 退勤位置情報記録', async () => {
      vi.setSystemTime(new Date('2026-01-12T18:30:00'))

      const mockAttendanceDoc = createMockAttendanceDoc()
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [mockAttendanceDoc],
      })
      mockDoc.mockReturnValue('attendance-doc-ref')
      mockUpdateDoc.mockResolvedValue(undefined)

      const store = useAttendanceFirebaseStore()
      await store.clockOut('user-001', mockLocation)

      expect(store.todayAttendance?.checkOutLocation).toEqual(mockLocation)
    })

    it('ATF-008-nocheck: 退勤打刻失敗（未出勤）', async () => {
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] })

      const store = useAttendanceFirebaseStore()
      const result = await store.clockOut('user-001', mockLocation)

      expect(result.success).toBe(false)
      expect(result.error).toBe('本日の出勤記録が見つかりません')
    })

    it('ATF-008-already: 退勤打刻失敗（既に退勤済み）', async () => {
      const mockAttendanceDoc = createMockAttendanceDoc({
        checkOut: createMockTimestamp(new Date('2026-01-12T18:00:00')),
      })
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [mockAttendanceDoc],
      })

      const store = useAttendanceFirebaseStore()
      const result = await store.clockOut('user-001', mockLocation)

      expect(result.success).toBe(false)
      expect(result.error).toBe('すでに退勤打刻済みです')
    })
  })

  describe('getTodayAttendance アクション', () => {
    it('ATF-012: 本日の勤怠取得（該当レコード返却）', async () => {
      const mockAttendanceDoc = createMockAttendanceDoc()
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [mockAttendanceDoc],
      })

      const store = useAttendanceFirebaseStore()
      const result = await store.getTodayAttendance('user-001')

      expect(result).not.toBeNull()
      expect(result?.userId).toBe('user-001')
      expect(result?.date).toBe('2026-01-12')
    })

    it('ATF-014: 存在しない勤怠（null返却）', async () => {
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] })

      const store = useAttendanceFirebaseStore()
      const result = await store.getTodayAttendance('user-001')

      expect(result).toBeNull()
    })

    it('ATF-012-err: Firestoreエラー時のハンドリング', async () => {
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockRejectedValue(new Error('Firestore error'))

      const store = useAttendanceFirebaseStore()
      const result = await store.getTodayAttendance('user-001')

      expect(result).toBeNull()
    })
  })

  describe('fetchMonthlyAttendances アクション', () => {
    it('ATF-013: 月次勤怠取得（当月のレコード一覧）', async () => {
      const mockDocs = [
        createMockAttendanceDoc({ date: '2026-01-10' }),
        createMockAttendanceDoc({ date: '2026-01-11' }),
        createMockAttendanceDoc({ date: '2026-01-12' }),
      ]
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockOrderBy.mockReturnValue('mock-orderby')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: mockDocs,
      })

      const store = useAttendanceFirebaseStore()
      await store.fetchMonthlyAttendances('user-001', 2026, 1)

      expect(store.attendances.length).toBe(3)
    })

    it('ATF-013-loading: loading状態の変化', async () => {
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockOrderBy.mockReturnValue('mock-orderby')
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] })

      const store = useAttendanceFirebaseStore()

      expect(store.loading).toBe(false)

      const promise = store.fetchMonthlyAttendances('user-001', 2026, 1)

      await promise
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchAttendancesByDateRange アクション', () => {
    it('ATF-015: 日付範囲取得成功', async () => {
      const mockDocs = [
        createMockAttendanceDoc({ date: '2026-01-10' }),
        createMockAttendanceDoc({ date: '2026-01-11' }),
        createMockAttendanceDoc({ date: '2026-01-12' }),
      ]
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: mockDocs,
      })

      const store = useAttendanceFirebaseStore()
      await store.fetchAttendancesByDateRange('user-001', '2026-01-10', '2026-01-12')

      expect(store.attendances.length).toBe(3)
    })

    it('ATF-015-cache: キャッシュに保存される', async () => {
      const mockDocs = [createMockAttendanceDoc()]
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: mockDocs,
      })

      const store = useAttendanceFirebaseStore()
      await store.fetchAttendancesByDateRange('user-001', '2026-01-10', '2026-01-12')

      expect(store.attendancesByUser.has('user-001')).toBe(true)
    })

    it('ATF-015-skip: checkInフィールドなしのレコードスキップ', async () => {
      const mockDocs = [
        createMockAttendanceDoc(),
        {
          id: 'attendance-002',
          data: () => ({
            userId: 'user-001',
            date: '2026-01-11',
            checkIn: undefined, // checkInがない
          }),
        },
      ]
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: mockDocs,
      })

      const store = useAttendanceFirebaseStore()
      await store.fetchAttendancesByDateRange('user-001', '2026-01-10', '2026-01-12')

      // checkInがないものはスキップされる
      expect(store.attendances.length).toBe(1)
    })
  })

  describe('getAttendancesByUserFromCache アクション', () => {
    it('ATF-016: キャッシュあり', async () => {
      const mockDocs = [createMockAttendanceDoc()]
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: mockDocs,
      })

      const store = useAttendanceFirebaseStore()
      await store.fetchAttendancesByDateRange('user-001', '2026-01-10', '2026-01-12')

      const cached = store.getAttendancesByUserFromCache('user-001')
      expect(cached).toBeDefined()
      expect(cached?.length).toBe(1)
    })

    it('ATF-016-nocache: キャッシュなし', () => {
      const store = useAttendanceFirebaseStore()

      const cached = store.getAttendancesByUserFromCache('user-001')
      expect(cached).toBeUndefined()
    })
  })

  describe('getAttendancesByDateRange アクション', () => {
    it('ATF-017: キャッシュから取得', async () => {
      const mockDocs = [
        createMockAttendanceDoc({ date: '2026-01-10' }),
        createMockAttendanceDoc({ date: '2026-01-11' }),
        createMockAttendanceDoc({ date: '2026-01-15' }),
      ]
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: mockDocs,
      })

      const store = useAttendanceFirebaseStore()
      await store.fetchAttendancesByDateRange('user-001', '2026-01-01', '2026-01-31')

      const filtered = store.getAttendancesByDateRange('user-001', '2026-01-10', '2026-01-12')
      expect(filtered.length).toBe(2) // 10, 11のみ（12はない）
    })

    it('ATF-017-nocache: キャッシュなし時は空配列', () => {
      const store = useAttendanceFirebaseStore()

      const result = store.getAttendancesByDateRange('user-001', '2026-01-10', '2026-01-12')
      expect(result).toEqual([])
    })
  })

  describe('clearCache アクション', () => {
    it('ATF-018: 特定ユーザーのキャッシュクリア', async () => {
      const mockDocs = [createMockAttendanceDoc()]
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: mockDocs,
      })

      const store = useAttendanceFirebaseStore()
      await store.fetchAttendancesByDateRange('user-001', '2026-01-10', '2026-01-12')

      expect(store.attendancesByUser.has('user-001')).toBe(true)

      store.clearCache('user-001')

      expect(store.attendancesByUser.has('user-001')).toBe(false)
    })

    it('ATF-018-all: 全キャッシュクリア', async () => {
      const mockDocs = [createMockAttendanceDoc()]
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: mockDocs,
      })

      const store = useAttendanceFirebaseStore()
      await store.fetchAttendancesByDateRange('user-001', '2026-01-10', '2026-01-12')

      store.clearCache()

      expect(store.attendancesByUser.size).toBe(0)
      expect(store.attendances.length).toBe(0)
    })
  })

  describe('loadTodayAttendance アクション', () => {
    it('ATF-019: 本日の勤怠読み込み', async () => {
      const mockAttendanceDoc = createMockAttendanceDoc()
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [mockAttendanceDoc],
      })

      const store = useAttendanceFirebaseStore()
      await store.loadTodayAttendance('user-001')

      expect(store.todayAttendance).not.toBeNull()
      expect(store.todayAttendance?.userId).toBe('user-001')
    })
  })

  describe('Getters', () => {
    it('ATF-020: cachedUserIds', async () => {
      const mockDocs = [createMockAttendanceDoc()]
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: mockDocs,
      })

      const store = useAttendanceFirebaseStore()
      await store.fetchAttendancesByDateRange('user-001', '2026-01-10', '2026-01-12')

      expect(store.cachedUserIds).toContain('user-001')
    })

    it('ATF-021: totalCachedRecords', async () => {
      const mockDocs = [
        createMockAttendanceDoc({ date: '2026-01-10' }),
        createMockAttendanceDoc({ date: '2026-01-11' }),
      ]
      mockCollection.mockReturnValue('attendances-collection')
      mockQuery.mockReturnValue('mock-query')
      mockWhere.mockReturnValue('mock-where')
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: mockDocs,
      })

      const store = useAttendanceFirebaseStore()
      await store.fetchAttendancesByDateRange('user-001', '2026-01-10', '2026-01-12')

      expect(store.totalCachedRecords).toBe(2)
    })
  })
})
