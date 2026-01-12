# 開発フロー

このドキュメントでは、本プロジェクトの開発フローとブランチ戦略について説明します。

## ブランチ戦略

```
main (本番環境)
  │
  └── develop (ステージング環境)
        │
        ├── feature/xxx (機能開発)
        ├── fix/xxx (バグ修正)
        └── refactor/xxx (リファクタリング)
```

### ブランチの役割

| ブランチ | 環境 | デプロイ先 | 説明 |
|---------|------|-----------|------|
| `main` | 本番 | Vercel (Production) | 本番公開。直接pushは禁止 |
| `develop` | ステージング | Vercel (Preview) | ステージング公開。PRマージ先 |
| `feature/*` | ローカルのみ | なし | 機能開発用。Emulatorで動作確認 |
| `fix/*` | ローカルのみ | なし | バグ修正用 |
| `refactor/*` | ローカルのみ | なし | リファクタリング用 |

## デプロイ環境

### 1. 本番環境 (Production)

- **ブランチ**: `main`
- **デプロイ先**: Vercel Production
- **Firebase**: 本番Firebase
- **URL**: https://attendance-tracker.vercel.app (例)

### 2. ステージング環境 (Staging)

- **ブランチ**: `develop`
- **デプロイ先**: Vercel Preview
- **Firebase**: 本番Firebase（または専用ステージング環境）
- **URL**: https://attendance-tracker-develop.vercel.app (例)

### 3. ローカル開発環境

- **ブランチ**: `feature/*`, `fix/*`, `refactor/*`
- **デプロイ先**: なし（ローカルのみ）
- **Firebase**: Firebase Emulator
- **URL**: http://localhost:5173

## 開発フロー

### 1. 新機能開発

```bash
# 1. developから最新を取得
git checkout develop
git pull origin develop

# 2. featureブランチを作成
git checkout -b feature/new-feature

# 3. Firebase Emulatorを起動
npm run firebase:emulators

# 4. 本番データをEmulatorにインポート（必要に応じて）
npm run export:production
npm run seed:emulator:from-export

# 5. 開発サーバーを起動
npm run dev

# 6. 開発・テスト
# ... コード修正 ...

# 7. コミット
git add .
git commit -m "feat: add new feature"

# 8. developにPRを作成
git push origin feature/new-feature
# GitHubでPR作成 → develop へマージ

# 9. ステージングで動作確認
# Vercel Previewで自動デプロイされる

# 10. 問題なければ develop → main へPRを作成
# 本番リリース
```

### 2. バグ修正

```bash
# 1. developから最新を取得してブランチ作成
git checkout develop
git pull origin develop
git checkout -b fix/bug-description

# 2. 修正・テスト（Emulator使用）
npm run firebase:emulators
npm run dev

# 3. コミット＆PR
git add .
git commit -m "fix: fix bug description"
git push origin fix/bug-description
```

### 3. 緊急修正（Hotfix）

```bash
# 1. mainから直接ブランチ作成
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. 修正・テスト

# 3. mainにPRを作成してマージ
# 4. developにもマージして同期
```

## Firebase環境の使い分け

### ローカル開発時

```bash
# Emulator起動
npm run firebase:emulators

# 開発サーバー起動（自動的にEmulatorに接続）
npm run dev
```

コンソールに以下が表示されれば正常:
```
🔧 Connected to Auth Emulator
🔧 Connected to Firestore Emulator
🚀 Running in LOCAL mode with Firebase Emulators
```

### Vercelビルド時

自動的に本番Firebaseに接続されます:
```
☁️  Running in PRODUCTION mode with Firebase
```

## データ管理コマンド

### 本番 → ローカル

```bash
# 本番データをエクスポート
npm run export:production

# EmulatorにインポートNpm
npm run seed:emulator:from-export
```

### ローカル → 本番

```bash
# Emulatorデータをエクスポート
npm run export:emulator

# 本番にアップロード（初期化モード：全削除してアップロード）
npm run upload:to-production -- --init

# 本番にアップロード（マージモード：既存を残して追加）
npm run upload:to-production -- --merge
```

### テストデータ生成

```bash
# 新規テストデータを生成してEmulatorにシード
npm run seed:emulator
```

## コマンド一覧

### 開発

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルド結果プレビュー |
| `npm run type-check` | TypeScript型チェック |
| `npm run lint` | ESLintチェック |
| `npm run format` | Prettier整形 |

### テスト

| コマンド | 説明 |
|---------|------|
| `npm run test:unit` | ユニットテスト実行 |
| `npm run test:unit:ui` | テストUI表示 |
| `npm run test:coverage` | カバレッジレポート |

### Firebase Emulator

| コマンド | 説明 |
|---------|------|
| `npm run firebase:emulators` | Emulator起動 |
| `npm run firebase:emulators:export` | Emulatorデータ保存 |
| `npm run firebase:emulators:import` | 保存データで起動 |
| `npm run seed:emulator` | テストデータ生成 |

### データ移行

| コマンド | 説明 |
|---------|------|
| `npm run export:production` | 本番データエクスポート |
| `npm run seed:emulator:from-export` | エクスポートデータをEmulatorへ |
| `npm run export:emulator` | Emulatorデータエクスポート |
| `npm run upload:to-production` | Emulatorデータを本番へ |

## テストアカウント

### ローカル開発（Emulator）

| メールアドレス | パスワード | 役割 |
|---------------|-----------|------|
| admin@example.com | adminadmin | 管理者 |
| user01@example.com | user01 | 一般ユーザー |
| user02~20@example.com | password123 | 一般ユーザー |

### 本番/ステージング

本番Firebaseに登録されているアカウントを使用してください。

## 注意事項

### やってはいけないこと

- `main`ブランチへの直接push
- ローカルで本番Firebaseに直接接続しての開発
- `--force`オプションなしでの本番データ初期化

### 推奨事項

- 機能開発は必ずEmulatorを使用
- コミット前に`npm run lint`と`npm run type-check`を実行
- PRには十分な説明を記載
- ステージング環境で動作確認後に本番リリース

## 関連ドキュメント

- [Firebase Emulator セットアップ](./FIREBASE_EMULATOR_SETUP.md)
- [基本設計](./basic-design.md)
- [コンポーネントツリー](./component-tree.md)
