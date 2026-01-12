// tests/unit/views/LoginView.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import LoginView from '@/views/LoginView.vue'
import { useAuthFirebaseStore } from '@/stores/authFirebase'

// Vue Routerのモック
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('LoginView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ヘルパー関数: コンポーネントをマウント
  function mountLoginView(options: { isAdmin?: boolean; stubActions?: boolean } = {}) {
    const { stubActions = true } = options
    return mount(LoginView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              authFirebase: {
                isAuthenticated: false,
                user: null,
                firebaseUser: null,
                loading: false,
              },
            },
            stubActions,
          }),
        ],
      },
      attachTo: document.body,
    })
  }

  // ヘルパー関数: スナックバーテキスト取得
  function getSnackbarText(): string {
    const snackbar = document.querySelector('.v-snackbar__content')
    return snackbar?.textContent || ''
  }

  describe('初期表示', () => {
    it('LV-001: フォーム要素表示', () => {
      const wrapper = mountLoginView()

      // メールアドレス入力欄
      expect(wrapper.text()).toContain('メールアドレス')
      // パスワード入力欄
      expect(wrapper.text()).toContain('パスワード')
      // ログインボタン
      expect(wrapper.text()).toContain('ログイン')

      wrapper.unmount()
    })

    it('LV-002: テストアカウントチップ表示', () => {
      const wrapper = mountLoginView()

      expect(wrapper.text()).toContain('管理者')
      expect(wrapper.text()).toContain('user01')
      expect(wrapper.text()).toContain('user02')
      expect(wrapper.text()).toContain('user03')

      wrapper.unmount()
    })

    it('LV-003: 初期値', () => {
      const wrapper = mountLoginView()

      // メールアドレスとパスワードの入力欄が空
      const textFields = wrapper.findAllComponents({ name: 'VTextField' })
      expect(textFields.length).toBeGreaterThanOrEqual(2)

      // rememberMeのチェックボックスが存在
      expect(wrapper.text()).toContain('ログイン状態を保持する')

      wrapper.unmount()
    })
  })

  describe('テストアカウント入力 (fillMockAccount)', () => {
    it('LV-004: 管理者アカウント選択', async () => {
      const wrapper = mountLoginView()

      // 管理者チップをクリック
      const adminChip = wrapper.findAllComponents({ name: 'VChip' }).find(
        (chip) => chip.text().includes('管理者')
      )
      expect(adminChip).toBeDefined()
      await adminChip!.trigger('click')
      await flushPromises()
      await vi.advanceTimersByTimeAsync(100)

      // スナックバーが表示される（DOM全体をチェック）
      expect(getSnackbarText()).toContain('アカウント情報を入力しました')

      wrapper.unmount()
    })

    it('LV-005: user01アカウント選択', async () => {
      const wrapper = mountLoginView()

      const user01Chip = wrapper.findAllComponents({ name: 'VChip' }).find(
        (chip) => chip.text().includes('user01')
      )
      expect(user01Chip).toBeDefined()
      await user01Chip!.trigger('click')
      await flushPromises()
      await vi.advanceTimersByTimeAsync(100)

      expect(getSnackbarText()).toContain('アカウント情報を入力しました')

      wrapper.unmount()
    })

    it('LV-006: user02アカウント選択', async () => {
      const wrapper = mountLoginView()

      const user02Chip = wrapper.findAllComponents({ name: 'VChip' }).find(
        (chip) => chip.text().includes('user02')
      )
      expect(user02Chip).toBeDefined()
      await user02Chip!.trigger('click')
      await flushPromises()
      await vi.advanceTimersByTimeAsync(100)

      expect(getSnackbarText()).toContain('アカウント情報を入力しました')

      wrapper.unmount()
    })
  })

  describe('ログイン処理 (handleLogin)', () => {
    it('LV-007: ログイン成功（一般ユーザー）', async () => {
      const wrapper = mountLoginView({ stubActions: false })
      const authStore = useAuthFirebaseStore()

      // loginをモック
      vi.spyOn(authStore, 'login').mockResolvedValue(true)
      // isAdminをモック（一般ユーザー）
      Object.defineProperty(authStore, 'isAdmin', { get: () => false })

      // ログインボタンをクリック
      const loginBtn = wrapper.findAllComponents({ name: 'VBtn' }).find(
        (btn) => btn.text() === 'ログイン'
      )
      expect(loginBtn).toBeDefined()
      await loginBtn!.trigger('click')
      await flushPromises()

      // 500ms後にルーターが呼ばれる
      await vi.advanceTimersByTimeAsync(500)
      await flushPromises()

      expect(mockPush).toHaveBeenCalledWith('/')

      wrapper.unmount()
    })

    it('LV-008: ログイン成功（管理者）', async () => {
      const wrapper = mountLoginView({ stubActions: false })
      const authStore = useAuthFirebaseStore()

      // loginをモック
      vi.spyOn(authStore, 'login').mockResolvedValue(true)
      // isAdminをモック（管理者）
      Object.defineProperty(authStore, 'isAdmin', { get: () => true })

      const loginBtn = wrapper.findAllComponents({ name: 'VBtn' }).find(
        (btn) => btn.text() === 'ログイン'
      )
      await loginBtn!.trigger('click')
      await flushPromises()

      await vi.advanceTimersByTimeAsync(500)
      await flushPromises()

      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard')

      wrapper.unmount()
    })

    it('LV-009: ログイン失敗（認証エラー）', async () => {
      const wrapper = mountLoginView({ stubActions: false })
      const authStore = useAuthFirebaseStore()

      // loginがfalseを返す
      vi.spyOn(authStore, 'login').mockResolvedValue(false)

      const loginBtn = wrapper.findAllComponents({ name: 'VBtn' }).find(
        (btn) => btn.text() === 'ログイン'
      )
      await loginBtn!.trigger('click')
      await flushPromises()
      await vi.advanceTimersByTimeAsync(100)

      // エラースナックバーが表示される
      expect(getSnackbarText()).toContain('メールアドレスまたはパスワードが正しくありません')
      // ルーターは呼ばれない
      expect(mockPush).not.toHaveBeenCalled()

      wrapper.unmount()
    })

    it('LV-010: ログイン失敗（例外）', async () => {
      const wrapper = mountLoginView({ stubActions: false })
      const authStore = useAuthFirebaseStore()

      // loginが例外をスロー
      vi.spyOn(authStore, 'login').mockRejectedValue(new Error('Network error'))

      const loginBtn = wrapper.findAllComponents({ name: 'VBtn' }).find(
        (btn) => btn.text() === 'ログイン'
      )
      await loginBtn!.trigger('click')
      await flushPromises()
      await vi.advanceTimersByTimeAsync(100)

      // エラースナックバーが表示される
      expect(getSnackbarText()).toContain('ログインに失敗しました')
      expect(mockPush).not.toHaveBeenCalled()

      wrapper.unmount()
    })

    it('LV-011: ローディング状態', async () => {
      const wrapper = mountLoginView({ stubActions: false })
      const authStore = useAuthFirebaseStore()

      // 遅延するPromiseを作成
      let resolveLogin: (value: boolean) => void
      vi.spyOn(authStore, 'login').mockReturnValue(
        new Promise((resolve) => {
          resolveLogin = resolve
        })
      )

      const loginBtn = wrapper.findAllComponents({ name: 'VBtn' }).find(
        (btn) => btn.text() === 'ログイン'
      )

      // ログインボタンクリック
      await loginBtn!.trigger('click')
      await flushPromises()

      // ローディング中はボタンがローディング状態
      expect(loginBtn!.props('loading')).toBe(true)

      // ログイン完了
      resolveLogin!(true)
      await flushPromises()

      // ローディング終了
      expect(loginBtn!.props('loading')).toBe(false)

      wrapper.unmount()
    })
  })

  describe('パスワードリセット (handlePasswordReset)', () => {
    it('LV-012: パスワードリセットボタン', async () => {
      const wrapper = mountLoginView()

      // 「パスワードをお忘れの方」ボタンをクリック
      const resetBtn = wrapper.findAllComponents({ name: 'VBtn' }).find(
        (btn) => btn.text().includes('パスワードをお忘れの方')
      )
      expect(resetBtn).toBeDefined()
      await resetBtn!.trigger('click')
      await flushPromises()
      await vi.advanceTimersByTimeAsync(100)

      // infoスナックバーが表示される
      expect(getSnackbarText()).toContain('パスワードリセット機能はモックでは実装されていません')

      wrapper.unmount()
    })
  })

  describe('スナックバー表示 (showSnackbar)', () => {
    it('LV-013: 成功メッセージ', async () => {
      const wrapper = mountLoginView({ stubActions: false })
      const authStore = useAuthFirebaseStore()

      vi.spyOn(authStore, 'login').mockResolvedValue(true)
      Object.defineProperty(authStore, 'isAdmin', { get: () => false })

      const loginBtn = wrapper.findAllComponents({ name: 'VBtn' }).find(
        (btn) => btn.text() === 'ログイン'
      )
      await loginBtn!.trigger('click')
      await flushPromises()
      await vi.advanceTimersByTimeAsync(100)

      // 成功メッセージが表示される
      expect(getSnackbarText()).toContain('ログインしました')

      wrapper.unmount()
    })

    it('LV-014: エラーメッセージ', async () => {
      const wrapper = mountLoginView({ stubActions: false })
      const authStore = useAuthFirebaseStore()

      vi.spyOn(authStore, 'login').mockResolvedValue(false)

      const loginBtn = wrapper.findAllComponents({ name: 'VBtn' }).find(
        (btn) => btn.text() === 'ログイン'
      )
      await loginBtn!.trigger('click')
      await flushPromises()
      await vi.advanceTimersByTimeAsync(100)

      // エラーメッセージが表示される
      expect(getSnackbarText()).toContain('メールアドレスまたはパスワードが正しくありません')

      wrapper.unmount()
    })

    it('LV-015: 情報メッセージ', async () => {
      const wrapper = mountLoginView()

      // 管理者チップをクリック
      const adminChip = wrapper.findAllComponents({ name: 'VChip' }).find(
        (chip) => chip.text().includes('管理者')
      )
      await adminChip!.trigger('click')
      await flushPromises()
      await vi.advanceTimersByTimeAsync(100)

      // 情報メッセージが表示される
      expect(getSnackbarText()).toContain('アカウント情報を入力しました')

      wrapper.unmount()
    })
  })
})
