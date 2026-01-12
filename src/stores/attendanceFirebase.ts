// src/stores/attendanceFirebase.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Attendance, Location } from '@/types'
import { logger } from '@/utils/logger'

export const useAttendanceFirebaseStore = defineStore('attendanceFirebase', () => {
  // State
  const attendances = ref<Attendance[]>([]) // 後方互換性のため残す
  const attendancesByUser = ref<Map<string, Attendance[]>>(new Map())
  const todayAttendance = ref<Attendance | null>(null)
  const loading = ref(false)

  // Actions
  async function clockIn(
    userId: string,
    location: Location,
  ): Promise<{ success: boolean; attendanceId?: string; error?: string }> {
    logger.debug('clockIn() 開始', { userId, location })
    try {
      loading.value = true

      const now = new Date()
      const today = now.toISOString().split('T')[0]

      // 今日の出勤記録がすでにあるかチェック
      const existingAttendance = await getTodayAttendance(userId)
      if (existingAttendance) {
        logger.warn('出勤打刻失敗: すでに本日の出勤記録あり', { userId, date: today })
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

      logger.info('Firestoreに出勤記録を追加中...', { userId, date: today, status })
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

      logger.info('出勤打刻完了', { attendanceId: docRef.id, status })
      logger.debug('clockIn() 終了')
      return { success: true, attendanceId: docRef.id }
    } catch (error) {
      logger.error('出勤打刻エラー', { userId, error })
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
    logger.debug('clockOut() 開始', { userId, location })
    try {
      loading.value = true

      const attendance = await getTodayAttendance(userId)
      if (!attendance) {
        logger.warn('退勤打刻失敗: 出勤記録なし', { userId })
        return {
          success: false,
          error: '本日の出勤記録が見つかりません',
        }
      }

      if (attendance.checkOut) {
        logger.warn('退勤打刻失敗: すでに退勤済み', { userId })
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

      logger.info('Firestoreの出勤記録を更新中...', { attendanceId: attendance.id, workingMinutes })
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

      logger.info('退勤打刻完了', { workingMinutes, status })
      logger.debug('clockOut() 終了')
      return { success: true }
    } catch (error) {
      logger.error('退勤打刻エラー', { userId, error })
      return {
        success: false,
        error: error instanceof Error ? error.message : '退勤打刻に失敗しました',
      }
    } finally {
      loading.value = false
    }
  }

  async function getTodayAttendance(userId: string): Promise<Attendance | null> {
    logger.debug('getTodayAttendance() 開始', { userId })
    try {
      const today = new Date().toISOString().split('T')[0]

      const q = query(
        collection(db, 'attendances'),
        where('userId', '==', userId),
        where('date', '==', today),
      )

      logger.info('Firestoreから本日の勤怠データを取得中...', { userId, date: today })
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        logger.debug('getTodayAttendance() 終了 - 記録なし')
        return null
      }

      const docData = snapshot.docs[0]
      const data = docData.data()

      logger.info('本日の勤怠データ取得完了', { attendanceId: docData.id })
      logger.debug('getTodayAttendance() 終了')
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
      logger.error('本日の勤怠データ取得エラー', { userId, error })
      return null
    }
  }

  async function fetchMonthlyAttendances(
    userId: string,
    year: number,
    month: number,
  ): Promise<void> {
    logger.debug('fetchMonthlyAttendances() 開始', { userId, year, month })
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

      logger.info('Firestoreから月間勤怠データを取得中...', { userId, year, month })
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
      logger.info('月間勤怠データ取得完了', { count: attendances.value.length })
      logger.debug('fetchMonthlyAttendances() 終了')
    } catch (error) {
      logger.error('月間勤怠データ取得エラー', { userId, year, month, error })
    } finally {
      loading.value = false
    }
  }

  async function loadTodayAttendance(userId: string): Promise<void> {
    logger.debug('loadTodayAttendance() 開始', { userId })
    todayAttendance.value = await getTodayAttendance(userId)
    logger.debug('loadTodayAttendance() 終了')
  }

  async function fetchAttendancesByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    logger.debug('fetchAttendancesByDateRange() 開始', { userId, startDate, endDate })
    try {
      loading.value = true

      // userIdのみでクエリし、日付範囲はクライアント側でフィルタリング
      // これによりFirestoreのインデックスが不要になる
      const q = query(collection(db, 'attendances'), where('userId', '==', userId))

      logger.info('Firestoreから勤怠データを取得中...', { userId })
      const snapshot = await getDocs(q)

      // 全データをマップ化（checkInが必須のため、欠けているレコードは除外）
      const allUserAttendances = snapshot.docs
        .filter((docData) => {
          const data = docData.data()
          if (!data.checkIn) {
            logger.warn('checkInフィールドが欠落しているレコードをスキップ', {
              attendanceId: docData.id,
            })
            return false
          }
          return true
        })
        .map((docData) => {
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

      // ユーザーごとのキャッシュに保存
      attendancesByUser.value.set(userId, allUserAttendances)

      // 日付範囲でフィルタリングしてソート（後方互換性のため）
      attendances.value = allUserAttendances
        .filter((att) => att.date >= startDate && att.date <= endDate)
        .sort((a, b) => b.date.localeCompare(a.date))

      logger.info('勤怠データをキャッシュに保存', { userId, totalCount: allUserAttendances.length })
      logger.debug('fetchAttendancesByDateRange() 終了')
    } catch (error) {
      logger.error('日付範囲指定の勤怠データ取得エラー', { userId, startDate, endDate, error })
    } finally {
      loading.value = false
    }
  }

  /**
   * ユーザーIDから勤怠データをキャッシュから取得
   *
   * @param userId - ユーザーID
   * @returns キャッシュされている場合は勤怠データの配列、なければundefined
   */
  function getAttendancesByUserFromCache(userId: string): Attendance[] | undefined {
    return attendancesByUser.value.get(userId)
  }

  /**
   * 特定ユーザーの特定日付範囲の勤怠データを取得（キャッシュ対応）
   *
   * @param userId - ユーザーID
   * @param startDate - YYYY-MM-DD形式の開始日
   * @param endDate - YYYY-MM-DD形式の終了日
   * @returns 勤怠データの配列
   */
  function getAttendancesByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Attendance[] {
    const cached = attendancesByUser.value.get(userId)
    if (!cached) return []

    return cached
      .filter((att) => att.date >= startDate && att.date <= endDate)
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  /**
   * 特定ユーザーのキャッシュをクリア
   *
   * @param userId - ユーザーID。指定しない場合は全てクリア
   */
  function clearCache(userId?: string): void {
    if (userId) {
      attendancesByUser.value.delete(userId)
      logger.info('勤怠キャッシュをクリア', { userId })
    } else {
      attendancesByUser.value.clear()
      attendances.value = []
      logger.info('全ての勤怠キャッシュをクリア')
    }
  }

  // Getters
  /**
   * キャッシュされているユーザー一覧
   */
  const cachedUserIds = computed(() => Array.from(attendancesByUser.value.keys()))

  /**
   * キャッシュされているデータの総数
   */
  const totalCachedRecords = computed(() => {
    let total = 0
    attendancesByUser.value.forEach((records) => {
      total += records.length
    })
    return total
  })

  return {
    // State
    attendances,
    attendancesByUser,
    todayAttendance,
    loading,
    // Getters
    cachedUserIds,
    totalCachedRecords,
    // Actions
    clockIn,
    clockOut,
    getTodayAttendance,
    fetchMonthlyAttendances,
    fetchAttendancesByDateRange,
    getAttendancesByUserFromCache,
    getAttendancesByDateRange,
    clearCache,
    loadTodayAttendance,
  }
})