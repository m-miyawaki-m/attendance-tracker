# `AttendanceListView.vue` 単体テスト仕様書

## 1. 概要

| 項目 | 内容 |
|:---|:---|
| 対象ファイル | `src/views/AttendanceListView.vue` |
| 関連設計書 | [基本設計書 1.3.2](../../design/03-basic/03-basic-design.md#132-月次勤怠一覧画面-attendancelistviewvue) |
| 設計書記載 | 月次勤怠一覧画面（日付選択、全従業員の勤怠一覧表示、ステータス別色分け） |

## 2. テストの目的

`AttendanceListView.vue`コンポーネントが、ユーザーの権限に応じて適切なコンポーネント（管理者用/一般ユーザー用）を表示することを保証する。

## 3. 使用するライブラリ

* **テストランナー**: Vitest
* **コンポーネントテスト**: Vue Test Utils
* **状態管理**: Pinia (テスト用にモック化)

## 4. テストケース

### 4.1. コンポーネント切り替え

| テストNo. | テストケース | `authStore.isAdmin` | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 1-1 | 管理者の場合 | `true` | `AdminAttendanceList`コンポーネントが表示される。 |
| 1-2 | 一般ユーザーの場合 | `false` | `UserAttendanceHistory`コンポーネントが表示される。 |

### 4.2. propsの受け渡し

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 2-1 | UserAttendanceHistoryへのprops | 一般ユーザー | `user-id`プロパティに`authStore.userId`が渡される。 |
