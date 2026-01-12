// src/composables/useLogger.ts
// ログ機能を提供するComposable

import { ref, computed, onUnmounted } from 'vue'
import {
  logger,
  getLogs,
  clearLogs,
  downloadLogsAsJson,
  downloadLogsAsText,
  onLogUpdate,
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

  // ログ更新時に自動的にリフレッシュ
  const unsubscribe = onLogUpdate(() => {
    logs.value = getLogs()
  })

  // コンポーネントがアンマウントされたらリスナーを解除
  onUnmounted(() => {
    unsubscribe()
  })

  /**
   * ログの件数（logs.valueに依存してリアクティブに更新）
   */
  const logCount = computed(() => logs.value.length)

  /**
   * ログのサイズ（人間が読みやすい形式、logs.valueに依存）
   */
  const logSizeFormatted = computed(() => {
    // logs.valueを参照することでリアクティブにする
    const size = JSON.stringify(logs.value).length
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
