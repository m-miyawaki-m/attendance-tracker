# Phase1 テスト実装チェックリスト

## 概要

Phase1で実装するテストのチェックリスト。テスト仕様書とPHASE1_ROADMAPを統合し、実装状況を追跡する。

---

## 1. authFirebase.ts ✅ 実装完了

**ファイル**: `tests/unit/stores/authFirebase.spec.ts`

### 1.1. State初期値
- [x] AF-001: user初期値がnull
- [x] AF-002: firebaseUser初期値がnull、isAuthenticated初期値がfalse、loading初期値がtrue

### 1.2. Getters
- [x] AF-002: isAdmin（未ログイン時false）
- [x] AF-002: userName（未ログイン時空文字）
- [x] AF-002: userEmail（未ログイン時空文字）
- [x] AF-002: userId（未ログイン時空文字）

### 1.3. login アクション
- [x] AF-003: メール/パスワードでログイン成功
- [x] AF-004: ログイン失敗（無効なメール）
- [x] AF-005: ログイン失敗（無効なパスワード）
- [x] AF-006: ログイン後のユーザー情報取得

### 1.4. logout アクション
- [x] AF-007: ログアウト成功
- [x] AF-008: ログアウト後のクリーンアップ

### 1.5. 認証状態監視
- [x] AF-009: ログイン検知（onAuthStateChanged）
- [x] AF-010: ログアウト検知（onAuthStateChanged with null）
- [x] AF-011: 認証状態変更時にユーザーデータ取得

### 1.6. ユーザー情報
- [x] AF-012: ユーザー名取得
- [x] AF-013: メールアドレス取得
- [x] AF-014: UID取得
- [x] AF-015: ロール取得

### 1.7. 管理者権限
- [x] AF-016: 管理者判定（true）
- [x] AF-017: 管理者判定（false）

### 1.8. エッジケース（追加実装）
- [x] ユーザードキュメントが存在しない場合
- [x] Firestoreからのデータ取得エラー
- [x] ログアウト時のエラーハンドリング
- [x] checkAuth関数は互換性のために存在

---

## 2. attendanceFirebase.ts ✅ 実装完了

**ファイル**: `tests/unit/stores/attendanceFirebase.spec.ts`

### 2.1. State初期値
- [x] ATF-001: attendances初期値が空配列
- [x] ATF-001: attendancesByUser初期値が空Map
- [x] ATF-001: todayAttendance初期値がnull
- [x] ATF-002: loading初期値がfalse

### 2.2. clockIn アクション（出勤打刻）
- [x] ATF-003: 出勤打刻成功（userId, 位置情報）
- [x] ATF-004: 出勤時刻記録（checkInに現在時刻）
- [x] ATF-005: 位置情報記録（checkInLocationに保存）
- [x] ATF-006: ステータス設定（9:00前出勤→status=present）
- [x] ATF-007: 遅刻判定（9:00以降出勤→status=late）
- [x] 2-3: 出勤打刻失敗（既に打刻済み）
- [x] 2-4: Firestoreエラー時のエラーハンドリング
- [x] 2-5: loading状態の変化
- [x] 2-6: 保存データ検証（全フィールド）

### 2.3. clockOut アクション（退勤打刻）
- [x] ATF-008: 退勤打刻成功（checkOut追加）
- [x] ATF-009: 勤務時間計算（workingMinutes）
- [x] ATF-010: 早退判定（18:00前退勤→status=early_leave）
- [x] ATF-011: 退勤位置情報記録
- [x] 3-3: 遅刻維持（出勤時late、18:00前退勤）
- [x] 3-4: 退勤打刻失敗（未出勤）
- [x] 3-5: 退勤打刻失敗（既に退勤済み）
- [x] 3-7: todayAttendance更新

### 2.4. getTodayAttendance アクション
- [x] ATF-012: 本日の勤怠取得（該当レコード返却）
- [x] ATF-014: 存在しない勤怠（null返却）
- [x] 4-3: Firestoreエラー時のハンドリング
- [x] 4-4: クエリ条件（userId + date）
- [x] 4-5: Timestamp変換

### 2.5. fetchMonthlyAttendances アクション
- [x] ATF-013: 月次勤怠取得（当月のレコード一覧）
- [x] 5-2: 日付範囲計算
- [x] 5-3: ソート順（checkIn降順）
- [x] 5-4: Firestoreエラー

### 2.6. fetchAttendancesByDateRange アクション
- [x] 6-1: 日付範囲取得成功
- [x] 6-2: checkInフィールドなしのレコードスキップ
- [x] 6-3: クライアント側フィルタリング
- [x] 6-4: ソート順（date降順）

### 2.7. getAttendancesByUserFromCache アクション
- [x] 7-1: キャッシュあり
- [x] 7-2: キャッシュなし

### 2.8. getAttendancesByDateRange アクション
- [x] 8-1: キャッシュから取得
- [x] 8-2: キャッシュなし時は空配列

### 2.9. clearCache アクション
- [x] 9-1: 特定ユーザーのキャッシュクリア
- [x] 9-2: 全キャッシュクリア

### 2.10. loadTodayAttendance アクション
- [x] 10-1: 本日の勤怠読み込み

### 2.11. Getters
- [x] 11-1: cachedUserIds
- [x] 11-2: totalCachedRecords

### 2.12. エラーハンドリング（ROADMAP追加）
- [x] ATF-018: Firestore接続エラー
- [x] ATF-019: 権限エラー
- [x] ATF-020: バリデーションエラー

### 2.13. リアルタイム更新（ROADMAP追加）
- [x] ATF-021: データ追加検知
- [x] ATF-022: データ更新検知
- [x] ATF-023: サブスクリプション解除

---

## 3. HomeView.vue ✅ 実装完了

**ファイル**: `tests/unit/views/HomeView.spec.ts`

### 3.1. 初期表示・時刻表示
- [x] HV-001: 画面タイトル「打刻」表示
- [x] HV-002: 現在時刻がHH:mm:ss形式で表示
- [x] HV-003: 日付表示（YYYY年MM月DD日 曜日）
- [x] 1-3: 時刻自動更新（1秒ごと）
- [x] 1-4: 初期打刻状態読み込み（loadAttendanceState）

### 3.2. 出勤打刻（handleCheckIn）
- [x] HV-005: 出勤ボタン表示（未出勤時有効）
- [x] HV-006: 出勤打刻成功
- [x] HV-007: 出勤後ボタン無効化
- [x] HV-008: 出勤時刻表示
- [x] 2-2: 出勤打刻成功（位置情報失敗時）
- [x] 2-3: 出勤打刻失敗
- [x] 2-4: ユーザー未ログイン時

### 3.3. 退勤打刻（handleCheckOut）
- [x] HV-009: 退勤ボタン表示（出勤済み時有効）
- [x] HV-010: 退勤打刻成功
- [x] HV-011: 退勤後ボタン無効化
- [x] HV-012: 勤務時間表示
- [x] 3-2: 退勤打刻失敗
- [x] 3-3: 未出勤時は退勤ボタン非活性

### 3.4. 勤務状態表示（currentStatus）
- [x] 4-1: 未出勤時の表示
- [x] 4-2: 正常出勤の表示
- [x] 4-3: 遅刻の表示
- [x] 4-4: 早退の表示

### 3.5. 勤務時間計算（workingHours）
- [x] 5-1: 未出勤時（'-'表示）
- [x] 5-2: 勤務中（経過時間表示）
- [x] 5-3: 退勤済み（勤務時間表示）

### 3.6. 位置情報取得（getCurrentLocation）
- [x] HV-013: 位置情報取得成功
- [x] HV-014: 位置情報取得失敗
- [x] 6-2: 位置情報未サポート
- [x] 6-3: 権限拒否
- [x] 6-4: 位置情報利用不可
- [x] 6-5: タイムアウト

### 3.7. 住所変換（getAddressFromCoords）
- [x] 7-1: 住所取得成功
- [x] 7-2: 住所取得失敗

### 3.8. ライフサイクル
- [x] 8-1: マウント時の処理
- [x] 8-2: アンマウント時のタイマークリア

### 3.9. ローディング状態
- [x] HV-015: APIエラー時の表示
- [x] HV-016: ローディング状態表示
- [x] 9-2: ボタン非活性化

---

## 4. DashboardView.vue ✅ 実装完了

**ファイル**: `tests/unit/views/admin/DashboardView.spec.ts`

### 4.1. アクセス制御（ROADMAP追加）
- [x] DV-001: 管理者アクセス許可
- [x] DV-002: 一般ユーザーリダイレクト

### 4.2. 初期データ取得
- [x] 1-1: ユーザーデータ取得
- [x] 1-2: 勤怠データ取得（過去30日分）
- [x] DV-011: ローディング表示
- [x] DV-012: データ取得成功
- [x] DV-013: データ取得失敗

### 4.3. サマリー計算（summary computed）
- [x] DV-003: 出勤率表示（従業員数）
- [x] DV-004: 平均勤務時間表示（本日出勤中）
- [x] DV-005: 遅刻者数表示（遅刻・早退数）
- [x] DV-006: 早退者数表示（今月総勤務時間）

### 4.4. グラフデータ計算

#### 4.4.1. 月次出勤率推移
- [x] DV-007: 月次出勤率グラフ
- [x] 3-1-1: カテゴリ（過去6ヶ月の月名）
- [x] 3-1-2: 出勤率計算
- [x] 3-1-3: データなし時は0

#### 4.4.2. 部署別平均勤務時間
- [x] DV-008: 部署別勤務時間グラフ
- [x] 3-2-1: 部署ごとの集計
- [x] 3-2-2: 小数点処理

#### 4.4.3. 遅刻・早退の推移
- [x] DV-009: 遅刻・早退推移グラフ
- [x] 3-3-1: カテゴリ（過去7日間）
- [x] 3-3-2: 遅刻件数
- [x] 3-3-3: 早退件数

#### 4.4.4. 当日の出勤状況
- [x] DV-010: 当日出勤状況グラフ
- [x] 3-4-1: 出勤数
- [x] 3-4-2: 欠勤数

### 4.5. グラフオプション
- [x] 4-1: 出勤率グラフオプション（line, 0-100, 緑）
- [x] 4-2: 勤務時間グラフオプション（bar, dataLabels, 青）
- [x] 4-3: 遅刻早退グラフオプション（line, 2系列）
- [x] 4-4: 出勤状況グラフオプション（donut）

### 4.6. 表示
- [x] 5-1: タイトル「管理者ダッシュボード」
- [x] 5-2: サマリーカード（4つ）
- [x] 5-3: グラフ（4つ）

---

## 実装進捗サマリー

| 対象ファイル | 総テスト数 | 実装済み | 未実装 | 進捗率 |
|:---|:---:|:---:|:---:|:---:|
| authFirebase.ts | 21 | 21 | 0 | 100% |
| attendanceFirebase.ts | 37 | 37 | 0 | 100% |
| HomeView.vue | 22 | 22 | 0 | 100% |
| DashboardView.vue | 36 | 36 | 0 | 100% |
| **合計** | **116** | **116** | **0** | **100%** |

---

## 実装順序（推奨）

1. ✅ **authFirebase.ts** - 認証ストア（実装完了）
2. ✅ **attendanceFirebase.ts** - 打刻機能の中核ストア（実装完了）
3. ✅ **HomeView.vue** - ストアを使用するUIテスト（実装完了）
4. ✅ **DashboardView.vue** - 管理者向けUIテスト（実装完了）

---

## 関連Issue

- [x] #17 - [Phase1] authFirebase.ts 単体テスト実装 ✅ 完了
- [x] #18 - [Phase1] attendanceFirebase.ts 単体テスト実装 ✅ 完了
- [x] #19 - [Phase1] HomeView.vue 単体テスト実装 ✅ 完了
- [x] #20 - [Phase1] DashboardView.vue 単体テスト実装 ✅ 完了

---

## モック要件まとめ

### attendanceFirebase.ts
- Firebase Firestore（collection, doc, addDoc, updateDoc, getDocs, query, where, orderBy）
- Timestamp

### HomeView.vue
- useAttendanceFirebaseStore
- useAuthFirebaseStore
- Geolocation API
- vi.useFakeTimers（時刻操作）

### DashboardView.vue
- Firebase Firestore（collection, getDocs, query, where）
- ApexCharts（スタブ化）
