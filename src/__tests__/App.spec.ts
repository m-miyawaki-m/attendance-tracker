// src/__tests__/App.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import App from '../App.vue'
import MainLayout from '@/layouts/MainLayout.vue'

// hoisting問題を解決するため、vi.mockの外で変数を宣言し、中で使用する
let mockRoute: { meta: object }

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: () => mockRoute,
  }
})

describe('App.vue', () => {
  beforeEach(() => {
    // 各テストの前にモックルートをリセット
    mockRoute = { meta: {} }
  })

  const mountComponent = (routeMeta: object, piniaState: object) => {
    mockRoute.meta = routeMeta

    const wrapper = mount(App, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              authFirebase: piniaState,
            },
            stubActions: false,
          }),
        ],
        stubs: {
          RouterView: true,
          MainLayout: true,
        },
      },
    })
    return { wrapper }
  }

  it('レイアウトが "none" の場合、MainLayout をレンダリングしない', () => {
    const { wrapper } = mountComponent({ layout: 'none' }, {})
    expect(wrapper.findComponent(MainLayout).exists()).toBe(false)
  })

  it('管理者の場合、サイドバー付きのMainLayoutをレンダリングする', () => {
    const { wrapper } = mountComponent({}, {
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }
    })
    const mainLayout = wrapper.findComponent(MainLayout)
    expect(mainLayout.exists()).toBe(true)
    expect(mainLayout.props('showSidebar')).toBe(true)
  })

  it('一般ユーザーでデフォルトレイアウトの場合、タブ付きのMainLayoutをレンダリングする', () => {
    const { wrapper } = mountComponent({ layout: 'default' }, {
      user: {
        id: '2',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user'
      }
    })
    const mainLayout = wrapper.findComponent(MainLayout)
    expect(mainLayout.exists()).toBe(true)
    expect(mainLayout.props('showTabs')).toBe(true)
    expect(mainLayout.props('showSidebar')).toBe(false)
  })

  it('レイアウト指定がない場合、デフォルトのMainLayoutをレンダリングする', () => {
    const { wrapper } = mountComponent({}, {
      user: {
        id: '2',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user'
      }
    })
    const mainLayout = wrapper.findComponent(MainLayout)
    expect(mainLayout.exists()).toBe(true)
    expect(mainLayout.props('showTabs')).toBe(false)
    expect(mainLayout.props('showSidebar')).toBe(false)
  })
})