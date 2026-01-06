# 勤怠管理システム 基本設計書

## 1. システム概要

### 1.1 目的
従業員の勤怠状況を効率的に管理し、打刻・勤怠確認・分析を一元的に行うシステム

### 1.2 対象ユーザー
- 一般従業員: 自身の打刻と勤怠確認
- 主任: 配下メンバーの勤怠管理
- 管理者: 全従業員の勤怠管理と分析

### 1.3 技術スタック
- フロントエンド: Vue 3 (Composition API) + TypeScript
- UIフレームワーク: Vuetify 3
- 状態管理: Pinia
- グラフ表示: ApexCharts (vue3-apexcharts)
- ルーティング: Vue Router

## 2. システム構成

### 2.1 ディレクトリ構造
```
src/
├── views/              # 画面コンポーネント
│   ├── LoginView.vue
│   ├── HomeView.vue
│   ├── AttendanceListView.vue
│   └── admin/
│       ├── DashboardView.vue
│       ├── EmployeeListView.vue
│       └── TeamView.vue
├── layouts/            # レイアウトコンポーネント
│   └── MainLayout.vue
├── stores/             # 状態管理
│   └── auth.ts
├── router/             # ルーティング設定
│   └── index.ts
├── data/               # モックデータ
│   └── mockData.ts
├── types/              # 型定義
│   └── index.ts
└── plugins/            # プラグイン設定
    └── vuetify.ts
```

### 2.2 データモデル

#### User (ユーザー)
```typescript
interface User {
  id: string                    // ユーザーID
  name: string                  // 氏名
  email: string                 // メールアドレス
  role: 'employee' | 'admin'    // 権限
  department: string            // 部署
  position?: string             // 役職
  employeeNumber?: string       // 社員番号
  managerId: string | null      // 上司ID（主任の場合は管理者ID）
  createdAt?: Date
  updatedAt?: Date
}
```

#### Attendance (勤怠記録)
```typescript
interface Attendance {
  id: string                    // 勤怠ID
  userId: string                // ユーザーID
  date: string                  // 日付 (YYYY-MM-DD)
  checkIn: Date | null          // 出勤時刻
  checkInLocation: Location | null   // 出勤位置情報
  checkOut: Date | null         // 退勤時刻
  checkOutLocation: Location | null  // 退勤位置情報
  workingMinutes: number        // 勤務時間（分）
  status: AttendanceStatus      // 勤怠ステータス
  note: string                  // 備考
}
```

#### Location (位置情報)
```typescript
interface Location {
  latitude: number              // 緯度
  longitude: number             // 経度
  accuracy: number              // 精度（メートル）
}
```

#### AttendanceStatus (勤怠ステータス)
```typescript
type AttendanceStatus =
  | 'present'      // 正常出勤
  | 'late'         // 遅刻
  | 'early_leave'  // 早退
  | 'absent'       // 欠勤
```

## 3. 画面設計

### 3.1 認証・共通

#### 3.1.1 ログイン画面 (LoginView.vue)
**パス:** `/login`
**レイアウト:** なし
**機能:**
- メールアドレス・パスワード入力
- モックアカウント自動入力ボタン
  - 管理者: admin@example.com / password
  - 一般従業員: yamada@example.com / password
- ログイン処理
- 役割に応じたリダイレクト
  - 管理者 → `/admin/dashboard`
  - 一般従業員 → `/`

**主要コンポーネント:**
- v-text-field (メールアドレス)
- v-text-field (パスワード、type="password")
- v-btn (ログイン)
- v-btn (モックアカウント自動入力)

#### 3.1.2 共通レイアウト (MainLayout.vue)
**構成要素:**
1. メインヘッダー (v-app-bar)
   - タイトル: "勤怠管理システム"
   - ユーザー情報表示 (v-chip)
   - ログアウトボタン (v-btn)

2. タブナビゲーション (v-app-bar) ※一般従業員のみ
   - 打刻タブ
   - 勤怠一覧タブ

3. サイドバー (v-navigation-drawer) ※管理者のみ
   - ダッシュボード
   - 従業員管理
   - チーム勤怠
   - 勤怠一覧

4. メインコンテンツ (v-main)
   - 各画面の表示領域

### 3.2 一般従業員画面

#### 3.2.1 打刻画面 (HomeView.vue)
**パス:** `/`
**権限:** 一般従業員
**レイアウト:** タブナビゲーション
**機能:**
- リアルタイム時刻表示
- 本日の出勤状態表示
- 出勤打刻ボタン
  - 位置情報取得
  - 打刻時刻記録
- 退勤打刻ボタン
  - 位置情報取得
  - 打刻時刻記録
  - 勤務時間計算

**主要コンポーネント:**
- v-card (ステータス表示)
- v-btn (出勤/退勤ボタン)
- リアルタイム時計表示

**処理フロー:**
1. 画面表示時に本日の勤怠データを取得
2. 出勤ボタンクリック → 位置情報取得 → 出勤時刻記録
3. 退勤ボタンクリック → 位置情報取得 → 退勤時刻記録 → 勤務時間計算

#### 3.2.2 勤怠一覧画面 (AttendanceListView.vue)
**パス:** `/attendance`
**権限:** 一般従業員・管理者
**レイアウト:** タブナビゲーション (一般) / サイドバー (管理者)
**機能:**
- 日付選択
- 全従業員の勤怠一覧表示
- 出勤時刻・退勤時刻・勤務時間・位置情報・ステータス表示
- ステータス別色分け (v-chip)

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

### 3.3 管理者画面

#### 3.3.1 ダッシュボード (DashboardView.vue)
**パス:** `/admin/dashboard`
**権限:** 管理者
**レイアウト:** サイドバー
**機能:**
- サマリーカード表示
  - 従業員数
  - 本日出勤中
  - 遅刻・早退
  - 今月の総勤務時間
- グラフ表示
  1. 月次出勤率推移 (折れ線グラフ)
  2. 部署別平均勤務時間 (棒グラフ)
  3. 遅刻・早退の推移 (複数折れ線グラフ)
  4. 当日の出勤状況 (ドーナツグラフ)

**サマリーデータ計算:**
```typescript
const summary = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayAttendances = mockAttendances.filter((att) => att.date === today)

  return {
    totalEmployees: mockUsers.filter((user) => user.role === 'employee').length,
    todayPresent: todayAttendances.filter((att) => att.status === 'present').length,
    todayLateEarly: todayAttendances.filter((att) =>
      att.status === 'late' || att.status === 'early_leave'
    ).length,
    monthlyTotalHours: Math.floor(totalMinutes / 60)
  }
})
```

**グラフ種類:**
- Line Chart: 月次出勤率、遅刻・早退推移
- Bar Chart: 部署別平均勤務時間
- Donut Chart: 当日の出勤状況

**主要コンポーネント:**
- v-card (サマリーカード)
- apexchart (グラフコンポーネント)

#### 3.3.2 従業員管理画面 (EmployeeListView.vue)
**パス:** `/admin/employees`
**権限:** 管理者
**レイアウト:** サイドバー
**機能:**
- 対象月選択
- 従業員一覧表示
- 月次勤怠ステータス集計表示
  - 正常出勤数
  - 遅刻数
  - 早退数
  - 欠勤数

**データテーブル列:**
| 列名 | 内容 |
|------|------|
| 社員番号 | employeeNumber |
| 名前 | name |
| 役職 | position |
| 当月の出勤ステータス | 正常・遅刻・早退・欠勤の件数 (v-chip) |
| 備考 | note |

**集計ロジック:**
```typescript
const employeeList = computed(() => {
  return mockUsers
    .filter((user) => user.role === 'employee')
    .map((user) => {
      const monthAttendances = mockAttendances.filter(
        (att) => att.userId === user.id && att.date.startsWith(selectedMonth.value)
      )

      const attendanceStatus = {
        present: monthAttendances.filter(att => att.status === 'present').length,
        late: monthAttendances.filter(att => att.status === 'late').length,
        early_leave: monthAttendances.filter(att => att.status === 'early_leave').length,
        absent: monthAttendances.filter(att => att.status === 'absent').length,
      }

      return { ...user, attendanceStatus }
    })
})
```

**主要コンポーネント:**
- v-text-field (月選択、type="month")
- v-data-table (従業員一覧)
- v-chip (ステータス件数表示)

#### 3.3.3 チーム勤怠管理画面 (TeamView.vue)
**パス:** `/admin/team`
**権限:** 管理者
**レイアウト:** サイドバー
**機能:**
- 主任選択 (v-select)
- 日付選択
- チームサマリー表示
  - チームメンバー数
  - 正常出勤数
  - 遅刻・早退数
  - 欠勤数
- チームメンバー勤怠一覧表示

**主任選択:**
```typescript
const managers = computed(() => {
  return mockUsers
    .filter((user) => user.position === '主任' && user.role === 'employee')
    .map((user) => ({
      id: user.id,
      name: user.name,
      label: `${user.name} (${user.department} - ${user.employeeNumber})`,
      department: user.department,
      employeeNumber: user.employeeNumber,
    }))
})
```

**チームメンバー取得:**
```typescript
const teamAttendanceList = computed(() => {
  if (!selectedManagerId.value) return []

  const teamMembers = mockUsers.filter(
    (user) => user.managerId === selectedManagerId.value && user.role === 'employee'
  )

  return teamMembers.map((user) => {
    const attendance = mockAttendances.find(
      (att) => att.userId === user.id && att.date === selectedDate.value
    )

    // 勤務時間計算
    let workingHours = '-'
    if (attendance?.workingMinutes) {
      const hours = Math.floor(attendance.workingMinutes / 60)
      const minutes = attendance.workingMinutes % 60
      workingHours = `${hours}:${minutes.toString().padStart(2, '0')}`
    }

    return {
      employeeNumber: user.employeeNumber || '-',
      name: user.name,
      position: user.position,
      checkIn: attendance?.checkIn || null,
      checkOut: attendance?.checkOut || null,
      workingHours,
      note: attendance?.note || '',
      status: attendance ? attendance.status : 'absent',
    }
  })
})
```

**データテーブル列:**
| 列名 | 内容 |
|------|------|
| 社員番号 | employeeNumber |
| 名前 | name |
| 役職 | position |
| 出勤時刻 | checkIn (HH:mm形式) |
| 退勤時刻 | checkOut (HH:mm形式) |
| 勤務時間 | workingHours (H:mm形式) |
| ステータス | status (色付きチップ) |
| 備考 | note |

**主要コンポーネント:**
- v-select (主任選択)
- v-text-field (日付選択、type="date")
- v-card (サマリーカード)
- v-data-table (チームメンバー一覧)
- v-chip (ステータス表示)

## 4. ルーティング設計

### 4.1 ルート定義
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
    path: '/admin/team',
    name: 'admin-team',
    component: TeamView,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]
```

### 4.2 ナビゲーションガード
- 認証チェック (requiresAuth)
- 管理者権限チェック (requiresAdmin)
- 未認証時はログイン画面へリダイレクト
- ログイン後は役割に応じたページへリダイレクト
  - 管理者: `/admin/dashboard`
  - 一般従業員: `/`

## 5. 状態管理 (Pinia)

### 5.1 Auth Store
```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    userName: (state) => state.user?.name || '',
    userEmail: (state) => state.user?.email || ''
  },

  actions: {
    async login(email: string, password: string) {
      // ログイン処理
    },
    logout() {
      // ログアウト処理
    }
  }
})
```

## 6. 共通機能・ユーティリティ

### 6.1 日時フォーマット
```typescript
// HH:mm形式に変換
const formatTime = (date: Date | string | null): string => {
  if (!date) return '-'
  return new Date(date).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// YYYY-MM-DD形式取得
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0]
}

// YYYY-MM形式取得
const getCurrentMonthString = (): string => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}
```

### 6.2 勤務時間計算
```typescript
// 分を H:mm形式に変換
const formatWorkingHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}:${mins.toString().padStart(2, '0')}`
}
```

### 6.3 ステータス設定
```typescript
const statusConfig: Record<string, StatusConfig> = {
  present: { text: '正常', color: 'success' },
  late: { text: '遅刻', color: 'warning' },
  early_leave: { text: '早退', color: 'info' },
  absent: { text: '欠勤', color: 'error' },
}

const getStatusText = (status: string): string => {
  return statusConfig[status]?.text || status
}

const getStatusColor = (status: string): string => {
  return statusConfig[status]?.color || 'grey'
}
```

### 6.4 位置情報取得
```typescript
const getCurrentPosition = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('位置情報がサポートされていません'))
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => reject(error)
    )
  })
}
```

## 7. モックデータ構造

### 7.1 ユーザーデータ
- 管理者: 1名 (user010 - 管理者権限)
- 主任: 3名 (user003, user006, user007)
  - 営業部: 鈴木一郎 (EMP003)
  - 開発部: 伊藤直樹 (EMP006)
  - 総務部: 渡辺優子 (EMP007)
- 一般従業員: 6名
  - 営業部: 山田太郎 (EMP001), 中村誠 (EMP008) → 鈴木主任配下
  - 開発部: 佐藤花子 (EMP002), 高橋健太 (EMP005) → 伊藤主任配下
  - 総務部: 田中美咲 (EMP004), 小林麻衣 (EMP009) → 渡辺主任配下

### 7.2 組織階層
```
管理者 (user010)
├── 営業部主任: 鈴木一郎 (user003)
│   ├── 山田太郎 (user001)
│   └── 中村誠 (user008)
├── 開発部主任: 伊藤直樹 (user006)
│   ├── 佐藤花子 (user002)
│   └── 高橋健太 (user005)
└── 総務部主任: 渡辺優子 (user007)
    ├── 田中美咲 (user004)
    └── 小林麻衣 (user009)
```

### 7.3 勤怠データ
- 2026-01-05のデータを含む
- 各ユーザーの出勤・退勤時刻
- 位置情報 (緯度・経度・精度)
- ステータス (正常・遅刻・早退・欠勤)
- 勤務時間（分）

### 7.4 グラフデータ
- 月次出勤率推移 (8月～1月の6ヶ月間)
- 部署別平均勤務時間 (営業部・開発部・総務部)
- 遅刻・早退の推移 (8月～1月の6ヶ月間)
- 当日の出勤状況 (出勤・欠勤の割合)

## 8. UI/UX設計

### 8.1 カラースキーム
- Primary: Vuetifyデフォルト (青系)
- Success: 緑 (#4CAF50) - 正常出勤
- Warning: オレンジ (#FF9800) - 遅刻
- Info: 水色 (#03A9F4) - 早退
- Error: 赤 (#F44336) - 欠勤

### 8.2 レスポンシブ対応
- v-col の cols/md 属性を使用
- サマリーカード: cols="12" md="3" (4列表示)
- グラフカード: cols="12" md="6" (2列表示)
- フォーム: cols="12" md="4" または md="6"

### 8.3 アイコン使用
- Material Design Icons (@mdi/font)
- 主要アイコン:
  - mdi-account: ユーザー
  - mdi-clock-outline: 打刻
  - mdi-calendar-clock: 勤怠一覧
  - mdi-view-dashboard: ダッシュボード
  - mdi-account-group: 従業員管理
  - mdi-account-multiple: チーム勤怠
  - mdi-logout: ログアウト

### 8.4 データテーブル
- ソート機能: sortable プロパティで制御
- ページネーション: items-per-page で設定 (デフォルト10件)
- elevation: 0 (フラットデザイン)

## 9. セキュリティ設計

### 9.1 認証・認可
- ログイン必須ページは requiresAuth メタデータ
- 管理者専用ページは requiresAdmin メタデータ
- ナビゲーションガードで未認証アクセスをブロック

### 9.2 位置情報
- ユーザー許可が必要
- 位置情報取得失敗時のエラーハンドリング
- 精度情報も記録

## 10. 将来の拡張性

### 10.1 バックエンド連携
現在はモックデータだが、以下の準備が整っている:
- 型定義による型安全性
- computed プロパティによるリアクティブなデータ処理
- async/await による非同期処理対応

### 10.2 追加機能候補
- CSV エクスポート機能
- 勤怠申請・承認フロー
- 休暇管理
- シフト管理
- 通知機能
- 逆ジオコーディング (位置情報から住所へ変換)

### 10.3 パフォーマンス最適化
- 仮想スクロール (大量データ対応)
- データキャッシング
- レイジーローディング
- コンポーネント分割

## 11. テスト方針

### 11.1 ユニットテスト
- Vitest を使用
- computed プロパティのロジックテスト
- ユーティリティ関数のテスト

### 11.2 E2Eテスト候補
- ログインフロー
- 打刻フロー
- 勤怠データ表示
- グラフ表示

## 12. 開発・運用

### 12.1 開発コマンド
```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run preview      # プレビュー
npm run test:unit    # ユニットテスト
npm run lint         # Lint実行
npm run format       # コード整形
```

### 12.2 モックアカウント
| 役割 | メールアドレス | パスワード |
|------|---------------|-----------|
| 管理者 | admin@example.com | password |
| 一般従業員 | yamada@example.com | password |

### 12.3 開発環境
- Node.js: ^20.19.0 || >=22.12.0
- 開発サーバー: http://localhost:5174/
