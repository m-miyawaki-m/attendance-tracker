# `authFirebase.ts` 単体テスト仕様書

## 1. 概要

| 項目 | 内容 |
|:---|:---|
| 対象ファイル | `src/stores/authFirebase.ts` |
| テストファイル | `tests/unit/stores/authFirebase.spec.ts` |
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

| テストID | テストケース | State | 期待する結果 |
| :--- | :--- | :--- | :--- |
| AF-001 | user初期値、isAuthenticated初期値、loading初期値 | `user`, `firebaseUser`, `isAuthenticated`, `loading` | `null`, `null`, `false`, `true` |
| AF-002 | 初期状態のgetters | `isAdmin`, `userName`, `userEmail`, `userId` | `false`, `''`, `''`, `''` |

### 4.2. login アクション

| テストID | テストケース | Firebase応答 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| AF-003 | メール/パスワードでログイン成功 | `signInWithEmailAndPassword`成功 | ・`true`を返す。<br>・`isAuthenticated`がtrueになる。 |
| AF-004 | ログイン失敗（無効なメール） | `signInWithEmailAndPassword`が例外 | ・`false`を返す。<br>・`isAuthenticated`がfalseのまま。 |
| AF-005 | ログイン失敗（無効なパスワード） | `signInWithEmailAndPassword`が例外 | ・`false`を返す。<br>・`isAuthenticated`がfalseのまま。 |
| AF-006 | ログイン後のユーザー情報取得 | ログイン成功、`getDoc`成功 | ・`user`にユーザーデータが設定される。 |

### 4.3. logout アクション

| テストID | テストケース | Firebase応答 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| AF-007 | ログアウト成功 | `signOut`成功 | ・`user`がnullになる。<br>・`firebaseUser`がnullになる。<br>・`isAuthenticated`がfalseになる。 |
| AF-008 | ログアウト後のクリーンアップ | `signOut`成功 | ・gettersも初期状態に戻る（`userName`が空文字など）。 |

### 4.4. 認証状態監視（initAuthListener）

| テストID | テストケース | 認証状態 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| AF-009 | ログイン検知（onAuthStateChanged） | `firebaseUserData`がnullでない | `onAuthStateChanged`が呼び出される。 |
| AF-010 | ログアウト検知（onAuthStateChanged with null） | `firebaseUserData`がnull | ・`isAuthenticated`がfalseになる。<br>・`loading`がfalseになる。 |
| AF-011 | 認証状態変更時にユーザーデータ取得 | 認証状態変更 | ・`isAuthenticated`がtrueになる。<br>・`getDoc`が呼び出される。 |

### 4.5. ユーザー情報（Getters）

| テストID | テストケース | State | 期待する結果 |
| :--- | :--- | :--- | :--- |
| AF-012 | ユーザー名取得 | ログイン後 | `userName`に正しい値が設定される。 |
| AF-013 | メールアドレス取得 | ログイン後 | `userEmail`に正しい値が設定される。 |
| AF-014 | UID取得 | ログイン後 | `userId`に正しい値が設定される。 |
| AF-015 | ロール取得 | ログイン後 | `user.role`に正しい値が設定される。 |

### 4.6. 管理者権限

| テストID | テストケース | State | 期待する結果 |
| :--- | :--- | :--- | :--- |
| AF-016 | 管理者判定（true） | `user.role: 'admin'` | `isAdmin`が`true`を返す。 |
| AF-017 | 管理者判定（false） | `user.role: 'employee'` | `isAdmin`が`false`を返す。 |

### 4.7. エッジケース

| テストID | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| AF-022 | ユーザードキュメントが存在しない場合 | `getDoc`で`exists()`がfalse | 認証成功するが`user`はnull。 |
| AF-023 | Firestoreからのデータ取得エラー | `getDoc`が例外 | 認証成功するが`user`はnull。 |
| AF-024 | ログアウト時のエラーハンドリング | `signOut`が例外 | エラーがスローされない。 |
| AF-025 | checkAuth関数は互換性のために存在 | - | 呼び出してもエラーにならない。 |

## 5. 備考

- テストID（AF-001〜AF-025）はチェックリスト（PHASE1_TEST_CHECKLIST.md）と統一
- 一部のテストケースは統合して実装（例: AF-001でState初期値とisAuthenticated初期値を同時にテスト）
- 実装テスト数: 21テスト関数
