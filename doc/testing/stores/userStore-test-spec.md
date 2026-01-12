# `userStore.ts` 単体テスト仕様書

## 1. 概要

| 項目 | 内容 |
|:---|:---|
| 対象ファイル | `src/stores/userStore.ts` |
| 関連設計書 | [基本設計書 3.1](../../design/03-basic/03-basic-design.md#31-auth-store-authfirebasets) |
| 設計書記載 | User Store（Firestoreからのユーザーデータ取得、キャッシュ管理、フィルタリング機能） |

## 2. テストの目的

`userStore.ts`ストアが、Firestoreからのユーザーデータ取得、キャッシュ管理、各種フィルタリング機能を正しく実装していることを保証する。

## 3. 使用するライブラリ

* **テストランナー**: Vitest
* **状態管理**: Pinia (setActivePinia)
* **モック**: Firebase Firestore モジュールをモック化

## 4. テストケース

### 4.1. State初期値

| テストNo. | テストケース | State | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 1-1 | users初期値 | `users` | 空配列 `[]` |
| 1-2 | loading初期値 | `loading` | `false` |
| 1-3 | lastFetched初期値 | `lastFetched` | `null` |
| 1-4 | error初期値 | `error` | `null` |

### 4.2. Getters

#### 4.2.1. employees

| テストNo. | テストケース | usersデータ | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 2-1-1 | 従業員フィルタリング | admin1人、employee3人 | employee3人のみ返される。 |
| 2-1-2 | 従業員なし | adminのみ | 空配列が返される。 |

#### 4.2.2. admins

| テストNo. | テストケース | usersデータ | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 2-2-1 | 管理者フィルタリング | admin1人、employee3人 | admin1人のみ返される。 |

#### 4.2.3. managers

| テストNo. | テストケース | usersデータ | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 2-3-1 | 主任フィルタリング | position='主任'が2人 | 主任2人のみ返される。 |
| 2-3-2 | 主任なし | 主任なし | 空配列が返される。 |
| 2-3-3 | adminの主任除外 | admin(主任)、employee(主任) | employeeの主任のみ返される。 |

#### 4.2.4. usersByDepartment

| テストNo. | テストケース | usersデータ | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 2-4-1 | 部署グループ化 | 営業部2人、開発部3人 | Map { '営業部' => [2人], '開発部' => [3人] } |
| 2-4-2 | 空データ | users空 | 空のMap |

### 4.3. fetchUsers アクション

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 3-1 | 初回取得成功 | キャッシュなし | ・`users`にデータが設定される。<br>・`lastFetched`が現在時刻に設定される。<br>・Firestoreの`getDocs`が呼び出される。 |
| 3-2 | キャッシュ利用 | 5分以内にfetch済み | ・`getDocs`が呼び出されない。<br>・既存データを返す。 |
| 3-3 | キャッシュ期限切れ | 5分以上経過 | ・`getDocs`が呼び出される。<br>・データが更新される。 |
| 3-4 | 強制リフレッシュ | `forceRefresh: true` | ・キャッシュに関係なく`getDocs`が呼び出される。 |
| 3-5 | Firestoreエラー | `getDocs`が例外 | ・`error`にエラーメッセージが設定される。<br>・例外がスローされる。<br>・loggerにエラーが記録される。 |
| 3-6 | loading状態 | - | 取得中は`loading`がtrue、完了後false。 |
| 3-7 | データマッピング | - | 全フィールド（id, name, email, role, department, position, employeeNumber, managerId, createdAt, updatedAt）が正しくマッピングされる。 |
| 3-8 | Timestamp変換 | - | `createdAt`、`updatedAt`が`toDate()`でDateに変換される。 |

### 4.4. getUserById アクション

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 4-1 | ユーザー存在 | 該当userIdあり | Userオブジェクトを返す。 |
| 4-2 | ユーザー不在 | 該当userIdなし | `undefined`を返す。 |

### 4.5. getTeamMembers アクション

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 5-1 | チームメンバー取得 | `managerId`一致するemployeeあり | 該当employeeの配列を返す。 |
| 5-2 | チームメンバーなし | `managerId`一致なし | 空配列を返す。 |
| 5-3 | adminは除外 | admin(managerId一致) | 含まれない（employeesからフィルタ）。 |

### 4.6. getUsersByDepartment アクション

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 6-1 | 部署メンバー取得 | 該当部署のユーザーあり | 該当部署のユーザー配列を返す。 |
| 6-2 | 部署メンバーなし | 該当部署なし | 空配列を返す。 |

### 4.7. clearCache アクション

| テストNo. | テストケース | 初期状態 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 7-1 | キャッシュクリア | データあり | ・`users`が空配列になる。<br>・`lastFetched`がnullになる。<br>・`error`がnullになる。<br>・loggerに記録される。 |
