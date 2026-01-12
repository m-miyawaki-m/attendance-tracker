<script setup lang="ts">
// src/components/dev/DevLogViewer.vue
// 開発者用ログビューア（開発環境のみ表示）

import { ref, computed } from 'vue'
import { useLogger } from '@/composables/useLogger'
import type { LogLevel } from '@/utils/logger'

// 開発環境かどうか
const isDev = import.meta.env.DEV

const { logs, logCount, logSizeFormatted, refreshLogs, clear, downloadJson, downloadText } =
  useLogger()

const isOpen = ref(false)
const selectedLevel = ref<LogLevel | 'all'>('all')
const searchKeyword = ref('')

// パネルを開いた時にログを更新
function togglePanel(): void {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    refreshLogs()
  }
}

const filteredLogs = computed(() => {
  let result = logs.value

  // レベルでフィルタ
  if (selectedLevel.value !== 'all') {
    result = result.filter((log) => log.level === selectedLevel.value)
  }

  // キーワードで検索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (log) =>
        log.message.toLowerCase().includes(keyword) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(keyword)),
    )
  }

  // 新しい順に並べ替え
  return [...result].reverse()
})

const levelColors: Record<LogLevel, string> = {
  debug: 'grey',
  info: 'blue',
  warn: 'orange',
  error: 'red',
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const time = date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const ms = date.getMilliseconds().toString().padStart(3, '0')
  return `${time}.${ms}`
}

function formatData(data: unknown): string {
  if (data === undefined) return ''
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

function handleClear(): void {
  if (confirm('全てのログを削除しますか？')) {
    clear()
    refreshLogs()
  }
}
</script>

<template>
  <!-- 開発環境でのみ表示 -->
  <div v-if="isDev" class="dev-log-viewer">
    <!-- トグルボタン -->
    <v-btn
      class="toggle-btn"
      :color="isOpen ? 'primary' : 'grey'"
      icon
      size="small"
      @click="togglePanel"
    >
      <v-icon>mdi-bug</v-icon>
      <v-badge v-if="logCount > 0" :content="logCount" color="error" floating />
    </v-btn>

    <!-- ログパネル -->
    <v-card v-if="isOpen" class="log-panel" elevation="8">
      <v-card-title class="d-flex align-center pa-2">
        <v-icon class="mr-2">mdi-console</v-icon>
        <span>開発ログ</span>
        <v-spacer />
        <span class="text-caption text-grey mr-2">{{ logCount }}件 / {{ logSizeFormatted }}</span>
        <v-btn icon size="x-small" @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <!-- ツールバー -->
      <div class="d-flex align-center pa-2 ga-2">
        <v-select
          v-model="selectedLevel"
          :items="[
            { title: '全て', value: 'all' },
            { title: 'Debug', value: 'debug' },
            { title: 'Info', value: 'info' },
            { title: 'Warn', value: 'warn' },
            { title: 'Error', value: 'error' },
          ]"
          item-title="title"
          item-value="value"
          density="compact"
          hide-details
          :menu-props="{ zIndex: 10001 }"
          style="max-width: 120px"
        />

        <v-text-field
          v-model="searchKeyword"
          placeholder="検索..."
          density="compact"
          hide-details
          clearable
          prepend-inner-icon="mdi-magnify"
          style="max-width: 200px"
        />

        <v-spacer />

        <v-btn size="small" variant="text" @click="refreshLogs">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>

        <v-menu>
          <template #activator="{ props }">
            <v-btn size="small" variant="text" v-bind="props">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="downloadJson">
              <v-list-item-title>JSON形式</v-list-item-title>
            </v-list-item>
            <v-list-item @click="downloadText">
              <v-list-item-title>テキスト形式</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-btn size="small" variant="text" color="error" @click="handleClear">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>

      <v-divider />

      <!-- ログ一覧 -->
      <div class="log-list">
        <div v-if="filteredLogs.length === 0" class="text-center text-grey pa-4">
          ログがありません
        </div>

        <div v-for="(log, index) in filteredLogs" :key="index" class="log-entry">
          <div class="log-header">
            <v-chip :color="levelColors[log.level]" size="x-small" label class="mr-2">
              {{ log.level.toUpperCase() }}
            </v-chip>
            <span class="text-caption text-grey">{{ formatTimestamp(log.timestamp) }}</span>
          </div>
          <div class="log-message">{{ log.message }}</div>
          <pre v-if="log.data !== undefined" class="log-data">{{ formatData(log.data) }}</pre>
        </div>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.dev-log-viewer {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 9999;
}

.toggle-btn {
  position: relative;
}

.log-panel {
  position: absolute;
  bottom: 48px;
  right: 0;
  width: 500px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.log-list {
  flex: 1;
  overflow-y: auto;
  max-height: 280px;
  font-family: monospace;
  font-size: 12px;
}

.log-entry {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.log-entry:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.log-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.log-message {
  word-break: break-word;
}

.log-data {
  margin-top: 4px;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  font-size: 11px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
