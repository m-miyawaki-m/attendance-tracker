<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { useAuthFirebaseStore } from '@/stores/authFirebase'

const route = useRoute()
const authStore = useAuthFirebaseStore()

// Firebase認証リスナーを初期化
onMounted(() => {
  authStore.initAuthListener()
})

const layoutConfig = computed(() => {
  const layout = route.meta.layout as string | undefined

  // レイアウトなし（ログインページなど）
  if (layout === 'none') {
    return null
  }

  // 管理者の場合は常にサイドバーを表示
  if (authStore.isAdmin && layout !== 'none') {
    return { showHeader: true, showSidebar: true, showFooter: false, showTabs: false }
  }

  // 一般ユーザーの場合はタブを表示
  if (layout === 'default') {
    return { showHeader: true, showSidebar: false, showFooter: false, showTabs: true }
  }

  // デフォルト（認証済みページ）
  return { showHeader: true, showSidebar: false, showFooter: false, showTabs: false }
})
</script>

<template>
  <MainLayout v-if="layoutConfig" v-bind="layoutConfig">
    <RouterView />
  </MainLayout>
  <RouterView v-else />
</template>

<style scoped></style>
