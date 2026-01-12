# 単体テスト仕様書 INDEX

このドキュメントは、勤怠管理システムの単体テスト仕様書の一覧です。

## ディレクトリ構造

```
doc/testing/
├── INDEX.md                          # このファイル
├── PHASE1_ROADMAP.md                 # Phase 1 テスト実装ロードマップ
├── TEST_SPECIFICATION.md             # テスト仕様の全体概要
│
├── views/                            # ビューコンポーネント
│   ├── App-test-spec.md
│   ├── MainLayout-test-spec.md
│   ├── LoginView-test-spec.md
│   ├── HomeView-test-spec.md
│   ├── AttendanceListView-test-spec.md
│   └── admin/                        # 管理者用ビュー
│       ├── DashboardView-test-spec.md
│       ├── EmployeeListView-test-spec.md
│       ├── TeamView-test-spec.md
│       └── AttendanceEditView-test-spec.md
│
├── components/                       # 共通コンポーネント
│   ├── attendance/                   # 勤怠関連コンポーネント
│   │   ├── AdminAttendanceList-test-spec.md
│   │   └── UserAttendanceHistory-test-spec.md
│   └── dev/                          # 開発者ツール
│       └── DevLogViewer-test-spec.md
│
├── stores/                           # Piniaストア
│   ├── authFirebase-test-spec.md
│   ├── attendanceFirebase-test-spec.md
│   ├── userStore-test-spec.md
│   └── adminAttendanceStore-test-spec.md
│
├── router/                           # ルーター
│   └── index-test-spec.md
│
├── utils/                            # ユーティリティ
│   └── logger-test-spec.md
│
├── composables/                      # コンポーザブル
│   └── useLogger-test-spec.md
│
├── types/                            # 型定義
│   └── index-test-spec.md
│
├── constants/                        # 定数
│   ├── attendance-test-spec.md
│   └── departments-test-spec.md
│
└── firebase/                         # Firebase設定
    └── config-test-spec.md
```

## テスト仕様書一覧

### Vueコンポーネント

| ファイル | 仕様書パス | 概要 |
| :--- | :--- | :--- |
| `src/App.vue` | [views/App-test-spec.md](views/App-test-spec.md) | ルートコンポーネント、レイアウト制御 |
| `src/layouts/MainLayout.vue` | [views/MainLayout-test-spec.md](views/MainLayout-test-spec.md) | メインレイアウト、ヘッダー/サイドバー/タブ表示 |
| `src/views/LoginView.vue` | [views/LoginView-test-spec.md](views/LoginView-test-spec.md) | ログインページ |
| `src/views/HomeView.vue` | [views/HomeView-test-spec.md](views/HomeView-test-spec.md) | ホーム（打刻画面） |
| `src/views/AttendanceListView.vue` | [views/AttendanceListView-test-spec.md](views/AttendanceListView-test-spec.md) | 勤怠一覧（権限による切り替え） |
| `src/views/admin/DashboardView.vue` | [views/admin/DashboardView-test-spec.md](views/admin/DashboardView-test-spec.md) | 管理者ダッシュボード |
| `src/views/admin/EmployeeListView.vue` | [views/admin/EmployeeListView-test-spec.md](views/admin/EmployeeListView-test-spec.md) | 従業員管理 |
| `src/views/admin/TeamView.vue` | [views/admin/TeamView-test-spec.md](views/admin/TeamView-test-spec.md) | チーム勤怠管理 |
| `src/views/admin/AttendanceEditView.vue` | [views/admin/AttendanceEditView-test-spec.md](views/admin/AttendanceEditView-test-spec.md) | 勤怠編集 |
| `src/components/attendance/AdminAttendanceList.vue` | [components/attendance/AdminAttendanceList-test-spec.md](components/attendance/AdminAttendanceList-test-spec.md) | 管理者用勤怠一覧 |
| `src/components/attendance/UserAttendanceHistory.vue` | [components/attendance/UserAttendanceHistory-test-spec.md](components/attendance/UserAttendanceHistory-test-spec.md) | ユーザー用勤怠履歴 |
| `src/components/dev/DevLogViewer.vue` | [components/dev/DevLogViewer-test-spec.md](components/dev/DevLogViewer-test-spec.md) | 開発者ログビューア |

### Piniaストア

| ファイル | 仕様書パス | 概要 |
| :--- | :--- | :--- |
| `src/stores/authFirebase.ts` | [stores/authFirebase-test-spec.md](stores/authFirebase-test-spec.md) | Firebase認証管理 |
| `src/stores/attendanceFirebase.ts` | [stores/attendanceFirebase-test-spec.md](stores/attendanceFirebase-test-spec.md) | ユーザー勤怠管理（打刻・履歴） |
| `src/stores/userStore.ts` | [stores/userStore-test-spec.md](stores/userStore-test-spec.md) | ユーザー情報管理 |
| `src/stores/adminAttendanceStore.ts` | [stores/adminAttendanceStore-test-spec.md](stores/adminAttendanceStore-test-spec.md) | 管理者用勤怠管理 |

### ルーター

| ファイル | 仕様書パス | 概要 |
| :--- | :--- | :--- |
| `src/router/index.ts` | [router/index-test-spec.md](router/index-test-spec.md) | ルート定義、ナビゲーションガード |

### ユーティリティ

| ファイル | 仕様書パス | 概要 |
| :--- | :--- | :--- |
| `src/utils/logger.ts` | [utils/logger-test-spec.md](utils/logger-test-spec.md) | ログ管理ユーティリティ |

### コンポーザブル

| ファイル | 仕様書パス | 概要 |
| :--- | :--- | :--- |
| `src/composables/useLogger.ts` | [composables/useLogger-test-spec.md](composables/useLogger-test-spec.md) | ログ機能コンポーザブル |

### 型定義

| ファイル | 仕様書パス | 概要 |
| :--- | :--- | :--- |
| `src/types/index.ts` | [types/index-test-spec.md](types/index-test-spec.md) | 共通型定義 |

### 定数

| ファイル | 仕様書パス | 概要 |
| :--- | :--- | :--- |
| `src/constants/attendance.ts` | [constants/attendance-test-spec.md](constants/attendance-test-spec.md) | 勤怠ステータス定数 |
| `src/constants/departments.ts` | [constants/departments-test-spec.md](constants/departments-test-spec.md) | 部署定数 |

### Firebase設定

| ファイル | 仕様書パス | 概要 |
| :--- | :--- | :--- |
| `src/firebase/config.ts` | [firebase/config-test-spec.md](firebase/config-test-spec.md) | Firebase初期化設定 |

## テスト優先度

テスト実装の推奨優先順位：

### 高優先度（ビジネスロジック）
1. `stores/authFirebase-test-spec.md` - 認証は全機能の基盤
2. `stores/attendanceFirebase-test-spec.md` - 主要機能（打刻）
3. `router/index-test-spec.md` - アクセス制御

### 中優先度（UIコンポーネント）
4. `views/LoginView-test-spec.md` - 入口となるページ
5. `views/HomeView-test-spec.md` - 主要画面
6. `views/MainLayout-test-spec.md` - 全体レイアウト

### 通常優先度
7. その他のストア
8. その他のビューコンポーネント
9. 定数・型定義
