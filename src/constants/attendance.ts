// src/constants/attendance.ts
import type { StatusConfig } from '@/types'

/**
 * 勤怠ステータスの表示設定
 *
 * @example
 * const statusText = ATTENDANCE_STATUS['present'].text // '正常'
 * const statusColor = ATTENDANCE_STATUS['late'].color // 'warning'
 */
export const ATTENDANCE_STATUS: Record<string, StatusConfig> = {
  present: { text: '正常', color: 'success' },
  late: { text: '遅刻', color: 'warning' },
  early_leave: { text: '早退', color: 'info' },
  absent: { text: '欠勤', color: 'error' },
} as const

/**
 * 勤務時間の基準（分単位）
 *
 * @example
 * const isLate = currentMinutes > WORK_TIME_STANDARDS.START_TIME
 * const isEarlyLeave = currentMinutes < WORK_TIME_STANDARDS.END_TIME
 */
export const WORK_TIME_STANDARDS = {
  /** 始業時刻: 9:00 (540分) */
  START_TIME: 9 * 60,
  /** 終業時刻: 18:00 (1080分) */
  END_TIME: 18 * 60,
} as const
