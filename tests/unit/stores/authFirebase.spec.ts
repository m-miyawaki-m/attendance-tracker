// tests/unit/stores/authFirebase.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthFirebaseStore } from '@/stores/authFirebase'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

// Firebase モックの型定義
const mockSignInWithEmailAndPassword = signInWithEmailAndPassword as Mock
const mockSignOut = signOut as Mock
const mockOnAuthStateChanged = onAuthStateChanged as Mock
const mockDoc = doc as Mock
const mockGetDoc = getDoc as Mock

// テスト用のユーザーデータ
const mockUserData = {
  name: 'テストユーザー',
  email: 'test@example.com',
  role: 'employee' as const,
  department: '開発部',
  position: '一般',
  employeeNumber: 'EMP001',
  managerId: 'manager-1',
  createdAt: { toDate: () => new Date('2024-01-01') },
  updatedAt: { toDate: () => new Date('2024-01-01') },
}

const mockAdminData = {
  name: '管理者',
  email: 'admin@example.com',
  role: 'admin' as const,
  department: '管理部',
  position: '管理者',
  employeeNumber: 'ADM001',
  managerId: null,
  createdAt: { toDate: () => new Date('2024-01-01') },
  updatedAt: { toDate: () => new Date('2024-01-01') },
}

describe('authFirebase Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // モックをリセット
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初期状態', () => {
    it('AF-001: 初期状態が正しい', () => {
      const store = useAuthFirebaseStore()

      expect(store.user).toBeNull()
      expect(store.firebaseUser).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.loading).toBe(true)
    })

    it('AF-002: 初期状態のgettersが正しい', () => {
      const store = useAuthFirebaseStore()

      expect(store.isAdmin).toBe(false)
      expect(store.userName).toBe('')
      expect(store.userEmail).toBe('')
      expect(store.userId).toBe('')
    })
  })

  describe('ログイン', () => {
    it('AF-003: メール/パスワードでログイン成功', async () => {
      const mockFirebaseUser = { uid: 'test-uid-123' }
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser })
      mockDoc.mockReturnValue('user-doc-ref')
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      })

      const store = useAuthFirebaseStore()
      const result = await store.login('test@example.com', 'password123')

      expect(result).toBe(true)
      expect(store.isAuthenticated).toBe(true)
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      )
    })

    it('AF-004: ログイン失敗（無効なメール）', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue(
        new Error('auth/user-not-found')
      )

      const store = useAuthFirebaseStore()
      const result = await store.login('invalid@example.com', 'password123')

      expect(result).toBe(false)
      expect(store.isAuthenticated).toBe(false)
      expect(store.user).toBeNull()
    })

    it('AF-005: ログイン失敗（無効なパスワード）', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue(
        new Error('auth/wrong-password')
      )

      const store = useAuthFirebaseStore()
      const result = await store.login('test@example.com', 'wrongpassword')

      expect(result).toBe(false)
      expect(store.isAuthenticated).toBe(false)
    })

    it('AF-006: ログイン後のユーザー情報取得', async () => {
      const mockFirebaseUser = { uid: 'test-uid-123' }
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser })
      mockDoc.mockReturnValue('user-doc-ref')
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      })

      const store = useAuthFirebaseStore()
      await store.login('test@example.com', 'password123')

      expect(store.user).not.toBeNull()
      expect(store.user?.name).toBe('テストユーザー')
      expect(store.user?.email).toBe('test@example.com')
      expect(store.user?.role).toBe('employee')
      expect(store.user?.department).toBe('開発部')
    })
  })

  describe('ログアウト', () => {
    it('AF-007: ログアウト成功', async () => {
      // まずログイン状態にする
      const mockFirebaseUser = { uid: 'test-uid-123' }
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser })
      mockDoc.mockReturnValue('user-doc-ref')
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      })
      mockSignOut.mockResolvedValue(undefined)

      const store = useAuthFirebaseStore()
      await store.login('test@example.com', 'password123')
      expect(store.isAuthenticated).toBe(true)

      // ログアウト
      await store.logout()

      expect(store.isAuthenticated).toBe(false)
      expect(store.user).toBeNull()
      expect(store.firebaseUser).toBeNull()
      expect(mockSignOut).toHaveBeenCalled()
    })

    it('AF-008: ログアウト後のクリーンアップ', async () => {
      const mockFirebaseUser = { uid: 'test-uid-123' }
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser })
      mockDoc.mockReturnValue('user-doc-ref')
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      })
      mockSignOut.mockResolvedValue(undefined)

      const store = useAuthFirebaseStore()
      await store.login('test@example.com', 'password123')
      await store.logout()

      // gettersも初期状態に戻っている
      expect(store.userName).toBe('')
      expect(store.userEmail).toBe('')
      expect(store.userId).toBe('')
      expect(store.isAdmin).toBe(false)
    })
  })

  describe('認証状態監視', () => {
    it('AF-009: ログイン検知（onAuthStateChanged）', () => {
      let authCallback: ((user: any) => void) | null = null
      mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
        authCallback = callback
        return () => {} // unsubscribe関数
      })
      mockDoc.mockReturnValue('user-doc-ref')
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      })

      const store = useAuthFirebaseStore()
      store.initAuthListener()

      expect(mockOnAuthStateChanged).toHaveBeenCalled()
      expect(authCallback).not.toBeNull()
    })

    it('AF-010: ログアウト検知（onAuthStateChanged with null）', async () => {
      let authCallback: ((user: any) => void) | null = null
      mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
        authCallback = callback
        return () => {}
      })

      const store = useAuthFirebaseStore()
      store.initAuthListener()

      // ログアウト状態をシミュレート
      if (authCallback) {
        await authCallback(null)
      }

      expect(store.isAuthenticated).toBe(false)
      expect(store.user).toBeNull()
      expect(store.loading).toBe(false)
    })

    it('AF-011: 認証状態変更時にユーザーデータ取得', async () => {
      let authCallback: ((user: any) => void) | null = null
      mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
        authCallback = callback
        return () => {}
      })
      mockDoc.mockReturnValue('user-doc-ref')
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      })

      const store = useAuthFirebaseStore()
      store.initAuthListener()

      // ログイン状態をシミュレート
      if (authCallback) {
        await authCallback({ uid: 'test-uid-123' })
      }

      expect(store.isAuthenticated).toBe(true)
      expect(mockGetDoc).toHaveBeenCalled()
    })
  })

  describe('ユーザー情報', () => {
    it('AF-012: ユーザー名取得', async () => {
      const mockFirebaseUser = { uid: 'test-uid-123' }
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser })
      mockDoc.mockReturnValue('user-doc-ref')
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      })

      const store = useAuthFirebaseStore()
      await store.login('test@example.com', 'password123')

      expect(store.userName).toBe('テストユーザー')
    })

    it('AF-013: メールアドレス取得', async () => {
      const mockFirebaseUser = { uid: 'test-uid-123' }
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser })
      mockDoc.mockReturnValue('user-doc-ref')
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      })

      const store = useAuthFirebaseStore()
      await store.login('test@example.com', 'password123')

      expect(store.userEmail).toBe('test@example.com')
    })

    it('AF-014: UID取得', async () => {
      const mockFirebaseUser = { uid: 'test-uid-123' }
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser })
      mockDoc.mockReturnValue('user-doc-ref')
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      })

      const store = useAuthFirebaseStore()
      await store.login('test@example.com', 'password123')

      expect(store.userId).toBe('test-uid-123')
    })

    it('AF-015: ロール取得', async () => {
      const mockFirebaseUser = { uid: 'test-uid-123' }
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser })
      mockDoc.mockReturnValue('user-doc-ref')
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      })

      const store = useAuthFirebaseStore()
      await store.login('test@example.com', 'password123')

      expect(store.user?.role).toBe('employee')
    })
  })

  describe('管理者権限', () => {
    it('AF-016: 管理者判定（true）', async () => {
      const mockFirebaseUser = { uid: 'admin-uid-123' }
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser })
      mockDoc.mockReturnValue('user-doc-ref')
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockAdminData,
      })

      const store = useAuthFirebaseStore()
      await store.login('admin@example.com', 'password123')

      expect(store.isAdmin).toBe(true)
      expect(store.user?.role).toBe('admin')
    })

    it('AF-017: 管理者判定（false）', async () => {
      const mockFirebaseUser = { uid: 'test-uid-123' }
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser })
      mockDoc.mockReturnValue('user-doc-ref')
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
      })

      const store = useAuthFirebaseStore()
      await store.login('test@example.com', 'password123')

      expect(store.isAdmin).toBe(false)
      expect(store.user?.role).toBe('employee')
    })
  })

  describe('エッジケース', () => {
    it('ユーザードキュメントが存在しない場合', async () => {
      const mockFirebaseUser = { uid: 'test-uid-123' }
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser })
      mockDoc.mockReturnValue('user-doc-ref')
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      })

      const store = useAuthFirebaseStore()
      await store.login('test@example.com', 'password123')

      // 認証自体は成功するがユーザーデータはnullのまま
      expect(store.isAuthenticated).toBe(true)
      expect(store.user).toBeNull()
    })

    it('Firestoreからのデータ取得エラー', async () => {
      const mockFirebaseUser = { uid: 'test-uid-123' }
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser })
      mockDoc.mockReturnValue('user-doc-ref')
      mockGetDoc.mockRejectedValue(new Error('Firestore error'))

      const store = useAuthFirebaseStore()
      await store.login('test@example.com', 'password123')

      // 認証は成功するがユーザーデータは取得できない
      expect(store.isAuthenticated).toBe(true)
      expect(store.user).toBeNull()
    })

    it('ログアウト時のエラーハンドリング', async () => {
      mockSignOut.mockRejectedValue(new Error('Sign out error'))

      const store = useAuthFirebaseStore()
      // エラーがスローされないことを確認
      await expect(store.logout()).resolves.not.toThrow()
    })

    it('checkAuth関数は互換性のために存在', () => {
      const store = useAuthFirebaseStore()
      // checkAuthが存在し、呼び出してもエラーにならないことを確認
      expect(() => store.checkAuth()).not.toThrow()
    })
  })
})
