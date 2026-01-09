# ワークフロー図解

## 📊 ブランチとPRの全体像

```mermaid
gitGraph
    commit id: "Initial"
    branch develop
    checkout develop
    commit id: "Setup develop"

    branch feature/user-auth
    checkout feature/user-auth
    commit id: "Add login page"
    commit id: "Add auth logic"
    checkout develop
    merge feature/user-auth tag: "PR #1"

    branch feature/csv-export
    checkout feature/csv-export
    commit id: "Add CSV export"
    commit id: "Add tests"
    checkout develop
    merge feature/csv-export tag: "PR #2"

    checkout main
    merge develop tag: "Release v1.1.0"

    checkout develop
    branch fix/date-bug
    checkout fix/date-bug
    commit id: "Fix timezone"
    checkout develop
    merge fix/date-bug tag: "PR #3"

    checkout main
    branch hotfix/critical
    checkout hotfix/critical
    commit id: "Security fix"
    checkout main
    merge hotfix/critical tag: "Hotfix v1.1.1"
    checkout develop
    merge hotfix/critical
```

---

## 🔄 通常の開発フロー（Feature開発）

```mermaid
sequenceDiagram
    participant Dev as 開発者
    participant Feature as feature/xxx
    participant Develop as develop
    participant Main as main
    participant CI as GitHub Actions
    participant Vercel as Vercel Preview
    participant Pages as GitHub Pages

    Dev->>Feature: 1. ブランチ作成
    Dev->>Feature: 2. 開発・コミット
    Dev->>Feature: 3. プッシュ
    Feature->>CI: 4. テスト実行
    CI-->>Dev: テスト結果

    Dev->>Develop: 5. PR作成 (feature→develop)
    Develop->>CI: 6. 再テスト実行
    CI-->>Dev: テスト結果
    Develop->>Vercel: 7. Preview デプロイ
    Vercel-->>Dev: Preview URL

    Note over Dev,Develop: レビュー＆承認

    Dev->>Develop: 8. マージ
    Note over Feature: ブランチ削除
```

---

## 🚀 リリースフロー（develop → main）

```mermaid
sequenceDiagram
    participant Team as チーム
    participant Develop as develop
    participant Main as main
    participant CI as GitHub Actions
    participant Pages as GitHub Pages

    Team->>Develop: 1. リリース準備完了確認
    Team->>Main: 2. PR作成 (develop→main)

    Main->>CI: 3. テスト実行
    CI-->>Team: テスト結果

    Main->>CI: 4. 型チェック
    CI-->>Team: 型チェック結果

    Note over Team,Main: レビュー＆承認（必須）

    Team->>Main: 5. マージ
    Main->>CI: 6. ビルド実行
    CI->>Pages: 7. 本番デプロイ
    Pages-->>Team: デプロイ完了通知
```

---

## 🔥 緊急修正フロー（Hotfix）

```mermaid
sequenceDiagram
    participant Dev as 開発者
    participant Hotfix as hotfix/xxx
    participant Main as main
    participant Develop as develop
    participant CI as GitHub Actions
    participant Pages as GitHub Pages

    Note over Main: 本番で重大なバグ発見！

    Dev->>Main: 1. mainから分岐
    Dev->>Hotfix: 2. 緊急修正
    Dev->>Hotfix: 3. プッシュ

    Dev->>Main: 4. PR作成 (hotfix→main)
    Main->>CI: 5. テスト実行
    CI-->>Dev: テスト結果

    Note over Dev,Main: 緊急レビュー

    Dev->>Main: 6. マージ
    Main->>CI: 7. ビルド
    CI->>Pages: 8. 本番デプロイ

    Dev->>Develop: 9. PR作成 (hotfix→develop)
    Note over Develop: developにも反映
    Dev->>Develop: 10. マージ

    Note over Hotfix: ブランチ削除
```

---

## 📋 PRの作成パターン一覧

### パターン1: feature → develop

```
┌─────────────────────────────────────────────┐
│ Pull Request #10                            │
├─────────────────────────────────────────────┤
│ Title: feat: CSV出力機能の追加              │
│                                             │
│ Base: develop                               │
│ ←                                           │
│ Compare: feature/csv-export                 │
│                                             │
│ Labels: feature, needs-review               │
│ Reviewers: @teammate1, @teammate2           │
│                                             │
│ ✅ Tests passed                             │
│ ✅ Type check passed                        │
│ 🚀 Vercel Preview: preview-pr10.vercel.app │
└─────────────────────────────────────────────┘
```

### パターン2: develop → main（リリース）

```
┌─────────────────────────────────────────────┐
│ Pull Request #15                            │
├─────────────────────────────────────────────┤
│ Title: Release v1.2.0 - 新機能とバグ修正   │
│                                             │
│ Base: main                                  │
│ ←                                           │
│ Compare: develop                            │
│                                             │
│ Labels: release, needs-approval             │
│ Reviewers: @team-lead, @senior-dev          │
│ Assignees: @release-manager                 │
│                                             │
│ 📦 含まれる変更:                            │
│   - CSV出力機能 (#10)                       │
│   - 日付フィルター (#11)                     │
│   - タイムゾーンバグ修正 (#12)              │
│                                             │
│ ✅ Tests passed                             │
│ ✅ Type check passed                        │
│ ✅ Build successful                         │
│ ⚠️ Requires 1 approval                      │
└─────────────────────────────────────────────┘
```

### パターン3: hotfix → main + develop

```
┌─────────────────────────────────────────────┐
│ Pull Request #20 (main用)                   │
├─────────────────────────────────────────────┤
│ Title: hotfix: セキュリティ脆弱性の修正     │
│                                             │
│ Base: main                                  │
│ ←                                           │
│ Compare: hotfix/security-fix                │
│                                             │
│ Labels: hotfix, critical, security          │
│ Priority: 🔴 URGENT                         │
│ Reviewers: @team-lead                       │
│                                             │
│ ✅ Tests passed                             │
│ ✅ Security scan passed                     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Pull Request #21 (develop用)                │
├─────────────────────────────────────────────┤
│ Title: hotfix: セキュリティ脆弱性の修正     │
│ (mainへの修正を同期)                        │
│                                             │
│ Base: develop                               │
│ ←                                           │
│ Compare: hotfix/security-fix                │
│                                             │
│ ✅ Tests passed                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 ブランチの関係図

```
┌────────────────────────────────────────────────────┐
│                    ブランチ階層                    │
└────────────────────────────────────────────────────┘

main (本番)
  │
  ├─ デプロイ先: GitHub Pages
  ├─ 保護: 強（PR必須、レビュー必須、テスト必須）
  └─ マージ元: develop, hotfix/*

develop (開発)
  │
  ├─ デプロイ先: Vercel Preview
  ├─ 保護: 中（テスト必須）
  ├─ マージ元: feature/*, fix/*, hotfix/*
  │
  ├─ feature/user-authentication
  │   └─ 目的: 新機能開発
  │
  ├─ feature/csv-export
  │   └─ 目的: 新機能開発
  │
  ├─ fix/timezone-bug
  │   └─ 目的: バグ修正
  │
  └─ fix/ui-alignment
      └─ 目的: バグ修正

hotfix/* (緊急修正)
  │
  ├─ 起点: main
  ├─ マージ先: main + develop
  │
  └─ hotfix/critical-security
      └─ 目的: 本番の緊急修正
```

---

## 📅 週次の開発サイクル例

```mermaid
gantt
    title 開発スプリント（2週間サイクル）
    dateFormat  YYYY-MM-DD
    section Sprint 1
    機能A開発(feature/A)    :a1, 2024-01-01, 3d
    機能B開発(feature/B)    :a2, 2024-01-02, 4d
    バグ修正(fix/bug1)      :a3, 2024-01-03, 2d
    section Integration
    developでテスト         :a4, 2024-01-05, 2d
    section Release
    リリースレビュー        :a5, 2024-01-07, 1d
    本番デプロイ(main)      :milestone, a6, 2024-01-08, 0d
```

---

## 🔍 CI/CDパイプライン詳細

```mermaid
flowchart TB
    Start([コード プッシュ]) --> BranchCheck{どのブランチ?}

    BranchCheck -->|feature/*| FeaturePipeline
    BranchCheck -->|develop| DevelopPipeline
    BranchCheck -->|main| MainPipeline

    subgraph FeaturePipeline[Feature Pipeline]
        F1[コード チェックアウト] --> F2[依存関係 インストール]
        F2 --> F3[テスト 実行]
        F3 --> F4[型チェック]
        F4 --> F5{成功?}
        F5 -->|Yes| F6[✅ PR可能]
        F5 -->|No| F7[❌ 修正必要]
    end

    subgraph DevelopPipeline[Develop Pipeline]
        D1[コード チェックアウト] --> D2[依存関係 インストール]
        D2 --> D3[テスト 実行]
        D3 --> D4[型チェック]
        D4 --> D5[ビルド]
        D5 --> D6{PR?}
        D6 -->|Yes| D7[Vercel Preview]
        D6 -->|No| D8[スキップ]
        D7 --> D9[✅ 完了]
        D8 --> D9
    end

    subgraph MainPipeline[Main Pipeline]
        M1[コード チェックアウト] --> M2[依存関係 インストール]
        M2 --> M3[テスト 実行]
        M3 --> M4[型チェック]
        M4 --> M5[本番ビルド]
        M5 --> M6[GitHub Pages デプロイ]
        M6 --> M7[✅ 本番リリース完了]
    end
```

---

## 📊 ブランチ戦略の意思決定フロー

```mermaid
flowchart TD
    Start([タスク開始]) --> Q1{本番で<br/>バグ発見?}

    Q1 -->|Yes| Hotfix[hotfixブランチ作成<br/>from main]
    Q1 -->|No| Q2{新機能?}

    Q2 -->|Yes| Feature[featureブランチ作成<br/>from develop]
    Q2 -->|No| Q3{バグ修正?}

    Q3 -->|Yes| Fix[fixブランチ作成<br/>from develop]
    Q3 -->|No| Other[その他<br/>適切なブランチを選択]

    Feature --> DevWork[開発作業]
    Fix --> DevWork
    Other --> DevWork
    Hotfix --> HotfixWork[緊急修正作業]

    DevWork --> PR1[developへPR作成]
    HotfixWork --> PR2[mainへPR作成]

    PR1 --> Review1[レビュー]
    PR2 --> Review2[レビュー]

    Review1 --> Merge1[developへマージ]
    Review2 --> Merge2[mainへマージ]

    Merge1 --> Q4{リリース<br/>準備完了?}
    Merge2 --> Merge3[developへもマージ]

    Q4 -->|Yes| Release[mainへPR作成<br/>リリース]
    Q4 -->|No| Wait[次の機能を待つ]

    Release --> Deploy[本番デプロイ]
    Merge3 --> Deploy

    Deploy --> End([完了])
    Wait --> End
```

---

## 💡 チーム規模別の推奨運用

### 小規模チーム（1-3人）

```
main ──────●────────●──────> (本番)
           │        │
  feature/A●        │
                    │
         feature/B──●

推奨:
- developブランチは省略可
- feature/* から直接 main へPR
- こまめなリリース
```

### 中規模チーム（4-10人）

```
main ──────────────●──────> (本番)
                   │
                   │ PR (週1回)
                   │
develop ───●───●───●───●──> (開発)
           │   │   │
feature/A──●   │   │
          fix/B●   │
              feature/C●

推奨:
- developブランチ必須
- 週1回の定期リリース
- feature → develop → main
```

### 大規模チーム（10人以上）

```
main ───────────────●──────> (本番)
                    │
                    │ PR (2週間)
                    │
develop ────●───────●──────> (開発・統合)
            │
            │ PR (毎日)
            │
feature-team ●──────●──────> (チーム統合)
             │      │
  feature/A──●      │
      feature/B─────●

推奨:
- チーム別の統合ブランチ
- 2週間スプリント
- feature → feature-team → develop → main
```

---

## 📈 成功指標（KPI）

```
┌─────────────────────────────────────────┐
│ 健全な開発プロセスの指標                │
├─────────────────────────────────────────┤
│ ✅ PR作成から3時間以内に初回レビュー    │
│ ✅ PRのサイズは300行以下                │
│ ✅ PRのライフサイクルは2日以内          │
│ ✅ CI/CDパイプライン成功率 95%以上      │
│ ✅ mainブランチは常にデプロイ可能       │
│ ✅ 週に1回以上の本番リリース            │
│ ✅ hotfixの発生率は月1回以下            │
└─────────────────────────────────────────┘
```

---

## 🎓 まとめ

このワークフロー図解を参考に、チームの規模や開発速度に合わせてブランチ戦略を調整してください。

重要なポイント:
1. **小さく、頻繁にマージ** - コンフリクトを最小化
2. **自動化を最大限活用** - CI/CDで品質保証
3. **レビュー文化の醸成** - コードの品質向上
4. **ドキュメント化** - チーム全員が理解できる運用

詳細は以下のドキュメントを参照:
- [ブランチ戦略詳細](BRANCH_STRATEGY.md)
- [セットアップガイド](SETUP_GUIDE.md)
