# 勤怠管理システム システム概要設計書

## 1. 技術スタック

### 1.1 フロントエンド
| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | Vue 3 (Composition API) | 3.x |
| 言語 | TypeScript | 5.x |
| UIフレームワーク | Vuetify 3 | 3.x |
| 状態管理 | Pinia | 2.x |
| ルーティング | Vue Router | 4.x |
| グラフ | ApexCharts (vue3-apexcharts) | 1.x |

### 1.2 バックエンド
| カテゴリ | 技術 | 説明 |
|---------|------|------|
| 認証 | Firebase Authentication | メール/パスワード認証 |
| データベース | Cloud Firestore | NoSQLドキュメントDB |
| ホスティング | Vercel | 静的サイトホスティング |

### 1.3 開発ツール
| カテゴリ | 技術 |
|---------|------|
| ビルドツール | Vite |
| テスト | Vitest + Vue Test Utils |
| Lint | ESLint |
| フォーマッター | Prettier |
| ローカル開発 | Firebase Emulator |

## 2. システム構成

### 2.1 アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│                      クライアント                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Vue 3 SPA                          │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────────────┐   │   │
│  │  │  Views  │ │ Stores  │ │    Router       │   │   │
│  │  └────┬────┘ └────┬────┘ └────────┬────────┘   │   │
│  │       │           │               │            │   │
│  │  ┌────┴───────────┴───────────────┴────────┐   │   │
│  │  │           Firebase SDK                   │   │   │
│  │  └──────────────────┬──────────────────────┘   │   │
│  └─────────────────────┼──────────────────────────┘   │
└────────────────────────┼──────────────────────────────┘
                         │
┌────────────────────────┼──────────────────────────────┐
│                Firebase│                              │
│  ┌─────────────────────┴─────────────────────────┐   │
│  │                                                │   │
│  │  ┌──────────────┐    ┌──────────────────┐     │   │
│  │  │    Auth      │    │    Firestore     │     │   │
│  │  │  Emulator    │    │    Emulator      │     │   │
│  │  └──────────────┘    └──────────────────┘     │   │
│  │         ↓                    ↓                │   │
│  │  ┌──────────────┐    ┌──────────────────┐     │   │
│  │  │ Firebase     │    │ Cloud            │     │   │
│  │  │ Auth         │    │ Firestore        │     │   │
│  │  └──────────────┘    └──────────────────┘     │   │
│  │                                                │   │
│  └────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────┘
```

### 2.2 環境構成

| 環境 | ブランチ | Firebase | デプロイ先 |
|------|---------|----------|-----------|
| ローカル | feature/* | Emulator | localhost:5173 |
| ステージング | develop | 本番 | Vercel Preview |
| 本番 | main | 本番 | Vercel Production |

## 3. ディレクトリ構造

```
attendance-tracker/
├── src/
│   ├── assets/              # 静的アセット（画像、CSS等）
│   ├── components/          # 共通コンポーネント
│   │   ├── attendance/      # 勤怠関連コンポーネント
│   │   └── common/          # 汎用コンポーネント
│   ├── firebase/            # Firebase設定
│   │   └── config.ts        # Firebase初期化・Emulator接続
│   ├── layouts/             # レイアウトコンポーネント
│   │   └── MainLayout.vue
│   ├── plugins/             # プラグイン設定
│   │   └── vuetify.ts
│   ├── router/              # ルーティング設定
│   │   └── index.ts
│   ├── stores/              # Pinia状態管理
│   │   ├── auth.ts          # 認証ストア（モック用）
│   │   ├── authFirebase.ts  # 認証ストア（Firebase）
│   │   └── attendanceFirebase.ts # 勤怠ストア（Firebase）
│   ├── types/               # TypeScript型定義
│   │   └── index.ts
│   ├── views/               # 画面コンポーネント
│   │   ├── LoginView.vue
│   │   ├── HomeView.vue
│   │   ├── AttendanceListView.vue
│   │   └── admin/
│   │       ├── DashboardView.vue
│   │       ├── EmployeeListView.vue
│   │       ├── AttendanceEditView.vue
│   │       └── TeamView.vue
│   ├── App.vue
│   └── main.ts
├── scripts/                 # 開発スクリプト
│   ├── seedEmulator.ts      # Emulatorテストデータ生成
│   ├── exportProductionData.ts
│   ├── importToEmulator.ts
│   ├── exportEmulatorData.ts
│   └── uploadToProduction.ts
├── doc/                     # ドキュメント
│   ├── design/              # 設計書
│   ├── development/         # 開発ガイド
│   ├── testing/             # テスト仕様
│   └── misc/                # その他
├── tests/                   # テストファイル
│   └── unit/
├── firebase.json            # Firebase設定
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## 4. データモデル

### 4.1 ER図

```
┌─────────────┐       ┌─────────────────┐
│    User     │       │   Attendance    │
├─────────────┤       ├─────────────────┤
│ id (PK)     │──┐    │ id (PK)         │
│ name        │  │    │ userId (FK)     │──┐
│ email       │  │    │ date            │  │
│ role        │  └────│ checkIn         │  │
│ department  │       │ checkInLocation │  │
│ position    │       │ checkOut        │  │
│ employeeNo  │       │ checkOutLocation│  │
│ managerId   │───────│ workingMinutes  │  │
│ createdAt   │       │ status          │  │
│ updatedAt   │       │ note            │  │
└─────────────┘       │ createdAt       │  │
      │               │ updatedAt       │  │
      │               └─────────────────┘  │
      │                                    │
      └────────────────────────────────────┘
         managerId → User.id (自己参照)
```

### 4.2 User（ユーザー）

```typescript
interface User {
  id: string                    // ユーザーID（Firebase Auth UID）
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

### 4.3 Attendance（勤怠記録）

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
  createdAt?: Date
  updatedAt?: Date
}
```

### 4.4 Location（位置情報）

```typescript
interface Location {
  latitude: number              // 緯度
  longitude: number             // 経度
  accuracy: number              // 精度（メートル）
}
```

### 4.5 AttendanceStatus（勤怠ステータス）

```typescript
type AttendanceStatus =
  | 'present'      // 正常出勤
  | 'late'         // 遅刻
  | 'early_leave'  // 早退
  | 'absent'       // 欠勤
```

## 5. Firestoreコレクション設計

### 5.1 コレクション構造

```
firestore-root/
├── users/                    # ユーザーコレクション
│   └── {userId}/             # ドキュメント（Auth UIDと同一）
│       ├── name
│       ├── email
│       ├── role
│       ├── department
│       ├── position
│       ├── employeeNumber
│       ├── managerId
│       ├── createdAt
│       └── updatedAt
│
└── attendances/              # 勤怠コレクション
    └── {attendanceId}/       # ドキュメント（自動ID）
        ├── userId
        ├── date
        ├── checkIn
        ├── checkInLocation
        ├── checkOut
        ├── checkOutLocation
        ├── workingMinutes
        ├── status
        ├── note
        ├── createdAt
        └── updatedAt
```

### 5.2 インデックス

| コレクション | フィールド | 用途 |
|-------------|-----------|------|
| attendances | userId, date | ユーザー別日付検索 |
| users | role | 権限別ユーザー検索 |
| users | managerId | チームメンバー検索 |

## 6. 関連ドキュメント

- [要件定義書](./01-requirements.md)
- [基本設計書](./03-basic-design.md)
- [詳細設計書](./04-detailed-design.md)
- [コンポーネントツリー](./component-tree.md)
- [画面遷移図](./screen-transition/flowchart.md)
