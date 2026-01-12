// tests/unit/views/admin/EmployeeListView.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import EmployeeListView from '@/views/admin/EmployeeListView.vue'
import { collection, getDocs, query, where } from 'firebase/firestore'

// Firestoreモックの型定義
const mockCollection = collection as Mock
const mockGetDocs = getDocs as Mock
const mockQuery = query as Mock
const mockWhere = where as Mock

// テスト用ユーザーデータ
const mockUsers = [
  {
    id: 'admin-001',
    name: '管理者',
    email: 'admin@example.com',
    role: 'admin',
    department: '管理部',
    position: '管理者',
    employeeNumber: 'ADM001',
  },
  {
    id: 'user-001',
    name: '山田太郎',
    email: 'yamada@example.com',
    role: 'employee',
    department: '営業部',
    position: '主任',
    employeeNumber: 'EMP001',
  },
  {
    id: 'user-002',
    name: '佐藤花子',
    email: 'sato@example.com',
    role: 'employee',
    department: '営業部',
    position: '一般',
    employeeNumber: 'EMP002',
  },
  {
    id: 'user-003',
    name: '鈴木一郎',
    email: 'suzuki@example.com',
    role: 'employee',
    department: '開発部',
    position: undefined,
    employeeNumber: undefined,
  },
]

// テスト用勤怠データ
const mockAttendances = [
  { id: 'att-001', userId: 'user-001', date: '2026-01-05', status: 'present', checkIn: { toDate: () => new Date() }, checkOut: { toDate: () => new Date() } },
  { id: 'att-002', userId: 'user-001', date: '2026-01-06', status: 'late', checkIn: { toDate: () => new Date() }, checkOut: { toDate: () => new Date() } },
  { id: 'att-003', userId: 'user-001', date: '2026-01-07', status: 'present', checkIn: { toDate: () => new Date() }, checkOut: { toDate: () => new Date() } },
  { id: 'att-004', userId: 'user-002', date: '2026-01-05', status: 'present', checkIn: { toDate: () => new Date() }, checkOut: { toDate: () => new Date() } },
  { id: 'att-005', userId: 'user-002', date: '2026-01-06', status: 'early_leave', checkIn: { toDate: () => new Date() }, checkOut: { toDate: () => new Date() } },
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

describe('EmployeeListView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-13T10:00:00'))

    // Firestoreモック設定
    mockCollection.mockReturnValue('collection-ref')
    mockQuery.mockReturnValue('query-ref')
    mockWhere.mockReturnValue('where-ref')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function mountEmployeeListView() {
    // 最初にユーザー、次に勤怠データを返す
    mockGetDocs
      .mockResolvedValueOnce(createMockSnapshot(mockUsers))
      .mockResolvedValueOnce(createMockSnapshot(mockAttendances))

    return mount(EmployeeListView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
          }),
        ],
      },
    })
  }

  describe('初期表示', () => {
    it('EL-001: 月選択フィールド', async () => {
      const wrapper = mountEmployeeListView()
      await flushPromises()

      const textField = wrapper.findComponent({ name: 'VTextField' })
      expect(textField.exists()).toBe(true)
      // 現在の年月が初期値として設定される
      expect((wrapper.vm as any).selectedMonth).toBe('2026-01')
    })

    it('EL-002: ヘッダー表示', async () => {
      const wrapper = mountEmployeeListView()
      await flushPromises()

      expect(wrapper.text()).toContain('従業員管理')
    })

    it('EL-003: テーブルヘッダー', async () => {
      const wrapper = mountEmployeeListView()
      await flushPromises()

      expect(wrapper.text()).toContain('社員番号')
      expect(wrapper.text()).toContain('名前')
      expect(wrapper.text()).toContain('役職')
      expect(wrapper.text()).toContain('当月の出勤ステータス')
      expect(wrapper.text()).toContain('備考')
    })
  })

  describe('データ取得', () => {
    it('EL-004: ユーザー取得', async () => {
      const wrapper = mountEmployeeListView()
      await flushPromises()

      // getDocsが呼ばれている
      expect(mockGetDocs).toHaveBeenCalled()
      expect(mockCollection).toHaveBeenCalled()
    })

    it('EL-005: 勤怠取得', async () => {
      const wrapper = mountEmployeeListView()
      await flushPromises()

      // queryとwhereが呼ばれている
      expect(mockQuery).toHaveBeenCalled()
      expect(mockWhere).toHaveBeenCalled()
    })

    it('EL-006: ローディング状態', async () => {
      mockGetDocs.mockReset()

      // 遅延するPromiseを作成
      let resolveGetDocs: (value: any) => void
      mockGetDocs.mockReturnValue(
        new Promise((resolve) => {
          resolveGetDocs = resolve
        })
      )

      const wrapper = mountEmployeeListView()

      // 初期状態はローディング中
      expect((wrapper.vm as any).loading).toBe(true)

      // 完了
      resolveGetDocs!(createMockSnapshot(mockUsers))
      await flushPromises()

      expect((wrapper.vm as any).loading).toBe(false)
    })
  })

  describe('月選択変更 (watch selectedMonth)', () => {
    it('EL-007: 月変更時の再取得', async () => {
      const wrapper = mountEmployeeListView()
      await flushPromises()

      // モックをリセット
      mockGetDocs.mockReset()
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockAttendances))

      // 月を変更
      ;(wrapper.vm as any).selectedMonth = '2026-02'
      await wrapper.vm.$nextTick()
      await flushPromises()

      // fetchAttendancesが呼ばれる
      expect(mockGetDocs).toHaveBeenCalled()
    })

    it('EL-008: 日付範囲計算', async () => {
      const wrapper = mountEmployeeListView()
      await flushPromises()

      // whereの呼び出しを確認
      expect(mockWhere).toHaveBeenCalledWith('date', '>=', '2026-01-01')
      expect(mockWhere).toHaveBeenCalledWith('date', '<=', '2026-01-31')
    })
  })

  describe('従業員リスト計算 (employeeList computed)', () => {
    it('EL-009: 従業員フィルタリング', async () => {
      const wrapper = mountEmployeeListView()
      await flushPromises()

      const list = (wrapper.vm as any).employeeList
      // adminを除外するので3人
      expect(list.length).toBe(3)
      expect(list.every((item: any) => item.name !== '管理者')).toBe(true)
    })

    it('EL-010: 勤怠ステータス集計', async () => {
      const wrapper = mountEmployeeListView()
      await flushPromises()

      const list = (wrapper.vm as any).employeeList
      const yamada = list.find((item: any) => item.name === '山田太郎')

      // 山田太郎: present=2, late=1
      expect(yamada.attendanceStatus.present).toBe(2)
      expect(yamada.attendanceStatus.late).toBe(1)
    })

    it('EL-011: ステータス初期値', async () => {
      const wrapper = mountEmployeeListView()
      await flushPromises()

      const list = (wrapper.vm as any).employeeList
      const suzuki = list.find((item: any) => item.name === '鈴木一郎')

      // 勤怠データなし
      expect(suzuki.attendanceStatus).toEqual({
        present: 0,
        late: 0,
        early_leave: 0,
        absent: 0,
      })
    })

    it('EL-012: 社員番号表示', async () => {
      const wrapper = mountEmployeeListView()
      await flushPromises()

      const list = (wrapper.vm as any).employeeList
      const suzuki = list.find((item: any) => item.name === '鈴木一郎')

      // employeeNumberがundefinedの場合は'-'
      expect(suzuki.employeeNumber).toBe('-')
    })
  })

  describe('テーブル表示', () => {
    it('EL-013: 社員番号', async () => {
      const wrapper = mountEmployeeListView()
      await flushPromises()

      expect(wrapper.text()).toContain('EMP001')
    })

    it('EL-014: 名前', async () => {
      const wrapper = mountEmployeeListView()
      await flushPromises()

      expect(wrapper.text()).toContain('山田太郎')
    })

    it('EL-015: 役職', async () => {
      const wrapper = mountEmployeeListView()
      await flushPromises()

      expect(wrapper.text()).toContain('主任')
    })
  })

  describe('ページネーション', () => {
    it('EL-016: デフォルト表示件数', async () => {
      const wrapper = mountEmployeeListView()
      await flushPromises()

      const dataTable = wrapper.findComponent({ name: 'VDataTable' })
      expect(dataTable.exists()).toBe(true)
      expect(dataTable.props('itemsPerPage')).toBe(10)
    })

    it('EL-017: ページ切り替え', async () => {
      // 11人以上のデータを作成
      const manyUsers = Array.from({ length: 15 }, (_, i) => ({
        id: `user-${i}`,
        name: `ユーザー${i}`,
        email: `user${i}@example.com`,
        role: 'employee',
        department: '営業部',
        position: '一般',
        employeeNumber: `EMP${i.toString().padStart(3, '0')}`,
      }))

      mockGetDocs.mockReset()
      mockGetDocs
        .mockResolvedValueOnce(createMockSnapshot(manyUsers))
        .mockResolvedValueOnce(createMockSnapshot([]))

      const wrapper = mount(EmployeeListView, {
        global: {
          plugins: [
            createTestingPinia({
              createSpy: vi.fn,
              stubActions: false,
            }),
          ],
        },
      })
      await flushPromises()

      const dataTable = wrapper.findComponent({ name: 'VDataTable' })
      expect(dataTable.exists()).toBe(true)
      // データが15件あるのでページネーションが存在する
      expect((wrapper.vm as any).employeeList.length).toBe(15)
    })
  })
})
