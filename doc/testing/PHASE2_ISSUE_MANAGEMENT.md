# Phase 2 Issue管理

## 概要

Phase 2のテスト実装における課題・改善点を追跡管理するドキュメント。

## 課題一覧

### 未着手

| Issue ID | タイトル | 優先度 | 対象 | 概要 |
|----------|----------|--------|------|------|
| P2-001 | LoginView.vue テスト拡充 | 高 | LV-001〜LV-015 | 現在1テストのみ → 15テストに拡充 |
| P2-002 | userStore.ts テスト新規実装 | 高 | US-001〜US-026 | 新規実装 26テスト |
| P2-003 | TeamView.vue テスト新規実装 | 中 | TV-001〜TV-029 | 新規実装 29テスト |
| P2-004 | EmployeeListView.vue テスト新規実装 | 中 | EL-001〜EL-017 | 新規実装 17テスト |
| P2-005 | useLogger.ts テスト新規実装 | 中 | UL-001〜UL-025 | 新規実装 25テスト |

### 進行中

| Issue ID | タイトル | 担当 | 進捗 |
|----------|----------|------|------|
| - | - | - | - |

### 完了

| Issue ID | タイトル | 完了日 | 備考 |
|----------|----------|--------|------|
| - | - | - | - |

---

## 詳細

### P2-001: LoginView.vue テスト拡充

**優先度**: 高
**対象テストID**: LV-001〜LV-015
**推定テスト数**: 15

**現状**:
- 既存テスト数: 1テスト
- テストファイル: `tests/unit/views/LoginView.spec.ts`

**改善内容**:
- フォーム表示テストの追加
- テストアカウント入力機能テストの追加
- ログイン成功/失敗パターンテストの追加
- スナックバー表示テストの追加

**モック要件**:
- `useAuthFirebaseStore`
- `vue-router` (useRouter)

---

### P2-002: userStore.ts テスト新規実装

**優先度**: 高
**対象テストID**: US-001〜US-026
**推定テスト数**: 26

**現状**:
- 既存テスト数: 0テスト
- テストファイル: 新規作成 `tests/unit/stores/userStore.spec.ts`

**実装内容**:
- State初期値テスト (4テスト)
- Getters テスト (8テスト)
- fetchUsers アクションテスト (8テスト)
- getUserById アクションテスト (2テスト)
- getTeamMembers アクションテスト (3テスト)
- clearCache アクションテスト (1テスト)

**モック要件**:
- Firebase Firestore (collection, getDocs)
- Timestamp

**注意事項**:
- キャッシュ機構（5分間）のテストには `vi.useFakeTimers()` 使用
- TeamView.vue/EmployeeListView.vue の前提となるため先行実装

---

### P2-003: TeamView.vue テスト新規実装

**優先度**: 中
**対象テストID**: TV-001〜TV-029
**推定テスト数**: 29

**現状**:
- 既存テスト数: 0テスト
- テストファイル: 新規作成 `tests/unit/views/admin/TeamView.spec.ts`

**実装内容**:
- 初期表示テスト (4テスト)
- 初期データ取得テスト (4テスト)
- 日付変更テスト (2テスト)
- 主任選択テスト (2テスト)
- 主任リストテスト (2テスト)
- 選択主任名テスト (2テスト)
- チーム勤怠リストテスト (6テスト)
- チームサマリーテスト (4テスト)
- サマリーカード表示テスト (2テスト)
- ヘルパー関数テスト (1テスト)

**モック要件**:
- `useUserStore`
- `useAttendanceFirebaseStore`
- `useLogger`

**依存関係**:
- P2-002 (userStore.ts) の完了後に実装

---

### P2-004: EmployeeListView.vue テスト新規実装

**優先度**: 中
**対象テストID**: EL-001〜EL-017
**推定テスト数**: 17

**現状**:
- 既存テスト数: 0テスト
- テストファイル: 新規作成 `tests/unit/views/admin/EmployeeListView.spec.ts`

**実装内容**:
- 初期表示テスト (3テスト)
- データ取得テスト (3テスト)
- 月選択変更テスト (2テスト)
- 従業員リスト計算テスト (4テスト)
- テーブル表示テスト (3テスト)
- ページネーションテスト (2テスト)

**モック要件**:
- `useUserStore`
- `useAttendanceFirebaseStore`
- Firebase Firestore

**依存関係**:
- P2-002 (userStore.ts) の完了後に実装

---

### P2-005: useLogger.ts テスト新規実装

**優先度**: 中
**対象テストID**: UL-001〜UL-025
**推定テスト数**: 25

**現状**:
- 既存テスト数: 0テスト（logger.spec.tsはutils/logger.tsのテスト）
- テストファイル: 新規作成 `tests/unit/composables/useLogger.spec.ts`

**実装内容**:
- 初期化テスト (2テスト)
- State テスト (2テスト)
- refreshLogs 関数テスト (1テスト)
- logCount computed テスト (3テスト)
- logSizeFormatted computed テスト (4テスト)
- clear 関数テスト (1テスト)
- downloadJson 関数テスト (1テスト)
- downloadText 関数テスト (1テスト)
- filterByLevel 関数テスト (3テスト)
- searchLogs 関数テスト (4テスト)
- logger インスタンステスト (1テスト)
- ライフサイクルテスト (2テスト)

**モック要件**:
- `@/utils/logger` (getLogs, clearLogs, downloadLogsAsJson, downloadLogsAsText, onLogUpdate)

---

## 技術的改善点

### TEC-001: テスト仕様書のテストID統一

**状態**: 計画中

**概要**:
Phase 2開始前に、テスト仕様書のテストIDを統一形式に更新する。

**対象ファイル**:
- `doc/testing/views/LoginView-test-spec.md` → LV-XXX形式に更新
- `doc/testing/stores/userStore-test-spec.md` → US-XXX形式に更新
- `doc/testing/views/admin/TeamView-test-spec.md` → TV-XXX形式に更新
- `doc/testing/views/admin/EmployeeListView-test-spec.md` → EL-XXX形式に更新
- `doc/testing/composables/useLogger-test-spec.md` → UL-XXX形式に更新

---

## ドキュメント改善

### DOC-001: テスト仕様書の設計書リンク確認

**状態**: 計画中

**概要**:
各テスト仕様書の関連設計書リンクが正しいことを確認・修正する。

---

## 進捗サマリー

| 日付 | 完了Issue | 残Issue | テスト数 | 備考 |
|------|-----------|---------|----------|------|
| 2026-01-12 | 0 | 5 | 206 | Phase2開始 |

---

## 参照ドキュメント

- [PHASE2_ROADMAP.md](./PHASE2_ROADMAP.md)
- [PHASE2_TEST_CHECKLIST.md](./PHASE2_TEST_CHECKLIST.md)
- [TEST_SPECIFICATION.md](./TEST_SPECIFICATION.md)
