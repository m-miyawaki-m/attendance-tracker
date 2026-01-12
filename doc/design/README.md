# 設計ドキュメント

勤怠管理システムの設計に関するドキュメント一覧です。

## ディレクトリ構成

```
design/
├── specifications/           # 設計書
│   ├── 01-requirements.md    # 要件定義書
│   ├── 02-overview.md        # システム概要設計書
│   ├── 03-basic-design.md    # 基本設計書
│   └── 04-detailed-design.md # 詳細設計書
└── diagrams/                 # 図表・ビジュアル資料
    ├── component-tree.md     # コンポーネントツリー
    └── screen-transition/    # 画面遷移図
        ├── flowchart.md
        └── flowchart.puml
```

## 設計書 (specifications/)

| ドキュメント | 内容 |
|-------------|------|
| [01-requirements.md](./specifications/01-requirements.md) | システム目的、ユーザー種別、機能要件、非機能要件 |
| [02-overview.md](./specifications/02-overview.md) | 技術スタック、アーキテクチャ、データモデル、Firestore設計 |
| [03-basic-design.md](./specifications/03-basic-design.md) | 画面設計、ルーティング、状態管理、UI/UX設計 |
| [04-detailed-design.md](./specifications/04-detailed-design.md) | ユーティリティ関数、計算ロジック、グラフ設定、セキュリティ、テスト |

## 図表 (diagrams/)

| ドキュメント | 内容 |
|-------------|------|
| [component-tree.md](./diagrams/component-tree.md) | Vueコンポーネントの階層構造 |
| [screen-transition/](./diagrams/screen-transition/) | 画面遷移図（PlantUML） |

## 関連ドキュメント

- [開発フロー](../development/DEVELOPMENT_FLOW.md)
- [Firebase Emulatorセットアップ](../development/FIREBASE_EMULATOR_SETUP.md)
- [テスト仕様](../testing/MainLayout-test-spec.md)
