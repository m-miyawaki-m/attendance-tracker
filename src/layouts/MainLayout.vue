<!-- src/layouts/MainLayout.vue -->
<template>
  <v-app>
    <!-- メインヘッダー（ログイン情報） -->
    <v-app-bar v-if="showHeader" color="primary" elevation="0">
      <v-app-bar-nav-icon v-if="showSidebar" @click="drawer = !drawer" />
      <v-app-bar-title>勤怠管理システム</v-app-bar-title>
      <v-spacer />
      <v-chip v-if="authStore.isAuthenticated" class="mr-4" color="white" variant="outlined">
        <v-icon start>mdi-account</v-icon>
        {{ authStore.userName }}
      </v-chip>
      <v-btn v-if="authStore.isAuthenticated" icon @click="handleLogout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- タブナビゲーション（サブヘッダー） -->
    <v-app-bar v-if="showTabs" color="white" elevation="1" density="compact">
      <v-tabs v-model="currentTab" color="primary" grow>
        <v-tab
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          :to="tab.to"
        >
          <v-icon start>{{ tab.icon }}</v-icon>
          {{ tab.title }}
        </v-tab>
      </v-tabs>
    </v-app-bar>

    <!-- サイドバー（管理者用） -->
    <v-navigation-drawer v-if="showSidebar" v-model="drawer" app>
      <v-list>
        <v-list-item>
          <v-list-item-title class="text-h6">管理メニュー</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider />

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="isActive(item.path)"
        />
      </v-list>

    </v-navigation-drawer>

    <!-- メインコンテンツ -->
    <v-main>
      <slot />
    </v-main>

    <!-- フッター -->
    <v-footer v-if="showFooter" app>
      <v-container>
        <v-row justify="center">
          <v-col class="text-center" cols="12">
            <span class="text-caption text-grey">
              &copy; {{ currentYear }} 勤怠管理システム. All rights reserved.
            </span>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>

    <!-- スナックバー -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface Props {
  showHeader?: boolean
  showSidebar?: boolean
  showFooter?: boolean
  showTabs?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showSidebar: false,
  showFooter: false,
  showTabs: false,
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const drawer = ref<boolean>(true)
const snackbar = ref<boolean>(false)
const snackbarMessage = ref<string>('')
const snackbarColor = ref<string>('success')
const currentTab = ref<string | null>(null)

const currentYear = computed(() => new Date().getFullYear())

// タブ定義（一般ユーザー用）
const tabs = computed(() => {
  if (authStore.isAdmin) {
    return [
      { title: 'ダッシュボード', value: 'dashboard', icon: 'mdi-view-dashboard', to: '/admin/dashboard' },
      { title: '従業員管理', value: 'employees', icon: 'mdi-account-group', to: '/admin/employees' },
      { title: 'チーム勤怠', value: 'team', icon: 'mdi-account-multiple', to: '/admin/team' },
    ]
  } else {
    return [
      { title: '打刻', value: 'home', icon: 'mdi-clock-outline', to: '/' },
      { title: '勤怠一覧', value: 'attendance', icon: 'mdi-calendar-clock', to: '/attendance' },
    ]
  }
})

// 管理者用メニュー項目
const menuItems = computed(() => [
  { path: '/admin/dashboard', icon: 'mdi-view-dashboard', title: 'ダッシュボード' },
  { path: '/admin/employees', icon: 'mdi-account-group', title: '従業員管理' },
  { path: '/admin/team', icon: 'mdi-account-multiple', title: 'チーム勤怠' },
  { path: '/attendance', icon: 'mdi-calendar-clock', title: '勤怠一覧' },
])

// 現在のルートがアクティブかチェック
const isActive = (path: string): boolean => {
  return route.path === path
}

// ログアウト処理
const handleLogout = (): void => {
  authStore.logout()
  showSnackbar('ログアウトしました', 'info')
  router.push('/login')
}

// スナックバー表示
const showSnackbar = (message: string, color: string = 'success'): void => {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}

// 外部からスナックバーを呼び出せるようにエクスポート
defineExpose({
  showSnackbar,
})
</script>

<style scoped>
/* レイアウト固有のスタイルがあればここに追加 */
</style>
