<template>
  <v-container>
    <!-- 現在時刻 -->
    <v-row>
      <v-col cols="12">
        <v-card class="text-center pa-4">
          <h2 class="text-h4 mb-2">{{ currentTime }}</h2>
          <p class="text-subtitle-1">{{ currentDate }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- 打刻ボタン -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title class="text-center">
            <v-icon start color="success" size="large">mdi-login</v-icon>
            出勤
          </v-card-title>
          <v-card-text class="text-center">
            <p v-if="checkInTime" class="text-h6 text-success">
              {{ formatTime(checkInTime) }}
            </p>
            <p v-else class="text-body-2 text-grey">未打刻</p>
            <v-divider v-if="checkInLocation" class="my-2" />
            <div
              v-if="checkInLocation"
              class="text-caption text-grey"
              style="white-space: pre-line"
            >
              <v-icon size="small">mdi-map-marker</v-icon>
              {{ checkInLocation }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              block
              size="large"
              color="success"
              :disabled="!!checkInTime || loading"
              :loading="loading"
              @click="handleCheckIn"
            >
              出勤打刻
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title class="text-center">
            <v-icon start color="error" size="large">mdi-logout</v-icon>
            退勤
          </v-card-title>
          <v-card-text class="text-center">
            <p v-if="checkOutTime" class="text-h6 text-error">
              {{ formatTime(checkOutTime) }}
            </p>
            <p v-else class="text-body-2 text-grey">未打刻</p>
            <v-divider v-if="checkOutLocation" class="my-2" />
            <div
              v-if="checkOutLocation"
              class="text-caption text-grey"
              style="white-space: pre-line"
            >
              <v-icon size="small">mdi-map-marker</v-icon>
              {{ checkOutLocation }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              block
              size="large"
              color="error"
              :disabled="!checkInTime || !!checkOutTime || loading"
              :loading="loading"
              @click="handleCheckOut"
            >
              退勤打刻
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 今日の勤務状態 -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-calendar-today</v-icon>
            今日の勤務状態
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <p class="text-caption text-grey">ステータス</p>
                  <v-chip v-if="checkInTime" :color="currentStatus.color" variant="flat">
                    {{ currentStatus.text }}
                  </v-chip>
                  <p v-else class="text-body-2">-</p>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <p class="text-caption text-grey">出勤時刻</p>
                  <p class="text-body-1">
                    {{ checkInTime ? formatTime(checkInTime) : '-' }}
                  </p>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <p class="text-caption text-grey">退勤時刻</p>
                  <p class="text-body-1">
                    {{ checkOutTime ? formatTime(checkOutTime) : '-' }}
                  </p>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <p class="text-caption text-grey">勤務時間</p>
                  <p class="text-body-1">{{ workingHours }}</p>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

  </v-container>

  <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
    {{ snackbarMessage }}
  </v-snackbar>

  <!-- ローディングオーバーレイ -->
  <v-overlay :model-value="loading" class="align-center justify-center" persistent>
    <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
    <p class="text-h6 mt-4">位置情報を取得中...</p>
  </v-overlay>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const currentTime = ref<string>('')
const currentDate = ref<string>('')
const loading = ref<boolean>(false)
const snackbar = ref<boolean>(false)
const snackbarMessage = ref<string>('')
const snackbarColor = ref<string>('success')
const checkInTime = ref<string | null>(null)
const checkOutTime = ref<string | null>(null)
const checkInLocation = ref<string | null>(null)
const checkOutLocation = ref<string | null>(null)

let timeInterval: number | null = null

// 現在のステータス
const currentStatus = computed(() => {
  if (!checkInTime.value) {
    return { text: '-', color: 'grey' }
  }

  // 9:00以降の出勤は遅刻
  const checkIn = new Date(checkInTime.value)
  const hours = checkIn.getHours()
  const minutes = checkIn.getMinutes()
  const totalMinutes = hours * 60 + minutes

  if (totalMinutes > 9 * 60) {
    return { text: '遅刻', color: 'warning' }
  }

  // 18:00前の退勤は早退
  if (checkOutTime.value) {
    const checkOut = new Date(checkOutTime.value)
    const outHours = checkOut.getHours()
    const outMinutes = checkOut.getMinutes()
    const outTotalMinutes = outHours * 60 + outMinutes

    if (outTotalMinutes < 18 * 60) {
      return { text: '早退', color: 'info' }
    }
  }

  return { text: '正常', color: 'success' }
})

// 勤務時間（時間:分）
const workingHours = computed(() => {
  if (!checkInTime.value) return '-'

  const checkIn = new Date(checkInTime.value)
  const checkOut = checkOutTime.value ? new Date(checkOutTime.value) : new Date()

  const minutes = Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}:${mins.toString().padStart(2, '0')}`
})

// 位置情報から地名を取得（逆ジオコーディング）
const getAddressFromCoords = async (lat: number, lon: number): Promise<string> => {
  try {
    // OpenStreetMap Nominatim API を使用
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ja`,
    )
    const data = await response.json()

    if (data.address) {
      const parts = []

      // 都道府県
      if (data.address.state) parts.push(data.address.state)

      // 市区町村
      if (data.address.city) parts.push(data.address.city)
      else if (data.address.town) parts.push(data.address.town)
      else if (data.address.village) parts.push(data.address.village)

      // 区
      if (data.address.city_district) parts.push(data.address.city_district)
      else if (data.address.suburb) parts.push(data.address.suburb)

      // 町・丁目
      if (data.address.neighbourhood) parts.push(data.address.neighbourhood)
      else if (data.address.quarter) parts.push(data.address.quarter)
      else if (data.address.road) parts.push(data.address.road)

      return parts.length > 0 ? parts.join(' ') : '住所不明'
    }
    return '住所不明'
  } catch (error) {
    console.warn('地名取得エラー:', error)
    return '住所不明'
  }
}

// 位置情報を取得
const getCurrentLocation = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('位置情報がサポートされていません')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        const accuracy = position.coords.accuracy.toFixed(0)

        // 地名を取得
        const address = await getAddressFromCoords(lat, lon)

        const locationStr = `${address}\n緯度: ${lat.toFixed(6)}, 経度: ${lon.toFixed(6)} (精度: ${accuracy}m)`
        resolve(locationStr)
      },
      (error) => {
        console.error('位置情報取得エラー:', error)
        let errorMessage = '位置情報の取得に失敗'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置情報の許可が拒否されました'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置情報が利用できません'
            break
          case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました'
            break
        }

        reject(errorMessage)
      },
      {
        enableHighAccuracy: false, // 精度を下げて速度を優先
        timeout: 30000, // 30秒に延長
        maximumAge: 60000, // 60秒以内のキャッシュを使用
      },
    )
  })
}

// LocalStorageから打刻状態を読み込む
const loadAttendanceState = () => {
  const checkedIn = localStorage.getItem('mock_checked_in')
  const checkedOut = localStorage.getItem('mock_checked_out')
  const checkedInLoc = localStorage.getItem('mock_checked_in_location')
  const checkedOutLoc = localStorage.getItem('mock_checked_out_location')
  const savedDate = localStorage.getItem('mock_attendance_date')
  const today = new Date().toISOString().split('T')[0]

  // 日付が変わっていたらクリア
  if (savedDate !== today) {
    localStorage.removeItem('mock_checked_in')
    localStorage.removeItem('mock_checked_out')
    localStorage.removeItem('mock_checked_in_location')
    localStorage.removeItem('mock_checked_out_location')
    localStorage.removeItem('mock_attendance_date')
    checkInTime.value = null
    checkOutTime.value = null
    checkInLocation.value = null
    checkOutLocation.value = null
  } else {
    checkInTime.value = checkedIn
    checkOutTime.value = checkedOut
    checkInLocation.value = checkedInLoc
    checkOutLocation.value = checkedOutLoc
  }
}

// 時刻更新
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  currentDate.value = now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

// 出勤打刻
const handleCheckIn = async () => {
  loading.value = true
  try {
    // 位置情報を取得
    let location = '位置情報なし'
    try {
      location = await getCurrentLocation()
    } catch (locError) {
      console.warn('位置情報の取得に失敗:', locError)
      location = '位置情報の取得に失敗'
    }

    const now = new Date().toISOString()
    const today = new Date().toISOString().split('T')[0]

    checkInTime.value = now
    checkInLocation.value = location
    checkOutTime.value = null
    checkOutLocation.value = null

    localStorage.setItem('mock_checked_in', now)
    localStorage.setItem('mock_checked_in_location', location)
    localStorage.setItem('mock_attendance_date', String(today))
    localStorage.removeItem('mock_checked_out')
    localStorage.removeItem('mock_checked_out_location')

    showSnackbar('出勤打刻しました', 'success')
  } catch (err) {
    console.error(err)
    showSnackbar('出勤打刻に失敗しました', 'error')
  } finally {
    loading.value = false
  }
}

// 退勤打刻
const handleCheckOut = async () => {
  loading.value = true
  try {
    // 位置情報を取得
    let location = '位置情報なし'
    try {
      location = await getCurrentLocation()
    } catch (locError) {
      console.warn('位置情報の取得に失敗:', locError)
      location = '位置情報の取得に失敗'
    }

    const now = new Date().toISOString()

    checkOutTime.value = now
    checkOutLocation.value = location

    localStorage.setItem('mock_checked_out', now)
    localStorage.setItem('mock_checked_out_location', location)

    showSnackbar('退勤打刻しました', 'success')
  } catch (err) {
    console.error(err)
    showSnackbar('退勤打刻に失敗しました', 'error')
  } finally {
    loading.value = false
  }
}

// フォーマット関数
const formatTime = (date: Date | string | null): string => {
  if (!date) return '-'
  return new Date(date).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const showSnackbar = (message: string, color: string = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}

// ライフサイクル
onMounted(() => {
  loadAttendanceState()
  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.v-card {
  height: 100%;
}
</style>
