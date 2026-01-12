# Firebase Emulator セットアップガイド

このドキュメントでは、ローカル開発環境でFirebase Emulatorを使用する方法について説明します。

## 概要

このプロジェクトは、以下の環境別にFirebase接続先を自動で切り替えます:

- **ローカル開発**: Firebase Emulator（ローカルマシン上で動作）
- **Vercelビルド**: 本番Firebase（クラウド）

## Firebase Emulatorとは

Firebase Emulatorは、Firebase Authentication、Firestore、Storageなどのサービスをローカルマシンで実行できるツールです。

### メリット

- 🚀 本番データを汚さない
- 💰 本番のFirebaseクォータを消費しない
- ⚡ ネットワーク遅延がないため高速
- 🔄 データをリセットして何度でもテストできる
- 📦 オフラインでも開発可能

## セットアップ手順

### 1. Firebase Emulatorの起動

ターミナルで以下のコマンドを実行します:

```bash
npm run firebase:emulators
```

これにより、以下のサービスが起動します:

- **Firestore Emulator**: `localhost:8080`
- **Authentication Emulator**: `localhost:9099`
- **Emulator UI**: `http://localhost:4000`

### 2. テストデータをシード

Emulatorにテストユーザーとサンプルデータを追加します:

```bash
npm run seed:emulator
```

以下のテストユーザーが作成されます:

| メールアドレス | パスワード | 役割 |
|---|---|---|
| admin@example.com | adminadmin | 管理者 |
| user01@example.com | user01 | 一般ユーザー |
| user02@example.com | password123 | 一般ユーザー |
| user03~user20@example.com | password123 | 一般ユーザー（18名） |

### 3. アプリケーションの起動

別のターミナルウィンドウで、開発サーバーを起動します:

```bash
npm run dev
```

アプリケーションは自動的にEmulatorに接続されます。

## 利用可能なコマンド

### Emulator起動

```bash
# Emulatorを起動
npm run firebase:emulators

# テストデータをシード（Emulator起動後に実行）
npm run seed:emulator

# データをエクスポートした状態で起動（前回の状態を復元）
npm run firebase:emulators:import

# Emulatorのデータをエクスポート（保存）
npm run firebase:emulators:export
```

### データのインポート/エクスポート

Emulatorのデータを保存したい場合:

```bash
# 現在のEmulatorデータを ./firebase-data に保存
npm run firebase:emulators:export

# 保存したデータをロードして起動
npm run firebase:emulators:import
```

## 環境の確認

アプリケーションを起動すると、ブラウザのコンソールに以下のようなメッセージが表示されます:

### ローカル開発時

```
🔧 Connected to Auth Emulator
🔧 Connected to Firestore Emulator
🚀 Running in LOCAL mode with Firebase Emulators
```

### Vercel本番ビルド時

```
☁️  Running in PRODUCTION mode with Firebase
```

## Emulator UI

Emulator UIにアクセスすると、以下の操作が可能です:

- **URL**: http://localhost:4000
- Firestoreのデータを閲覧・編集
- Authenticationのユーザーを管理
- データのインポート/エクスポート

## トラブルシューティング

### Emulatorに接続できない

1. Emulatorが起動しているか確認
   ```bash
   # プロセスを確認
   lsof -i :8080
   lsof -i :9099
   ```

2. ポートが使用中の場合は、`firebase.json`のポート番号を変更

### 本番データに誤って接続してしまう

`.env.local`ファイルで以下を確認:

```
VITE_FIREBASE_PROJECT_ID=your-project-id
```

本番プロジェクトIDが設定されていても、ローカル開発(`npm run dev`)では自動的にEmulatorに接続されます。

### データがリセットされる

Emulatorは再起動すると データがクリアされます。データを保持したい場合:

```bash
# データをエクスポート
npm run firebase:emulators:export

# 次回起動時にインポート
npm run firebase:emulators:import
```

## データ移行

### 本番データをEmulatorにインポート

本番環境のデータを使ってローカル開発する場合:

```bash
# 1. 本番Firebaseからデータをエクスポート（service-account.json必要）
npm run export:production

# 2. Emulator起動
npm run firebase:emulators

# 3. エクスポートしたデータをEmulatorにインポート
npm run seed:emulator:from-export
```

### EmulatorデータをEmulatorにアップロード

ローカルで作成したデータを本番環境に反映する場合:

```bash
# 1. Emulatorからデータをエクスポート
npm run export:emulator

# 2. 本番にアップロード（2つのモードから選択）

# 初期化モード: 本番データを全削除してアップロード
npm run upload:to-production -- --init

# マージモード: 既存データを残して追加
npm run upload:to-production -- --merge
```

⚠️ **注意**: パスワードはエクスポート/インポートされません。ユーザーはパスワードリセットが必要です。

## 本番環境への影響

このセットアップでは、以下のロジックで接続先が決定されます:

```typescript
const isVercel = import.meta.env.VERCEL === '1' || import.meta.env.VERCEL === 'true'
const isDevelopment = import.meta.env.DEV && !isVercel

if (isDevelopment) {
  // Emulatorに接続
} else {
  // 本番Firebaseに接続
}
```

Vercelでビルドする際、環境変数`VERCEL`が自動的に設定されるため、本番Firebaseに接続されます。

## 関連ドキュメント

- [開発フロー](./DEVELOPMENT_FLOW.md) - ブランチ戦略と開発手順

## 参考リンク

- [Firebase Emulator Suite 公式ドキュメント](https://firebase.google.com/docs/emulator-suite)
- [Firebase Emulator UI](http://localhost:4000)（Emulator起動時のみ）
