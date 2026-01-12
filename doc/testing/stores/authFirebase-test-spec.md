# `authFirebase.ts` 単体テスト仕様書

## 1. 概要

| 項目 | 内容 |
|:---|:---|
| 対象ファイル | `src/stores/authFirebase.ts` |
| 関連設計書 | [基本設計書 3.1](../../design/03-basic/03-basic-design.md#31-auth-store-authfirebasets) |
| 設計書記載 | Auth Store（ログイン/ログアウト処理、ユーザーデータ取得、認証状態管理） |

## 2. テストの目的

`authFirebase.ts`ストアが、Firebase Authenticationを使用したログイン/ログアウト処理、ユーザーデータの取得、認証状態の管理を正しく実装していることを保証する。

## 3. 使用するライブラリ

* **テストランナー**: Vitest
* **状態管理**: Pinia (setActivePinia)
* **モック**: Firebase Auth / Firestore モジュールをモック化

## 4. テストケース

### 4.1. State初期値

| テストNo. | テストケース | State | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 1-1 | user初期値 | `user` | `null` |
| 1-2 | firebaseUser初期値 | `firebaseUser` | `null` |
| 1-3 | isAuthenticated初期値 | `isAuthenticated` | `false` |
| 1-4 | loading初期値 | `loading` | `true` |

### 4.2. Getters

| テストNo. | テストケース | State | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 2-1 | isAdmin（管理者） | `user.role: 'admin'` | `true` |
| 2-2 | isAdmin（一般ユーザー） | `user.role: 'employee'` | `false` |
| 2-3 | isAdmin（未ログイン） | `user: null` | `false` |
| 2-4 | userName | `user.name: '山田太郎'` | `'山田太郎'` |
| 2-5 | userName（未ログイン） | `user: null` | `''` |
| 2-6 | userEmail | `user.email: 'test@example.com'` | `'test@example.com'` |
| 2-7 | userId | `user.id: 'user001'` | `'user001'` |

### 4.3. login アクション

| テストNo. | テストケース | Firebase応答 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 3-1 | ログイン成功 | `signInWithEmailAndPassword`成功 | ・`true`を返す。<br>・`firebaseUser`が設定される。<br>・`fetchUserData`が呼び出される。<br>・`isAuthenticated`がtrueになる。 |
| 3-2 | ログイン失敗 | `signInWithEmailAndPassword`が例外 | ・`false`を返す。<br>・`isAuthenticated`がfalseのまま。<br>・loggerにエラーが記録される。 |
| 3-3 | ログ出力 | - | debug/infoログが適切に出力される。 |

### 4.4. logout アクション

| テストNo. | テストケース | Firebase応答 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 4-1 | ログアウト成功 | `signOut`成功 | ・`user`がnullになる。<br>・`firebaseUser`がnullになる。<br>・`isAuthenticated`がfalseになる。<br>・loggerに記録される。 |
| 4-2 | ログアウト失敗 | `signOut`が例外 | ・loggerにエラーが記録される。 |

### 4.5. fetchUserData アクション

| テストNo. | テストケース | Firestore応答 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 5-1 | ユーザーデータ取得成功 | `getDoc`でドキュメントあり | ・`user`にユーザーデータが設定される。<br>・全フィールド（id, name, email, role, department, position, employeeNumber, managerId, createdAt, updatedAt）が正しくマッピングされる。 |
| 5-2 | ユーザードキュメントなし | `getDoc`で`exists()`がfalse | ・`user`がnullのまま。<br>・loggerに警告が記録される。 |
| 5-3 | Firestoreエラー | `getDoc`が例外 | ・loggerにエラーが記録される。 |
| 5-4 | Timestamp変換 | `createdAt`/`updatedAt`がTimestamp | `toDate()`でDateオブジェクトに変換される。 |

### 4.6. initAuthListener アクション

| テストNo. | テストケース | 認証状態 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 6-1 | リスナー登録 | - | `onAuthStateChanged`が呼び出される。 |
| 6-2 | ログイン状態検出 | `firebaseUserData`がnullでない | ・`loading`がtrueになる。<br>・`fetchUserData`が呼び出される。<br>・`isAuthenticated`がtrueになる。<br>・`loading`がfalseになる。 |
| 6-3 | 未ログイン状態検出 | `firebaseUserData`がnull | ・`user`がnullになる。<br>・`isAuthenticated`がfalseになる。<br>・`loading`がfalseになる。 |

### 4.7. checkAuth アクション

| テストNo. | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| 7-1 | 互換性メソッド | loggerにdebugログが出力される（実際の処理はinitAuthListenerで行われる）。 |
