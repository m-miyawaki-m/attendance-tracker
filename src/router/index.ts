// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/layouts/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false, layout: 'none' },
  },
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/attendance',
    name: 'attendance',
    component: () => import('@/views/AttendanceListView.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
      },
      {
        path: 'employees',
        name: 'employees',
        component: () => import('@/views/admin/EmployeeListView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
      },
      {
        path: 'edit/:id',
        name: 'edit',
        component: () => import('@/views/admin/AttendanceEditView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
      },
      {
        path: 'team',
        name: 'team',
        component: () => import('@/views/admin/TeamView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ナビゲーションガード
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.checkAuth()

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)

  if (requiresAuth && !authStore.isAuthenticated) {
    // 未認証の場合はログインページへ
    next('/login')
  } else if (requiresAdmin && !authStore.isAdmin) {
    // 管理者権限が必要なページに一般ユーザーがアクセスした場合はホームへ
    next('/')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    // ログイン済みの場合、管理者はダッシュボードへ、一般ユーザーはホームへ
    if (authStore.isAdmin) {
      next('/admin/dashboard')
    } else {
      next('/')
    }
  } else {
    // その他の場合は通常通り遷移
    next()
  }
})

export default router
