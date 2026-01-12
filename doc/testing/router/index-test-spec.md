# `router/index.ts` 単体テスト仕様書

## 1. 概要

| 項目 | 内容 |
|:---|:---|
| 対象ファイル | `src/router/index.ts` |
| 関連設計書 | [基本設計書 2](../../design/03-basic/03-basic-design.md#2-ルーティング-routerindexts) |
| 設計書記載 | ルート定義とナビゲーションガード（認証・管理者権限チェック） |

## 2. テストの目的

`router/index.ts`が、ルート定義とナビゲーションガード（認証・権限チェック）を正しく実装していることを保証する。

## 3. 使用するライブラリ

* **テストランナー**: Vitest
* **ルーティング**: Vue Router
* **状態管理**: Pinia (テスト用にモック化)

## 4. テストケース

### 4.1. ルート定義

| テストNo. | テストケース | パス | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 1-1 | ログインページ | `/login` | ・name: 'login'<br>・meta: `{ requiresAuth: false, layout: 'none' }` |
| 1-2 | ホームページ | `/` | ・name: 'home'<br>・meta: `{ requiresAuth: true, layout: 'default' }` |
| 1-3 | 勤怠一覧ページ | `/attendance` | ・name: 'attendance'<br>・meta: `{ requiresAuth: true, layout: 'default' }` |
| 1-4 | 管理者リダイレクト | `/admin` | `/admin/dashboard`にリダイレクト |
| 1-5 | ダッシュボード | `/admin/dashboard` | ・name: 'dashboard'<br>・meta: `{ requiresAuth: true, requiresAdmin: true, layout: 'admin' }` |
| 1-6 | 従業員管理 | `/admin/employees` | ・name: 'employees'<br>・meta: `{ requiresAuth: true, requiresAdmin: true, layout: 'admin' }` |
| 1-7 | 勤怠編集 | `/admin/edit/:id` | ・name: 'edit'<br>・動的パラメータ`:id`あり |
| 1-8 | チーム勤怠 | `/admin/team` | ・name: 'team'<br>・meta: `{ requiresAuth: true, requiresAdmin: true, layout: 'admin' }` |

### 4.2. ナビゲーションガード - 認証チェック

| テストNo. | テストケース | 遷移先 | `isAuthenticated` | 期待する結果 |
| :--- | :--- | :--- | :--- | :--- |
| 2-1 | 認証必要ページ（未認証） | `/` | `false` | `/login`にリダイレクトされる。 |
| 2-2 | 認証必要ページ（認証済み） | `/` | `true` | 遷移が許可される。 |
| 2-3 | 認証不要ページ（未認証） | `/login` | `false` | 遷移が許可される。 |

### 4.3. ナビゲーションガード - 管理者権限チェック

| テストNo. | テストケース | 遷移先 | `isAdmin` | 期待する結果 |
| :--- | :--- | :--- | :--- | :--- |
| 3-1 | 管理者ページ（管理者） | `/admin/dashboard` | `true` | 遷移が許可される。 |
| 3-2 | 管理者ページ（一般ユーザー） | `/admin/dashboard` | `false` | `/`にリダイレクトされる。 |
| 3-3 | 管理者ページ（未認証） | `/admin/dashboard` | - | `/login`にリダイレクトされる（認証チェックが先）。 |

### 4.4. ナビゲーションガード - ログイン済みの場合

| テストNo. | テストケース | 遷移先 | `isAdmin` | 期待する結果 |
| :--- | :--- | :--- | :--- | :--- |
| 4-1 | ログインページ（管理者ログイン済み） | `/login` | `true` | `/admin/dashboard`にリダイレクトされる。 |
| 4-2 | ログインページ（一般ユーザーログイン済み） | `/login` | `false` | `/`にリダイレクトされる。 |

### 4.5. checkAuth呼び出し

| テストNo. | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| 5-1 | 全遷移時 | `authStore.checkAuth()`が呼び出される。 |

### 4.6. 遅延ローディング

| テストNo. | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| 6-1 | LoginView | `import('@/views/LoginView.vue')`で遅延ローディング。 |
| 6-2 | HomeView | `import('@/views/HomeView.vue')`で遅延ローディング。 |
| 6-3 | AttendanceListView | `import('@/views/AttendanceListView.vue')`で遅延ローディング。 |
| 6-4 | DashboardView | `import('@/views/admin/DashboardView.vue')`で遅延ローディング。 |
| 6-5 | EmployeeListView | `import('@/views/admin/EmployeeListView.vue')`で遅延ローディング。 |
| 6-6 | AttendanceEditView | `import('@/views/admin/AttendanceEditView.vue')`で遅延ローディング。 |
| 6-7 | TeamView | `import('@/views/admin/TeamView.vue')`で遅延ローディング。 |
