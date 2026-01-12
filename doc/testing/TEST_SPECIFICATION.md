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
\`\`\`
attendance-tracker/
├── tests/
│   ├── unit/                      # 単体テスト
│   │   ├── data/                  # データ層テスト
│   │   │   └── mockData.spec.ts
│   │   ├── stores/                # ストアテスト
│   │   │   ├── auth.spec.ts
│   │   │   ├── authFirebase.spec.ts
│   │   │   ├── attendanceFirebase.spec.ts
│   │   │   └── userStore.spec.ts
│   │   ├── utils/                 # ユーティリティテスト
│   │   │   └── logger.spec.ts
│   │   ├── composables/           # Composableテスト
│   │   │   └── useLogger.spec.ts
│   │   └── views/                 # ビューテスト
│   │       ├── LoginView.spec.ts
│   │       ├── HomeView.spec.ts
│   │       └── admin/
│   │           ├── DashboardView.spec.ts
│   │           ├── TeamView.spec.ts
│   │           └── EmployeeListView.spec.ts
│   ├── integration/               # 結合テスト（予定）
│   └── helpers/                   # テストヘルパー
│       └── testUtils.ts
├── src/
│   ├── __tests__/                 # コンポーネント単体テスト
│   │   └── App.spec.ts
│   └── layouts/__tests__/
│       └── MainLayout.spec.ts
└── e2e/                           # E2Eテスト（予定）
\`\`\`

---

## 2. テスト実装状況サマリー

### 2.1 現在のテスト状況（2026-01-13時点）

- **実装済み**: 317テスト（14ファイル）
- **コンポーネントカバレッジ**: 8/12（67%）
- **ストアカバレッジ**: 4/6（67%）

### 2.2 Phase別実装状況

| Phase | 対象 | テスト数 | 状態 |
|-------|------|----------|------|
| 既存 | 基盤テスト | 65 | ✅完了 |
| Phase 1 | コアストア・メインビュー | 140 | ✅完了 |
| Phase 2 | 拡張ストア・管理ビュー・Composable | 112 | ✅完了 |
| Phase 3 | 結合テスト・E2Eテスト | 未定 | 📋計画中 |
| **合計** | - | **317+** | - |

### 2.3 テストカテゴリ別状況

| カテゴリ | 対象 | テスト数 | Phase | 状態 |
|----------|------|----------|-------|------|
| データ層 | mockData | 18 | 既存 | ✅完了 |
| 認証ストア | auth.ts（モック版） | 9 | 既存 | ✅完了 |
| ログユーティリティ | logger.ts | 17 | 既存 | ✅完了 |
| Appコンポーネント | App.vue | 4 | 既存 | ✅完了 |
| レイアウト | MainLayout.vue | 17 | 既存 | ✅完了 |
| Firebase認証 | authFirebase.ts | 21 | Phase 1 | ✅完了 |
| Firebase勤怠 | attendanceFirebase.ts | 49 | Phase 1 | ✅完了 |
| ホームビュー | HomeView.vue | 38 | Phase 1 | ✅完了 |
| ダッシュボード | DashboardView.vue | 32 | Phase 1 | ✅完了 |
| ログインビュー | LoginView.vue | 15 | Phase 2 | ✅完了 |
| ユーザーストア | userStore.ts | 26 | Phase 2 | ✅完了 |
| チームビュー | TeamView.vue | 29 | Phase 2 | ✅完了 |
| 従業員一覧 | EmployeeListView.vue | 17 | Phase 2 | ✅完了 |
| ログComposable | useLogger.ts | 25 | Phase 2 | ✅完了 |
| **合計** | | **317** | | |

---

## 3. コンポーネントテスト状況

### 3.1 全コンポーネント一覧

| コンポーネント | パス | テスト数 | 状態 | Phase |
|----------------|------|----------|------|-------|
| App.vue | src/ | 4 | ✅完了 | 既存 |
| MainLayout.vue | src/layouts/ | 17 | ✅完了 | 既存 |
| LoginView.vue | src/views/ | 15 | ✅完了 | Phase 2 |
| HomeView.vue | src/views/ | 38 | ✅完了 | Phase 1 |
| AttendanceListView.vue | src/views/ | **0** | 未実装 | Phase 3 |
| DashboardView.vue | src/views/admin/ | 32 | ✅完了 | Phase 1 |
| EmployeeListView.vue | src/views/admin/ | 17 | ✅完了 | Phase 2 |
| TeamView.vue | src/views/admin/ | 29 | ✅完了 | Phase 2 |
| AttendanceEditView.vue | src/views/admin/ | **0** | 未実装 | Phase 3 |
| AdminAttendanceList.vue | src/components/attendance/ | **0** | 未実装 | Phase 3 |
| UserAttendanceHistory.vue | src/components/attendance/ | **0** | 未実装 | Phase 3 |
| DevLogViewer.vue | src/components/dev/ | **0** | 未実装 | Phase 3 |

### 3.2 ストアテスト状況

| ストア | パス | テスト数 | 状態 | Phase |
|--------|------|----------|------|-------|
| auth.ts | src/stores/ | 9 | ✅完了（モック版） | 既存 |
| authFirebase.ts | src/stores/ | 21 | ✅完了 | Phase 1 |
| attendanceFirebase.ts | src/stores/ | 49 | ✅完了 | Phase 1 |
| userStore.ts | src/stores/ | 26 | ✅完了 | Phase 2 |
| adminAttendanceStore.ts | src/stores/ | **0** | 未実装 | Phase 3 |
| counter.ts | src/stores/ | **0** | 未実装（未使用） | - |

### 3.3 ユーティリティ・Composableテスト状況

| ファイル | パス | テスト数 | 状態 | Phase |
|----------|------|----------|------|-------|
| logger.ts | src/utils/ | 17 | ✅完了 | 既存 |
| useLogger.ts | src/composables/ | 25 | ✅完了 | Phase 2 |

---

## 4. テストID体系

### 4.1 命名規則

| Prefix | 対象 | 例 |
|--------|------|-----|
| AF- | authFirebase.ts | AF-001〜AF-025 |
| ATF- | attendanceFirebase.ts | ATF-001〜ATF-049 |
| HV- | HomeView.vue | HV-001〜HV-038 |
| DV- | DashboardView.vue | DV-001〜DV-032 |
| LV- | LoginView.vue | LV-001〜LV-015 |
| US- | userStore.ts | US-001〜US-026 |
| TV- | TeamView.vue | TV-001〜TV-029 |
| EL- | EmployeeListView.vue | EL-001〜EL-017 |
| UL- | useLogger.ts | UL-001〜UL-025 |
| DATA- | mockData | DATA-001〜DATA-018 |
| AUTH- | auth.ts | AUTH-001〜AUTH-009 |
| LOG- | logger.ts | LOG-001〜LOG-017 |
| INT- | 結合テスト | INT-001〜 |
| E2E- | E2Eテスト | E2E-001〜 |

---

## 5. テストデータ仕様

### 5.1 ユーザーデータ

#### 5.1.1 テストアカウント
| 区分 | メール | パスワード | 役割 | 用途 |
|------|--------|------------|------|------|
| 管理者 | admin@example.com | adminadmin | admin | 管理機能テスト |
| 一般 | user01@example.com | user01 | employee | 打刻機能テスト |
| 主任 | user02@example.com | password123 | employee (主任) | チーム管理テスト |

#### 5.1.2 ユーザー構成
\`\`\`
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
\`\`\`

### 5.2 勤怠データ

#### 5.2.1 ステータス
| ステータス | 値 | 表示テキスト | 色 |
|------------|-----|--------------|-----|
| 正常出勤 | present | 正常出勤 | success |
| 遅刻 | late | 遅刻 | warning |
| 早退 | early_leave | 早退 | warning |
| 欠勤 | absent | 欠勤 | error |

#### 5.2.2 テスト用勤怠パターン
| パターン | 出勤時刻 | 退勤時刻 | ステータス | 用途 |
|----------|----------|----------|------------|------|
| 正常 | 09:00 | 18:00 | present | 基本テスト |
| 遅刻 | 09:30 | 18:00 | late | 遅刻判定テスト |
| 早退 | 09:00 | 16:00 | early_leave | 早退判定テスト |
| 勤務中 | 09:00 | null | present | 退勤前状態テスト |
| 欠勤 | - | - | absent | 欠勤表示テスト |

---

## 6. モック要件

### 6.1 Firebase関連モック

| モジュール | モック対象 | 使用ファイル |
|------------|------------|--------------|
| firebase/firestore | collection, doc, addDoc, updateDoc, getDocs, query, where, orderBy, Timestamp | authFirebase, attendanceFirebase, userStore |
| firebase/auth | signInWithEmailAndPassword, signOut, onAuthStateChanged | authFirebase |

### 6.2 ブラウザAPI関連モック

| API | モック対象 | 使用ファイル |
|-----|------------|--------------|
| Geolocation | navigator.geolocation.getCurrentPosition | HomeView |
| LocalStorage | localStorage.getItem, setItem | auth, logger |
| Timer | vi.useFakeTimers, vi.setSystemTime | HomeView, userStore |

### 6.3 Vue関連モック

| モジュール | モック対象 | 使用ファイル |
|------------|------------|--------------|
| vue-router | useRouter, useRoute | LoginView, DashboardView |
| pinia | createTestingPinia | 全コンポーネントテスト |

---

## 7. テスト実行

### 7.1 コマンド

\`\`\`bash
# 単体テスト実行
npm run test:unit

# ウォッチモード
npm run test:unit -- --watch

# カバレッジ付き
npm run test:unit -- --coverage

# 特定ファイル
npm run test:unit -- tests/unit/stores/authFirebase.spec.ts

# 特定パターン
npm run test:unit -- --grep "AF-001"

# 結合テスト（予定）
npm run test:integration

# E2Eテスト（予定）
npm run test:e2e
\`\`\`

### 7.2 CI/CD設定

GitHub Actionsで自動実行:
- プルリクエスト時
- mainブランチへのマージ時

---

## 8. 今後の課題（Phase 3）

### 8.1 残りの単体テスト

| 優先度 | 対象 | 推定テスト数 | 理由 |
|--------|------|--------------|------|
| 中 | AttendanceListView.vue | 15〜20 | 月次勤怠一覧表示 |
| 中 | adminAttendanceStore.ts | 20〜25 | 管理者向け勤怠データ取得 |
| 低 | AttendanceEditView.vue | 10〜15 | 勤怠編集機能 |
| 低 | AdminAttendanceList.vue | 10〜15 | 管理者向け勤怠テーブル |
| 低 | UserAttendanceHistory.vue | 10〜15 | ユーザー勤怠履歴 |
| 低 | DevLogViewer.vue | 5〜10 | 開発用ログビューア |

### 8.2 結合テスト

- ストア間連携テスト
- Firebase Emulator連携テスト
- ルーティングテスト

### 8.3 E2Eテスト

- Playwright導入
- 主要フロー自動テスト
- CI/CD連携

---

## 9. 関連ドキュメント

| ドキュメント | 概要 |
|--------------|------|
| [TEST_MILESTONES.md](./TEST_MILESTONES.md) | マイルストーン概要 |
| [PHASE1_TEST_CHECKLIST.md](./PHASE1_TEST_CHECKLIST.md) | Phase 1チェックリスト |
| [PHASE2_TEST_CHECKLIST.md](./PHASE2_TEST_CHECKLIST.md) | Phase 2チェックリスト |
| [PHASE1_ROADMAP.md](./PHASE1_ROADMAP.md) | Phase 1ロードマップ |
| [PHASE2_ROADMAP.md](./PHASE2_ROADMAP.md) | Phase 2ロードマップ |

### 個別テスト仕様書

| 対象 | ドキュメント |
|------|--------------|
| authFirebase.ts | [stores/authFirebase-test-spec.md](./stores/authFirebase-test-spec.md) |
| attendanceFirebase.ts | [stores/attendanceFirebase-test-spec.md](./stores/attendanceFirebase-test-spec.md) |
| userStore.ts | [stores/userStore-test-spec.md](./stores/userStore-test-spec.md) |
| HomeView.vue | [views/HomeView-test-spec.md](./views/HomeView-test-spec.md) |
| LoginView.vue | [views/LoginView-test-spec.md](./views/LoginView-test-spec.md) |
| DashboardView.vue | [views/admin/DashboardView-test-spec.md](./views/admin/DashboardView-test-spec.md) |
| TeamView.vue | [views/admin/TeamView-test-spec.md](./views/admin/TeamView-test-spec.md) |
| EmployeeListView.vue | [views/admin/EmployeeListView-test-spec.md](./views/admin/EmployeeListView-test-spec.md) |
| useLogger.ts | [composables/useLogger-test-spec.md](./composables/useLogger-test-spec.md) |

---

## 更新履歴

| 日付 | 更新内容 |
|------|----------|
| 2026-01-13 | Phase 2完了に伴い全面更新 |
| 2026-01-12 | Phase 1完了 |
| 2026-01-10 | 初版作成 |
