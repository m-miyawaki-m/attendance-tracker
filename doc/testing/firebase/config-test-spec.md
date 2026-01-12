# `firebase/config.ts` 単体テスト仕様書

## 1. テストの目的

`firebase/config.ts`が、Firebase Authenticationとfirestoreの初期化、および環境に応じたEmulator接続を正しく実装していることを保証する。

## 2. 使用するライブラリ

* **テストランナー**: Vitest
* **モック**: Firebase モジュール、import.meta.env

## 3. テストケース

### 3.1. Firebase初期化

| テストNo. | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| 1-1 | initializeApp呼び出し | 環境変数から取得した設定で`initializeApp`が呼び出される。 |
| 1-2 | auth初期化 | `getAuth(app)`でAuth instanceが取得される。 |
| 1-3 | db初期化 | `getFirestore(app)`でFirestore instanceが取得される。 |

### 3.2. 環境変数

| テストNo. | テストケース | 環境変数 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 2-1 | API Key | `VITE_FIREBASE_API_KEY` | firebaseConfigに設定される。 |
| 2-2 | Auth Domain | `VITE_FIREBASE_AUTH_DOMAIN` | firebaseConfigに設定される。 |
| 2-3 | Project ID | `VITE_FIREBASE_PROJECT_ID` | firebaseConfigに設定される。 |
| 2-4 | Storage Bucket | `VITE_FIREBASE_STORAGE_BUCKET` | firebaseConfigに設定される。 |
| 2-5 | Messaging Sender ID | `VITE_FIREBASE_MESSAGING_SENDER_ID` | firebaseConfigに設定される。 |
| 2-6 | App ID | `VITE_FIREBASE_APP_ID` | firebaseConfigに設定される。 |

### 3.3. 環境判定

| テストNo. | テストケース | 環境変数 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 3-1 | Vercel判定（'1'） | `VERCEL='1'` | `isVercel`がtrue。 |
| 3-2 | Vercel判定（'true'） | `VERCEL='true'` | `isVercel`がtrue。 |
| 3-3 | Vercel判定（未設定） | `VERCEL`未設定 | `isVercel`がfalse。 |
| 3-4 | 開発環境判定 | `DEV=true`, Vercelでない | `isDevelopment`がtrue。 |
| 3-5 | テスト環境判定 | `MODE='test'` | `isTest`がtrue。 |

### 3.4. Emulator接続（開発環境）

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 4-1 | Auth Emulator接続 | `isDevelopment=true`, `isTest=false` | `connectAuthEmulator(auth, 'http://localhost:9099')`が呼び出される。 |
| 4-2 | Firestore Emulator接続 | `isDevelopment=true`, `isTest=false` | `connectFirestoreEmulator(db, 'localhost', 8080)`が呼び出される。 |
| 4-3 | 接続は1回のみ | 複数回importされた場合 | Emulator接続は1回のみ実行される（`emulatorConnected`フラグ）。 |

### 3.5. Emulator非接続

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 5-1 | 本番環境 | `isDevelopment=false` | Emulatorに接続しない。 |
| 5-2 | テスト環境 | `isTest=true` | Emulatorに接続しない。 |
| 5-3 | Vercel環境 | `isVercel=true` | Emulatorに接続しない。 |

### 3.6. コンソールログ

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 6-1 | ローカルモードログ | `isDevelopment=true` | `'🚀 Running in LOCAL mode with Firebase Emulators'`が出力される。 |
| 6-2 | 本番モードログ | `isDevelopment=false`, `isTest=false` | `'☁️  Running in PRODUCTION mode with Firebase'`が出力される。 |
| 6-3 | テスト環境 | `isTest=true` | ログが出力されない。 |

### 3.7. エクスポート

| テストNo. | テストケース | 期待する結果 |
| :--- | :--- | :--- |
| 7-1 | auth | Firebase Auth instanceがエクスポートされる。 |
| 7-2 | db | Firestore instanceがエクスポートされる。 |
