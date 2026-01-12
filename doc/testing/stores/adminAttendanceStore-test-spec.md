# `adminAttendanceStore.ts` 単体テスト仕様書

## 1. 概要

| 項目 | 内容 |
|:---|:---|
| 対象ファイル | `src/stores/adminAttendanceStore.ts` |
| テストファイル | `tests/unit/stores/adminAttendanceStore.spec.ts` |
| 関連設計書 | [基本設計書](../../design/03-basic/03-basic-design.md) |
| 設計書記載 | 管理者向け勤怠データを日付ベースでキャッシュ管理 |

## 2. テストの目的

`adminAttendanceStore.ts`が、日付ベースの勤怠データ取得・キャッシュ管理・エラーハンドリングを正しく実装していることを保証する。

## 3. 使用するライブラリ

* **テストランナー**: Vitest
* **状態管理**: Pinia
* **モック**: vi.mock (Firebase Firestore)

## 4. テストケース

### 4.1. State初期値

| テストID | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| AAS-001 | attendancesByDate初期値 | 空のMapである |
| AAS-002 | loading初期値 | falseである |
| AAS-003 | error初期値 | nullである |

### 4.2. Getters

| テストID | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| AAS-004 | cachedDates - 初期状態 | 空の配列である |
| AAS-005 | cachedDates - キャッシュあり | キャッシュされた日付の配列を返す |
| AAS-006 | totalCachedRecords - 初期状態 | 0である |
| AAS-007 | totalCachedRecords - キャッシュあり | 全レコード数の合計を返す |

### 4.3. fetchAttendancesByDate アクション

| テストID | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| AAS-008 | 初回取得成功 | Firestoreからデータを取得し、キャッシュに保存 |
| AAS-009 | キャッシュ利用 | キャッシュがある場合はFirestoreを呼ばない |
| AAS-010 | loading状態 | 取得中はtrueになり、完了後falseに戻る |
| AAS-011 | Firestoreエラー | errorに設定され、例外がスローされる |
| AAS-012 | データマッピング | Timestampが正しくDateに変換される |
| AAS-013 | 位置情報なしデータ | checkOutLocation等がnullの場合も正常処理 |

### 4.4. fetchAttendancesByDateRange アクション

| テストID | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| AAS-014 | 日付範囲取得成功 | 指定範囲のデータを取得 |
| AAS-015 | ユーザーID指定 | 指定ユーザーのデータのみ取得 |
| AAS-016 | loading状態 | 取得中はtrueになり、完了後falseに戻る |
| AAS-017 | Firestoreエラー | errorに設定され、例外がスローされる |

### 4.5. getAttendancesByDateFromCache アクション

| テストID | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| AAS-018 | キャッシュあり | キャッシュされたデータを返す |
| AAS-019 | キャッシュなし | undefinedを返す |

### 4.6. getUserAttendanceByDate アクション

| テストID | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| AAS-020 | データあり | 該当ユーザーの勤怠データを返す |
| AAS-021 | 日付キャッシュなし | nullを返す |
| AAS-022 | ユーザーデータなし | nullを返す |

### 4.7. clearCache アクション

| テストID | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| AAS-023 | 特定日付クリア | 指定日付のキャッシュのみ削除 |
| AAS-024 | 全キャッシュクリア | 全てのキャッシュを削除 |
| AAS-025 | エラーもクリア | error状態もnullにリセット |

### 4.8. refreshAttendances アクション

| テストID | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| AAS-026 | 強制再取得 | キャッシュをクリアしてFirestoreから再取得 |

## 5. 備考

- テストID（AAS-001〜AAS-026）はチェックリスト（PHASE2_TEST_CHECKLIST.md）と統一
- 実装テスト数: 26テスト関数
- Firebase Firestoreのモックが必要
