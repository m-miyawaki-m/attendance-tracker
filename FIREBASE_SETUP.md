# Firebase連携セットアップガイド

このドキュメントでは、attendance-trackerプロジェクトにFirebaseバックエンドを統合する手順を説明します。

## 📋 目次

1. [前提条件](#前提条件)
2. [Firebaseプロジェクトのセットアップ](#firebaseプロジェクトのセットアップ)
3. [ローカル環境の設定](#ローカル環境の設定)
4. [Vercel環境変数の設定](#vercel環境変数の設定)
5. [Firestoreセキュリティルールの設定](#firestoreセキュリティルールの設定)
6. [初期データの投入](#初期データの投入)
7. [実装の切り替え](#実装の切り替え)
8. [動作確認](#動作確認)

---

## 前提条件

- Node.js 20.19.0以上または22.12.0以上がインストールされていること
- Googleアカウントを持っていること
- Firebase CLIがインストールされていること（インストール方法は下記参照）

### Firebase CLIのインストール

Firebase CLIはプロジェクトのdevDependenciesとして既にインストール済みです。以下のコマンドでFirebase CLIを使用できます:

```bash
# Firebase CLIコマンドの実行
npm run firebase -- [コマンド]

# または直接npxで実行
npx firebase [コマンド]
```

---

## Firebaseプロジェクトのセットアップ

### 1. Firebase Consoleでプロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `attendance-tracker`）
4. Google Analyticsの設定（任意）
5. プロジェクト作成完了

### 2. Webアプリの追加

1. Firebase Consoleで作成したプロジェクトを開く
2. プロジェクト概要画面で「Webアプリを追加」アイコン（`</>`）をクリック
3. アプリのニックネームを入力（例: `attendance-tracker-web`）
4. Firebase Hostingは不要（Vercelを使用するため）
5. 「アプリを登録」をクリック
6. **表示される構成情報をメモ**（後で使用します）

```javascript
// メモする情報（例）
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 3. Firebase Authenticationの有効化

1. Firebase Consoleの左メニューから「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブを選択
4. 「メール/パスワード」を選択
5. 「有効にする」をオンにして「保存」

### 4. Cloud Firestoreの作成

1. Firebase Consoleの左メニューから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. **本番モード**で開始（セキュリティルールは後で設定）
4. ロケーションを選択（例: `asia-northeast1` 東京）
5. 「有効にする」をクリック

---

## ローカル環境の設定

### 1. 環境変数ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成します:

```bash
cp .env.example .env.local
```

### 2. 環境変数の設定

`.env.local` ファイルを開き、Firebase Consoleから取得した値を設定します:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## Vercel環境変数の設定

### Vercelダッシュボードでの設定

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択
3. 「Settings」タブを選択
4. 左メニューから「Environment Variables」を選択
5. 以下の環境変数を追加:

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | Production, Preview, Development |
| `VITE_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com | Production, Preview, Development |
| `VITE_FIREBASE_PROJECT_ID` | your-project-id | Production, Preview, Development |
| `VITE_FIREBASE_STORAGE_BUCKET` | your-project.appspot.com | Production, Preview, Development |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | your-sender-id | Production, Preview, Development |
| `VITE_FIREBASE_APP_ID` | your-app-id | Production, Preview, Development |

6. 「Save」をクリック

---

## Firestoreセキュリティルールの設定

### 1. Firebase CLIでログイン

```bash
npm run firebase:login
```

### 2. Firebaseプロジェクトを初期化

```bash
npm run firebase:init
```

以下の質問に答えます:
- **Use an existing project**: 作成したプロジェクトを選択
- **Firestore Rules**: `firestore.rules`（既存ファイルを使用）
- **Firestore indexes**: `firestore.indexes.json`（デフォルト）
- **Overwrite files**: No（既存のルールファイルを保持）

### 3. セキュリティルールをデプロイ

```bash
npm run firebase:deploy
```

### セキュリティルールの内容

`firestore.rules` ファイルには以下のルールが定義されています:

- **users**: 認証済みユーザーは読み取り可能、管理者のみ作成・削除可能
- **attendances**: 自分の記録または管理者が読み取り・更新可能
- **locations**: 認証済みユーザーは読み取り可能、管理者のみ書き込み可能
- **editLogs**: 認証済みユーザーは読み取り可能、管理者のみ作成可能

---

## 初期データの投入

### 1. テストユーザーの作成

Firebase Consoleから手動でユーザーを作成:

1. Firebase Console > Authentication > Users
2. 「ユーザーを追加」をクリック
3. メールアドレスとパスワードを入力
4. 作成されたユーザーのUIDをメモ

### 2. Firestoreにユーザーデータを追加

Firebase Console > Firestore Database > データを追加:

**コレクション**: `users`
**ドキュメントID**: 作成したユーザーのUID

```json
{
  "name": "山田太郎",
  "email": "yamada@example.com",
  "role": "employee",
  "department": "営業部",
  "position": "営業担当",
  "employeeNumber": "EMP001",
  "managerId": null,
  "createdAt": [現在のタイムスタンプ],
  "updatedAt": [現在のタイムスタンプ]
}
```

### 3. 管理者ユーザーの作成

同様に管理者ユーザーを作成:

**Authentication**:
- Email: `admin@example.com`
- Password: 任意の安全なパスワード

**Firestore** (`users` コレクション):
```json
{
  "name": "管理者権限",
  "email": "admin@example.com",
  "role": "admin",
  "department": "管理部",
  "position": "管理者",
  "employeeNumber": "ADM001",
  "managerId": null,
  "createdAt": [現在のタイムスタンプ],
  "updatedAt": [現在のタイムスタンプ]
}
```

### 4. Firestoreインデックスの作成

勤怠データの検索を高速化するため、以下のインデックスを作成します:

Firebase Console > Firestore Database > インデックス > 複合インデックスを作成:

1. **コレクション**: `attendances`
2. **フィールド**:
   - `userId` (昇順)
   - `checkIn` (降順)
3. **クエリスコープ**: コレクション

または、アプリ使用時にエラーログに表示されるリンクからインデックスを作成できます。

---

## 実装の切り替え

### モック実装からFirebase実装への切り替え

Firebase実装を使用するには、以下のファイルを更新します:

#### 1. `src/stores/index.ts` の更新（推奨）

既存のストアのインポートをFirebase版に切り替えます:

```typescript
// モック実装
export { useAuthStore } from './auth'

// Firebase実装に切り替え
export { useAuthFirebaseStore as useAuthStore } from './authFirebase'
export { useAttendanceFirebaseStore as useAttendanceStore } from './attendanceFirebase'
```

#### 2. または、各コンポーネントで直接インポート

```typescript
// Before (モック)
import { useAuthStore } from '@/stores/auth'

// After (Firebase)
import { useAuthFirebaseStore as useAuthStore } from '@/stores/authFirebase'
```

#### 3. `src/App.vue` の更新

Firebase Authの初期化リスナーを追加:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthFirebaseStore } from '@/stores/authFirebase'

const authStore = useAuthFirebaseStore()

onMounted(() => {
  authStore.initAuthListener()
})
</script>
```

#### 4. `src/views/HomeView.vue` の更新

勤怠打刻機能をFirebase版に更新する必要があります。詳細は別途実装が必要です。

---

## 動作確認

### 1. ローカル環境での確認

```bash
npm run dev
```

1. ブラウザで `http://localhost:5173` にアクセス
2. 作成したテストユーザーでログイン
3. 出勤打刻を実行
4. Firebase Console > Firestore Database で `attendances` コレクションにデータが追加されることを確認

### 2. Vercelデプロイ後の確認

```bash
git add .
git commit -m "Add Firebase integration"
git push
```

1. Vercelで自動デプロイが完了するまで待つ
2. デプロイされたURLにアクセス
3. ログイン、打刻機能が正常に動作することを確認

---

## トラブルシューティング

### 環境変数が読み込まれない

- `.env.local` ファイルがプロジェクトルートにあることを確認
- 開発サーバーを再起動（`npm run dev`）
- Vercelの場合、環境変数を保存後にデプロイを実行

### Firestoreの権限エラー

- セキュリティルールが正しくデプロイされているか確認
- ユーザーがFirebase Authenticationで認証されているか確認
- ブラウザのコンソールでエラーメッセージを確認

### Firebase初期化エラー

- Firebase設定値が正しいか確認
- プロジェクトIDが一致しているか確認
- ネットワーク接続を確認

---

## 次のステップ

- [ ] すべてのコンポーネントをFirebase実装に移行
- [ ] 管理者画面のFirebase対応
- [ ] リアルタイム更新機能の実装（`onSnapshot`）
- [ ] オフライン対応の検討
- [ ] パフォーマンス最適化

---

## 参考リンク

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)