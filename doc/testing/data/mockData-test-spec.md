# `mockData.ts` 単体テスト仕様書

## 1. 概要

| 項目 | 内容 |
|:---|:---|
| 対象ファイル | `src/data/mockData.ts` |
| テストファイル | `tests/unit/data/mockData.spec.ts` |
| テストID範囲 | MD-001〜MD-018 |
| テスト数 | 18 |

## 2. テストの目的

モックデータがアプリケーション全体で使用されるテストデータとして、正しい形式・構造・値を持っていることを保証する。

## 3. テストケース

### 3.1. mockUsers（ユーザーデータ）

| テストID | テストケース | 期待する結果 |
|:---|:---|:---|
| MD-001 | 正しい数のユーザーが存在する | 21人のユーザーが存在する |
| MD-002 | 管理者ユーザーが存在する | role='admin'のユーザーが存在し、email='admin@example.com' |
| MD-003 | 一般従業員が存在する | role='employee'のユーザーが1人以上存在する |
| MD-004 | 全てのユーザーに必須フィールドが存在する | id, name, email, role, departmentが全ユーザーに存在 |

### 3.2. mockAttendances（勤怠データ）

| テストID | テストケース | 期待する結果 |
|:---|:---|:---|
| MD-005 | 打刻データが存在する | 1件以上の勤怠データが存在する |
| MD-006 | 全ての打刻データに必須フィールドが存在する | id, userId, date, checkIn, checkInLocation, statusが存在 |
| MD-007 | 位置情報が正しい形式である | latitude, longitude, accuracyが数値型 |
| MD-008 | 退勤済みの打刻データは退勤情報を持つ | checkOut, checkOutLocation, workingMinutesが存在 |

### 3.3. mockChartData（グラフデータ）

| テストID | テストケース | 期待する結果 |
|:---|:---|:---|
| MD-009 | 出勤率データが存在する | categories: 6件、series: 1件、data: 6件 |
| MD-010 | 平均勤務時間データが存在する | categories、seriesが存在 |
| MD-011 | 遅刻・早退データが存在する | categories: 3件、series: 2件 |
| MD-012 | 部署別出勤状況データが存在する | labels: 2件、series: 2件 |

### 3.4. mockSummary（サマリーデータ）

| テストID | テストケース | 期待する結果 |
|:---|:---|:---|
| MD-013 | サマリーデータが正しい型である | todayAttendanceRate, averageWorkHours, todayLateCount, todayEarlyLeaveCountが数値型 |
| MD-014 | 出勤率が0-100の範囲内である | 0 <= todayAttendanceRate <= 100 |

### 3.5. statusConfig（ステータス設定）

| テストID | テストケース | 期待する結果 |
|:---|:---|:---|
| MD-015 | 全てのステータスが定義されている | present, late, early_leave, absentが存在 |
| MD-016 | 各ステータスにテキストとカラーが存在する | text, colorが全ステータスに存在 |

### 3.6. departments（部署リスト）

| テストID | テストケース | 期待する結果 |
|:---|:---|:---|
| MD-017 | 部署リストが存在する | 1件以上の部署が存在する |
| MD-018 | 全ての部署が文字列である | 全要素がstring型 |

## 4. 備考

- このテストはモックデータの整合性を確認するためのもの
- アプリケーションの他のテストで使用されるデータの品質を保証する
