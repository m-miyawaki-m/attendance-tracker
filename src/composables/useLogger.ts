// src/composables/useLogger.ts
// ログ機能を提供するComposable

import { ref, computed } from 'vue'
import {
  logger,
  getLogs,
  clearLogs,
  downloadLogsAsJson,
  downloadLogsAsText,
  getLogCount,
  getLogSize,
  type LogEntry,
  type LogLevel,
} from '@/utils/logger'

export function useLogger() {
  const logs = ref<LogEntry[]>([])
  const isLoading = ref(false)

  /**
   * ログを再読み込み
   */
  function refreshLogs(): void {
    logs.value = getLogs()
  }

  /**
   * ログの件数
   */
  const logCount = computed(() => getLogCount())

  /**
   * ログのサイズ（人間が読みやすい形式）
   */
  const logSizeFormatted = computed(() => {
    const size = getLogSize()
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / 1024 / 1024).toFixed(1)} MB`
  })

  /**
   * ログをクリア
   */
  function clear(): void {
    clearLogs()
    logs.value = []
  }

  /**
   * JSONとしてダウンロード
   */
  function downloadJson(): void {
    downloadLogsAsJson()
  }

  /**
   * テキストとしてダウンロード
   */
  function downloadText(): void {
    downloadLogsAsText()
  }

  /**
   * レベルでフィルタリング
   */
  function filterByLevel(level: LogLevel | 'all'): LogEntry[] {
    if (level === 'all') return logs.value
    return logs.value.filter((log) => log.level === level)
  }

  /**
   * キーワードで検索
   */
  function searchLogs(keyword: string): LogEntry[] {
    if (!keyword) return logs.value
    const lowerKeyword = keyword.toLowerCase()
    return logs.value.filter(
      (log) =>
        log.message.toLowerCase().includes(lowerKeyword) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(lowerKeyword)),
    )
  }

  // 初期読み込み
  refreshLogs()

  return {
    // State
    logs,
    isLoading,
    // Computed
    logCount,
    logSizeFormatted,
    // Actions
    refreshLogs,
    clear,
    downloadJson,
    downloadText,
    filterByLevel,
    searchLogs,
    // Logger instance
    logger,
  }
}
