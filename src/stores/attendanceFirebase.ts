// src/stores/attendanceFirebase.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Attendance, Location } from '@/types'

export const useAttendanceFirebaseStore = defineStore('attendanceFirebase', () => {
  // State
  const attendances = ref<Attendance[]>([])
  const todayAttendance = ref<Attendance | null>(null)
  const loading = ref(false)

  // Actions
  async function clockIn(
    userId: string,
    location: Location,
  ): Promise<{ success: boolean; attendanceId?: string; error?: string }> {
    try {
      loading.value = true

      const now = new Date()
      const today = now.toISOString().split('T')[0]

      // 今日の出勤記録がすでにあるかチェック
      const existingAttendance = await getTodayAttendance(userId)
      if (existingAttendance) {
        return {
          success: false,
          error: 'すでに本日の出勤打刻があります',
        }
      }

      // 出勤ステータスを判定（9:00以降は遅刻）
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const totalMinutes = hours * 60 + minutes
      const status = totalMinutes > 9 * 60 ? 'late' : 'present'

      // Firestoreに出勤記録を追加
      const docRef = await addDoc(collection(db, 'attendances'), {
        userId,
        date: today,
        checkIn: Timestamp.fromDate(now),
        checkInLocation: location,
        checkOut: null,
        checkOutLocation: null,
        workingMinutes: 0,
        status,
        note: '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      todayAttendance.value = {
        id: docRef.id,
        userId,
        date: today,
        checkIn: now,
        checkInLocation: location,
        checkOut: null,
        checkOutLocation: null,
        workingMinutes: 0,
        status,
        note: '',
        createdAt: now,
        updatedAt: now,
      }

      return { success: true, attendanceId: docRef.id }
    } catch (error) {
      console.error('Clock in error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '出勤打刻に失敗しました',
      }
    } finally {
      loading.value = false
    }
  }

  async function clockOut(
    userId: string,
    location: Location,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      loading.value = true

      const attendance = await getTodayAttendance(userId)
      if (!attendance) {
        return {
          success: false,
          error: '本日の出勤記録が見つかりません',
        }
      }

      if (attendance.checkOut) {
        return {
          success: false,
          error: 'すでに退勤打刻済みです',
        }
      }

      const now = new Date()
      const checkIn = attendance.checkIn
      const workingMinutes = Math.floor((now.getTime() - checkIn.getTime()) / 60000)

      // 退勤ステータスを判定（18:00前は早退）
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const totalMinutes = hours * 60 + minutes
      let status = attendance.status

      // すでに遅刻でない場合のみ早退チェック
      if (status !== 'late' && totalMinutes < 18 * 60) {
        status = 'early_leave'
      }

      // Firestoreの出勤記録を更新
      const attendanceRef = doc(db, 'attendances', attendance.id)
      await updateDoc(attendanceRef, {
        checkOut: Timestamp.fromDate(now),
        checkOutLocation: location,
        workingMinutes,
        status,
        updatedAt: Timestamp.now(),
      })

      todayAttendance.value = {
        ...attendance,
        checkOut: now,
        checkOutLocation: location,
        workingMinutes,
        status,
        updatedAt: now,
      }

      return { success: true }
    } catch (error) {
      console.error('Clock out error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '退勤打刻に失敗しました',
      }
    } finally {
      loading.value = false
    }
  }

  async function getTodayAttendance(userId: string): Promise<Attendance | null> {
    try {
      const today = new Date().toISOString().split('T')[0]

      const q = query(
        collection(db, 'attendances'),
        where('userId', '==', userId),
        where('date', '==', today),
      )

      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        return null
      }

      const docData = snapshot.docs[0]
      const data = docData.data()

      return {
        id: docData.id,
        userId: data.userId,
        date: data.date,
        checkIn: data.checkIn.toDate(),
        checkInLocation: data.checkInLocation,
        checkOut: data.checkOut?.toDate() || null,
        checkOutLocation: data.checkOutLocation || null,
        workingMinutes: data.workingMinutes,
        status: data.status,
        note: data.note,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error)
      return null
    }
  }

  async function fetchMonthlyAttendances(
    userId: string,
    year: number,
    month: number,
  ): Promise<void> {
    try {
      loading.value = true

      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59)

      const q = query(
        collection(db, 'attendances'),
        where('userId', '==', userId),
        where('checkIn', '>=', Timestamp.fromDate(startDate)),
        where('checkIn', '<=', Timestamp.fromDate(endDate)),
        orderBy('checkIn', 'desc'),
      )

      const snapshot = await getDocs(q)

      attendances.value = snapshot.docs.map((docData) => {
        const data = docData.data()
        return {
          id: docData.id,
          userId: data.userId,
          date: data.date,
          checkIn: data.checkIn.toDate(),
          checkInLocation: data.checkInLocation,
          checkOut: data.checkOut?.toDate() || null,
          checkOutLocation: data.checkOutLocation || null,
          workingMinutes: data.workingMinutes,
          status: data.status,
          note: data.note,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        }
      })
    } catch (error) {
      console.error('Error fetching monthly attendances:', error)
    } finally {
      loading.value = false
    }
  }

  async function loadTodayAttendance(userId: string): Promise<void> {
    todayAttendance.value = await getTodayAttendance(userId)
  }

  async function fetchAttendancesByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    try {
      loading.value = true

      const start = new Date(startDate + 'T00:00:00')
      const end = new Date(endDate + 'T23:59:59')

      const q = query(
        collection(db, 'attendances'),
        where('userId', '==', userId),
        where('checkIn', '>=', Timestamp.fromDate(start)),
        where('checkIn', '<=', Timestamp.fromDate(end)),
        orderBy('checkIn', 'desc'),
      )

      const snapshot = await getDocs(q)

      attendances.value = snapshot.docs.map((docData) => {
        const data = docData.data()
        return {
          id: docData.id,
          userId: data.userId,
          date: data.date,
          checkIn: data.checkIn.toDate(),
          checkInLocation: data.checkInLocation,
          checkOut: data.checkOut?.toDate() || null,
          checkOutLocation: data.checkOutLocation || null,
          workingMinutes: data.workingMinutes,
          status: data.status,
          note: data.note,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        }
      })
    } catch (error) {
      console.error('Error fetching attendances by date range:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    attendances,
    todayAttendance,
    loading,
    // Actions
    clockIn,
    clockOut,
    getTodayAttendance,
    fetchMonthlyAttendances,
    fetchAttendancesByDateRange,
    loadTodayAttendance,
  }
})