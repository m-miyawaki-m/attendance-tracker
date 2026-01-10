// src/stores/userStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { User } from '@/types'

/**
 * ユーザー情報を管理するStore
 *
 * Firebase Firestoreの`users`コレクションからユーザーデータを取得・管理します。
 * キャッシュ機能により、5分間は同じデータを再利用します。
 */
export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([])
  const loading = ref(false)
  const lastFetched = ref<Date | null>(null)
  const error = ref<string | null>(null)

  // Getters
  /**
   * 従業員（role: 'employee'）のみを取得
   */
  const employees = computed(() => users.value.filter((u) => u.role === 'employee'))

  /**
   * 管理者（role: 'admin'）のみを取得
   */
  const admins = computed(() => users.value.filter((u) => u.role === 'admin'))

  /**
   * 主任（position: '主任'）の従業員のみを取得
   */
  const managers = computed(() =>
    employees.value.filter((u) => u.position === '主任'),
  )

  /**
   * 部署ごとにグループ化されたユーザー
   */
  const usersByDepartment = computed(() => {
    const grouped = new Map<string, User[]>()
    users.value.forEach((user) => {
      const dept = user.department
      if (!grouped.has(dept)) {
        grouped.set(dept, [])
      }
      grouped.get(dept)!.push(user)
    })
    return grouped
  })

  // Actions
  /**
   * Firestoreからユーザー一覧を取得
   *
   * @param forceRefresh - trueの場合、キャッシュを無視して強制的に再取得
   */
  async function fetchUsers(forceRefresh = false): Promise<void> {
    // キャッシュチェック: 5分以内なら再利用
    if (!forceRefresh && users.value.length > 0 && lastFetched.value) {
      const cacheAge = Date.now() - lastFetched.value.getTime()
      const CACHE_DURATION = 5 * 60 * 1000 // 5分
      if (cacheAge < CACHE_DURATION) {
        console.log('Using cached user data')
        return
      }
    }

    try {
      loading.value = true
      error.value = null

      const snapshot = await getDocs(collection(db, 'users'))
      users.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email,
        role: doc.data().role,
        department: doc.data().department,
        position: doc.data().position,
        employeeNumber: doc.data().employeeNumber,
        managerId: doc.data().managerId,
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as User[]

      lastFetched.value = new Date()
      console.log('Fetched users from Firestore:', users.value.length)
    } catch (err) {
      console.error('Error fetching users:', err)
      error.value = err instanceof Error ? err.message : 'ユーザー情報の取得に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * ユーザーIDから特定のユーザーを取得
   *
   * @param userId - ユーザーID
   * @returns 見つかった場合はUserオブジェクト、見つからない場合はundefined
   */
  function getUserById(userId: string): User | undefined {
    return users.value.find((u) => u.id === userId)
  }

  /**
   * 指定された主任の配下のチームメンバーを取得
   *
   * @param managerId - 主任のユーザーID
   * @returns チームメンバーの配列
   */
  function getTeamMembers(managerId: string): User[] {
    return employees.value.filter((u) => u.managerId === managerId)
  }

  /**
   * 部署名から所属ユーザーを取得
   *
   * @param departmentName - 部署名
   * @returns 所属ユーザーの配列
   */
  function getUsersByDepartment(departmentName: string): User[] {
    return users.value.filter((u) => u.department === departmentName)
  }

  /**
   * キャッシュをクリア（強制的に再取得させたい場合に使用）
   */
  function clearCache(): void {
    users.value = []
    lastFetched.value = null
    error.value = null
  }

  return {
    // State
    users,
    loading,
    lastFetched,
    error,
    // Getters
    employees,
    admins,
    managers,
    usersByDepartment,
    // Actions
    fetchUsers,
    getUserById,
    getTeamMembers,
    getUsersByDepartment,
    clearCache,
  }
})
