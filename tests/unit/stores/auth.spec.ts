// tests/unit/stores/auth.spec.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockUsers } from '@/data/mockData'

// テストで使用するユーザー情報をmockDataから取得
const testEmployee = mockUsers.find(u => u.name === '山田太郎')!
const testAdmin = mockUsers.find(u => u.role === 'admin')!

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // LocalStorageをクリア
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('初期状態は未認証', () => {
    const authStore = useAuthStore()

    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
  })

  it('一般従業員でログインできる', () => {
    const authStore = useAuthStore()

    const result = authStore.login({
      email: testEmployee.email, // 修正: 正しいemailを使用
      password: 'password',
    })

    expect(result).toBe(true)
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user?.name).toBe(testEmployee.name)
    expect(authStore.user?.role).toBe('employee')
    expect(authStore.isAdmin).toBe(false)
  })

  it('管理者でログインできる', () => {
    const authStore = useAuthStore()

    const result = authStore.login({
      email: testAdmin.email,
      password: 'password',
    })

    expect(result).toBe(true)
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user?.name).toBe('管理者') // 修正: '管理者権限' -> '管理者'
    expect(authStore.user?.role).toBe('admin')
    expect(authStore.isAdmin).toBe(true)
  })

  it('存在しないユーザーはログインできない', () => {
    const authStore = useAuthStore()

    const result = authStore.login({
      email: 'notexist@example.com',
      password: 'password',
    })

    expect(result).toBe(false)
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.user).toBeNull()
  })

  it('ログアウトできる', () => {
    const authStore = useAuthStore()

    // ログイン
    const loginResult = authStore.login({
      email: testEmployee.email, // 修正: 正しいemailを使用
      password: 'password',
    })
    
    // ログインが成功したことを確認してからログアウトをテスト
    expect(loginResult).toBe(true)
    expect(authStore.isAuthenticated).toBe(true)

    // ログアウト
    authStore.logout()

    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
  })

  it('ログイン情報がLocalStorageに保存される', () => {
    const authStore = useAuthStore()

    authStore.login({
      email: testEmployee.email, // 修正: 正しいemailを使用
      password: 'password',
    })

    expect(localStorage.getItem('mock_auth')).toBe('true')
    expect(localStorage.getItem('mock_role')).toBe(testEmployee.role)
    expect(localStorage.getItem('mock_user_id')).toBe(testEmployee.id) // 修正: 正しいIDを期待
    expect(localStorage.getItem('mock_user_name')).toBe(testEmployee.name)
  })

  it('LocalStorageから認証状態を復元できる', () => {
    // LocalStorageに認証情報をセット
    localStorage.setItem('mock_auth', 'true')
    localStorage.setItem('mock_user_id', testEmployee.id) // 修正: 正しいIDを使用

    const authStore = useAuthStore()
    authStore.checkAuth()

    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user?.name).toBe(testEmployee.name)
  })

  it('computed値が正しく計算される', () => {
    const authStore = useAuthStore()

    authStore.login({
      email: testEmployee.email, // 修正: 正しいemailを使用
      password: 'password',
    })

    expect(authStore.userName).toBe(testEmployee.name)
    expect(authStore.userEmail).toBe(testEmployee.email)
    expect(authStore.userId).toBe(testEmployee.id) // 修正: 正しいIDを期待
  })

  it('rememberMeオプションが機能する', () => {
    const authStore = useAuthStore()

    authStore.login({
      email: testEmployee.email, // 修正: 正しいemailを使用
      password: 'password',
      rememberMe: true,
    })

    expect(localStorage.getItem('mock_remember')).toBe('true')
  })
})
