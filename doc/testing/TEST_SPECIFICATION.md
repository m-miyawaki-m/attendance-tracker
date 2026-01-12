# テスト仕様書

## 1. テスト概要

### 1.1 目的
勤怠管理システムの品質を保証するため、単体テスト・結合テスト・E2Eテストを体系的に実施する。

### 1.2 テスト環境
| 項目 | 内容 |
|------|------|
| テストランナー | Vitest 4.x |
| コンポーネントテスト | Vue Test Utils |
| 状態管理モック | @pinia/testing |
| E2Eテスト | Playwright（予定） |
| カバレッジ | @vitest/coverage-v8 |

### 1.3 テストファイル構成
```
attendance-tracker/
├── tests/
│   ├── unit/                    # 単体テスト
│   │   ├── data/               # データ層テスト
│   │   │   └── mockData.spec.ts
│   │   ├── stores/             # ストアテスト
│   │   │   └── auth.spec.ts
│   │   ├── utils/              # ユーティリティテスト
│   │   │   └── logger.spec.ts
│   │   └── views/              # ビューテスト
│   │       └── LoginView.spec.ts
│   ├── integration/            # 結合テスト（予定）
│   └── helpers/                # テストヘルパー
│       └── testUtils.ts
├── src/
│   ├── __tests__/              # コンポーネント単体テスト
│   │   └── App.spec.ts
│   └── layouts/__tests__/
│       └── MainLayout.spec.ts
└── e2e/                        # E2Eテスト（予定）
```

---

## 2. 単体テスト仕様

### 2.1 テスト実装状況サマリー

#### 現在のテスト状況
- **実装済み**: 66テスト（6ファイル）
- **コンポーネントカバレッジ**: 3/12（25%）
- **ストアカバレッジ**: 1/6（17%）※auth.tsのみ

#### テストカテゴリ別状況

| カテゴリ | 対象 | テスト数 | 状態 |
|----------|------|----------|------|
| データ層 | mockData | 18 | 完了 |
| 認証ストア | auth.ts（モック版） | 9 | 完了 |
| ログユーティリティ | logger.ts | 17 | 完了 |
| Appコンポーネント | App.vue | 4 | 完了 |
| レイアウト | MainLayout.vue | 17 | 完了 |
| ログインビュー | LoginView.vue | 1 | 最小限 |
| **合計** | | **66** | |

### 2.2 コンポーネントテスト状況

#### 2.2.1 全コンポーネント一覧

| コンポーネント | パス | テスト | 状態 | 優先度 |
|----------------|------|--------|------|--------|
| App.vue | src/ | あり（4件） | 完了 | - |
| MainLayout.vue | src/layouts/ | あり（17件） | 完了 | - |
| LoginView.vue | src/views/ | あり（1件） | 最小限 | 中 |
| HomeView.vue | src/views/ | **なし** | 未実装 | 高 |
| AttendanceListView.vue | src/views/ | **なし** | 未実装 | 中 |
| DashboardView.vue | src/views/admin/ | **なし** | 未実装 | 高 |
| EmployeeListView.vue | src/views/admin/ | **なし** | 未実装 | 中 |
| TeamView.vue | src/views/admin/ | **なし** | 未実装 | 中 |
| AttendanceEditView.vue | src/views/admin/ | **なし** | 未実装 | 低 |
| AdminAttendanceList.vue | src/components/attendance/ | **なし** | 未実装 | 中 |
| UserAttendanceHistory.vue | src/components/attendance/ | **なし** | 未実装 | 中 |
| DevLogViewer.vue | src/components/dev/ | **なし** | 未実装 | 低 |

### 2.3 ストアテスト状況

| ストア | パス | テスト | 状態 | 優先度 |
|--------|------|--------|------|--------|
| auth.ts | src/stores/ | あり（9件） | 完了（モック版） | - |
| authFirebase.ts | src/stores/ | **なし** | 未実装 | 高 |
| attendanceFirebase.ts | src/stores/ | **なし** | 未実装 | 高 |
| userStore.ts | src/stores/ | **なし** | 未実装 | 中 |
| adminAttendanceStore.ts | src/stores/ | **なし** | 未実装 | 中 |
| counter.ts | src/stores/ | **なし** | 未実装 | 低（未使用） |

### 2.4 ユーティリティ・Composableテスト状況

| ファイル | パス | テスト | 状態 | 優先度 |
|----------|------|--------|------|--------|
| logger.ts | src/utils/ | あり（17件） | 完了 | - |
| useLogger.ts | src/composables/ | **なし** | 未実装 | 中 |

### 2.5 データ層テスト（mockData.spec.ts）

#### 2.5.1 mockUsers
| テストNo | テストケース | 期待結果 |
|----------|--------------|----------|
| DATA-001 | ユーザー数の確認 | 21名のユーザーが存在 |
| DATA-002 | 管理者の存在確認 | admin@example.com が存在 |
| DATA-003 | 一般従業員の存在確認 | employee ロールが1名以上 |
| DATA-004 | 必須フィールド確認 | id, name, email, role, department が全員に存在 |

#### 2.5.2 mockAttendances
| テストNo | テストケース | 期待結果 |
|----------|--------------|----------|
| DATA-005 | 打刻データの存在 | 1件以上存在 |
| DATA-006 | 必須フィールド確認 | id, userId, date, checkIn, status が全件に存在 |
| DATA-007 | 位置情報形式 | latitude, longitude, accuracy が数値 |
| DATA-008 | 退勤データ整合性 | checkOut がある場合、workingMinutes > 0 |

#### 2.5.3 mockChartData
| テストNo | テストケース | 期待結果 |
|----------|--------------|----------|
| DATA-009 | 出勤率データ | 6ヶ月分のデータ存在 |
| DATA-010 | 平均勤務時間データ | カテゴリとシリーズが存在 |
| DATA-011 | 遅刻・早退データ | 3ヶ月分、2シリーズ |
| DATA-012 | 部署別状況データ | 2ラベル、2シリーズ |

#### 2.5.4 その他
| テストNo | テストケース | 期待結果 |
|----------|--------------|----------|
| DATA-013 | サマリー型チェック | 数値型であること |
| DATA-014 | 出勤率範囲チェック | 0-100の範囲 |
| DATA-015 | ステータス定義 | present, late, early_leave, absent が定義 |
| DATA-016 | ステータス属性 | text, color が各ステータスに存在 |
| DATA-017 | 部署リスト存在 | 1件以上存在 |
| DATA-018 | 部署型チェック | 全て文字列 |

### 2.6 認証ストアテスト（auth.spec.ts）

| テストNo | テストケース | 前提条件 | 操作 | 期待結果 |
|----------|--------------|----------|------|----------|
| AUTH-001 | 初期状態確認 | なし | ストア初期化 | isAuthenticated=false, user=null |
| AUTH-002 | 一般ユーザーログイン | なし | 正しい認証情報でlogin | isAuthenticated=true, role=employee |
| AUTH-003 | 管理者ログイン | なし | admin認証情報でlogin | isAuthenticated=true, role=admin |
| AUTH-004 | 不正認証拒否 | なし | 存在しないメールでlogin | result=false, isAuthenticated=false |
| AUTH-005 | ログアウト | ログイン済み | logout | isAuthenticated=false |
| AUTH-006 | LocalStorage保存 | なし | login | LocalStorageに認証情報保存 |
| AUTH-007 | 認証状態復元 | LocalStorage設定済み | checkAuth | isAuthenticated=true |
| AUTH-008 | computed値計算 | ログイン済み | 各computed参照 | 正しい値が返る |
| AUTH-009 | rememberMeオプション | なし | rememberMe=true でlogin | LocalStorageにremember保存 |

### 2.7 ログユーティリティテスト（logger.spec.ts）

#### 2.7.1 ログ出力
| テストNo | テストケース | 操作 | 期待結果 |
|----------|--------------|------|----------|
| LOG-001 | debugログ記録 | logger.debug() | level=debug で記録 |
| LOG-002 | infoログ記録 | logger.info() | level=info で記録 |
| LOG-003 | warnログ記録 | logger.warn() | level=warn で記録 |
| LOG-004 | errorログ記録 | logger.error() | level=error で記録 |
| LOG-005 | logメソッド | logger.log() | level=info で記録 |
| LOG-006 | データなしログ | logger.info('msg') | data=undefined |
| LOG-007 | 複数ログ順序 | 3回ログ出力 | 出力順に配列格納 |

#### 2.7.2 ログ操作
| テストNo | テストケース | 操作 | 期待結果 |
|----------|--------------|------|----------|
| LOG-008 | ログクリア | clearLogs() | 件数0になる |
| LOG-009 | 件数取得 | getLogCount() | 正しい件数 |
| LOG-010 | サイズ取得 | getLogSize() | サイズ増加確認 |

#### 2.7.3 フォーマット・リスナー
| テストNo | テストケース | 操作 | 期待結果 |
|----------|--------------|------|----------|
| LOG-011 | テキスト形式化 | formatLogsAsText() | [timestamp] [LEVEL] message 形式 |
| LOG-012 | 更新通知受信 | onLogUpdate() | コールバック呼び出し |
| LOG-013 | 購読解除 | unsubscribe() | 以後コールバック無し |
| LOG-014 | 複数リスナー | 2つ登録 | 両方に通知 |

#### 2.7.4 LocalStorage
| テストNo | テストケース | 操作 | 期待結果 |
|----------|--------------|------|----------|
| LOG-015 | 保存確認 | logger.info() | LocalStorageに保存 |
| LOG-016 | 復元確認 | getLogs() | 既存ログ取得 |
| LOG-017 | 不正JSON対応 | 不正JSON設定後getLogs() | 空配列返却 |

### 2.8 コンポーネントテスト詳細

#### 2.8.1 App.vue（App.spec.ts）
| テストNo | テストケース | 条件 | 期待結果 |
|----------|--------------|------|----------|
| APP-001 | レイアウトnone | meta.layout='none' | MainLayout非表示 |
| APP-002 | 管理者レイアウト | role=admin | showSidebar=true |
| APP-003 | 一般ユーザーレイアウト | role=user, layout=default | showTabs=true |
| APP-004 | デフォルトレイアウト | metaなし | MainLayout表示 |

#### 2.8.2 MainLayout.vue（MainLayout.spec.ts）
※ 詳細は [MainLayout-test-spec.md](./MainLayout-test-spec.md) 参照

| カテゴリ | テスト数 | 概要 |
|----------|----------|------|
| 表示制御 | 8 | props による UI パーツ表示制御 |
| 認証状態 | 2 | ログイン/未ログイン時の表示 |
| ユーザー権限 | 2 | 一般/管理者のタブ表示 |
| インタラクション | 3 | ログアウト、サイドバー開閉 |
| 内部ロジック | 2 | フッター年表示、スナックバー |

#### 2.8.3 LoginView.vue（LoginView.spec.ts）
| テストNo | テストケース | 操作 | 期待結果 |
|----------|--------------|------|----------|
| LOGIN-001 | 正常レンダリング | マウント | タイトル・入力欄表示 |

---

## 3. 結合テスト仕様（予定）

### 3.1 テストシナリオ

#### 3.1.1 認証フロー
| テストNo | シナリオ | 操作手順 | 期待結果 |
|----------|----------|----------|----------|
| INT-001 | ログイン→ホーム | 1. ログイン画面表示<br>2. 認証情報入力<br>3. ログインボタン押下 | ホーム画面に遷移 |
| INT-002 | ログアウト→ログイン | 1. ホーム画面<br>2. ログアウト押下 | ログイン画面に遷移 |
| INT-003 | 認証状態保持 | 1. ログイン<br>2. ページリロード | ログイン状態維持 |

#### 3.1.2 打刻フロー
| テストNo | シナリオ | 操作手順 | 期待結果 |
|----------|----------|----------|----------|
| INT-004 | 出勤打刻 | 1. ホーム画面<br>2. 出勤ボタン押下 | 出勤記録作成、ステータス更新 |
| INT-005 | 退勤打刻 | 1. 出勤済み状態<br>2. 退勤ボタン押下 | 退勤記録追加、勤務時間計算 |
| INT-006 | 二重打刻防止 | 1. 出勤済み状態<br>2. 出勤ボタン押下 | ボタン無効化/エラー表示 |

#### 3.1.3 管理者フロー
| テストNo | シナリオ | 操作手順 | 期待結果 |
|----------|----------|----------|----------|
| INT-007 | ダッシュボード表示 | 管理者ログイン | グラフ・サマリー表示 |
| INT-008 | チーム勤怠確認 | 1. 主任選択<br>2. 日付選択 | チームメンバー勤怠一覧 |
| INT-009 | 勤怠編集 | 1. 従業員選択<br>2. 勤怠データ修正 | データ更新反映 |

### 3.2 ストア間連携テスト

| テストNo | 対象ストア | テスト内容 | 期待結果 |
|----------|------------|------------|----------|
| INT-010 | auth + attendance | ログインユーザーの勤怠取得 | 正しいユーザーIDでクエリ |
| INT-011 | user + adminAttendance | 主任配下メンバーの勤怠取得 | managerId でフィルタ |
| INT-012 | auth + user | ユーザー権限に基づく表示 | roleに応じた画面表示 |

---

## 4. テストデータ仕様

### 4.1 ユーザーデータ

#### 4.1.1 テストアカウント
| 区分 | メール | パスワード | 役割 | 用途 |
|------|--------|------------|------|------|
| 管理者 | admin@example.com | password | admin | 管理機能テスト |
| 一般 | yamada@example.com | password | employee | 打刻機能テスト |
| 主任 | suzuki@example.com | password | employee (主任) | チーム管理テスト |

#### 4.1.2 ユーザー構成
```
管理者: 1名
主任: 3名（各部署1名）
一般従業員: 17名
合計: 21名

部署構成:
├── 開発部（7名）
│   └── 主任: 鈴木一郎（配下6名）
├── 営業部（7名）
│   └── 主任: 佐藤花子（配下6名）
└── 総務部（6名）
    └── 主任: 田中次郎（配下5名）
```

### 4.2 勤怠データ

#### 4.2.1 ステータス
| ステータス | 値 | 表示テキスト | 色 |
|------------|-----|--------------|-----|
| 正常出勤 | present | 正常出勤 | success |
| 遅刻 | late | 遅刻 | warning |
| 早退 | early_leave | 早退 | warning |
| 欠勤 | absent | 欠勤 | error |

#### 4.2.2 テスト用勤怠パターン
| パターン | 出勤時刻 | 退勤時刻 | ステータス | 用途 |
|----------|----------|----------|------------|------|
| 正常 | 09:00 | 18:00 | present | 基本テスト |
| 遅刻 | 09:30 | 18:00 | late | 遅刻判定テスト |
| 早退 | 09:00 | 16:00 | early_leave | 早退判定テスト |
| 勤務中 | 09:00 | null | present | 退勤前状態テスト |
| 欠勤 | - | - | absent | 欠勤表示テスト |

### 4.3 Firebase Emulator テストデータ

#### 4.3.1 データ投入方法
```bash
# Emulator起動
npm run emulator

# シードデータ投入
npm run seed:emulator
```

#### 4.3.2 シードデータ内容
- ユーザー: 21名（上記構成）
- 勤怠: 過去30日分（各ユーザー）
- 位置情報: 東京駅周辺の座標

---

## 5. E2Eテスト仕様（予定）

### 5.1 テストケース

| テストNo | シナリオ | 操作 | 確認項目 |
|----------|----------|------|----------|
| E2E-001 | ログイン成功 | 正しい認証情報入力 | ホーム画面遷移 |
| E2E-002 | ログイン失敗 | 誤った認証情報入力 | エラーメッセージ表示 |
| E2E-003 | 出勤打刻 | 出勤ボタンクリック | ステータス更新、時刻表示 |
| E2E-004 | 退勤打刻 | 退勤ボタンクリック | 勤務時間計算、ステータス更新 |
| E2E-005 | 勤怠履歴確認 | 勤怠一覧タブ選択 | 月次データ表示 |
| E2E-006 | ダッシュボード | 管理者ログイン | グラフ表示、数値表示 |
| E2E-007 | チーム勤怠 | 主任選択→日付選択 | メンバー一覧表示 |

### 5.2 テスト環境

| 項目 | 設定 |
|------|------|
| ブラウザ | Chromium, Firefox, WebKit |
| ベースURL | http://localhost:5173 |
| 認証 | Firebase Emulator |
| データ | シードデータ使用 |

---

## 6. テスト実行

### 6.1 コマンド

```bash
# 単体テスト実行
npm run test:unit

# ウォッチモード
npm run test:unit -- --watch

# カバレッジ付き
npm run test:unit -- --coverage

# 特定ファイル
npm run test:unit -- tests/unit/utils/logger.spec.ts

# 結合テスト（予定）
npm run test:integration

# E2Eテスト（予定）
npm run test:e2e
```

### 6.2 CI/CD設定

GitHub Actionsで自動実行:
- プルリクエスト時
- mainブランチへのマージ時

---

## 7. 今後の課題

### 7.1 テストカバレッジ拡充（ストア）

| 優先度 | 対象 | 状態 | 理由 |
|--------|------|------|------|
| 高 | authFirebase.ts | 未実装 | 認証の中核。Firebase連携のモックが必要 |
| 高 | attendanceFirebase.ts | 未実装 | 打刻機能の中核。CRUD操作のテスト必須 |
| 中 | userStore.ts | 未実装 | ユーザー一覧取得のテスト |
| 中 | adminAttendanceStore.ts | 未実装 | 管理者機能のテスト |
| 低 | counter.ts | 未実装 | 未使用のため優先度低 |

### 7.2 テストカバレッジ拡充（コンポーネント）

| 優先度 | 対象 | 状態 | 必要なテスト内容 |
|--------|------|------|-----------------|
| 高 | HomeView.vue | 未実装 | 打刻ボタン表示、時刻表示、状態更新 |
| 高 | DashboardView.vue | 未実装 | グラフ表示、サマリー表示 |
| 中 | LoginView.vue | 最小限 | ログイン処理、バリデーション、エラー表示 |
| 中 | AttendanceListView.vue | 未実装 | 月次勤怠一覧、フィルタリング |
| 中 | TeamView.vue | 未実装 | 主任選択、チーム一覧表示 |
| 中 | EmployeeListView.vue | 未実装 | 従業員一覧、ステータス表示 |
| 中 | AdminAttendanceList.vue | 未実装 | 勤怠データテーブル |
| 中 | UserAttendanceHistory.vue | 未実装 | 履歴表示 |
| 低 | AttendanceEditView.vue | 未実装 | 編集フォーム |
| 低 | DevLogViewer.vue | 未実装 | 開発用のため優先度低 |

### 7.3 テストカバレッジ拡充（ユーティリティ）

| 優先度 | 対象 | 状態 | 必要なテスト内容 |
|--------|------|------|-----------------|
| 中 | useLogger.ts | 未実装 | リアクティブ更新、フィルタリング |

### 7.4 結合テスト追加

- ストア間連携テスト
- Firebase Emulator連携テスト
- ルーティングテスト

### 7.5 E2Eテスト追加

- Playwright導入
- 主要フロー自動テスト
- CI/CD連携

---

## 8. テスト実装ロードマップ

### Phase 1: 高優先度（推奨）
1. HomeView.vue - 打刻機能のUIテスト
2. authFirebase.ts - Firebase認証のモックテスト
3. attendanceFirebase.ts - 勤怠CRUDのモックテスト
4. DashboardView.vue - 管理者ダッシュボードのテスト

### Phase 2: 中優先度
1. LoginView.vue - テスト拡充（現在1件のみ）
2. userStore.ts - ユーザー取得のテスト
3. TeamView.vue / EmployeeListView.vue - 一覧表示テスト
4. useLogger.ts - Composableのテスト

### Phase 3: 結合・E2E
1. ストア間連携テスト
2. Playwright導入・設定
3. 主要フロー（ログイン→打刻→確認）のE2Eテスト
