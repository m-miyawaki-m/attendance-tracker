# `App.vue` 単体テスト仕様書

## 1. 概要

| 項目 | 内容 |
|:---|:---|
| 対象ファイル | `src/App.vue` |
| 関連設計書 | [基本設計書 1.2.2](../../design/03-basic/03-basic-design.md#122-共通レイアウト-mainlayoutvue) |
| 設計書記載 | ルートコンポーネント（レイアウト設定、認証状態監視） |

## 2. テストの目的

`App.vue`コンポーネントが、ルートの`meta.layout`設定と認証状態に応じて、適切なレイアウト設定を`MainLayout`に渡すことを保証する。また、Firebase認証リスナーの初期化が正しく行われることを確認する。

## 3. 使用するライブラリ

* **テストランナー**: Vitest
* **コンポーネントテスト**: Vue Test Utils
* **状態管理**: Pinia (テスト用にモック化)
* **ルーティング**: Vue Router (テスト用にモック化)

## 4. テストケース

### 4.1. 初期化

| テストNo. | テストケース | 概要 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 1-1 | 認証リスナー初期化 | コンポーネントがマウントされた時 | `authStore.initAuthListener`が1回呼び出される。 |

### 4.2. レイアウト設定 (`layoutConfig` computed)

ルートの`meta.layout`と`authStore.isAdmin`に応じて、`MainLayout`への`props`が正しく計算されることを確認する。

| テストNo. | テストケース | `route.meta.layout` | `authStore.isAdmin` | 期待する結果 |
| :--- | :--- | :--- | :--- | :--- |
| 2-1 | ログインページ | `'none'` | - | `layoutConfig`が`null`を返す。`MainLayout`が表示されない。 |
| 2-2 | 管理者ページ | `'admin'` | `true` | `{ showHeader: true, showSidebar: true, showFooter: false, showTabs: false }` |
| 2-3 | 一般ユーザーホーム | `'default'` | `false` | `{ showHeader: true, showSidebar: false, showFooter: false, showTabs: true }` |
| 2-4 | 管理者がデフォルトページ | `'default'` | `true` | `{ showHeader: true, showSidebar: true, showFooter: false, showTabs: false }` |
| 2-5 | その他のページ | `undefined` | `false` | `{ showHeader: true, showSidebar: false, showFooter: false, showTabs: false }` |

### 4.3. レンダリング

| テストNo. | テストケース | 条件 | 期待する結果 |
| :--- | :--- | :--- | :--- |
| 3-1 | MainLayoutあり | `layoutConfig`が`null`でない | `MainLayout`コンポーネントがレンダリングされる。`RouterView`がスロットとして渡される。 |
| 3-2 | MainLayoutなし | `layoutConfig`が`null` | `MainLayout`がレンダリングされず、直接`RouterView`がレンダリングされる。 |
| 3-3 | DevLogViewer表示 | 常に | `DevLogViewer`コンポーネントが常にレンダリングされる。 |
