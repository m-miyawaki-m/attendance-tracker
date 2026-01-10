// src/constants/departments.ts

/**
 * 部署リスト
 *
 * @example
 * const allDepartments = DEPARTMENTS // ['営業部', '開発部', ...]
 */
export const DEPARTMENTS = [
  '営業部',
  '開発部',
  '総務部',
  '管理部',
  '人事部',
  '経理部',
  'マーケティング部',
] as const

/**
 * 部署の型定義
 */
export type Department = typeof DEPARTMENTS[number]
