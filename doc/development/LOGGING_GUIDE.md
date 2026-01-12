# 開発用ログ機能ガイド

## 概要

本アプリケーションには、開発・デバッグ用のログ機能が組み込まれています。
ログはLocalStorageに保存され、開発環境でのみ表示されるログビューアから確認・ダウンロードできます。

**対象環境**: 開発環境（`npm run dev`）のみ

## 機能

### 1. ログの記録
- 4つのログレベル: `debug`, `info`, `warn`, `error`
- タイムスタンプ付きで自動記録
- 任意のデータオブジェクトを添付可能
- LocalStorageに最大1000件まで保存

### 2. ログビューア（DevLogViewer）
- 画面右下に虫アイコンのボタンとして表示
- ログレベルでフィルタリング
- キーワード検索
- JSON/テキスト形式でダウンロード
- ログクリア機能

## 使い方

### ログの出力

```typescript
import { logger } from '@/utils/logger'

// 各レベルでログを出力
logger.debug('関数開始', { param1: 'value1' })
logger.info('処理完了', { count: 10 })
logger.warn('注意: データが空です', { userId: 'xxx' })
logger.error('エラー発生', { error: err })

// console.log の代わりに使用
logger.log('メッセージ')  // infoレベルとして記録
```

### 推奨ログパターン

```typescript
async function fetchData(): Promise<void> {
  logger.debug('fetchData() 開始')
  try {
    logger.info('データを取得中...', { endpoint: '/api/data' })
    const result = await api.getData()
    logger.info('データ取得完了', { count: result.length })
  } catch (error) {
    logger.error('データ取得エラー', { error })
  } finally {
    logger.debug('fetchData() 終了')
  }
}
```

### ログレベルの使い分け

| レベル | 用途 | 例 |
|--------|------|-----|
| `debug` | 関数の開始/終了、詳細なフロー追跡 | `fetchData() 開始`, `キャッシュ使用` |
| `info` | 重要な処理の実行・完了 | `ログイン成功`, `データ取得完了` |
| `warn` | 警告、想定外だが継続可能な状態 | `データが空`, `認証エラー` |
| `error` | エラー、例外 | `API呼び出し失敗`, `例外発生` |

## ログビューアの操作

### 起動
1. 開発サーバーを起動 (`npm run dev`)
2. 画面右下の虫アイコン（mdi-bug）をクリック

### フィルタリング
- ドロップダウンでログレベルを選択（全て/Debug/Info/Warn/Error）
- 検索ボックスでキーワード検索

### ダウンロード
- ダウンロードアイコンをクリック
- JSON形式またはテキスト形式を選択

### クリア
- ゴミ箱アイコンをクリック
- 確認ダイアログで「OK」を選択

## ファイル構成

```
src/
├── utils/
│   └── logger.ts           # ログユーティリティ本体
├── composables/
│   └── useLogger.ts        # Vue用Composable
└── components/
    └── dev/
        └── DevLogViewer.vue  # ログビューアUI
```

## 実装済みのログ出力箇所

### Stores
- `authFirebase.ts` - 認証関連（ログイン/ログアウト/ユーザーデータ取得）
- `attendanceFirebase.ts` - 勤怠関連（出勤/退勤/データ取得）
- `userStore.ts` - ユーザー一覧取得
- `adminAttendanceStore.ts` - 管理者向け勤怠データ取得

### Views
- `LoginView.vue` - ログイン処理
- `TeamView.vue` - チーム勤怠画面

## 制限事項

- **本番環境では無効**: `import.meta.env.DEV` が `false` の場合、ログビューアは表示されません
- **LocalStorage制限**: 最大4MBまで保存。超過時は古いログから自動削除
- **最大件数**: 1000件まで保存
- **デバッグログ**: コンソールへの出力は開発環境のみ（`console.debug`）

## トラブルシューティング

### ログが表示されない
1. 開発環境で実行していることを確認
2. ブラウザのLocalStorageが有効か確認
3. DevLogViewerのリフレッシュボタンをクリック

### ドロップダウンが選択できない
- v-selectのメニューがログ一覧の下に隠れている場合は、z-indexの設定を確認

### ログが多すぎる
- ログレベルフィルターで `info` または `error` のみを表示
- 検索機能で特定のキーワードを絞り込み
- クリアボタンで全削除

## API リファレンス

### logger オブジェクト

```typescript
// ログ出力
logger.debug(message: string, data?: unknown): void
logger.info(message: string, data?: unknown): void
logger.warn(message: string, data?: unknown): void
logger.error(message: string, data?: unknown): void
logger.log(message: string, data?: unknown): void  // infoのエイリアス

// ログ取得・操作（直接使用する場合）
import { getLogs, clearLogs, downloadLogsAsJson, downloadLogsAsText } from '@/utils/logger'

getLogs(): LogEntry[]           // 全ログ取得
clearLogs(): void               // ログクリア
downloadLogsAsJson(): void      // JSONダウンロード
downloadLogsAsText(): void      // テキストダウンロード
```

### useLogger Composable

```typescript
import { useLogger } from '@/composables/useLogger'

const {
  logs,              // ref<LogEntry[]> - リアクティブなログ配列
  logCount,          // computed - ログ件数
  logSizeFormatted,  // computed - サイズ（人間可読形式）
  refreshLogs,       // function - ログ再読み込み
  clear,             // function - クリア
  downloadJson,      // function - JSONダウンロード
  downloadText,      // function - テキストダウンロード
  logger,            // logger インスタンス
} = useLogger()
```

## 今後の拡張予定

- [ ] ログのリモート送信機能
- [ ] ログレベルの動的切り替え
- [ ] セッション間でのログ継続
- [ ] エクスポート形式の追加（CSV等）
