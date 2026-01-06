# Vuetify モック セットアップガイド（TypeScript版）

## 前提条件
- Node.js v18以上がインストール済み
- WSL2 (Ubuntu) が起動している
- VSCode がインストール済み

## ステップ1: プロジェクト作成

```bash
# ホームディレクトリに移動
cd ~

# Vueプロジェクト作成
npm create vue@latest attendance-tracker

# プロンプトへの回答（TypeScript対応）
# ✔ Add TypeScript? … Yes ← TypeScript有効化
# ✔ Add JSX Support? … No
# ✔ Add Vue Router? … Yes
# ✔ Add Pinia? … Yes
# ✔ Add Vitest for Unit Testing? … Yes ← テスト有効化
# ✔ Add an End-to-End Testing Solution? … No
# ✔ Add ESLint for code quality? … Yes
# ✔ Add Prettier for code formatting? … Yes

# プロジェクトディレクトリに移動
cd attendance-tracker

# 依存関係インストール
npm install
```

## ステップ2: Vuetify & ApexChartsインストール

```bash
# Vuetify 3
npm install vuetify@next

# Material Design Icons
npm install @mdi/font

# ApexCharts
npm install apexcharts vue3-apexcharts

# TypeScript型定義
npm install --save-dev @types/node

# テストライブラリ
npm install --save-dev @vue/test-utils @vitest/ui jsdom
```

## ステップ3: TypeScript設定

### 3-1. tsconfig.json の更新

プロジェクトルートの `tsconfig.json` に以下を追加：

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@vue/test-utils"]
  }
}
```

### 3-2. vite.config.ts の更新

```typescript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
```

## ステップ4: ディレクトリ構造

```
attendance-tracker/
├── src/
│   ├── assets/
│   ├── components/
│   ├── data/
│   │   └── mockData.ts
│   ├── plugins/
│   │   └── vuetify.ts
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   │   └── auth.ts
│   ├── types/
│   │   └── index.ts
│   ├── views/
│   │   ├── LoginView.vue
│   │   ├── HomeView.vue
│   │   ├── AttendanceListView.vue
│   │   └── admin/
│   │       ├── DashboardView.vue
│   │       ├── EmployeeListView.vue
│   │       ├── AttendanceEditView.vue
│   │       └── TeamView.vue
│   ├── App.vue
│   └── main.ts
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   └── views/
│   │       ├── LoginView.spec.ts
│   │       └── HomeView.spec.ts
│   └── setup.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## ステップ5: 型定義ファイル

### src/types/index.ts

このファイルでアプリケーション全体の型を定義します。

## ステップ6: テスト実行

```bash
# ユニットテスト実行
npm run test:unit

# テストをウォッチモードで実行
npm run test:unit -- --watch

# カバレッジ付きで実行
npm run test:unit -- --coverage

# テストUIを表示
npm run test:unit -- --ui
```

## ステップ7: 開発サーバー起動

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# Lint
npm run lint

# フォーマット
npm run format
```

## ステップ8: ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

## ログイン情報（モック）

### 一般従業員アカウント
- メール: yamada@example.com
- パスワード: password

### 管理者アカウント
- メール: admin@example.com
- パスワード: password

## 利用可能なnpmスクリプト

```bash
npm run dev              # 開発サーバー起動
npm run build            # プロダクションビルド
npm run preview          # ビルド結果プレビュー
npm run test:unit        # ユニットテスト実行
npm run type-check       # TypeScript型チェック
npm run lint             # ESLint実行
npm run format           # Prettier実行
```

## トラブルシューティング

### TypeScriptエラー: Cannot find module
```bash
npm install --save-dev @types/node
```

### Vitestエラー
```bash
npm install --save-dev @vue/test-utils @vitest/ui jsdom
```

### ビルドエラー
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

## VSCode拡張機能推奨

以下の拡張機能をインストールすることを推奨します：

1. **Volar** - Vue 3とTypeScriptのサポート
2. **ESLint** - コード品質チェック
3. **Prettier** - コードフォーマット
4. **Vitest** - テスト実行とデバッグ
5. **Vuetify Snippets** - Vuetifyコンポーネントのスニペット

## 次のステップ

1. ✅ TypeScript型定義の追加
2. ✅ Vitestによるテスト作成
3. 🔲 Firebaseとの統合
4. 🔲 E2Eテストの追加（Playwright/Cypress）
5. 🔲 CIパイプライン設定（GitHub Actions）

## 参考資料

- [Vue 3 + TypeScript公式ガイド](https://vuejs.org/guide/typescript/overview.html)
- [Vuetify公式ドキュメント](https://vuetifyjs.com/)
- [Vitest公式ドキュメント](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
