# `adminAttendanceStore.ts` 単体テスト仕様書

## 1. 概要

| 項目 | 内容 |
|:---|:---|
| 対象ファイル | `src/stores/adminAttendanceStore.ts` |
| 関連設計書 | [基本設計書 3.3](../../design/03-basic/03-basic-design.md#33-admin-attendance-store-adminattendancestorets) |
| 設計書記載 | Admin Attendance Store（管理者向け日付ベースの勤怠データ取得・キャッシュ管理） |

## 2. テストの目的

`adminAttendanceStore.ts`ストアが、管理者向けの日付ベースの勤怠データ取得・キャッシュ管理を正しく実装していることを保証する。

## 3. 使用するライブラリ

* **テストランナー**: Vitest
* **状態管理**: Pinia (setActivePinia)
* **モック**: Firebase Firestore モジュールをモック化

## 4. テストケース

### 4.1. State初期値

| テストNo. | テストケース | State | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 1-1 | attendancesByDate初期値 | `attendancesByDate` | 空のMap |
| 1-2 | loading初期値 | `loading` | `false` |
| 1-3 | error初期値 | `error` | `null` |

### 4.2. Getters

| テストNo. | テストケース | 状態 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 2-1 | cachedDates | 3日分のデータあり | `['2026-01-05', '2026-01-06', '2026-01-07']`（キー一覧） |
| 2-2 | totalCachedRecords | 各日10件 | `30`（合計レコード数） |

### 4.3. fetchAttendancesByDate アクション

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 3-1 | 新規取得成功 | キャッシュなし | ・Firestoreから取得される。<br>・`attendancesByDate`にキャッシュされる。<br>・Attendance配列を返す。 |
| 3-2 | キャッシュ利用 | 該当日のキャッシュあり | ・Firestoreが呼び出されない。<br>・キャッシュから即座に返す。 |
| 3-3 | クエリ条件 | date='2026-01-05' | `where('date', '==', '2026-01-05')`でクエリされる。 |
| 3-4 | Firestoreエラー | `getDocs`が例外 | ・`error`にエラーメッセージが設定される。<br>・例外がスローされる。 |
| 3-5 | loading状態 | - | 取得中は`loading`がtrue、完了後false。 |
| 3-6 | データマッピング | - | 全フィールドが正しくマッピングされる（id, userId, date, checkIn, checkInLocation, checkOut, checkOutLocation, workingMinutes, status, note, createdAt, updatedAt）。 |
| 3-7 | Timestamp変換 | - | `checkIn`、`checkOut`、`createdAt`、`updatedAt`がDateに変換される。 |

### 4.4. fetchAttendancesByDateRange アクション

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 4-1 | 日付範囲取得成功 | startDate、endDate指定 | ・Firestoreから取得される。<br>・Attendance配列を返す。 |
| 4-2 | ユーザー指定あり | userId指定 | userIdでも追加フィルタされたクエリが実行される。 |
| 4-3 | クエリ条件 | startDate='2026-01-01', endDate='2026-01-31' | `checkIn >= startDate 00:00:00`、`checkIn <= endDate 23:59:59`でクエリ。 |
| 4-4 | Firestoreエラー | `getDocs`が例外 | ・`error`にエラーメッセージが設定される。<br>・例外がスローされる。 |

### 4.5. getAttendancesByDateFromCache アクション

| テストNo. | テストケース | キャッシュ状態 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 5-1 | キャッシュあり | 該当日のキャッシュあり | Attendance配列を返す。 |
| 5-2 | キャッシュなし | 該当日のキャッシュなし | `undefined`を返す。 |

### 4.6. getUserAttendanceByDate アクション

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 6-1 | 該当ユーザーの勤怠あり | userId、date指定 | Attendanceオブジェクトを返す。 |
| 6-2 | 該当ユーザーの勤怠なし | キャッシュにuserIdなし | `null`を返す。 |
| 6-3 | 日付のキャッシュなし | dateのキャッシュなし | `null`を返す。 |

### 4.7. clearCache アクション

| テストNo. | テストケース | 引数 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 7-1 | 特定日付のキャッシュクリア | `date: '2026-01-05'` | ・指定日のキャッシュのみ削除される。<br>・`error`がnullにリセットされる。 |
| 7-2 | 全キャッシュクリア | `date: undefined` | ・`attendancesByDate`が全クリアされる。<br>・`error`がnullにリセットされる。 |

### 4.8. refreshAttendances アクション

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 8-1 | 強制再取得 | date指定 | ・`clearCache(date)`が呼び出される。<br>・`fetchAttendancesByDate(date)`が呼び出される。<br>・新しいAttendance配列を返す。 |
