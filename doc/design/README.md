# 設計ドキュメント

勤怠管理システムの設計に関するドキュメント一覧です。

## ディレクトリ構成

```
design/
├── 01-requirements/              # 要件定義
│   └── 01-requirements.md
├── 02-overview/                  # システム概要設計
│   └── 02-overview.md
├── 03-basic/                     # 基本設計
│   ├── 03-basic-design.md        # 基本設計書
│   ├── component-tree.md         # コンポーネントツリー
│   └── screen-transition/        # 画面遷移図
│       ├── flowchart.md
│       └── flowchart.puml
└── 04-detailed/                  # 詳細設計
    └── 04-detailed-design.md
```

## 01. 要件定義

| ドキュメント | 内容 |
|-------------|------|
| [01-requirements.md](./01-requirements/01-requirements.md) | システム目的、ユーザー種別、機能要件、非機能要件 |

## 02. システム概要設計

| ドキュメント | 内容 |
|-------------|------|
| [02-overview.md](./02-overview/02-overview.md) | 技術スタック、アーキテクチャ、データモデル、Firestore設計 |

## 03. 基本設計

| ドキュメント | 内容 |
|-------------|------|
| [03-basic-design.md](./03-basic/03-basic-design.md) | 画面設計、ルーティング、状態管理、UI/UX設計 |
| [component-tree.md](./03-basic/component-tree.md) | Vueコンポーネントの階層構造 |
| [screen-transition/](./03-basic/screen-transition/) | 画面遷移図（PlantUML） |

## 04. 詳細設計

| ドキュメント | 内容 |
|-------------|------|
| [04-detailed-design.md](./04-detailed/04-detailed-design.md) | ユーティリティ関数、計算ロジック、グラフ設定、セキュリティ、テスト |

## 関連ドキュメント

- [開発フロー](../development/DEVELOPMENT_FLOW.md)
- [Firebase Emulatorセットアップ](../development/FIREBASE_EMULATOR_SETUP.md)
- [テスト仕様](../testing/MainLayout-test-spec.md)
