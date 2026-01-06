// tests/unit/stores/auth.spec.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

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
      email: 'yamada@example.com',
      password: 'password',
    })

    expect(result).toBe(true)
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user?.name).toBe('山田太郎')
    expect(authStore.user?.role).toBe('employee')
    expect(authStore.isAdmin).toBe(false)
  })

  it('管理者でログインできる', () => {
    const authStore = useAuthStore()

    const result = authStore.login({
      email: 'admin@example.com',
      password: 'password',
    })

    expect(result).toBe(true)
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user?.name).toBe('管理者権限')
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
    authStore.login({
      email: 'yamada@example.com',
      password: 'password',
    })

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
      email: 'yamada@example.com',
      password: 'password',
    })

    expect(localStorage.getItem('mock_auth')).toBe('true')
    expect(localStorage.getItem('mock_role')).toBe('employee')
    expect(localStorage.getItem('mock_user_id')).toBe('user001')
    expect(localStorage.getItem('mock_user_name')).toBe('山田太郎')
  })

  it('LocalStorageから認証状態を復元できる', () => {
    // LocalStorageに認証情報をセット
    localStorage.setItem('mock_auth', 'true')
    localStorage.setItem('mock_user_id', 'user001')

    const authStore = useAuthStore()
    authStore.checkAuth()

    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user?.name).toBe('山田太郎')
  })

  it('computed値が正しく計算される', () => {
    const authStore = useAuthStore()

    authStore.login({
      email: 'yamada@example.com',
      password: 'password',
    })

    expect(authStore.userName).toBe('山田太郎')
    expect(authStore.userEmail).toBe('yamada@example.com')
    expect(authStore.userId).toBe('user001')
  })

  it('rememberMeオプションが機能する', () => {
    const authStore = useAuthStore()

    authStore.login({
      email: 'yamada@example.com',
      password: 'password',
      rememberMe: true,
    })

    expect(localStorage.getItem('mock_remember')).toBe('true')
  })
})
