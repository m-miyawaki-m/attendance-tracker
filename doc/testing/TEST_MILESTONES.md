# テスト実装マイルストーン

## 概要

| Phase | 対象 | テスト数 | 状態 | GitHub Issue | ブランチ |
|-------|------|----------|------|--------------|----------|
| Phase 1 | コアストア・メインビュー | 205 | ✅完了 | #17, #18, #19, #20 | feature/17-authFirebase-unit-test |
| Phase 2 | 拡張ストア・管理ビュー・Composable | 112 | ✅完了 | #24 | feature/24-phase2-test-implementation |
| Phase 3 | 結合テスト・E2Eテスト | 未定 | 📋計画中 | - | - |
| **合計** | - | **317+** | - | - | - |

---

## GitHub Issue・ブランチ命名規則

### 命名規則
- **Issue**: `[Phase{N}] {対象} 単体テスト実装`
- **ブランチ**: `feature/{issue番号}-{機能名}`

### Phase 1 関連Issue（クローズ済み）
- [#17](https://github.com/m-miyawaki-m/attendance-tracker/issues/17) - authFirebase.ts 単体テスト実装
- [#18](https://github.com/m-miyawaki-m/attendance-tracker/issues/18) - attendanceFirebase.ts 単体テスト実装
- [#19](https://github.com/m-miyawaki-m/attendance-tracker/issues/19) - HomeView.vue 単体テスト実装
- [#20](https://github.com/m-miyawaki-m/attendance-tracker/issues/20) - DashboardView.vue 単体テスト実装

### Phase 2 関連Issue（クローズ済み）
- [#24](https://github.com/m-miyawaki-m/attendance-tracker/issues/24) - Phase2 単体テスト実装 (112テスト)

---

## Phase 1: コアストア・メインビュー ✅完了

### 目的
認証・打刻機能の中核部分のテストを実装し、システムの基盤品質を保証する。

### GitHub Issue
- #17 authFirebase.ts (CLOSED)
- #18 attendanceFirebase.ts (CLOSED)
- #19 HomeView.vue (CLOSED)
- #20 DashboardView.vue (CLOSED)

### ブランチ
`feature/17-authFirebase-unit-test`

### 実装対象

| 対象ファイル | テストファイル | テストID範囲 | テスト数 | 状態 |
|--------------|----------------|--------------|----------|------|
| authFirebase.ts | stores/authFirebase.spec.ts | AF-001〜AF-025 | 21 | ✅完了 |
| attendanceFirebase.ts | stores/attendanceFirebase.spec.ts | ATF-001〜ATF-049 | 49 | ✅完了 |
| HomeView.vue | views/HomeView.spec.ts | HV-001〜HV-038 | 38 | ✅完了 |
| DashboardView.vue | views/admin/DashboardView.spec.ts | DV-001〜DV-032 | 32 | ✅完了 |

### テスト内訳

#### authFirebase.ts (21テスト)
- State初期値 (AF-001〜AF-002)
- Getters (AF-003〜AF-006)
- loginアクション (AF-007〜AF-010)
- logoutアクション (AF-011〜AF-012)
- 認証状態監視 (AF-013〜AF-015)
- ユーザー情報 (AF-016〜AF-019)
- 管理者権限 (AF-020〜AF-021)
- エッジケース (AF-022〜AF-025)

#### attendanceFirebase.ts (49テスト)
- State初期値 (ATF-001〜ATF-004)
- clockInアクション (ATF-005〜ATF-013)
- clockOutアクション (ATF-014〜ATF-021)
- getTodayAttendanceアクション (ATF-022〜ATF-026)
- fetchMonthlyAttendancesアクション (ATF-027〜ATF-030)
- fetchAttendancesByDateRangeアクション (ATF-031〜ATF-034)
- キャッシュ操作 (ATF-035〜ATF-043)
- エラーハンドリング (ATF-044〜ATF-046)
- リアルタイム更新 (ATF-047〜ATF-049)

#### HomeView.vue (38テスト)
- 初期表示・時刻表示 (HV-001〜HV-005)
- 出勤打刻 (HV-006〜HV-012)
- 退勤打刻 (HV-013〜HV-018)
- 勤務状態表示 (HV-019〜HV-022)
- 勤務時間計算 (HV-023〜HV-025)
- 位置情報取得 (HV-026〜HV-031)
- 住所変換 (HV-032〜HV-033)
- ライフサイクル (HV-034〜HV-035)
- ローディング状態 (HV-036〜HV-038)

#### DashboardView.vue (32テスト)
- アクセス制御 (DV-001〜DV-002)
- 初期データ取得 (DV-003〜DV-007)
- サマリー計算 (DV-008〜DV-011)
- グラフデータ計算 (DV-012〜DV-025)
- グラフオプション (DV-026〜DV-029)
- 表示 (DV-030〜DV-032)

### 既存テスト（Phase 1以前）

| 対象 | テストファイル | テスト数 |
|------|----------------|----------|
| mockData | data/mockData.spec.ts | 18 |
| auth.ts (モック版) | stores/auth.spec.ts | 9 |
| logger.ts | utils/logger.spec.ts | 17 |
| App.vue | src/__tests__/App.spec.ts | 4 |
| MainLayout.vue | src/layouts/__tests__/MainLayout.spec.ts | 17 |

### 関連ドキュメント
- [PHASE1_TEST_CHECKLIST.md](./PHASE1_TEST_CHECKLIST.md)
- [PHASE1_ROADMAP.md](./PHASE1_ROADMAP.md)

---

## Phase 2: 拡張ストア・管理ビュー・Composable ✅完了

### 目的
ユーザー管理、管理者向け一覧表示、ログ管理機能のテストを実装し、システム全体のカバレッジを向上する。

### GitHub Issue
- #24 Phase2 単体テスト実装 (CLOSED)

### ブランチ
`feature/24-phase2-test-implementation`

### 実装対象

| 対象ファイル | テストファイル | テストID範囲 | テスト数 | 状態 |
|--------------|----------------|--------------|----------|------|
| LoginView.vue | views/LoginView.spec.ts | LV-001〜LV-015 | 15 | ✅完了 |
| userStore.ts | stores/userStore.spec.ts | US-001〜US-026 | 26 | ✅完了 |
| TeamView.vue | views/admin/TeamView.spec.ts | TV-001〜TV-029 | 29 | ✅完了 |
| EmployeeListView.vue | views/admin/EmployeeListView.spec.ts | EL-001〜EL-017 | 17 | ✅完了 |
| useLogger.ts | composables/useLogger.spec.ts | UL-001〜UL-025 | 25 | ✅完了 |

### テスト内訳

#### LoginView.vue (15テスト)
- 初期表示 (LV-001〜LV-003)
- テストアカウント入力 (LV-004〜LV-006)
- ログイン処理 (LV-007〜LV-011)
- パスワードリセット (LV-012)
- スナックバー表示 (LV-013〜LV-015)

#### userStore.ts (26テスト)
- State初期値 (US-001〜US-004)
- Getters (US-005〜US-012)
- fetchUsersアクション (US-013〜US-020)
- getUserByIdアクション (US-021〜US-022)
- getTeamMembersアクション (US-023〜US-025)
- clearCacheアクション (US-026)

#### TeamView.vue (29テスト)
- 初期表示 (TV-001〜TV-004)
- 初期データ取得 (TV-005〜TV-008)
- 日付変更 (TV-009〜TV-010)
- 主任選択 (TV-011〜TV-012)
- 主任リスト (TV-013〜TV-014)
- 選択主任名 (TV-015〜TV-016)
- チーム勤怠リスト (TV-017〜TV-022)
- チームサマリー (TV-023〜TV-026)
- サマリーカード表示 (TV-027〜TV-028)
- ヘルパー関数 (TV-029)

#### EmployeeListView.vue (17テスト)
- 初期表示 (EL-001〜EL-003)
- データ取得 (EL-004〜EL-006)
- 月選択変更 (EL-007〜EL-008)
- 従業員リスト計算 (EL-009〜EL-012)
- テーブル表示 (EL-013〜EL-015)
- ページネーション (EL-016〜EL-017)

#### useLogger.ts (25テスト)
- 初期化 (UL-001〜UL-002)
- State (UL-003〜UL-004)
- refreshLogs関数 (UL-005)
- logCount computed (UL-006〜UL-008)
- logSizeFormatted computed (UL-009〜UL-012)
- clear関数 (UL-013)
- downloadJson関数 (UL-014)
- downloadText関数 (UL-015)
- filterByLevel関数 (UL-016〜UL-018)
- searchLogs関数 (UL-019〜UL-022)
- loggerインスタンス (UL-023)
- ライフサイクル (UL-024〜UL-025)

### 関連ドキュメント
- [PHASE2_TEST_CHECKLIST.md](./PHASE2_TEST_CHECKLIST.md)
- [PHASE2_ROADMAP.md](./PHASE2_ROADMAP.md)
- [PHASE2_ISSUE_MANAGEMENT.md](./PHASE2_ISSUE_MANAGEMENT.md)

---

## Phase 3: 結合テスト・E2Eテスト 📋計画中

### 目的
コンポーネント・ストア間の連携をテストし、ユーザー視点での品質を保証する。

### 3.1 結合テスト（計画）

#### ストア間連携テスト

| テストID | 対象ストア | テスト内容 | 優先度 |
|----------|------------|------------|--------|
| INT-001 | auth + attendance | ログインユーザーの勤怠取得 | 高 |
| INT-002 | user + adminAttendance | 主任配下メンバーの勤怠取得 | 高 |
| INT-003 | auth + user | ユーザー権限に基づく表示 | 中 |

#### 認証フローテスト

| テストID | シナリオ | 期待結果 |
|----------|----------|----------|
| INT-004 | ログイン→ホーム遷移 | 認証後ホーム画面表示 |
| INT-005 | ログアウト→ログイン遷移 | 認証解除後ログイン画面表示 |
| INT-006 | 認証状態保持（リロード） | ログイン状態維持 |

#### 打刻フローテスト

| テストID | シナリオ | 期待結果 |
|----------|----------|----------|
| INT-007 | 出勤→退勤フロー | 正常な打刻記録作成 |
| INT-008 | 二重打刻防止 | エラー表示・ボタン無効化 |

### 3.2 E2Eテスト（計画）

#### 環境設定

| 項目 | 設定 |
|------|------|
| フレームワーク | Playwright |
| ブラウザ | Chromium, Firefox, WebKit |
| ベースURL | http://localhost:5173 |
| 認証 | Firebase Emulator |

#### テストシナリオ

| テストID | シナリオ | 操作 | 確認項目 |
|----------|----------|------|----------|
| E2E-001 | ログイン成功 | 正しい認証情報入力 | ホーム画面遷移 |
| E2E-002 | ログイン失敗 | 誤った認証情報入力 | エラーメッセージ表示 |
| E2E-003 | 出勤打刻 | 出勤ボタンクリック | ステータス更新、時刻表示 |
| E2E-004 | 退勤打刻 | 退勤ボタンクリック | 勤務時間計算、ステータス更新 |
| E2E-005 | 勤怠履歴確認 | 勤怠一覧タブ選択 | 月次データ表示 |
| E2E-006 | ダッシュボード | 管理者ログイン | グラフ表示、数値表示 |
| E2E-007 | チーム勤怠 | 主任選択→日付選択 | メンバー一覧表示 |

### 3.3 残りの単体テスト（計画）

| 対象 | テストファイル | 推定テスト数 | 優先度 |
|------|----------------|--------------|--------|
| AttendanceListView.vue | views/AttendanceListView.spec.ts | 15〜20 | 中 |
| adminAttendanceStore.ts | stores/adminAttendanceStore.spec.ts | 20〜25 | 中 |
| AttendanceEditView.vue | views/admin/AttendanceEditView.spec.ts | 10〜15 | 低 |
| AdminAttendanceList.vue | components/attendance/AdminAttendanceList.spec.ts | 10〜15 | 低 |
| UserAttendanceHistory.vue | components/attendance/UserAttendanceHistory.spec.ts | 10〜15 | 低 |
| DevLogViewer.vue | components/dev/DevLogViewer.spec.ts | 5〜10 | 低 |

---

## テスト実行結果サマリー

### 現在の状況（2026-01-13）

```
Test Files  14 passed (14)
Tests       317 passed (317)
```

### テストファイル一覧

| テストファイル | テスト数 | Phase |
|----------------|----------|-------|
| src/__tests__/App.spec.ts | 4 | 既存 |
| src/layouts/__tests__/MainLayout.spec.ts | 17 | 既存 |
| tests/unit/data/mockData.spec.ts | 18 | 既存 |
| tests/unit/stores/auth.spec.ts | 9 | 既存 |
| tests/unit/utils/logger.spec.ts | 17 | 既存 |
| tests/unit/stores/authFirebase.spec.ts | 21 | Phase 1 |
| tests/unit/stores/attendanceFirebase.spec.ts | 49 | Phase 1 |
| tests/unit/views/HomeView.spec.ts | 38 | Phase 1 |
| tests/unit/views/admin/DashboardView.spec.ts | 32 | Phase 1 |
| tests/unit/views/LoginView.spec.ts | 15 | Phase 2 |
| tests/unit/stores/userStore.spec.ts | 26 | Phase 2 |
| tests/unit/views/admin/TeamView.spec.ts | 29 | Phase 2 |
| tests/unit/views/admin/EmployeeListView.spec.ts | 17 | Phase 2 |
| tests/unit/composables/useLogger.spec.ts | 25 | Phase 2 |
| **合計** | **317** | - |

### Phase別集計

| Phase | テスト数 | 割合 |
|-------|----------|------|
| 既存（Phase 1以前） | 65 | 20.5% |
| Phase 1 | 140 | 44.2% |
| Phase 2 | 112 | 35.3% |
| **合計** | **317** | 100% |

---

## 関連ドキュメント

### Phase 1
- [PHASE1_ROADMAP.md](./PHASE1_ROADMAP.md) - Phase 1実装ロードマップ
- [PHASE1_TEST_CHECKLIST.md](./PHASE1_TEST_CHECKLIST.md) - Phase 1テストチェックリスト

### Phase 2
- [PHASE2_ROADMAP.md](./PHASE2_ROADMAP.md) - Phase 2実装ロードマップ
- [PHASE2_TEST_CHECKLIST.md](./PHASE2_TEST_CHECKLIST.md) - Phase 2テストチェックリスト
- [PHASE2_ISSUE_MANAGEMENT.md](./PHASE2_ISSUE_MANAGEMENT.md) - Phase 2課題管理

### 仕様書
- [TEST_SPECIFICATION.md](./TEST_SPECIFICATION.md) - テスト仕様書（全体）
- 各コンポーネント・ストアの個別テスト仕様書は `doc/testing/` 配下を参照

---

## 更新履歴

| 日付 | 更新内容 |
|------|----------|
| 2026-01-13 | Phase 2完了、マイルストーン作成 |
| 2026-01-12 | Phase 1完了 |
