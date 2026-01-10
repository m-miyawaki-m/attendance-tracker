// src/stores/adminAttendanceStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Attendance } from '@/types'

/**
 * 管理者向け勤怠データを管理するStore
 *
 * 複数ユーザーの勤怠データを日付ベースでキャッシュ管理します。
 * AdminAttendanceList、TeamView、DashboardViewなどで使用されます。
 */
export const useAdminAttendanceStore = defineStore('adminAttendance', () => {
  // State
  const attendancesByDate = ref<Map<string, Attendance[]>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  /**
   * キャッシュされている日付一覧
   */
  const cachedDates = computed(() => Array.from(attendancesByDate.value.keys()))

  /**
   * キャッシュされているデータの総数
   */
  const totalCachedRecords = computed(() => {
    let total = 0
    attendancesByDate.value.forEach((records) => {
      total += records.length
    })
    return total
  })

  // Actions
  /**
   * 特定日付の全従業員の勤怠データを取得
   *
   * @param date - YYYY-MM-DD形式の日付
   * @returns 勤怠データの配列
   */
  async function fetchAttendancesByDate(date: string): Promise<Attendance[]> {
    // キャッシュチェック
    if (attendancesByDate.value.has(date)) {
      console.log(`Using cached attendance data for ${date}`)
      return attendancesByDate.value.get(date)!
    }

    try {
      loading.value = true
      error.value = null

      const q = query(collection(db, 'attendances'), where('date', '==', date))
      const snapshot = await getDocs(q)

      const attendances = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId,
          date: data.date,
          checkIn: data.checkIn?.toDate(),
          checkInLocation: data.checkInLocation,
          checkOut: data.checkOut?.toDate() || null,
          checkOutLocation: data.checkOutLocation || null,
          workingMinutes: data.workingMinutes,
          status: data.status,
          note: data.note,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        }
      }) as Attendance[]

      attendancesByDate.value.set(date, attendances)
      console.log(`Fetched ${attendances.length} attendance records for ${date}`)

      return attendances
    } catch (err) {
      console.error('Error fetching attendances:', err)
      error.value = err instanceof Error ? err.message : '勤怠データの取得に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 日付範囲で勤怠データを取得
   *
   * @param startDate - YYYY-MM-DD形式の開始日
   * @param endDate - YYYY-MM-DD形式の終了日
   * @param userId - 指定した場合、特定ユーザーのデータのみ取得
   * @returns 勤怠データの配列
   */
  async function fetchAttendancesByDateRange(
    startDate: string,
    endDate: string,
    userId?: string,
  ): Promise<Attendance[]> {
    try {
      loading.value = true
      error.value = null

      const start = Timestamp.fromDate(new Date(startDate + 'T00:00:00'))
      const end = Timestamp.fromDate(new Date(endDate + 'T23:59:59'))

      let q = query(
        collection(db, 'attendances'),
        where('checkIn', '>=', start),
        where('checkIn', '<=', end),
      )

      // 特定ユーザーのみの場合（注意: Firestoreの制約により、別クエリが必要な場合あり）
      if (userId) {
        q = query(
          collection(db, 'attendances'),
          where('userId', '==', userId),
          where('checkIn', '>=', start),
          where('checkIn', '<=', end),
        )
      }

      const snapshot = await getDocs(q)

      const attendances = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId,
          date: data.date,
          checkIn: data.checkIn?.toDate(),
          checkInLocation: data.checkInLocation,
          checkOut: data.checkOut?.toDate() || null,
          checkOutLocation: data.checkOutLocation || null,
          workingMinutes: data.workingMinutes,
          status: data.status,
          note: data.note,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        }
      }) as Attendance[]

      console.log(
        `Fetched ${attendances.length} attendance records from ${startDate} to ${endDate}`,
      )

      return attendances
    } catch (err) {
      console.error('Error fetching attendances by date range:', err)
      error.value = err instanceof Error ? err.message : '勤怠データの取得に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 特定日付の勤怠データをキャッシュから取得
   *
   * @param date - YYYY-MM-DD形式の日付
   * @returns キャッシュされている場合は勤怠データの配列、なければundefined
   */
  function getAttendancesByDateFromCache(date: string): Attendance[] | undefined {
    return attendancesByDate.value.get(date)
  }

  /**
   * 特定ユーザーの特定日付の勤怠データを取得
   *
   * @param userId - ユーザーID
   * @param date - YYYY-MM-DD形式の日付
   * @returns 見つかった場合は勤怠データ、なければnull
   */
  function getUserAttendanceByDate(userId: string, date: string): Attendance | null {
    const dateAttendances = attendancesByDate.value.get(date)
    if (!dateAttendances) return null

    return dateAttendances.find((att) => att.userId === userId) || null
  }

  /**
   * 特定日付のキャッシュをクリア
   *
   * @param date - YYYY-MM-DD形式の日付。指定しない場合は全てクリア
   */
  function clearCache(date?: string): void {
    if (date) {
      attendancesByDate.value.delete(date)
      console.log(`Cleared cache for ${date}`)
    } else {
      attendancesByDate.value.clear()
      console.log('Cleared all attendance cache')
    }
    error.value = null
  }

  /**
   * 勤怠データを強制的に再取得
   *
   * @param date - YYYY-MM-DD形式の日付
   * @returns 勤怠データの配列
   */
  async function refreshAttendances(date: string): Promise<Attendance[]> {
    clearCache(date)
    return await fetchAttendancesByDate(date)
  }

  return {
    // State
    attendancesByDate,
    loading,
    error,
    // Getters
    cachedDates,
    totalCachedRecords,
    // Actions
    fetchAttendancesByDate,
    fetchAttendancesByDateRange,
    getAttendancesByDateFromCache,
    getUserAttendanceByDate,
    clearCache,
    refreshAttendances,
  }
})
