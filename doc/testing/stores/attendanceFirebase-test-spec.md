# `attendanceFirebase.ts` 単体テスト仕様書

## 1. 概要

| 項目 | 内容 |
|:---|:---|
| 対象ファイル | `src/stores/attendanceFirebase.ts` |
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

| テストNo. | テストケース | State | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 1-1 | attendances初期値 | `attendances` | 空配列 `[]` |
| 1-2 | attendancesByUser初期値 | `attendancesByUser` | 空のMap |
| 1-3 | todayAttendance初期値 | `todayAttendance` | `null` |
| 1-4 | loading初期値 | `loading` | `false` |

### 4.2. clockIn アクション

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 2-1 | 出勤打刻成功（9:00前） | 本日未打刻、9:00前 | ・`{ success: true, attendanceId }`を返す。<br>・Firestoreに`status: 'present'`で保存される。<br>・`todayAttendance`が設定される。 |
| 2-2 | 出勤打刻成功（9:00後） | 本日未打刻、9:00後 | ・`status: 'late'`で保存される。 |
| 2-3 | 出勤打刻失敗（既に打刻済み） | 本日打刻済み | ・`{ success: false, error: 'すでに本日の出勤打刻があります' }`を返す。 |
| 2-4 | Firestoreエラー | `addDoc`が例外 | ・`{ success: false, error }`を返す。<br>・loggerにエラーが記録される。 |
| 2-5 | loading状態 | - | 処理中は`loading`がtrue、完了後false。 |
| 2-6 | 保存データ検証 | - | userId, date, checkIn, checkInLocation, status, workingMinutes(0), createdAt, updatedAtが正しく設定される。 |

### 4.3. clockOut アクション

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 3-1 | 退勤打刻成功（18:00後） | 出勤済み、未退勤、18:00後 | ・`{ success: true }`を返す。<br>・`checkOut`、`checkOutLocation`、`workingMinutes`が更新される。 |
| 3-2 | 退勤打刻成功（早退） | 出勤済み、未退勤、18:00前、遅刻でない | ・`status: 'early_leave'`に更新される。 |
| 3-3 | 退勤打刻成功（遅刻維持） | 出勤時`status: 'late'`、18:00前 | ・`status: 'late'`が維持される。 |
| 3-4 | 退勤打刻失敗（未出勤） | 本日の出勤記録なし | ・`{ success: false, error: '本日の出勤記録が見つかりません' }`を返す。 |
| 3-5 | 退勤打刻失敗（既に退勤済み） | 既に退勤打刻済み | ・`{ success: false, error: 'すでに退勤打刻済みです' }`を返す。 |
| 3-6 | 勤務時間計算 | 出勤から退勤まで | `workingMinutes`が正しく計算される（分単位）。 |
| 3-7 | todayAttendance更新 | 退勤成功 | `todayAttendance`が更新される。 |

### 4.4. getTodayAttendance アクション

| テストNo. | テストケース | Firestore応答 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 4-1 | 本日の勤怠あり | ドキュメントあり | Attendanceオブジェクトを返す。 |
| 4-2 | 本日の勤怠なし | ドキュメントなし | `null`を返す。 |
| 4-3 | Firestoreエラー | `getDocs`が例外 | `null`を返し、loggerにエラーが記録される。 |
| 4-4 | クエリ条件 | - | `userId`と`date`（今日）でクエリされる。 |
| 4-5 | Timestamp変換 | - | `checkIn`、`checkOut`、`createdAt`、`updatedAt`がDateに変換される。 |

### 4.5. fetchMonthlyAttendances アクション

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 5-1 | 月間勤怠取得成功 | userId、year、month指定 | ・`attendances`に結果が設定される。<br>・`checkIn`の範囲でクエリされる。 |
| 5-2 | 日付範囲計算 | year=2026, month=1 | 2026-01-01 00:00:00 〜 2026-01-31 23:59:59でクエリ。 |
| 5-3 | ソート順 | - | `checkIn`の降順でソートされる。 |
| 5-4 | Firestoreエラー | `getDocs`が例外 | loggerにエラーが記録される。 |

### 4.6. fetchAttendancesByDateRange アクション

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 6-1 | 日付範囲取得成功 | userId、startDate、endDate指定 | ・`attendancesByUser`にキャッシュされる。<br>・`attendances`にフィルタ結果が設定される。 |
| 6-2 | checkInフィールドなし | `checkIn`がundefinedのレコード | スキップされ、loggerに警告が記録される。 |
| 6-3 | クライアント側フィルタリング | - | userIdのみでクエリし、日付範囲はクライアント側でフィルタ。 |
| 6-4 | ソート順 | - | `date`の降順でソートされる。 |

### 4.7. getAttendancesByUserFromCache アクション

| テストNo. | テストケース | キャッシュ状態 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 7-1 | キャッシュあり | userIdのデータがキャッシュ済み | Attendance配列を返す。 |
| 7-2 | キャッシュなし | userIdのデータなし | `undefined`を返す。 |

### 4.8. getAttendancesByDateRange アクション

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 8-1 | キャッシュから取得 | userId、startDate、endDate指定 | ・キャッシュから日付範囲でフィルタされた結果を返す。<br>・日付降順でソートされる。 |
| 8-2 | キャッシュなし | userIdのキャッシュなし | 空配列を返す。 |

### 4.9. clearCache アクション

| テストNo. | テストケース | 引数 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 9-1 | 特定ユーザーのキャッシュクリア | `userId: 'user001'` | 指定ユーザーのキャッシュのみ削除される。 |
| 9-2 | 全キャッシュクリア | `userId: undefined` | ・`attendancesByUser`がクリアされる。<br>・`attendances`が空配列になる。 |

### 4.10. loadTodayAttendance アクション

| テストNo. | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| 10-1 | 本日の勤怠読み込み | `getTodayAttendance`を呼び出し、結果を`todayAttendance`に設定。 |

### 4.11. Getters

| テストNo. | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| 11-1 | cachedUserIds | `attendancesByUser`のキー一覧を配列で返す。 |
| 11-2 | totalCachedRecords | `attendancesByUser`の全レコード数の合計を返す。 |
