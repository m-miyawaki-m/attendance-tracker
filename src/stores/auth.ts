// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials } from '@/types'
import { mockUsers } from '@/data/mockData'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const token = ref<string | null>(null)

  // Getters
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')
  const userId = computed(() => user.value?.id || '')

  // Actions
  function login(credentials: LoginCredentials): boolean {
    // モック認証
    const foundUser = mockUsers.find((u) => u.email === credentials.email)

    if (foundUser) {
      user.value = foundUser
      isAuthenticated.value = true
      token.value = 'mock-token-' + foundUser.id

      // LocalStorageに保存
      localStorage.setItem('mock_auth', 'true')
      localStorage.setItem('mock_role', foundUser.role)
      localStorage.setItem('mock_user_id', foundUser.id)
      localStorage.setItem('mock_user_name', foundUser.name)

      if (credentials.rememberMe) {
        localStorage.setItem('mock_remember', 'true')
      }

      return true
    }

    return false
  }

  function logout(): void {
    user.value = null
    isAuthenticated.value = false
    token.value = null

    // LocalStorageをクリア（認証情報と位置情報を含む）
    localStorage.removeItem('mock_auth')
    localStorage.removeItem('mock_role')
    localStorage.removeItem('mock_user_id')
    localStorage.removeItem('mock_user_name')
    localStorage.removeItem('mock_remember')
    localStorage.removeItem('mock_checked_in')
    localStorage.removeItem('mock_checked_out')
    localStorage.removeItem('mock_checked_in_location')
    localStorage.removeItem('mock_checked_out_location')
    localStorage.removeItem('mock_attendance_date')
  }

  function checkAuth(): void {
    // LocalStorageから認証状態を復元
    const auth = localStorage.getItem('mock_auth')
    const userId = localStorage.getItem('mock_user_id')

    if (auth === 'true' && userId) {
      const foundUser = mockUsers.find((u) => u.id === userId)
      if (foundUser) {
        user.value = foundUser
        isAuthenticated.value = true
        token.value = 'mock-token-' + userId
      }
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    token,
    // Getters
    isAdmin,
    userName,
    userEmail,
    userId,
    // Actions
    login,
    logout,
    checkAuth,
  }
})
