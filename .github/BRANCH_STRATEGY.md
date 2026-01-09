# ブランチ戦略・運用ガイド

## ブランチ構成

```
main (本番環境)
├── develop (開発環境)
├── feature/* (機能開発)
├── fix/* (バグ修正)
└── hotfix/* (緊急修正)
```

## ブランチの役割

### 1. main ブランチ
- **目的**: 本番環境にデプロイされるコード
- **デプロイ先**: GitHub Pages (自動)
- **保護ルール**:
  - ✅ プルリクエスト必須
  - ✅ レビュー承認必須（1人以上）
  - ✅ テスト合格必須
  - ✅ 直接プッシュ禁止
- **マージ元**: `develop` または `hotfix/*`

### 2. develop ブランチ
- **目的**: 開発中の機能を統合・検証
- **デプロイ先**: Vercel Preview (自動)
- **保護ルール**:
  - ✅ プルリクエスト推奨
  - ✅ テスト合格必須
- **マージ元**: `feature/*`, `fix/*`

### 3. feature/* ブランチ
- **目的**: 新機能の開発
- **命名規則**: `feature/機能名-簡潔な説明`
  - 例: `feature/user-authentication`
  - 例: `feature/attendance-export-csv`
- **作成元**: `develop`
- **マージ先**: `develop`
- **ライフサイクル**: マージ後削除

### 4. fix/* ブランチ
- **目的**: バグ修正
- **命名規則**: `fix/問題の簡潔な説明`
  - 例: `fix/login-button-not-working`
  - 例: `fix/date-format-timezone`
- **作成元**: `develop`
- **マージ先**: `develop`
- **ライフサイクル**: マージ後削除

### 5. hotfix/* ブランチ
- **目的**: 本番環境の緊急修正
- **命名規則**: `hotfix/重大度-問題の説明`
  - 例: `hotfix/critical-security-vulnerability`
  - 例: `hotfix/production-crash`
- **作成元**: `main`
- **マージ先**: `main` と `develop` の両方
- **ライフサイクル**: マージ後削除

---

## 開発フロー

### 通常の機能開発

```bash
# 1. developブランチから最新を取得
git checkout develop
git pull origin develop

# 2. featureブランチを作成
git checkout -b feature/new-attendance-report

# 3. 開発・コミット
git add .
git commit -m "feat: add new attendance report feature"

# 4. リモートにプッシュ
git push origin feature/new-attendance-report

# 5. GitHub上でPR作成 (develop ← feature/*)
#    - テストが自動実行される
#    - レビューを受ける

# 6. マージ後、ブランチ削除
git branch -d feature/new-attendance-report
```

### 本番リリース

```bash
# 1. developブランチが安定していることを確認
# 2. GitHub上でPR作成 (main ← develop)
#    - レビュー必須
#    - テスト合格必須
# 3. マージ後、自動的にGitHub Pagesへデプロイ
```

### 緊急修正（Hotfix）

```bash
# 1. mainブランチから分岐
git checkout main
git pull origin main
git checkout -b hotfix/critical-login-bug

# 2. 修正・コミット
git add .
git commit -m "hotfix: fix critical login bug"

# 3. mainへPR作成・マージ
# 4. developへもマージ（同期）
git checkout develop
git merge hotfix/critical-login-bug
git push origin develop

# 5. hotfixブランチ削除
git branch -d hotfix/critical-login-bug
```

---

## CI/CD パイプライン

### テストワークフロー
- **トリガー**: すべてのブランチへのプッシュ・PR
- **実行内容**:
  - ユニットテスト
  - 型チェック
- **ファイル**: `.github/workflows/test.yml`

### 開発環境デプロイ
- **トリガー**: `develop` ブランチへのプッシュ・PR
- **実行内容**:
  - テスト実行
  - Vercel Preview デプロイ（PR時）
- **ファイル**: `.github/workflows/develop.yml`

### 本番環境デプロイ
- **トリガー**: `main` ブランチへのプッシュのみ
- **実行内容**:
  - テスト実行
  - 型チェック
  - GitHub Pages デプロイ
- **ファイル**: `.github/workflows/deploy.yml`

---

## ブランチ保護設定（推奨）

### main ブランチ
1. GitHub リポジトリ → Settings → Branches
2. "Branch protection rules" → "Add rule"
3. 以下を設定:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Require status checks to pass before merging
     - test
     - type-check
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings

### develop ブランチ
1. "Branch protection rules" → "Add rule"
2. 以下を設定:
   - ✅ Require status checks to pass before merging
     - test
     - type-check

---

## コミットメッセージ規約

```
<type>: <subject>

<body>

<footer>
```

### Type
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更（空白、フォーマットなど）
- `refactor`: バグ修正や機能追加を伴わないコード変更
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更

### 例
```bash
feat: add CSV export functionality for attendance records

- Implement CSV export button in attendance list
- Add download handler with proper encoding
- Include tests for export functionality

Closes #123
```

---

## よくある質問

### Q: developブランチは必須ですか？
A: 小規模プロジェクトの場合、`main` ブランチのみでも運用可能です。ただし、複数機能を並行開発する場合や、本番と開発環境を分けたい場合は `develop` ブランチの導入を強く推奨します。

### Q: Vercelはどのように設定しますか？
A: Vercel Dashboard で以下を設定:
- Production Branch: `main`
- Preview Deployments: すべてのブランチ
- Firebaseの環境変数をVercel環境変数として設定

### Q: FirebaseのPreview Channelを使うべきですか？
A: PR ごとに独立した環境でテストしたい場合は有用です。ただし、Vercel Preview で十分な場合も多いです。

---

## 参考リンク
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Vercel Git Integration](https://vercel.com/docs/deployments/git)
- [Firebase Hosting Preview Channels](https://firebase.google.com/docs/hosting/test-preview-deploy)
