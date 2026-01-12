// tests/unit/utils/logger.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  logger,
  getLogs,
  clearLogs,
  formatLogsAsText,
  getLogCount,
  getLogSize,
  onLogUpdate,
} from '@/utils/logger'
import type { LogEntry } from '@/utils/logger'

describe('logger', () => {
  let localStorageMock: Record<string, string>

  beforeEach(() => {
    // LocalStorageのモック
    localStorageMock = {}
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key) => localStorageMock[key] || null,
    )
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      localStorageMock[key] = value
    })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete localStorageMock[key]
    })

    // コンソール出力をモック
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // ログをクリア
    clearLogs()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('ログ出力', () => {
    it('logger.debug()でdebugレベルのログが記録される', () => {
      logger.debug('テストデバッグ', { key: 'value' })

      const logs = getLogs()
      expect(logs.length).toBe(1)
      expect(logs[0].level).toBe('debug')
      expect(logs[0].message).toBe('テストデバッグ')
      expect(logs[0].data).toEqual({ key: 'value' })
      expect(logs[0].timestamp).toBeDefined()
    })

    it('logger.info()でinfoレベルのログが記録される', () => {
      logger.info('テスト情報')

      const logs = getLogs()
      expect(logs.length).toBe(1)
      expect(logs[0].level).toBe('info')
      expect(logs[0].message).toBe('テスト情報')
    })

    it('logger.warn()でwarnレベルのログが記録される', () => {
      logger.warn('テスト警告')

      const logs = getLogs()
      expect(logs.length).toBe(1)
      expect(logs[0].level).toBe('warn')
      expect(logs[0].message).toBe('テスト警告')
    })

    it('logger.error()でerrorレベルのログが記録される', () => {
      logger.error('テストエラー')

      const logs = getLogs()
      expect(logs.length).toBe(1)
      expect(logs[0].level).toBe('error')
      expect(logs[0].message).toBe('テストエラー')
    })

    it('logger.log()はinfoレベルとして記録される', () => {
      logger.log('テストログ')

      const logs = getLogs()
      expect(logs.length).toBe(1)
      expect(logs[0].level).toBe('info')
    })

    it('データなしでログを記録できる', () => {
      logger.info('データなし')

      const logs = getLogs()
      expect(logs[0].data).toBeUndefined()
    })

    it('複数のログが正しい順序で記録される', () => {
      logger.info('1番目')
      logger.info('2番目')
      logger.info('3番目')

      const logs = getLogs()
      expect(logs.length).toBe(3)
      expect(logs[0].message).toBe('1番目')
      expect(logs[1].message).toBe('2番目')
      expect(logs[2].message).toBe('3番目')
    })
  })

  describe('ログ操作', () => {
    it('clearLogs()でログがクリアされる', () => {
      logger.info('テスト1')
      logger.info('テスト2')
      expect(getLogs().length).toBe(2)

      clearLogs()
      expect(getLogs().length).toBe(0)
    })

    it('getLogCount()で正しい件数が返される', () => {
      expect(getLogCount()).toBe(0)

      logger.info('テスト1')
      expect(getLogCount()).toBe(1)

      logger.info('テスト2')
      expect(getLogCount()).toBe(2)
    })

    it('getLogSize()でサイズが返される', () => {
      const initialSize = getLogSize()
      logger.info('テストメッセージ')
      expect(getLogSize()).toBeGreaterThan(initialSize)
    })
  })

  describe('フォーマット', () => {
    it('formatLogsAsText()でテキスト形式にフォーマットされる', () => {
      const logs: LogEntry[] = [
        {
          timestamp: '2024-01-15T10:00:00.000Z',
          level: 'info',
          message: 'テストメッセージ',
        },
        {
          timestamp: '2024-01-15T10:01:00.000Z',
          level: 'error',
          message: 'エラーメッセージ',
          data: { error: 'test' },
        },
      ]

      const text = formatLogsAsText(logs)
      expect(text).toContain('[2024-01-15T10:00:00.000Z] [INFO] テストメッセージ')
      expect(text).toContain('[2024-01-15T10:01:00.000Z] [ERROR] エラーメッセージ')
      expect(text).toContain('{"error":"test"}')
    })
  })

  describe('リスナー', () => {
    it('onLogUpdate()でログ更新を受け取れる', () => {
      const callback = vi.fn()
      const unsubscribe = onLogUpdate(callback)

      logger.info('テスト')
      expect(callback).toHaveBeenCalledTimes(1)

      logger.info('テスト2')
      expect(callback).toHaveBeenCalledTimes(2)

      unsubscribe()
    })

    it('unsubscribe後はコールバックが呼ばれない', () => {
      const callback = vi.fn()
      const unsubscribe = onLogUpdate(callback)

      logger.info('テスト1')
      expect(callback).toHaveBeenCalledTimes(1)

      unsubscribe()

      logger.info('テスト2')
      expect(callback).toHaveBeenCalledTimes(1) // 増えない
    })

    it('複数のリスナーを登録できる', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      const unsubscribe1 = onLogUpdate(callback1)
      const unsubscribe2 = onLogUpdate(callback2)

      logger.info('テスト')
      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledTimes(1)

      unsubscribe1()
      unsubscribe2()
    })
  })

  describe('LocalStorage', () => {
    it('ログがLocalStorageに保存される', () => {
      logger.info('保存テスト')

      expect(localStorageMock['app_logs']).toBeDefined()
      const stored = JSON.parse(localStorageMock['app_logs'])
      expect(stored.length).toBe(1)
      expect(stored[0].message).toBe('保存テスト')
    })

    it('LocalStorageからログを復元できる', () => {
      const existingLogs: LogEntry[] = [
        {
          timestamp: '2024-01-15T10:00:00.000Z',
          level: 'info',
          message: '既存ログ',
        },
      ]
      localStorageMock['app_logs'] = JSON.stringify(existingLogs)

      const logs = getLogs()
      expect(logs.length).toBe(1)
      expect(logs[0].message).toBe('既存ログ')
    })

    it('不正なJSONの場合は空配列を返す', () => {
      localStorageMock['app_logs'] = 'invalid json'

      const logs = getLogs()
      expect(logs).toEqual([])
    })
  })
})
