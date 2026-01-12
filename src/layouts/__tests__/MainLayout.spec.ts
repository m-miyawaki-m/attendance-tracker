// src/layouts/__tests__/MainLayout.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { defineComponent, type ComponentPublicInstance } from 'vue'

import MainLayout from '@/layouts/MainLayout.vue'
import { useAuthFirebaseStore } from '@/stores/authFirebase'

// Vue Routerのモック
const mockRouter = {
  push: vi.fn(),
}
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => ({
    path: '/',
  }),
}))

// スロットコンテンツを持つラッパーコンポーネント
const TestComponent = defineComponent({
  template: '<div id="slot-content">Test Slot Content</div>',
})

// --- テスト本体 ---

describe('MainLayout.vue', () => {
  let wrapper: VueWrapper<ComponentPublicInstance>
  let authStore: ReturnType<typeof useAuthFirebaseStore>

  const mountComponent = (props = {}, piniaOptions = {}) => {
    wrapper = mount(MainLayout, {
      global: {
        plugins: [
          // Vuetifyはvitest.setup.tsでグローバル設定済み
          createTestingPinia({
            createSpy: vi.fn,
            ...piniaOptions,
          }),
        ],
        stubs: {
          // ルーターリンクのスタブ
          RouterLink: true,
        },
      },
      props: {
        // デフォルトのprops
        showHeader: true,
        showSidebar: false,
        showFooter: false,
        showTabs: false,
        ...props,
      },
      slots: {
        default: TestComponent,
      },
    })
    authStore = useAuthFirebaseStore()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('3.1. 表示制御 (props)', () => {
    it('1-1: showHeader: true の場合にヘッダーが表示される', () => {
      mountComponent({ showHeader: true })
      expect(wrapper.findComponent({ name: 'VAppBar' }).exists()).toBe(true)
    })

    it('1-2: showHeader: false の場合にヘッダーが非表示になる', () => {
      mountComponent({ showHeader: false })
      // v-app-barは複数ある可能性があるので、メインヘッダーのタイトルで特定
      const mainHeader = wrapper
        .findAllComponents({ name: 'VAppBar' })
        .find((w) => w.text().includes('勤怠管理システム'))
      expect(mainHeader).toBeUndefined()
    })

    it('1-3: showSidebar: true の場合にサイドバーが表示される', () => {
      mountComponent({ showSidebar: true })
      expect(wrapper.findComponent({ name: 'VNavigationDrawer' }).exists()).toBe(true)
    })

    it('1-4: showSidebar: false の場合にサイドバーが非表示になる', () => {
      mountComponent({ showSidebar: false })
      expect(wrapper.findComponent({ name: 'VNavigationDrawer' }).exists()).toBe(false)
    })

    it('1-5: showFooter: true の場合にフッターが表示される', () => {
      mountComponent({ showFooter: true })
      expect(wrapper.findComponent({ name: 'VFooter' }).exists()).toBe(true)
    })

    it('1-6: showFooter: false の場合にフッターが非表示になる', () => {
      mountComponent({ showFooter: false })
      expect(wrapper.findComponent({ name: 'VFooter' }).exists()).toBe(false)
    })

    it('1-7: showTabs: true の場合にタブが表示される', () => {
      mountComponent({ showTabs: true })
      expect(wrapper.findComponent({ name: 'VTabs' }).exists()).toBe(true)
    })

    it('1-8: showTabs: false の場合にタブが非表示になる', () => {
      mountComponent({ showTabs: false })
      expect(wrapper.findComponent({ name: 'VTabs' }).exists()).toBe(false)
    })
  })

  describe('3.2. 認証状態', () => {
    it('2-1: ログイン状態の場合、ユーザー名とログアウトボタンが表示される', () => {
      mountComponent(
        {},
        {
          initialState: {
            authFirebase: {
              isAuthenticated: true,
              user: {
                id: '1',
                name: 'テストユーザー',
                email: 'test@example.com',
                role: 'user',
              },
            },
          },
        },
      )
      expect(wrapper.text()).toContain('テストユーザー')
      expect(wrapper.find('[data-testid="logout-button"]').exists()).toBe(true)
    })

    it('2-2: 未ログイン状態の場合、ユーザー名とログアウトボタンが非表示になる', () => {
      mountComponent(
        {},
        {
          initialState: {
            authFirebase: { isAuthenticated: false, user: null },
          },
        },
      )
      expect(wrapper.text()).not.toContain('テストユーザー')
      expect(wrapper.find('[data-testid="logout-button"]').exists()).toBe(false)
    })
  })

  describe('3.3. ユーザー権限（タブ表示）', () => {
    it('3-1: 一般ユーザーの場合、一般ユーザー用のタブが表示される', () => {
      mountComponent(
        { showTabs: true },
        {
          initialState: {
            authFirebase: {
              user: {
                id: '1',
                name: 'Regular User',
                email: 'user@example.com',
                role: 'user',
              },
            },
          },
        },
      )
      const tabs = wrapper.findAllComponents({ name: 'VTab' })
      expect(tabs.length).toBe(2)
      expect(tabs[0]!.text()).toContain('打刻')
      expect(tabs[1]!.text()).toContain('勤怠一覧')
    })

    it('3-2: 管理者の場合、管理者用のタブが表示される', () => {
      mountComponent(
        { showTabs: true },
        {
          initialState: {
            authFirebase: {
              user: {
                id: '1',
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
              },
            },
          },
        },
      )
      const tabs = wrapper.findAllComponents({ name: 'VTab' })
      expect(tabs.length).toBe(3)
      expect(tabs[0]!.text()).toContain('ダッシュボード')
      expect(tabs[1]!.text()).toContain('従業員管理')
      expect(tabs[2]!.text()).toContain('チーム勤怠')
    })
  })

  describe('3.4. ユーザーインタラクション', () => {
    it('4-1: ログアウトに成功すると、ストアのlogoutが呼ばれ、ログインページに遷移する', async () => {
      mountComponent(
        {},
        {
          initialState: { authFirebase: { isAuthenticated: true } },
        },
      )
      authStore.logout = vi.fn().mockResolvedValue(undefined)

      // v-btnにaria-labelを追加して特定しやすくする
      const logoutButton = wrapper.find('[data-testid="logout-button"]')
      await logoutButton.trigger('click')

      expect(authStore.logout).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/login')

      await wrapper.vm.$nextTick() // snackbarの更新を待つ
      // スナックバーが表示されることを確認（Vuetifyのteleportのため、propsで確認）
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('modelValue')).toBe(true)
      expect(snackbar.props('color')).toBe('info')
    })

    it('4-2: ログアウトに失敗すると、エラーメッセージが表示される', async () => {
      mountComponent(
        {},
        {
          initialState: { authFirebase: { isAuthenticated: true } },
        },
      )
      const error = new Error('Logout failed')
      authStore.logout = vi.fn().mockRejectedValue(error)

      const logoutButton = wrapper.find('[data-testid="logout-button"]')
      await logoutButton.trigger('click')

      expect(authStore.logout).toHaveBeenCalled()
      expect(mockRouter.push).not.toHaveBeenCalled()

      await wrapper.vm.$nextTick()
      // スナックバーが表示されることを確認（Vuetifyのteleportのため、propsで確認）
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('modelValue')).toBe(true)
      expect(snackbar.props('color')).toBe('error')
    })

    it('4-3: サイドバーのアイコンクリックでサイドバーが開閉する', async () => {
      mountComponent({ showSidebar: true })

      const vm = wrapper.vm as unknown as { drawer: boolean }

      // 初期状態では開いている
      expect(vm.drawer).toBe(true)

      const navIcon = wrapper.findComponent({ name: 'VAppBarNavIcon' })
      await navIcon.trigger('click')

      // クリック後に閉じる
      expect(vm.drawer).toBe(false)
    })
  })

  describe('3.5. 内部ロジック', () => {
    it('5-1: フッターに現在の年が表示される', () => {
      mountComponent({ showFooter: true })
      const currentYear = new Date().getFullYear().toString()
      expect(wrapper.findComponent({ name: 'VFooter' }).text()).toContain(currentYear)
    })

    it('5-2: defineExposeされたshowSnackbarが機能する', async () => {
      mountComponent()

      // 初期状態では非表示
      expect(wrapper.findComponent({ name: 'VSnackbar' }).props('modelValue')).toBe(false)

      // メソッドを呼び出す
      const vm = wrapper.vm as unknown as {
        showSnackbar: (msg: string, color?: string) => Promise<void> | void
        snackbarMessage: string
      }
      await vm.showSnackbar('テストメッセージ', 'info')

      // 表示されることを確認（Vuetifyのteleportのため、propsで確認）
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('modelValue')).toBe(true)
      expect(snackbar.props('color')).toBe('info')
      // 内部stateも確認
      expect(vm.snackbarMessage).toBe('テストメッセージ')
    })
  })
})

// `v-btn` に `data-testid` を追加する修正が MainLayout.vue に必要です
// <v-btn v-if="authStore.isAuthenticated" icon @click="handleLogout" data-testid="logout-button">
//   <v-icon>mdi-logout</v-icon>
// </v-btn>
// このコメントは、テストコードを動作させるためのコンポーネント側の修正提案です。
