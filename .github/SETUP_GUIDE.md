# プロジェクトセットアップガイド

## 初期セットアップ手順

### 1. developブランチの作成

```bash
# mainブランチから最新を取得
git checkout main
git pull origin main

# developブランチを作成してプッシュ
git checkout -b develop
git push -u origin develop
```

### 2. GitHub ブランチ保護の設定

#### main ブランチの保護

1. リポジトリページで **Settings** → **Branches** を開く
2. **Branch protection rules** → **Add rule** をクリック
3. **Branch name pattern** に `main` を入力
4. 以下のオプションを有効化:

   **Protect matching branches:**
   - ✅ Require a pull request before merging
     - ✅ Require approvals: 1
     - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging
     - 検索ボックスで以下を追加:
       - `test` (test jobの完了を必須に)
       - `build` (build jobの完了を必須に)
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings

5. **Create** をクリック

#### develop ブランチの保護

1. **Add rule** をクリック
2. **Branch name pattern** に `develop` を入力
3. 以下のオプションを有効化:

   **Protect matching branches:**
   - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging
     - 検索ボックスで以下を追加:
       - `test`

4. **Create** をクリック

---

### 3. Vercel の設定

#### Vercel プロジェクトの作成

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. **Add New** → **Project** をクリック
3. GitHub リポジトリを選択
4. **Import** をクリック

#### 環境変数の設定

**Production (main ブランチ):**
1. Project Settings → Environment Variables
2. 以下を追加（Production環境）:
   ```
   VITE_FIREBASE_API_KEY=***
   VITE_FIREBASE_AUTH_DOMAIN=***
   VITE_FIREBASE_PROJECT_ID=***
   VITE_FIREBASE_STORAGE_BUCKET=***
   VITE_FIREBASE_MESSAGING_SENDER_ID=***
   VITE_FIREBASE_APP_ID=***
   ```

**Preview (develop, feature/* ブランチ):**
- 同じ環境変数を **Preview** 環境にも追加
- または、開発用のFirebaseプロジェクトを別途作成して設定

#### Git 設定

1. Project Settings → Git
2. 以下を設定:
   - **Production Branch**: `main`
   - **Preview Deployments**: All branches (すべてのブランチ)
   - **Automatically expose System Environment Variables**: ON

---

### 4. GitHub Actions Secrets の設定

1. リポジトリページで **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** をクリック
3. 以下のシークレットを追加:

   **Firebase関連:**
   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   ```

   **Vercel関連（オプション - Vercel CLIデプロイを使う場合）:**
   ```
   VERCEL_TOKEN
   VERCEL_ORG_ID
   VERCEL_PROJECT_ID
   ```

---

### 5. Firebase Hosting の設定（オプション）

Preview Channelsを使用する場合:

1. `firebase.json` を作成:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

2. GitHub Actions に Firebase デプロイを追加:
```yaml
- uses: FirebaseExtended/action-hosting-deploy@v0
  with:
    repoToken: '${{ secrets.GITHUB_TOKEN }}'
    firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
    channelId: preview-${{ github.event.pull_request.number }}
    projectId: your-project-id
```

---

### 6. ローカル開発環境のセットアップ

```bash
# リポジトリのクローン
git clone git@github.com:YOUR_USERNAME/attendance-tracker.git
cd attendance-tracker

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.local にFirebaseの設定を記入

# 開発サーバー起動
npm run dev

# テスト実行
npm run test:unit

# ビルド
npm run build
```

---

## チーム開発のベストプラクティス

### Pull Request テンプレート

`.github/PULL_REQUEST_TEMPLATE.md` を作成:

```markdown
## 変更内容
<!-- 何を変更したか簡潔に説明 -->

## 変更の種類
- [ ] 新機能
- [ ] バグ修正
- [ ] ドキュメント更新
- [ ] リファクタリング
- [ ] テスト追加

## チェックリスト
- [ ] テストが通ることを確認
- [ ] 型チェックが通ることを確認
- [ ] コードレビューを依頼
- [ ] 関連するIssueをリンク

## スクリーンショット
<!-- UI変更がある場合 -->

## 関連Issue
Closes #(issue番号)
```

### コードレビューのガイドライン

1. **レビュー観点:**
   - 機能要件を満たしているか
   - テストが適切に書かれているか
   - セキュリティ上の問題がないか
   - パフォーマンスへの影響
   - コードの可読性・保守性

2. **レビュー時間:**
   - 小規模PR: 1営業日以内
   - 大規模PR: 2営業日以内

3. **承認ルール:**
   - main ← develop: 1人以上の承認必須
   - develop ← feature/*: レビュー推奨

---

## トラブルシューティング

### テストがCIで失敗する（ローカルでは成功）

**原因:** 環境変数が設定されていない

**解決策:**
1. GitHub Actions Secrets に必要な環境変数を追加
2. `.github/workflows/*.yml` で環境変数を正しく設定

### Vercel デプロイが失敗する

**原因:** ビルドエラー、または環境変数が不足

**解決策:**
1. Vercel Dashboard → Project → Deployments で詳細ログを確認
2. 環境変数が正しく設定されているか確認
3. `npm run build` がローカルで成功するか確認

### ブランチ保護でマージできない

**原因:** 必須のステータスチェックが完了していない

**解決策:**
1. PRページでどのチェックが失敗しているか確認
2. テストやビルドのエラーを修正
3. 必要に応じて `git pull origin main` でベースブランチと同期

---

## 定期メンテナンス

### 月次タスク
- [ ] 依存関係の更新確認 (`npm outdated`)
- [ ] セキュリティ脆弱性チェック (`npm audit`)
- [ ] 不要なブランチの削除

### リリース前チェックリスト
- [ ] すべてのテストが通る
- [ ] 型チェックエラーなし
- [ ] 本番環境でFirebase接続確認
- [ ] 主要機能の動作確認
- [ ] パフォーマンス確認

---

## 参考資料
- [ブランチ戦略詳細](.github/BRANCH_STRATEGY.md)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Vercel Documentation](https://vercel.com/docs)
