# `auth.ts` 単体テスト仕様書（モック版）

## 1. 概要

| 項目 | 内容 |
|:---|:---|
| 対象ファイル | `src/stores/auth.ts` |
| テストファイル | `tests/unit/stores/auth.spec.ts` |
| テストID範囲 | AUTH-001〜AUTH-009 |
| テスト数 | 9 |

## 2. テストの目的

モック版認証ストア（Firebase未使用）が、ログイン・ログアウト・認証状態管理を正しく行えることを保証する。LocalStorageを使用した認証状態の永続化も確認する。

## 3. 使用するライブラリ

- **テストランナー**: Vitest
- **状態管理**: Pinia

## 4. テストケース

### 4.1. 初期状態

| テストID | テストケース | 期待する結果 |
|:---|:---|:---|
| AUTH-001 | 初期状態は未認証 | isAuthenticated=false, user=null, token=null |

### 4.2. ログイン処理

| テストID | テストケース | 期待する結果 |
|:---|:---|:---|
| AUTH-002 | 一般従業員でログインできる | result=true, isAuthenticated=true, role='employee', isAdmin=false |
| AUTH-003 | 管理者でログインできる | result=true, isAuthenticated=true, role='admin', isAdmin=true |
| AUTH-004 | 存在しないユーザーはログインできない | result=false, isAuthenticated=false, user=null |

### 4.3. ログアウト処理

| テストID | テストケース | 期待する結果 |
|:---|:---|:---|
| AUTH-005 | ログアウトできる | isAuthenticated=false, user=null, token=null |

### 4.4. LocalStorage永続化

| テストID | テストケース | 期待する結果 |
|:---|:---|:---|
| AUTH-006 | ログイン情報がLocalStorageに保存される | mock_auth, mock_role, mock_user_id, mock_user_nameが保存 |
| AUTH-007 | LocalStorageから認証状態を復元できる | checkAuth()で認証状態が復元される |

### 4.5. Computed値

| テストID | テストケース | 期待する結果 |
|:---|:---|:---|
| AUTH-008 | computed値が正しく計算される | userName, userEmail, userIdが正しい値を返す |

### 4.6. オプション

| テストID | テストケース | 期待する結果 |
|:---|:---|:---|
| AUTH-009 | rememberMeオプションが機能する | mock_remember='true'がLocalStorageに保存される |

## 5. 備考

- このストアはFirebase未使用のモック版認証ストア
- Firebase版認証ストアは`authFirebase.ts`（テストID: AF-001〜AF-025）
- LocalStorageを使用した簡易認証のため、本番環境では使用しない
