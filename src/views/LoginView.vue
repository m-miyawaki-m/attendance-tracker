<!-- src/views/LoginView.vue -->
<template>
  <v-app>
    <v-main>
      <v-container fluid fill-height class="login-bg">
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>勤怠管理システム</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form @submit.prevent="handleLogin">
                  <v-text-field
                    v-model="email"
                    label="メールアドレス"
                    prepend-icon="mdi-email"
                    type="email"
                    required
                  />
                  <v-text-field
                    v-model="password"
                    label="パスワード"
                    prepend-icon="mdi-lock"
                    type="password"
                    required
                  />
                  <v-checkbox v-model="rememberMe" label="ログイン状態を保持する" />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" block size="large" :loading="loading" @click="handleLogin">
                  ログイン
                </v-btn>
              </v-card-actions>
              <v-card-text class="text-center">
                <v-btn variant="text" size="small" @click="handlePasswordReset">
                  パスワードをお忘れの方
                </v-btn>
              </v-card-text>
              <v-divider />
              <v-card-text class="text-center">
                <p class="text-caption mb-2">テストアカウント（クリックで入力）</p>
                <div class="d-flex flex-wrap justify-center gap-2 mb-3">
                  <v-chip
                    class="ma-1"
                    size="small"
                    color="error"
                    variant="outlined"
                    clickable
                    @click="fillMockAccount('admin@example.com', 'adminadmin')"
                  >
                    <v-icon start size="small">mdi-shield-account</v-icon>
                    管理者
                  </v-chip>
                  <v-chip
                    class="ma-1"
                    size="small"
                    color="primary"
                    variant="outlined"
                    clickable
                    @click="fillMockAccount('user01@example.com', 'user01')"
                  >
                    <v-icon start size="small">mdi-account</v-icon>
                    user01
                  </v-chip>
                  <v-chip
                    class="ma-1"
                    size="small"
                    color="primary"
                    variant="outlined"
                    clickable
                    @click="fillMockAccount('user02@example.com', 'password123')"
                  >
                    <v-icon start size="small">mdi-account</v-icon>
                    user02
                  </v-chip>
                  <v-chip
                    class="ma-1"
                    size="small"
                    color="primary"
                    variant="outlined"
                    clickable
                    @click="fillMockAccount('user03@example.com', 'password123')"
                  >
                    <v-icon start size="small">mdi-account</v-icon>
                    user03
                  </v-chip>
                </div>
                <p class="text-caption text-grey-darken-1">
                  利用可能: admin (pw: adminadmin), user01 (pw: user01), user02~user20 (pw: password123)
                </p>
                <p class="text-caption text-grey mt-1">
                  合計 20人のユーザーが利用可能です
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthFirebaseStore } from '@/stores/authFirebase'

const router = useRouter()
const authStore = useAuthFirebaseStore()

const email = ref<string>('')
const password = ref<string>('')
const rememberMe = ref<boolean>(false)
const loading = ref<boolean>(false)
const snackbar = ref<boolean>(false)
const snackbarMessage = ref<string>('')
const snackbarColor = ref<string>('success')

const handleLogin = async (): Promise<void> => {
  loading.value = true

  try {
    const success = await authStore.login(email.value, password.value)

    if (success) {
      showSnackbar('ログインしました', 'success')
      setTimeout(() => {
        // 管理者の場合はダッシュボードへ、一般ユーザーはホームへ
        if (authStore.isAdmin) {
          router.push('/admin/dashboard')
        } else {
          router.push('/')
        }
      }, 500)
    } else {
      showSnackbar('メールアドレスまたはパスワードが正しくありません', 'error')
    }
  } catch (error) {
    console.error('Login error:', error)
    showSnackbar('ログインに失敗しました', 'error')
  } finally {
    loading.value = false
  }
}

const handlePasswordReset = (): void => {
  showSnackbar('パスワードリセット機能はモックでは実装されていません', 'info')
}

const fillMockAccount = (emailValue: string, passwordValue: string): void => {
  email.value = emailValue
  password.value = passwordValue
  showSnackbar('アカウント情報を入力しました', 'info')
}

const showSnackbar = (message: string, color: string = 'success'): void => {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}
</script>

<style scoped>
.login-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
