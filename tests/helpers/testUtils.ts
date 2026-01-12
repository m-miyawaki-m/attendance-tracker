// tests/helpers/testUtils.ts
// テスト用のユーティリティ関数とVuetifyセットアップ

import { mount, type MountingOptions, type VueWrapper } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import type { Component } from 'vue'
import { vi } from 'vitest'

/**
 * テスト用のVuetifyインスタンスを作成
 */
export function createTestVuetify() {
  return createVuetify({
    components,
    directives,
  })
}

/**
 * Vuetifyコンポーネントをマウントするためのヘルパー
 * Vuetifyの警告を防ぐために必要なプラグインを自動的に設定
 */
export function mountWithVuetify<T extends Component>(
  component: T,
  options: MountingOptions<T> = {},
): VueWrapper {
  const vuetify = createTestVuetify()
  const pinia = createPinia()
  setActivePinia(pinia)

  return mount(component, {
    global: {
      plugins: [vuetify, pinia],
      stubs: {
        // 必要に応じてスタブを追加
      },
      ...options.global,
    },
    ...options,
  })
}

/**
 * Piniaストアをテスト用にセットアップ
 */
export function setupTestPinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * LocalStorageのモック
 */
export function createLocalStorageMock() {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] || null,
  }
}

/**
 * LocalStorageをモックに置き換え
 */
export function mockLocalStorage() {
  const mock = createLocalStorageMock()
  Object.defineProperty(window, 'localStorage', {
    value: mock,
    writable: true,
  })
  return mock
}

/**
 * テスト用の日付を固定
 */
export function mockDate(date: Date | string) {
  const fixedDate = new Date(date)
  vi.useFakeTimers()
  vi.setSystemTime(fixedDate)
  return () => vi.useRealTimers()
}

/**
 * console出力をキャプチャするユーティリティ
 */
export function captureConsole() {
  const logs: { level: string; args: unknown[] }[] = []

  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  }

  console.log = (...args) => logs.push({ level: 'log', args })
  console.info = (...args) => logs.push({ level: 'info', args })
  console.warn = (...args) => logs.push({ level: 'warn', args })
  console.error = (...args) => logs.push({ level: 'error', args })
  console.debug = (...args) => logs.push({ level: 'debug', args })

  return {
    logs,
    restore: () => {
      console.log = originalConsole.log
      console.info = originalConsole.info
      console.warn = originalConsole.warn
      console.error = originalConsole.error
      console.debug = originalConsole.debug
    },
  }
}
