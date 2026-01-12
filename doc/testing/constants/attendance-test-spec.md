# `constants/attendance.ts` 単体テスト仕様書

## 1. テストの目的

`constants/attendance.ts`で定義されている勤怠関連の定数が、アプリケーション全体で一貫して使用される値を正しく提供していることを保証する。

## 2. 使用するライブラリ

* **テストランナー**: Vitest

## 3. テストケース

### 3.1. ATTENDANCE_STATUS 定数

#### 3.1.1. present（正常出勤）

| テストNo. | テストケース | プロパティ | 期待する値 |
| :--- | :--- | :--- | :--- |
| 1-1-1 | text | `ATTENDANCE_STATUS.present.text` | `'正常'` |
| 1-1-2 | color | `ATTENDANCE_STATUS.present.color` | `'success'` |

#### 3.1.2. late（遅刻）

| テストNo. | テストケース | プロパティ | 期待する値 |
| :--- | :--- | :--- | :--- |
| 1-2-1 | text | `ATTENDANCE_STATUS.late.text` | `'遅刻'` |
| 1-2-2 | color | `ATTENDANCE_STATUS.late.color` | `'warning'` |

#### 3.1.3. early_leave（早退）

| テストNo. | テストケース | プロパティ | 期待する値 |
| :--- | :--- | :--- | :--- |
| 1-3-1 | text | `ATTENDANCE_STATUS.early_leave.text` | `'早退'` |
| 1-3-2 | color | `ATTENDANCE_STATUS.early_leave.color` | `'info'` |

#### 3.1.4. absent（欠勤）

| テストNo. | テストケース | プロパティ | 期待する値 |
| :--- | :--- | :--- | :--- |
| 1-4-1 | text | `ATTENDANCE_STATUS.absent.text` | `'欠勤'` |
| 1-4-2 | color | `ATTENDANCE_STATUS.absent.color` | `'error'` |

### 3.2. WORK_TIME_STANDARDS 定数

| テストNo. | テストケース | プロパティ | 期待する値 | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| 2-1 | START_TIME | `WORK_TIME_STANDARDS.START_TIME` | `540` | 9:00 = 9 * 60分 |
| 2-2 | END_TIME | `WORK_TIME_STANDARDS.END_TIME` | `1080` | 18:00 = 18 * 60分 |

### 3.3. 型定義

| テストNo. | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| 3-1 | ATTENDANCE_STATUS型 | `Record<string, StatusConfig>`型として定義されている。 |
| 3-2 | as const | `ATTENDANCE_STATUS`と`WORK_TIME_STANDARDS`がreadonly。 |
