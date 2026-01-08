<template>
  <!-- 管理者の場合: 全従業員の勤怠状況一覧 -->
  <AdminAttendanceList v-if="authStore.isAdmin" />

  <!-- 一般ユーザーの場合: 自分の出退勤履歴 -->
  <UserAttendanceHistory v-else :user-id="authStore.userId" />
</template>

<script setup lang="ts">
import { useAuthFirebaseStore } from '@/stores/authFirebase'
import AdminAttendanceList from '@/components/attendance/AdminAttendanceList.vue'
import UserAttendanceHistory from '@/components/attendance/UserAttendanceHistory.vue'

const authStore = useAuthFirebaseStore()
</script>

<style scoped></style>
