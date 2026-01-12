// src/stores/adminAttendanceStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Attendance } from '@/types'
import { logger } from '@/utils/logger'

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
    logger.debug('fetchAttendancesByDate() 開始', { date })
    // キャッシュチェック
    if (attendancesByDate.value.has(date)) {
      logger.debug('キャッシュされた勤怠データを使用', { date })
      return attendancesByDate.value.get(date)!
    }

    try {
      loading.value = true
      error.value = null

      logger.info('Firestoreから日付別勤怠データを取得中...', { date })
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
      logger.info('日付別勤怠データ取得完了', { date, count: attendances.length })

      return attendances
    } catch (err) {
      logger.error('日付別勤怠データ取得エラー', { date, error: err })
      error.value = err instanceof Error ? err.message : '勤怠データの取得に失敗しました'
      throw err
    } finally {
      loading.value = false
      logger.debug('fetchAttendancesByDate() 終了')
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
    logger.debug('fetchAttendancesByDateRange() 開始', { startDate, endDate, userId })
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

      logger.info('Firestoreから日付範囲の勤怠データを取得中...', { startDate, endDate, userId })
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

      logger.info('日付範囲の勤怠データ取得完了', {
        startDate,
        endDate,
        count: attendances.length,
      })

      return attendances
    } catch (err) {
      logger.error('日付範囲の勤怠データ取得エラー', { startDate, endDate, userId, error: err })
      error.value = err instanceof Error ? err.message : '勤怠データの取得に失敗しました'
      throw err
    } finally {
      loading.value = false
      logger.debug('fetchAttendancesByDateRange() 終了')
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
      logger.info('日付別勤怠キャッシュをクリア', { date })
    } else {
      attendancesByDate.value.clear()
      logger.info('全ての勤怠キャッシュをクリア')
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
