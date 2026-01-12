# `types/index.ts` 単体テスト仕様書

## 1. テストの目的

`types/index.ts`で定義されている型が、アプリケーション全体で使用されるデータ構造を正しく表現していることを保証する。型定義ファイルは主にTypeScriptのコンパイル時にチェックされるが、ランタイムでの型ガードや型アサーションのテストも考慮する。

## 2. 使用するライブラリ

* **テストランナー**: Vitest
* **TypeScript**: 型チェック

## 3. テストケース

### 3.1. User インターフェース

| テストNo. | テストケース | フィールド | 期待する型 |
| :--- | :--- | :--- | :--- |
| 1-1 | id | `id` | `string` |
| 1-2 | name | `name` | `string` |
| 1-3 | email | `email` | `string` |
| 1-4 | role | `role` | `'employee' \| 'admin'` |
| 1-5 | department | `department` | `string` |
| 1-6 | position（オプション） | `position` | `string \| undefined` |
| 1-7 | employeeNumber（オプション） | `employeeNumber` | `string \| undefined` |
| 1-8 | managerId | `managerId` | `string \| null` |
| 1-9 | createdAt（オプション） | `createdAt` | `Date \| undefined` |
| 1-10 | updatedAt（オプション） | `updatedAt` | `Date \| undefined` |

### 3.2. Location インターフェース

| テストNo. | テストケース | フィールド | 期待する型 |
| :--- | :--- | :--- | :--- |
| 2-1 | latitude | `latitude` | `number` |
| 2-2 | longitude | `longitude` | `number` |
| 2-3 | accuracy | `accuracy` | `number` |

### 3.3. Attendance インターフェース

| テストNo. | テストケース | フィールド | 期待する型 |
| :--- | :--- | :--- | :--- |
| 3-1 | id | `id` | `string` |
| 3-2 | userId | `userId` | `string` |
| 3-3 | date | `date` | `string` (YYYY-MM-DD形式) |
| 3-4 | checkIn | `checkIn` | `Date` |
| 3-5 | checkInLocation | `checkInLocation` | `Location` |
| 3-6 | checkOut | `checkOut` | `Date \| null` |
| 3-7 | checkOutLocation | `checkOutLocation` | `Location \| null` |
| 3-8 | workingMinutes | `workingMinutes` | `number` |
| 3-9 | status | `status` | `AttendanceStatus` |
| 3-10 | note | `note` | `string` |
| 3-11 | createdAt（オプション） | `createdAt` | `Date \| undefined` |
| 3-12 | updatedAt（オプション） | `updatedAt` | `Date \| undefined` |

### 3.4. AttendanceStatus 型

| テストNo. | テストケース | 値 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 4-1 | present | `'present'` | 有効な値 |
| 4-2 | late | `'late'` | 有効な値 |
| 4-3 | early_leave | `'early_leave'` | 有効な値 |
| 4-4 | absent | `'absent'` | 有効な値 |

### 3.5. EditLog インターフェース

| テストNo. | テストケース | フィールド | 期待する型 |
| :--- | :--- | :--- | :--- |
| 5-1 | id | `id` | `string` |
| 5-2 | attendanceId | `attendanceId` | `string` |
| 5-3 | editedBy | `editedBy` | `string` |
| 5-4 | editedByName（オプション） | `editedByName` | `string \| undefined` |
| 5-5 | editedAt | `editedAt` | `Date` |
| 5-6 | fieldChanged | `fieldChanged` | `string` |
| 5-7 | oldValue | `oldValue` | `any` |
| 5-8 | newValue | `newValue` | `any` |
| 5-9 | reason | `reason` | `string` |

### 3.6. StatusConfig インターフェース

| テストNo. | テストケース | フィールド | 期待する型 |
| :--- | :--- | :--- | :--- |
| 6-1 | text | `text` | `string` |
| 6-2 | color | `color` | `string` |

### 3.7. ChartData インターフェース

| テストNo. | テストケース | フィールド | 期待する型 |
| :--- | :--- | :--- | :--- |
| 7-1 | attendanceRate | `attendanceRate` | `{ categories: string[], series: Array<{ name: string, data: number[] }> }` |
| 7-2 | averageWorkHours | `averageWorkHours` | `{ categories: string[], series: Array<{ name: string, data: number[] }> }` |
| 7-3 | lateEarlyLeave | `lateEarlyLeave` | `{ categories: string[], series: Array<{ name: string, data: number[] }> }` |
| 7-4 | departmentStatus | `departmentStatus` | `{ labels: string[], series: number[] }` |

### 3.8. Summary インターフェース

| テストNo. | テストケース | フィールド | 期待する型 |
| :--- | :--- | :--- | :--- |
| 8-1 | todayAttendanceRate | `todayAttendanceRate` | `number` |
| 8-2 | averageWorkHours | `averageWorkHours` | `number` |
| 8-3 | todayLateCount | `todayLateCount` | `number` |
| 8-4 | todayEarlyLeaveCount | `todayEarlyLeaveCount` | `number` |

### 3.9. LoginCredentials インターフェース

| テストNo. | テストケース | フィールド | 期待する型 |
| :--- | :--- | :--- | :--- |
| 9-1 | email | `email` | `string` |
| 9-2 | password | `password` | `string` |
| 9-3 | rememberMe（オプション） | `rememberMe` | `boolean \| undefined` |

### 3.10. AuthState インターフェース

| テストNo. | テストケース | フィールド | 期待する型 |
| :--- | :--- | :--- | :--- |
| 10-1 | isAuthenticated | `isAuthenticated` | `boolean` |
| 10-2 | user | `user` | `User \| null` |
| 10-3 | token | `token` | `string \| null` |

### 3.11. DataTableHeader インターフェース

| テストNo. | テストケース | フィールド | 期待する型 |
| :--- | :--- | :--- | :--- |
| 11-1 | title | `title` | `string` |
| 11-2 | key | `key` | `string` |
| 11-3 | sortable（オプション） | `sortable` | `boolean \| undefined` |
| 11-4 | align（オプション） | `align` | `'start' \| 'center' \| 'end' \| undefined` |

### 3.12. ApexChartOptions インターフェース

| テストNo. | テストケース | フィールド | 期待する型 |
| :--- | :--- | :--- | :--- |
| 12-1 | chart（オプション） | `chart` | `any` |
| 12-2 | xaxis（オプション） | `xaxis` | `any` |
| 12-3 | yaxis（オプション） | `yaxis` | `any` |
| 12-4 | colors（オプション） | `colors` | `string[]` |
| 12-5 | その他オプション | - | 各種ApexChartsオプション |
