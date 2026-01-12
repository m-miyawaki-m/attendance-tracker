// tests/unit/stores/adminAttendanceStore.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdminAttendanceStore } from '@/stores/adminAttendanceStore'
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore'

// Firebase モックの型定義
const mockCollection = collection as Mock
const mockGetDocs = getDocs as Mock
const mockQuery = query as Mock
const mockWhere = where as Mock

// テスト用勤怠データ
const mockAttendances = [
  {
    id: 'att-001',
    userId: 'user-001',
    date: '2026-01-13',
    checkIn: { toDate: () => new Date('2026-01-13T09:00:00') },
    checkInLocation: { latitude: 35.6812, longitude: 139.7671, address: '東京駅' },
    checkOut: { toDate: () => new Date('2026-01-13T18:00:00') },
    checkOutLocation: { latitude: 35.6812, longitude: 139.7671, address: '東京駅' },
    workingMinutes: 540,
    status: 'present',
    note: null,
    createdAt: { toDate: () => new Date('2026-01-13T09:00:00') },
    updatedAt: { toDate: () => new Date('2026-01-13T18:00:00') },
  },
  {
    id: 'att-002',
    userId: 'user-002',
    date: '2026-01-13',
    checkIn: { toDate: () => new Date('2026-01-13T09:30:00') },
    checkInLocation: { latitude: 35.6812, longitude: 139.7671, address: '東京駅' },
    checkOut: null,
    checkOutLocation: null,
    workingMinutes: 0,
    status: 'late',
    note: '電車遅延',
    createdAt: { toDate: () => new Date('2026-01-13T09:30:00') },
    updatedAt: { toDate: () => new Date('2026-01-13T09:30:00') },
  },
]

const mockAttendances2 = [
  {
    id: 'att-003',
    userId: 'user-001',
    date: '2026-01-14',
    checkIn: { toDate: () => new Date('2026-01-14T09:00:00') },
    checkInLocation: null,
    checkOut: { toDate: () => new Date('2026-01-14T18:00:00') },
    checkOutLocation: null,
    workingMinutes: 540,
    status: 'present',
    note: null,
    createdAt: { toDate: () => new Date('2026-01-14T09:00:00') },
    updatedAt: { toDate: () => new Date('2026-01-14T18:00:00') },
  },
]

// モックスナップショットの作成
function createMockSnapshot(data: any[]) {
  return {
    docs: data.map((item) => ({
      id: item.id,
      data: () => item,
    })),
  }
}

describe('adminAttendanceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Firestoreモック設定
    mockCollection.mockReturnValue('attendances-collection')
    mockQuery.mockReturnValue('query-ref')
    mockWhere.mockReturnValue('where-ref')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('State初期値', () => {
    it('AAS-001: attendancesByDate初期値', () => {
      const store = useAdminAttendanceStore()
      expect(store.attendancesByDate).toBeInstanceOf(Map)
      expect(store.attendancesByDate.size).toBe(0)
    })

    it('AAS-002: loading初期値', () => {
      const store = useAdminAttendanceStore()
      expect(store.loading).toBe(false)
    })

    it('AAS-003: error初期値', () => {
      const store = useAdminAttendanceStore()
      expect(store.error).toBeNull()
    })
  })

  describe('Getters', () => {
    it('AAS-004: cachedDates - 初期状態', () => {
      const store = useAdminAttendanceStore()
      expect(store.cachedDates).toEqual([])
    })

    it('AAS-005: cachedDates - キャッシュあり', async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockAttendances))

      const store = useAdminAttendanceStore()
      await store.fetchAttendancesByDate('2026-01-13')

      expect(store.cachedDates).toContain('2026-01-13')
    })

    it('AAS-006: totalCachedRecords - 初期状態', () => {
      const store = useAdminAttendanceStore()
      expect(store.totalCachedRecords).toBe(0)
    })

    it('AAS-007: totalCachedRecords - キャッシュあり', async () => {
      mockGetDocs
        .mockResolvedValueOnce(createMockSnapshot(mockAttendances))
        .mockResolvedValueOnce(createMockSnapshot(mockAttendances2))

      const store = useAdminAttendanceStore()
      await store.fetchAttendancesByDate('2026-01-13')
      await store.fetchAttendancesByDate('2026-01-14')

      // 2件 + 1件 = 3件
      expect(store.totalCachedRecords).toBe(3)
    })
  })

  describe('fetchAttendancesByDate アクション', () => {
    it('AAS-008: 初回取得成功', async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockAttendances))

      const store = useAdminAttendanceStore()
      const result = await store.fetchAttendancesByDate('2026-01-13')

      expect(result).toHaveLength(2)
      expect(mockGetDocs).toHaveBeenCalledTimes(1)
      expect(store.attendancesByDate.has('2026-01-13')).toBe(true)
    })

    it('AAS-009: キャッシュ利用', async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockAttendances))

      const store = useAdminAttendanceStore()
      
      // 1回目の取得
      await store.fetchAttendancesByDate('2026-01-13')
      expect(mockGetDocs).toHaveBeenCalledTimes(1)

      // 2回目の取得（キャッシュから）
      const result = await store.fetchAttendancesByDate('2026-01-13')
      expect(mockGetDocs).toHaveBeenCalledTimes(1) // 増えない
      expect(result).toHaveLength(2)
    })

    it('AAS-010: loading状態', async () => {
      let resolveGetDocs: (value: any) => void
      mockGetDocs.mockReturnValue(
        new Promise((resolve) => {
          resolveGetDocs = resolve
        })
      )

      const store = useAdminAttendanceStore()
      expect(store.loading).toBe(false)

      // 取得開始
      const fetchPromise = store.fetchAttendancesByDate('2026-01-13')
      expect(store.loading).toBe(true)

      // 完了
      resolveGetDocs!(createMockSnapshot(mockAttendances))
      await fetchPromise
      expect(store.loading).toBe(false)
    })

    it('AAS-011: Firestoreエラー', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firestore error'))

      const store = useAdminAttendanceStore()

      await expect(store.fetchAttendancesByDate('2026-01-13')).rejects.toThrow('Firestore error')
      expect(store.error).toBe('Firestore error')
      expect(store.loading).toBe(false)
    })

    it('AAS-012: データマッピング', async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockAttendances))

      const store = useAdminAttendanceStore()
      const result = await store.fetchAttendancesByDate('2026-01-13')

      const att = result[0]
      expect(att.id).toBe('att-001')
      expect(att.userId).toBe('user-001')
      expect(att.checkIn).toBeInstanceOf(Date)
      expect(att.checkOut).toBeInstanceOf(Date)
      expect(att.status).toBe('present')
    })

    it('AAS-013: 位置情報なしデータ', async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockAttendances2))

      const store = useAdminAttendanceStore()
      const result = await store.fetchAttendancesByDate('2026-01-14')

      const att = result[0]
      expect(att.checkInLocation).toBeNull()
      expect(att.checkOutLocation).toBeNull()
    })
  })

  describe('fetchAttendancesByDateRange アクション', () => {
    it('AAS-014: 日付範囲取得成功', async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot([...mockAttendances, ...mockAttendances2]))

      const store = useAdminAttendanceStore()
      const result = await store.fetchAttendancesByDateRange('2026-01-13', '2026-01-14')

      expect(result).toHaveLength(3)
      expect(mockQuery).toHaveBeenCalled()
      expect(mockWhere).toHaveBeenCalled()
    })

    it('AAS-015: ユーザーID指定', async () => {
      const userSpecificData = mockAttendances.filter(a => a.userId === 'user-001')
      mockGetDocs.mockResolvedValue(createMockSnapshot(userSpecificData))

      const store = useAdminAttendanceStore()
      const result = await store.fetchAttendancesByDateRange('2026-01-13', '2026-01-14', 'user-001')

      expect(result).toHaveLength(1)
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user-001')
    })

    it('AAS-016: loading状態', async () => {
      let resolveGetDocs: (value: any) => void
      mockGetDocs.mockReturnValue(
        new Promise((resolve) => {
          resolveGetDocs = resolve
        })
      )

      const store = useAdminAttendanceStore()
      expect(store.loading).toBe(false)

      const fetchPromise = store.fetchAttendancesByDateRange('2026-01-13', '2026-01-14')
      expect(store.loading).toBe(true)

      resolveGetDocs!(createMockSnapshot(mockAttendances))
      await fetchPromise
      expect(store.loading).toBe(false)
    })

    it('AAS-017: Firestoreエラー', async () => {
      mockGetDocs.mockRejectedValue(new Error('Range fetch error'))

      const store = useAdminAttendanceStore()

      await expect(store.fetchAttendancesByDateRange('2026-01-13', '2026-01-14')).rejects.toThrow('Range fetch error')
      expect(store.error).toBe('Range fetch error')
    })
  })

  describe('getAttendancesByDateFromCache アクション', () => {
    it('AAS-018: キャッシュあり', async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockAttendances))

      const store = useAdminAttendanceStore()
      await store.fetchAttendancesByDate('2026-01-13')

      const cached = store.getAttendancesByDateFromCache('2026-01-13')
      expect(cached).toHaveLength(2)
    })

    it('AAS-019: キャッシュなし', () => {
      const store = useAdminAttendanceStore()

      const cached = store.getAttendancesByDateFromCache('2026-01-13')
      expect(cached).toBeUndefined()
    })
  })

  describe('getUserAttendanceByDate アクション', () => {
    it('AAS-020: データあり', async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockAttendances))

      const store = useAdminAttendanceStore()
      await store.fetchAttendancesByDate('2026-01-13')

      const att = store.getUserAttendanceByDate('user-001', '2026-01-13')
      expect(att).not.toBeNull()
      expect(att?.userId).toBe('user-001')
    })

    it('AAS-021: 日付キャッシュなし', () => {
      const store = useAdminAttendanceStore()

      const att = store.getUserAttendanceByDate('user-001', '2026-01-13')
      expect(att).toBeNull()
    })

    it('AAS-022: ユーザーデータなし', async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockAttendances))

      const store = useAdminAttendanceStore()
      await store.fetchAttendancesByDate('2026-01-13')

      const att = store.getUserAttendanceByDate('non-existent-user', '2026-01-13')
      expect(att).toBeNull()
    })
  })

  describe('clearCache アクション', () => {
    it('AAS-023: 特定日付クリア', async () => {
      mockGetDocs
        .mockResolvedValueOnce(createMockSnapshot(mockAttendances))
        .mockResolvedValueOnce(createMockSnapshot(mockAttendances2))

      const store = useAdminAttendanceStore()
      await store.fetchAttendancesByDate('2026-01-13')
      await store.fetchAttendancesByDate('2026-01-14')

      expect(store.cachedDates).toHaveLength(2)

      store.clearCache('2026-01-13')

      expect(store.cachedDates).toHaveLength(1)
      expect(store.cachedDates).toContain('2026-01-14')
      expect(store.cachedDates).not.toContain('2026-01-13')
    })

    it('AAS-024: 全キャッシュクリア', async () => {
      mockGetDocs
        .mockResolvedValueOnce(createMockSnapshot(mockAttendances))
        .mockResolvedValueOnce(createMockSnapshot(mockAttendances2))

      const store = useAdminAttendanceStore()
      await store.fetchAttendancesByDate('2026-01-13')
      await store.fetchAttendancesByDate('2026-01-14')

      expect(store.cachedDates).toHaveLength(2)

      store.clearCache()

      expect(store.cachedDates).toHaveLength(0)
    })

    it('AAS-025: エラーもクリア', async () => {
      mockGetDocs.mockRejectedValue(new Error('Test error'))

      const store = useAdminAttendanceStore()
      
      try {
        await store.fetchAttendancesByDate('2026-01-13')
      } catch {
        // エラーは想定内
      }

      expect(store.error).not.toBeNull()

      store.clearCache()

      expect(store.error).toBeNull()
    })
  })

  describe('refreshAttendances アクション', () => {
    it('AAS-026: 強制再取得', async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockAttendances))

      const store = useAdminAttendanceStore()
      
      // 1回目の取得
      await store.fetchAttendancesByDate('2026-01-13')
      expect(mockGetDocs).toHaveBeenCalledTimes(1)

      // 強制再取得
      await store.refreshAttendances('2026-01-13')
      expect(mockGetDocs).toHaveBeenCalledTimes(2) // キャッシュクリアされて再取得
    })
  })
})
