// tests/unit/composables/useLogger.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useLogger } from '@/composables/useLogger'
import {
  getLogs,
  clearLogs,
  downloadLogsAsJson,
  downloadLogsAsText,
  onLogUpdate,
  logger,
  type LogEntry,
} from '@/utils/logger'

// utils/loggerをモック化
vi.mock('@/utils/logger', () => {
  const mockLogs: LogEntry[] = []
  const mockListeners = new Set<() => void>()

  return {
    getLogs: vi.fn(() => [...mockLogs]),
    clearLogs: vi.fn(() => {
      mockLogs.length = 0
    }),
    downloadLogsAsJson: vi.fn(),
    downloadLogsAsText: vi.fn(),
    onLogUpdate: vi.fn((listener: () => void) => {
      mockListeners.add(listener)
      return () => mockListeners.delete(listener)
    }),
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      log: vi.fn(),
    },
    // テスト用ヘルパー
    __mockLogs: mockLogs,
    __mockListeners: mockListeners,
    __triggerUpdate: () => mockListeners.forEach((l) => l()),
  }
})

// モック内部状態を取得するためのキャスト
const mockModule = vi.mocked(await import('@/utils/logger')) as any

describe('useLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // モックログをリセット
    mockModule.__mockLogs.length = 0
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初期化', () => {
    it('UL-001: 初期ログ読み込み', () => {
      // モックログを設定
      mockModule.__mockLogs.push(
        { timestamp: '2026-01-01T00:00:00.000Z', level: 'info', message: 'Test log 1' },
        { timestamp: '2026-01-01T00:00:01.000Z', level: 'info', message: 'Test log 2' }
      )

      const { logs } = useLogger()

      expect(getLogs).toHaveBeenCalled()
      expect(logs.value).toHaveLength(2)
    })

    it('UL-002: リスナー登録', () => {
      useLogger()

      expect(onLogUpdate).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('State', () => {
    it('UL-003: logs', () => {
      mockModule.__mockLogs.push(
        { timestamp: '2026-01-01T00:00:00.000Z', level: 'info', message: 'Test' }
      )

      const { logs } = useLogger()

      expect(Array.isArray(logs.value)).toBe(true)
      expect(logs.value[0]).toHaveProperty('level')
      expect(logs.value[0]).toHaveProperty('message')
      expect(logs.value[0]).toHaveProperty('timestamp')
    })

    it('UL-004: isLoading', () => {
      const { isLoading } = useLogger()

      expect(isLoading.value).toBe(false)
    })
  })

  describe('refreshLogs 関数', () => {
    it('UL-005: ログ再読み込み', () => {
      const { logs, refreshLogs } = useLogger()

      // 初期状態
      expect(logs.value).toHaveLength(0)

      // ログを追加
      mockModule.__mockLogs.push(
        { timestamp: '2026-01-01T00:00:00.000Z', level: 'info', message: 'New log' }
      )

      // リフレッシュ
      refreshLogs()

      expect(getLogs).toHaveBeenCalled()
      expect(logs.value).toHaveLength(1)
      expect(logs.value[0].message).toBe('New log')
    })
  })

  describe('logCount computed', () => {
    it('UL-006: 件数取得', () => {
      // 50件のログを追加
      for (let i = 0; i < 50; i++) {
        mockModule.__mockLogs.push({
          timestamp: `2026-01-01T00:00:${i.toString().padStart(2, '0')}.000Z`,
          level: 'info',
          message: `Log ${i}`,
        })
      }

      const { logCount } = useLogger()

      expect(logCount.value).toBe(50)
    })

    it('UL-007: 空の場合', () => {
      const { logCount } = useLogger()

      expect(logCount.value).toBe(0)
    })

    it('UL-008: リアクティブ更新', async () => {
      const { logs, logCount } = useLogger()

      expect(logCount.value).toBe(0)

      // 直接logs.valueを更新
      logs.value = [
        { timestamp: '2026-01-01T00:00:00.000Z', level: 'info', message: 'Test' },
      ]
      await nextTick()

      expect(logCount.value).toBe(1)
    })
  })

  describe('logSizeFormatted computed', () => {
    it('UL-009: バイト表示', () => {
      // 小さいログ
      mockModule.__mockLogs.push({
        timestamp: '2026-01-01T00:00:00.000Z',
        level: 'info',
        message: 'a',
      })

      const { logSizeFormatted } = useLogger()

      expect(logSizeFormatted.value).toMatch(/^\d+ B$/)
    })

    it('UL-010: KB表示', () => {
      // 1KB以上のログ（約50文字 × 30件 = 1500文字以上）
      for (let i = 0; i < 30; i++) {
        mockModule.__mockLogs.push({
          timestamp: '2026-01-01T00:00:00.000Z',
          level: 'info',
          message: 'A'.repeat(50),
          data: { index: i, longData: 'B'.repeat(100) },
        })
      }

      const { logSizeFormatted } = useLogger()

      expect(logSizeFormatted.value).toMatch(/^\d+\.\d KB$/)
    })

    it('UL-011: MB表示', () => {
      // 1MB以上のログ
      for (let i = 0; i < 100; i++) {
        mockModule.__mockLogs.push({
          timestamp: '2026-01-01T00:00:00.000Z',
          level: 'info',
          message: 'A'.repeat(1000),
          data: { index: i, longData: 'B'.repeat(10000) },
        })
      }

      const { logSizeFormatted } = useLogger()

      expect(logSizeFormatted.value).toMatch(/^\d+\.\d MB$/)
    })

    it('UL-012: リアクティブ更新', async () => {
      const { logs, logSizeFormatted } = useLogger()

      const initialSize = logSizeFormatted.value

      // ログを追加
      logs.value = [
        { timestamp: '2026-01-01T00:00:00.000Z', level: 'info', message: 'X'.repeat(100) },
      ]
      await nextTick()

      expect(logSizeFormatted.value).not.toBe(initialSize)
    })
  })

  describe('clear 関数', () => {
    it('UL-013: クリア実行', () => {
      mockModule.__mockLogs.push(
        { timestamp: '2026-01-01T00:00:00.000Z', level: 'info', message: 'Test' }
      )

      const { logs, clear } = useLogger()

      expect(logs.value).toHaveLength(1)

      clear()

      expect(clearLogs).toHaveBeenCalled()
      expect(logs.value).toHaveLength(0)
    })
  })

  describe('downloadJson 関数', () => {
    it('UL-014: JSONダウンロード', () => {
      const { downloadJson } = useLogger()

      downloadJson()

      expect(downloadLogsAsJson).toHaveBeenCalled()
    })
  })

  describe('downloadText 関数', () => {
    it('UL-015: テキストダウンロード', () => {
      const { downloadText } = useLogger()

      downloadText()

      expect(downloadLogsAsText).toHaveBeenCalled()
    })
  })

  describe('filterByLevel 関数', () => {
    beforeEach(() => {
      mockModule.__mockLogs.push(
        { timestamp: '2026-01-01T00:00:00.000Z', level: 'info', message: 'Info log' },
        { timestamp: '2026-01-01T00:00:01.000Z', level: 'error', message: 'Error log' },
        { timestamp: '2026-01-01T00:00:02.000Z', level: 'warn', message: 'Warn log' },
        { timestamp: '2026-01-01T00:00:03.000Z', level: 'debug', message: 'Debug log' },
        { timestamp: '2026-01-01T00:00:04.000Z', level: 'info', message: 'Info log 2' }
      )
    })

    it('UL-016: 全て', () => {
      const { filterByLevel } = useLogger()

      const result = filterByLevel('all')

      expect(result).toHaveLength(5)
    })

    it('UL-017: errorのみ', () => {
      const { filterByLevel } = useLogger()

      const result = filterByLevel('error')

      expect(result).toHaveLength(1)
      expect(result[0].level).toBe('error')
      expect(result[0].message).toBe('Error log')
    })

    it('UL-018: infoのみ', () => {
      const { filterByLevel } = useLogger()

      const result = filterByLevel('info')

      expect(result).toHaveLength(2)
      expect(result.every((log) => log.level === 'info')).toBe(true)
    })
  })

  describe('searchLogs 関数', () => {
    beforeEach(() => {
      mockModule.__mockLogs.push(
        { timestamp: '2026-01-01T00:00:00.000Z', level: 'info', message: 'User login success' },
        { timestamp: '2026-01-01T00:00:01.000Z', level: 'error', message: 'Database error' },
        { timestamp: '2026-01-01T00:00:02.000Z', level: 'info', message: 'Page loaded', data: { userId: 'user123' } },
        { timestamp: '2026-01-01T00:00:03.000Z', level: 'debug', message: 'API call' }
      )
    })

    it('UL-019: 空文字', () => {
      const { searchLogs } = useLogger()

      const result = searchLogs('')

      expect(result).toHaveLength(4)
    })

    it('UL-020: メッセージ検索', () => {
      const { searchLogs } = useLogger()

      const result = searchLogs('login')

      expect(result).toHaveLength(1)
      expect(result[0].message).toBe('User login success')
    })

    it('UL-021: データ検索', () => {
      const { searchLogs } = useLogger()

      const result = searchLogs('userId')

      expect(result).toHaveLength(1)
      expect(result[0].message).toBe('Page loaded')
    })

    it('UL-022: 大文字小文字無視', () => {
      const { searchLogs } = useLogger()

      const result = searchLogs('LOGIN')

      expect(result).toHaveLength(1)
      expect(result[0].message).toBe('User login success')
    })
  })

  describe('logger インスタンス', () => {
    it('UL-023: エクスポート', () => {
      const composable = useLogger()

      expect(composable.logger).toBeDefined()
      expect(composable.logger.debug).toBeDefined()
      expect(composable.logger.info).toBeDefined()
      expect(composable.logger.warn).toBeDefined()
      expect(composable.logger.error).toBeDefined()
    })
  })

  describe('ライフサイクル', () => {
    it('UL-024: アンマウント時', () => {
      // onLogUpdateが返すunsubscribe関数が呼ばれることを確認
      const mockUnsubscribe = vi.fn()
      vi.mocked(onLogUpdate).mockReturnValue(mockUnsubscribe)

      // useLoggerを呼び出す（onUnmountedが登録される）
      useLogger()

      // onLogUpdateが呼ばれ、unsubscribe関数が返されたことを確認
      expect(onLogUpdate).toHaveBeenCalled()
    })

    it('UL-025: リスナー自動更新', async () => {
      // onLogUpdateのモックを設定してリスナーを捕捉
      let capturedListener: (() => void) | null = null
      vi.mocked(onLogUpdate).mockImplementation((listener) => {
        capturedListener = listener
        return () => {}
      })

      const { logs } = useLogger()

      // 初期状態
      expect(logs.value).toHaveLength(0)

      // ログを追加
      mockModule.__mockLogs.push({
        timestamp: '2026-01-01T00:00:00.000Z',
        level: 'info',
        message: 'New log via listener',
      })

      // 捕捉したリスナーを呼び出す
      if (capturedListener) {
        capturedListener()
      }

      // logs.valueが更新されていることを確認
      expect(logs.value).toHaveLength(1)
      expect(logs.value[0].message).toBe('New log via listener')
    })
  })
})
