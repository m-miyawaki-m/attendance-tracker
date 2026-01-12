// tests/unit/stores/userStore.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { collection, getDocs } from 'firebase/firestore'

// Firebase モックの型定義
const mockCollection = collection as Mock
const mockGetDocs = getDocs as Mock

// テスト用のユーザーデータ
const mockUsers = [
  {
    id: 'admin-001',
    name: '管理者',
    email: 'admin@example.com',
    role: 'admin',
    department: '管理部',
    position: '管理者',
    employeeNumber: 'ADM001',
    managerId: null,
    createdAt: { toDate: () => new Date('2024-01-01') },
    updatedAt: { toDate: () => new Date('2024-01-01') },
  },
  {
    id: 'user-001',
    name: '山田太郎',
    email: 'yamada@example.com',
    role: 'employee',
    department: '営業部',
    position: '主任',
    employeeNumber: 'EMP001',
    managerId: null,
    createdAt: { toDate: () => new Date('2024-01-02') },
    updatedAt: { toDate: () => new Date('2024-01-02') },
  },
  {
    id: 'user-002',
    name: '佐藤花子',
    email: 'sato@example.com',
    role: 'employee',
    department: '営業部',
    position: '一般',
    employeeNumber: 'EMP002',
    managerId: 'user-001',
    createdAt: { toDate: () => new Date('2024-01-03') },
    updatedAt: { toDate: () => new Date('2024-01-03') },
  },
  {
    id: 'user-003',
    name: '鈴木一郎',
    email: 'suzuki@example.com',
    role: 'employee',
    department: '開発部',
    position: '主任',
    employeeNumber: 'EMP003',
    managerId: null,
    createdAt: { toDate: () => new Date('2024-01-04') },
    updatedAt: { toDate: () => new Date('2024-01-04') },
  },
  {
    id: 'user-004',
    name: '田中次郎',
    email: 'tanaka@example.com',
    role: 'employee',
    department: '開発部',
    position: '一般',
    employeeNumber: 'EMP004',
    managerId: 'user-003',
    createdAt: { toDate: () => new Date('2024-01-05') },
    updatedAt: { toDate: () => new Date('2024-01-05') },
  },
  {
    id: 'user-005',
    name: '高橋三郎',
    email: 'takahashi@example.com',
    role: 'employee',
    department: '開発部',
    position: '一般',
    employeeNumber: 'EMP005',
    managerId: 'user-003',
    createdAt: { toDate: () => new Date('2024-01-06') },
    updatedAt: { toDate: () => new Date('2024-01-06') },
  },
]

// モックスナップショットの作成
function createMockSnapshot(users: typeof mockUsers) {
  return {
    docs: users.map((user) => ({
      id: user.id,
      data: () => ({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        employeeNumber: user.employeeNumber,
        managerId: user.managerId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    })),
  }
}

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  describe('State初期値', () => {
    it('US-001: users初期値', () => {
      const store = useUserStore()
      expect(store.users).toEqual([])
    })

    it('US-002: loading初期値', () => {
      const store = useUserStore()
      expect(store.loading).toBe(false)
    })

    it('US-003: lastFetched初期値', () => {
      const store = useUserStore()
      expect(store.lastFetched).toBeNull()
    })

    it('US-004: error初期値', () => {
      const store = useUserStore()
      expect(store.error).toBeNull()
    })
  })

  describe('Getters - employees', () => {
    it('US-005: 従業員フィルタリング', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers))

      const store = useUserStore()
      await store.fetchUsers()

      // admin1人、employee5人なので、employeesは5人
      expect(store.employees).toHaveLength(5)
      expect(store.employees.every((u) => u.role === 'employee')).toBe(true)
    })

    it('US-006: 従業員なし', async () => {
      const adminOnly = mockUsers.filter((u) => u.role === 'admin')
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(adminOnly))

      const store = useUserStore()
      await store.fetchUsers()

      expect(store.employees).toHaveLength(0)
    })
  })

  describe('Getters - admins', () => {
    it('US-007: 管理者フィルタリング', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers))

      const store = useUserStore()
      await store.fetchUsers()

      expect(store.admins).toHaveLength(1)
      expect(store.admins[0].role).toBe('admin')
      expect(store.admins[0].name).toBe('管理者')
    })
  })

  describe('Getters - managers', () => {
    it('US-008: 主任フィルタリング', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers))

      const store = useUserStore()
      await store.fetchUsers()

      // 山田太郎（営業部主任）と鈴木一郎（開発部主任）の2人
      expect(store.managers).toHaveLength(2)
      expect(store.managers.every((u) => u.position === '主任')).toBe(true)
    })

    it('US-009: 主任なし', async () => {
      const noManagers = mockUsers.filter((u) => u.position !== '主任')
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(noManagers))

      const store = useUserStore()
      await store.fetchUsers()

      expect(store.managers).toHaveLength(0)
    })

    it('US-010: adminの主任除外', async () => {
      // 管理者に主任の役職を付けたテストデータ
      const usersWithAdminManager = [
        {
          ...mockUsers[0],
          position: '主任', // adminに主任を付ける
        },
        ...mockUsers.slice(1),
      ]
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(usersWithAdminManager))

      const store = useUserStore()
      await store.fetchUsers()

      // managersはemployeesからフィルタするのでadminは含まれない
      expect(store.managers).toHaveLength(2)
      expect(store.managers.every((u) => u.role === 'employee')).toBe(true)
    })
  })

  describe('Getters - usersByDepartment', () => {
    it('US-011: 部署グループ化', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers))

      const store = useUserStore()
      await store.fetchUsers()

      const byDept = store.usersByDepartment
      expect(byDept.get('管理部')).toHaveLength(1)
      expect(byDept.get('営業部')).toHaveLength(2)
      expect(byDept.get('開発部')).toHaveLength(3)
    })

    it('US-012: 空データ', () => {
      const store = useUserStore()
      // 初期状態でusersは空なのでMapも空
      expect(store.usersByDepartment.size).toBe(0)
    })
  })

  describe('fetchUsers アクション', () => {
    it('US-013: 初回取得成功', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers))

      const store = useUserStore()
      await store.fetchUsers()

      expect(store.users).toHaveLength(6)
      expect(store.lastFetched).not.toBeNull()
      expect(mockGetDocs).toHaveBeenCalledTimes(1)
    })

    it('US-014: キャッシュ利用', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers))

      const store = useUserStore()

      // 1回目の取得
      await store.fetchUsers()
      expect(mockGetDocs).toHaveBeenCalledTimes(1)

      // 2回目の取得（5分以内なのでキャッシュ利用）
      await store.fetchUsers()
      expect(mockGetDocs).toHaveBeenCalledTimes(1) // 呼び出し回数は増えない
    })

    it('US-015: キャッシュ期限切れ', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers))

      const store = useUserStore()

      // 1回目の取得
      await store.fetchUsers()
      expect(mockGetDocs).toHaveBeenCalledTimes(1)

      // 5分以上経過させる
      vi.advanceTimersByTime(6 * 60 * 1000) // 6分

      // 2回目の取得（キャッシュ期限切れなので再取得）
      await store.fetchUsers()
      expect(mockGetDocs).toHaveBeenCalledTimes(2)
    })

    it('US-016: 強制リフレッシュ', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers))

      const store = useUserStore()

      // 1回目の取得
      await store.fetchUsers()
      expect(mockGetDocs).toHaveBeenCalledTimes(1)

      // 強制リフレッシュ
      await store.fetchUsers(true)
      expect(mockGetDocs).toHaveBeenCalledTimes(2)
    })

    it('US-017: Firestoreエラー', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockRejectedValue(new Error('Firestore error'))

      const store = useUserStore()

      await expect(store.fetchUsers()).rejects.toThrow('Firestore error')
      expect(store.error).toBe('Firestore error')
    })

    it('US-018: loading状態', async () => {
      mockCollection.mockReturnValue('users-collection')

      // 遅延をシミュレート
      let resolveGetDocs: (value: any) => void
      mockGetDocs.mockReturnValue(
        new Promise((resolve) => {
          resolveGetDocs = resolve
        })
      )

      const store = useUserStore()
      expect(store.loading).toBe(false)

      // fetchUsers開始
      const fetchPromise = store.fetchUsers()
      expect(store.loading).toBe(true)

      // 完了
      resolveGetDocs!(createMockSnapshot(mockUsers))
      await fetchPromise
      expect(store.loading).toBe(false)
    })

    it('US-019: データマッピング', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers))

      const store = useUserStore()
      await store.fetchUsers()

      const user = store.users.find((u) => u.id === 'user-001')
      expect(user).toBeDefined()
      expect(user?.id).toBe('user-001')
      expect(user?.name).toBe('山田太郎')
      expect(user?.email).toBe('yamada@example.com')
      expect(user?.role).toBe('employee')
      expect(user?.department).toBe('営業部')
      expect(user?.position).toBe('主任')
      expect(user?.employeeNumber).toBe('EMP001')
      expect(user?.managerId).toBeNull()
    })

    it('US-020: Timestamp変換', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers))

      const store = useUserStore()
      await store.fetchUsers()

      const user = store.users.find((u) => u.id === 'user-001')
      expect(user?.createdAt).toBeInstanceOf(Date)
      expect(user?.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('getUserById アクション', () => {
    it('US-021: ユーザー存在', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers))

      const store = useUserStore()
      await store.fetchUsers()

      const user = store.getUserById('user-002')
      expect(user).toBeDefined()
      expect(user?.name).toBe('佐藤花子')
    })

    it('US-022: ユーザー不在', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers))

      const store = useUserStore()
      await store.fetchUsers()

      const user = store.getUserById('non-existent-id')
      expect(user).toBeUndefined()
    })
  })

  describe('getTeamMembers アクション', () => {
    it('US-023: チームメンバー取得', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers))

      const store = useUserStore()
      await store.fetchUsers()

      // 鈴木一郎（user-003）の部下は田中次郎と高橋三郎の2人
      const members = store.getTeamMembers('user-003')
      expect(members).toHaveLength(2)
      expect(members.map((m) => m.name)).toContain('田中次郎')
      expect(members.map((m) => m.name)).toContain('高橋三郎')
    })

    it('US-024: チームメンバーなし', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers))

      const store = useUserStore()
      await store.fetchUsers()

      // 存在しないマネージャーID
      const members = store.getTeamMembers('non-existent-manager')
      expect(members).toHaveLength(0)
    })

    it('US-025: adminは除外', async () => {
      // adminにmanagerIdを設定したテストデータ
      const usersWithAdminUnderManager = mockUsers.map((u) => ({
        ...u,
        managerId: u.id === 'admin-001' ? 'user-001' : u.managerId,
      }))
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(usersWithAdminUnderManager))

      const store = useUserStore()
      await store.fetchUsers()

      // getTeamMembersはemployeesからフィルタするのでadminは含まれない
      const members = store.getTeamMembers('user-001')
      expect(members.every((m) => m.role === 'employee')).toBe(true)
      expect(members.find((m) => m.role === 'admin')).toBeUndefined()
    })
  })

  describe('clearCache アクション', () => {
    it('US-026: キャッシュクリア', async () => {
      mockCollection.mockReturnValue('users-collection')
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers))

      const store = useUserStore()
      await store.fetchUsers()

      expect(store.users).toHaveLength(6)
      expect(store.lastFetched).not.toBeNull()

      // キャッシュクリア
      store.clearCache()

      expect(store.users).toEqual([])
      expect(store.lastFetched).toBeNull()
      expect(store.error).toBeNull()
    })
  })
})
