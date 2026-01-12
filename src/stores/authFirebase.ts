// src/stores/authFirebase.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import type { User } from '@/types'
import { logger } from '@/utils/logger'

export const useAuthFirebaseStore = defineStore('authFirebase', () => {
  // State
  const user = ref<User | null>(null)
  const firebaseUser = ref<FirebaseUser | null>(null)
  const isAuthenticated = ref(false)
  const loading = ref(true)

  // Getters
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')
  const userId = computed(() => user.value?.id || '')

  // Actions
  async function login(email: string, password: string): Promise<boolean> {
    logger.debug('login() 開始', { email })
    try {
      logger.info('Firebase認証を実行中...', { email })
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      firebaseUser.value = userCredential.user
      logger.info('Firebase認証成功', { uid: userCredential.user.uid })
      await fetchUserData(userCredential.user.uid)
      isAuthenticated.value = true
      logger.debug('login() 終了 - 成功')
      return true
    } catch (error) {
      logger.error('ログインエラー', { email, error })
      logger.debug('login() 終了 - 失敗')
      return false
    }
  }

  async function logout(): Promise<void> {
    logger.debug('logout() 開始')
    try {
      logger.info('ログアウト処理を実行中...')
      await signOut(auth)
      user.value = null
      firebaseUser.value = null
      isAuthenticated.value = false
      logger.info('ログアウト完了')
      logger.debug('logout() 終了')
    } catch (error) {
      logger.error('ログアウトエラー', error)
    }
  }

  async function fetchUserData(uid: string): Promise<void> {
    logger.debug('fetchUserData() 開始', { uid })
    try {
      logger.info('Firestoreからユーザーデータを取得中...', { uid })
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        user.value = {
          id: uid,
          name: data.name,
          email: data.email,
          role: data.role,
          department: data.department,
          position: data.position,
          employeeNumber: data.employeeNumber,
          managerId: data.managerId,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        }
        logger.info('ユーザーデータ取得完了', { name: data.name, role: data.role })
      } else {
        logger.warn('ユーザードキュメントが見つかりません', { uid })
      }
      logger.debug('fetchUserData() 終了')
    } catch (error) {
      logger.error('ユーザーデータ取得エラー', { uid, error })
    }
  }

  function initAuthListener(): void {
    logger.debug('initAuthListener() 開始')
    logger.info('Firebase認証リスナーを初期化中...')
    onAuthStateChanged(auth, async (firebaseUserData) => {
      loading.value = true
      firebaseUser.value = firebaseUserData

      if (firebaseUserData) {
        logger.info('認証状態変更: ログイン済み', { uid: firebaseUserData.uid })
        await fetchUserData(firebaseUserData.uid)
        isAuthenticated.value = true
      } else {
        logger.info('認証状態変更: 未ログイン')
        user.value = null
        isAuthenticated.value = false
      }

      loading.value = false
    })
    logger.debug('initAuthListener() 終了')
  }

  function checkAuth(): void {
    logger.debug('checkAuth() 呼び出し - initAuthListenerで処理')
    // Firebase Auth の onAuthStateChanged を使用するため、
    // この関数は互換性のために残していますが、実際の処理は initAuthListener で行われます
  }

  return {
    // State
    user,
    firebaseUser,
    isAuthenticated,
    loading,
    // Getters
    isAdmin,
    userName,
    userEmail,
    userId,
    // Actions
    login,
    logout,
    checkAuth,
    initAuthListener,
  }
})