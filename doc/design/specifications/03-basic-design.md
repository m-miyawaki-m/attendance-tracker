# 勤怠管理システム 基本設計書

## 1. 画面設計

### 1.1 画面一覧

| No | 画面名 | パス | 権限 | レイアウト |
|----|-------|------|------|-----------|
| 1 | ログイン | /login | なし | なし |
| 2 | 打刻（ホーム） | / | 一般従業員 | タブナビ |
| 3 | 月次勤怠一覧 | /attendance | 全員 | タブナビ/サイドバー |
| 4 | ダッシュボード | /admin/dashboard | 管理者 | サイドバー |
| 5 | 従業員一覧 | /admin/employees | 管理者 | サイドバー |
| 6 | 勤怠編集 | /admin/edit/:id | 管理者 | サイドバー |
| 7 | チーム勤怠 | /admin/team | 管理者 | サイドバー |

### 1.2 認証・共通画面

#### 1.2.1 ログイン画面 (LoginView.vue)

**パス:** `/login`

**機能:**
- メールアドレス・パスワード入力
- Firebase Authenticationによるログイン
- 役割に応じたリダイレクト
  - 管理者 → `/admin/dashboard`
  - 一般従業員 → `/`

**主要コンポーネント:**
- v-text-field (メールアドレス)
- v-text-field (パスワード、type="password")
- v-btn (ログイン)

#### 1.2.2 共通レイアウト (MainLayout.vue)

**構成要素:**

1. **メインヘッダー (v-app-bar)**
   - タイトル: "勤怠管理システム"
   - ユーザー情報表示 (v-chip)
   - ログアウトボタン (v-btn)

2. **タブナビゲーション** ※一般従業員のみ
   - 打刻タブ
   - 勤怠一覧タブ

3. **サイドバー (v-navigation-drawer)** ※管理者のみ
   - ダッシュボード
   - 従業員管理
   - チーム勤怠
   - 勤怠一覧

4. **メインコンテンツ (v-main)**
   - 各画面の表示領域

### 1.3 一般従業員画面

#### 1.3.1 打刻画面 (HomeView.vue)

**パス:** `/`

**機能:**
- リアルタイム時刻表示
- 本日の出勤状態表示
- 出勤打刻ボタン（位置情報取得）
- 退勤打刻ボタン（位置情報取得、勤務時間計算）

**主要コンポーネント:**
- v-card (ステータス表示)
- v-btn (出勤/退勤ボタン)
- リアルタイム時計表示

**処理フロー:**
```
1. 画面表示 → 本日の勤怠データ取得
2. 出勤ボタン → 位置情報取得 → 出勤時刻記録
3. 退勤ボタン → 位置情報取得 → 退勤時刻記録 → 勤務時間計算
```

#### 1.3.2 月次勤怠一覧画面 (AttendanceListView.vue)

**パス:** `/attendance`

**機能:**
- 日付選択
- 全従業員の勤怠一覧表示
- ステータス別色分け

**データテーブル列:**

| 列名 | 内容 |
|------|------|
| 社員番号 | employeeNumber |
| 名前 | name |
| 役職 | position |
| 出勤時刻 | checkIn (HH:mm形式) |
| 退勤時刻 | checkOut (HH:mm形式) |
| 勤務時間 | workingHours (H:mm形式) |
| 位置情報 | 出勤時の住所 |
| ステータス | status (色付きチップ) |
| 備考 | note |

**主要コンポーネント:**
- v-text-field (日付選択、type="date")
- v-data-table (勤怠一覧)
- v-chip (ステータス表示)

### 1.4 管理者画面

#### 1.4.1 ダッシュボード (DashboardView.vue)

**パス:** `/admin/dashboard`

**機能:**

1. **サマリーカード表示**
   - 従業員数
   - 本日出勤中
   - 遅刻・早退
   - 今月の総勤務時間

2. **グラフ表示**
   - 月次出勤率推移（折れ線グラフ）
   - 部署別平均勤務時間（棒グラフ）
   - 遅刻・早退の推移（複数折れ線グラフ）
   - 当日の出勤状況（ドーナツグラフ）

**主要コンポーネント:**
- v-card (サマリーカード)
- apexchart (グラフコンポーネント)

#### 1.4.2 従業員管理画面 (EmployeeListView.vue)

**パス:** `/admin/employees`

**機能:**
- 対象月選択
- 従業員一覧表示
- 月次勤怠ステータス集計表示

**データテーブル列:**

| 列名 | 内容 |
|------|------|
| 社員番号 | employeeNumber |
| 名前 | name |
| 役職 | position |
| 当月の出勤ステータス | 正常・遅刻・早退・欠勤の件数 |
| 備考 | note |

**主要コンポーネント:**
- v-text-field (月選択、type="month")
- v-data-table (従業員一覧)
- v-chip (ステータス件数表示)

#### 1.4.3 チーム勤怠管理画面 (TeamView.vue)

**パス:** `/admin/team`

**機能:**
- 主任選択 (v-select)
- 日付選択
- チームサマリー表示
- チームメンバー勤怠一覧表示

**主要コンポーネント:**
- v-select (主任選択)
- v-text-field (日付選択、type="date")
- v-card (サマリーカード)
- v-data-table (チームメンバー一覧)
- v-chip (ステータス表示)

#### 1.4.4 勤怠編集画面 (AttendanceEditView.vue)

**パス:** `/admin/edit/:id`

**機能:**
- ユーザー選択
- 日付選択
- 出勤/退勤時刻編集
- ステータス編集
- 備考編集

## 2. ルーティング設計

### 2.1 ルート定義

```typescript
const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { layout: 'none' }
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { layout: 'default', requiresAuth: true }
  },
  {
    path: '/attendance',
    name: 'attendance',
    component: AttendanceListView,
    meta: { layout: 'default', requiresAuth: true }
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/employees',
    name: 'admin-employees',
    component: EmployeeListView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/edit/:id',
    name: 'admin-edit',
    component: AttendanceEditView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/team',
    name: 'admin-team',
    component: TeamView,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]
```

### 2.2 ナビゲーションガード

| ガード | 条件 | 動作 |
|--------|------|------|
| requiresAuth | 未認証 | /login へリダイレクト |
| requiresAdmin | 非管理者 | / へリダイレクト |

### 2.3 リダイレクトルール

| 状態 | ログイン画面アクセス | 保護ページアクセス |
|------|---------------------|-------------------|
| 未認証 | 表示 | /login へ |
| 認証済（管理者） | /admin/dashboard へ | 表示 |
| 認証済（一般） | / へ | 表示（権限あり）|

## 3. 状態管理 (Pinia)

### 3.1 Auth Store (authFirebase.ts)

```typescript
interface AuthState {
  user: User | null
  firebaseUser: FirebaseUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Getters
- isAdmin: boolean          // 管理者判定
- userName: string          // ユーザー名
- userEmail: string         // メールアドレス
- currentUserId: string     // ユーザーID

// Actions
- login(email, password)    // ログイン
- logout()                  // ログアウト
- initializeAuth()          // 認証状態初期化
- fetchUserData(uid)        // ユーザーデータ取得
```

### 3.2 Attendance Store (attendanceFirebase.ts)

```typescript
interface AttendanceState {
  attendances: Attendance[]
  attendancesByUser: Map<string, Attendance[]>
  loading: boolean
  error: string | null
}

// Actions
- fetchAttendances()                      // 全勤怠取得
- fetchAttendancesByDateRange(userId, start, end)  // 期間指定取得
- addAttendance(attendance)               // 勤怠追加
- updateAttendance(id, data)              // 勤怠更新
- clearCache()                            // キャッシュクリア

// Getters
- getAttendancesByDateRange(userId, start, end)    // キャッシュから取得
```

## 4. UI/UX設計

### 4.1 カラースキーム

| ステータス | 色 | Vuetifyカラー |
|-----------|-----|--------------|
| 正常出勤 | 緑 | success (#4CAF50) |
| 遅刻 | オレンジ | warning (#FF9800) |
| 早退 | 水色 | info (#03A9F4) |
| 欠勤 | 赤 | error (#F44336) |

### 4.2 レスポンシブ対応

| コンポーネント | PC (md以上) | モバイル |
|---------------|-------------|---------|
| サマリーカード | 4列 (md="3") | 1列 (cols="12") |
| グラフカード | 2列 (md="6") | 1列 (cols="12") |
| フォーム | 2-3列 | 1列 |

### 4.3 アイコン (Material Design Icons)

| 用途 | アイコン |
|------|---------|
| ユーザー | mdi-account |
| 打刻 | mdi-clock-outline |
| 勤怠一覧 | mdi-calendar-clock |
| ダッシュボード | mdi-view-dashboard |
| 従業員管理 | mdi-account-group |
| チーム勤怠 | mdi-account-multiple |
| ログアウト | mdi-logout |

### 4.4 データテーブル設定

| 設定 | 値 |
|------|-----|
| ページネーション | 10件/ページ |
| ソート | 有効 |
| elevation | 0 (フラット) |

## 5. 関連ドキュメント

- [要件定義書](./01-requirements.md)
- [システム概要設計書](./02-overview.md)
- [詳細設計書](./04-detailed-design.md)
- [コンポーネントツリー](../diagrams/component-tree.md)
- [画面遷移図](../diagrams/screen-transition/flowchart.md)
