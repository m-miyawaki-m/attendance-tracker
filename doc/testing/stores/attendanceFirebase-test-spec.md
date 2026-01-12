# `attendanceFirebase.ts` 単体テスト仕様書

## 1. 概要

| 項目 | 内容 |
|:---|:---|
| 対象ファイル | `src/stores/attendanceFirebase.ts` |
| テストファイル | `tests/unit/stores/attendanceFirebase.spec.ts` |
| 関連設計書 | [基本設計書 3.2](../../design/03-basic/03-basic-design.md#32-attendance-store-attendancefirebasets) |
| 設計書記載 | Attendance Store（勤怠取得、期間指定取得、勤怠追加・更新、キャッシュクリア） |

## 2. テストの目的

`attendanceFirebase.ts`ストアが、出退勤打刻、勤怠データの取得・キャッシュ管理を正しく実装していることを保証する。

## 3. 使用するライブラリ

* **テストランナー**: Vitest
* **状態管理**: Pinia (setActivePinia)
* **モック**: Firebase Firestore モジュールをモック化

## 4. テストケース

### 4.1. State初期値

| テストID | テストケース | State | 期待する結果 |
| :--- | :--- | :--- | :--- |
| ATF-001 | attendances初期値 | `attendances` | 空配列 `[]` |
| ATF-002 | attendancesByUser初期値 | `attendancesByUser` | 空のMap |
| ATF-003 | todayAttendance初期値 | `todayAttendance` | `null` |
| ATF-004 | loading初期値 | `loading` | `false` |

### 4.2. clockIn アクション（出勤打刻）

| テストID | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| ATF-005 | 出勤打刻成功 | 本日未打刻、userId、位置情報指定 | ・`{ success: true, attendanceId }`を返す。<br>・Firestoreに保存される。<br>・`todayAttendance`が設定される。 |
| ATF-006 | 出勤時刻記録 | - | `checkIn`に現在時刻が記録される。 |
| ATF-007 | 位置情報記録 | 位置情報あり | `checkInLocation`に保存される。 |
| ATF-008 | ステータス設定（9:00前出勤） | 9:00前 | `status: 'present'`で保存される。 |
| ATF-009 | 遅刻判定（9:00以降出勤） | 9:00以降 | `status: 'late'`で保存される。 |
| ATF-010 | 出勤打刻失敗（既に打刻済み） | 本日打刻済み | ・`{ success: false, error }`を返す。 |
| ATF-011 | Firestoreエラー時のエラーハンドリング | `addDoc`が例外 | ・`{ success: false, error }`を返す。 |
| ATF-012 | loading状態の変化 | - | 処理開始時`loading=true`、完了後`false`。 |
| ATF-013 | 保存データ検証（全フィールド） | - | userId, date, checkIn, checkInLocation, status, workingMinutes(0)が正しく設定される。 |

### 4.3. clockOut アクション（退勤打刻）

| テストID | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| ATF-014 | 退勤打刻成功（checkOut追加） | 出勤済み、未退勤 | ・`{ success: true }`を返す。<br>・`checkOut`が更新される。 |
| ATF-015 | 勤務時間計算（workingMinutes） | 出勤から退勤まで | `workingMinutes`が正しく計算される（分単位）。 |
| ATF-016 | 早退判定（18:00前退勤） | 18:00前、遅刻でない | `status: 'early_leave'`に更新される。 |
| ATF-017 | 退勤位置情報記録 | 位置情報あり | `checkOutLocation`に保存される。 |
| ATF-018 | 遅刻維持（出勤時late、18:00前退勤） | `status: 'late'`、18:00前 | `status: 'late'`が維持される。 |
| ATF-019 | 退勤打刻失敗（未出勤） | 本日の出勤記録なし | ・`{ success: false, error }`を返す。 |
| ATF-020 | 退勤打刻失敗（既に退勤済み） | 既に退勤打刻済み | ・`{ success: false, error }`を返す。 |
| ATF-021 | todayAttendance更新 | 退勤成功 | `todayAttendance`が更新される。 |

### 4.4. getTodayAttendance アクション

| テストID | テストケース | Firestore応答 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| ATF-022 | 本日の勤怠取得（該当レコード返却） | ドキュメントあり | Attendanceオブジェクトを返す。 |
| ATF-023 | 存在しない勤怠（null返却） | ドキュメントなし | `null`を返す。 |
| ATF-024 | Firestoreエラー時のハンドリング | `getDocs`が例外 | `null`を返す。 |
| ATF-025 | クエリ条件（userId + date） | - | `userId`と`date`（今日）でクエリされる。 |
| ATF-026 | Timestamp変換 | - | `checkIn`、`checkOut`がDateに変換される。 |

### 4.5. fetchMonthlyAttendances アクション

| テストID | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| ATF-027 | 月次勤怠取得（当月のレコード一覧） | userId、year、month指定 | `attendances`に結果が設定される。 |
| ATF-028 | 日付範囲計算 | year=2026, month=1 | 2026-01-01 00:00:00 〜 2026-01-31 23:59:59でクエリ。 |
| ATF-029 | ソート順（checkIn降順） | - | `checkIn`の降順でソートされる。 |
| ATF-030 | Firestoreエラー | `getDocs`が例外 | エラーがスローされない。 |

### 4.6. fetchAttendancesByDateRange アクション

| テストID | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| ATF-031 | 日付範囲取得成功 | userId、startDate、endDate指定 | `attendances`にフィルタ結果が設定される。 |
| ATF-032 | checkInフィールドなしのレコードスキップ | `checkIn`がundefinedのレコード | スキップされる。 |
| ATF-033 | クライアント側フィルタリング | - | userIdのみでクエリし、日付範囲はクライアント側でフィルタ。 |
| ATF-034 | ソート順（date降順） | - | `date`の降順でソートされる。 |

### 4.7. getAttendancesByUserFromCache アクション

| テストID | テストケース | キャッシュ状態 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| ATF-035 | キャッシュあり | userIdのデータがキャッシュ済み | Attendance配列を返す。 |
| ATF-036 | キャッシュなし | userIdのデータなし | `undefined`を返す。 |

### 4.8. getAttendancesByDateRange アクション

| テストID | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| ATF-037 | キャッシュから取得 | userId、startDate、endDate指定 | キャッシュから日付範囲でフィルタされた結果を返す。 |
| ATF-038 | キャッシュなし時は空配列 | userIdのキャッシュなし | 空配列を返す。 |

### 4.9. clearCache アクション

| テストID | テストケース | 引数 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| ATF-039 | 特定ユーザーのキャッシュクリア | `userId: 'user001'` | 指定ユーザーのキャッシュのみ削除される。 |
| ATF-040 | 全キャッシュクリア | `userId: undefined` | `attendancesByUser`と`attendances`がクリアされる。 |

### 4.10. loadTodayAttendance アクション

| テストID | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| ATF-041 | 本日の勤怠読み込み | `getTodayAttendance`を呼び出し、`todayAttendance`に設定。 |

### 4.11. Getters

| テストID | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| ATF-042 | cachedUserIds | `attendancesByUser`のキー一覧を配列で返す。 |
| ATF-043 | totalCachedRecords | `attendancesByUser`の全レコード数の合計を返す。 |

### 4.12. エラーハンドリング

| テストID | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| ATF-044 | Firestore接続エラー | `addDoc`が接続エラー | `{ success: false, error }`を返す。 |
| ATF-045 | 権限エラー | `addDoc`が権限エラー | `{ success: false, error }`を返す。 |
| ATF-046 | バリデーションエラー | `addDoc`がバリデーションエラー | `{ success: false, error }`を返す。 |

### 4.13. リアルタイム更新

| テストID | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| ATF-047 | データ追加検知 | キャッシュ更新時 | キャッシュが更新される。 |
| ATF-048 | データ更新検知 | 既存データ更新時 | キャッシュが更新される。 |
| ATF-049 | サブスクリプション解除 | clearCache呼び出し | キャッシュがクリアされる。 |

## 5. 備考

- テストID（ATF-001〜ATF-049）はチェックリスト（PHASE1_TEST_CHECKLIST.md）と統一
- 実装テスト数: 49テスト関数
