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
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      firebaseUser.value = userCredential.user
      await fetchUserData(userCredential.user.uid)
      isAuthenticated.value = true
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  async function logout(): Promise<void> {
    try {
      await signOut(auth)
      user.value = null
      firebaseUser.value = null
      isAuthenticated.value = false
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  async function fetchUserData(uid: string): Promise<void> {
    try {
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
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  function initAuthListener(): void {
    onAuthStateChanged(auth, async (firebaseUserData) => {
      loading.value = true
      firebaseUser.value = firebaseUserData

      if (firebaseUserData) {
        await fetchUserData(firebaseUserData.uid)
        isAuthenticated.value = true
      } else {
        user.value = null
        isAuthenticated.value = false
      }

      loading.value = false
    })
  }

  function checkAuth(): void {
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