// src/utils/logger.ts
// コンソールログをLocalStorageに蓄積し、ダウンロード可能にするユーティリティ

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: unknown
}

const STORAGE_KEY = 'app_logs'
const MAX_LOGS = 1000 // 最大保存件数
const MAX_STORAGE_SIZE = 4 * 1024 * 1024 // 4MB（LocalStorageの安全な上限）

/**
 * ログをLocalStorageから取得
 */
export function getLogs(): LogEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * ログをLocalStorageに保存
 */
function saveLogs(logs: LogEntry[]): void {
  try {
    const json = JSON.stringify(logs)
    // サイズチェック
    if (json.length > MAX_STORAGE_SIZE) {
      // 古いログを削除して再試行
      const trimmedLogs = logs.slice(-Math.floor(MAX_LOGS / 2))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedLogs))
    } else {
      localStorage.setItem(STORAGE_KEY, json)
    }
  } catch (e) {
    // LocalStorageが使えない場合は無視
    console.warn('Failed to save logs to localStorage:', e)
  }
}

/**
 * ログエントリを追加
 */
function addLogEntry(level: LogLevel, message: string, data?: unknown): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data: data !== undefined ? data : undefined,
  }

  const logs = getLogs()
  logs.push(entry)

  // 最大件数を超えたら古いログを削除
  if (logs.length > MAX_LOGS) {
    logs.splice(0, logs.length - MAX_LOGS)
  }

  saveLogs(logs)
}

/**
 * ログをクリア
 */
export function clearLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 無視
  }
}

/**
 * ログをテキスト形式でフォーマット
 */
export function formatLogsAsText(logs: LogEntry[]): string {
  return logs
    .map((log) => {
      const dataStr = log.data !== undefined ? ` | ${JSON.stringify(log.data)}` : ''
      return `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${dataStr}`
    })
    .join('\n')
}

/**
 * ログをJSONファイルとしてダウンロード
 */
export function downloadLogsAsJson(): void {
  const logs = getLogs()
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `app-logs-${getTimestampForFilename()}.json`)
}

/**
 * ログをテキストファイルとしてダウンロード
 */
export function downloadLogsAsText(): void {
  const logs = getLogs()
  const text = formatLogsAsText(logs)
  const blob = new Blob([text], { type: 'text/plain' })
  downloadBlob(blob, `app-logs-${getTimestampForFilename()}.txt`)
}

/**
 * Blobをダウンロード
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * ファイル名用のタイムスタンプを生成
 */
function getTimestampForFilename(): string {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

/**
 * ログの件数を取得
 */
export function getLogCount(): number {
  return getLogs().length
}

/**
 * ログのサイズ（バイト）を取得
 */
export function getLogSize(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? new Blob([stored]).size : 0
  } catch {
    return 0
  }
}

/**
 * ロガーオブジェクト
 * console.log等の代わりに使用
 */
export const logger = {
  debug(message: string, data?: unknown): void {
    addLogEntry('debug', message, data)
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, data !== undefined ? data : '')
    }
  },

  info(message: string, data?: unknown): void {
    addLogEntry('info', message, data)
    console.info(`[INFO] ${message}`, data !== undefined ? data : '')
  },

  warn(message: string, data?: unknown): void {
    addLogEntry('warn', message, data)
    console.warn(`[WARN] ${message}`, data !== undefined ? data : '')
  },

  error(message: string, data?: unknown): void {
    addLogEntry('error', message, data)
    console.error(`[ERROR] ${message}`, data !== undefined ? data : '')
  },

  /**
   * console.logと同じように使用（infoレベルとして記録）
   */
  log(message: string, data?: unknown): void {
    this.info(message, data)
  },
}

export default logger
