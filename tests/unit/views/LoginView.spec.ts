// tests/unit/views/LoginView.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createTestingPinia } from '@pinia/testing'
import LoginView from '@/views/LoginView.vue'

// Vue Routerのモック
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Vuetifyのセットアップ
const vuetify = createVuetify({
  components,
  directives,
})

describe('LoginView.vue', () => {
  it('正常にレンダリングされる', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            createSpy: vi.fn,
            // 必要に応じてストアの初期状態やアクションをモック
            initialState: {
              // LoginViewはauthFirebaseストアを使っているので、そのモックを設定
              authFirebase: { isAuthenticated: false },
            },
            stubActions: false,
          }),
        ],
      },
    })

    // コンポーネントが正しくマウントされ、期待されるテキストが含まれているかを確認
    expect(wrapper.text()).toContain('勤怠管理システム')
    expect(wrapper.findComponent({ name: 'VTextField' })).toBeTruthy()
    expect(wrapper.text()).toContain('メールアドレス')
    expect(wrapper.text()).toContain('パスワード')
  })
})