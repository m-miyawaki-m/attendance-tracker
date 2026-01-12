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
- [x] AF-003: isAdmin（未ログイン時false）
- [x] AF-004: userName（未ログイン時空文字）
- [x] AF-005: userEmail（未ログイン時空文字）
- [x] AF-006: userId（未ログイン時空文字）

### 1.3. login アクション
- [x] AF-007: メール/パスワードでログイン成功
- [x] AF-008: ログイン失敗（無効なメール）
- [x] AF-009: ログイン失敗（無効なパスワード）
- [x] AF-010: ログイン後のユーザー情報取得

### 1.4. logout アクション
- [x] AF-011: ログアウト成功
- [x] AF-012: ログアウト後のクリーンアップ

### 1.5. 認証状態監視
- [x] AF-013: ログイン検知（onAuthStateChanged）
- [x] AF-014: ログアウト検知（onAuthStateChanged with null）
- [x] AF-015: 認証状態変更時にユーザーデータ取得

### 1.6. ユーザー情報
- [x] AF-016: ユーザー名取得
- [x] AF-017: メールアドレス取得
- [x] AF-018: UID取得
- [x] AF-019: ロール取得

### 1.7. 管理者権限
- [x] AF-020: 管理者判定（true）
- [x] AF-021: 管理者判定（false）

### 1.8. エッジケース
- [x] AF-022: ユーザードキュメントが存在しない場合
- [x] AF-023: Firestoreからのデータ取得エラー
- [x] AF-024: ログアウト時のエラーハンドリング
- [x] AF-025: checkAuth関数は互換性のために存在

---

## 2. attendanceFirebase.ts ✅ 実装完了

**ファイル**: `tests/unit/stores/attendanceFirebase.spec.ts`

### 2.1. State初期値
- [x] ATF-001: attendances初期値が空配列
- [x] ATF-002: attendancesByUser初期値が空Map
- [x] ATF-003: todayAttendance初期値がnull
- [x] ATF-004: loading初期値がfalse

### 2.2. clockIn アクション（出勤打刻）
- [x] ATF-005: 出勤打刻成功（userId, 位置情報）
- [x] ATF-006: 出勤時刻記録（checkInに現在時刻）
- [x] ATF-007: 位置情報記録（checkInLocationに保存）
- [x] ATF-008: ステータス設定（9:00前出勤→status=present）
- [x] ATF-009: 遅刻判定（9:00以降出勤→status=late）
- [x] ATF-010: 出勤打刻失敗（既に打刻済み）
- [x] ATF-011: Firestoreエラー時のエラーハンドリング
- [x] ATF-012: loading状態の変化
- [x] ATF-013: 保存データ検証（全フィールド）

### 2.3. clockOut アクション（退勤打刻）
- [x] ATF-014: 退勤打刻成功（checkOut追加）
- [x] ATF-015: 勤務時間計算（workingMinutes）
- [x] ATF-016: 早退判定（18:00前退勤→status=early_leave）
- [x] ATF-017: 退勤位置情報記録
- [x] ATF-018: 遅刻維持（出勤時late、18:00前退勤）
- [x] ATF-019: 退勤打刻失敗（未出勤）
- [x] ATF-020: 退勤打刻失敗（既に退勤済み）
- [x] ATF-021: todayAttendance更新

### 2.4. getTodayAttendance アクション
- [x] ATF-022: 本日の勤怠取得（該当レコード返却）
- [x] ATF-023: 存在しない勤怠（null返却）
- [x] ATF-024: Firestoreエラー時のハンドリング
- [x] ATF-025: クエリ条件（userId + date）
- [x] ATF-026: Timestamp変換

### 2.5. fetchMonthlyAttendances アクション
- [x] ATF-027: 月次勤怠取得（当月のレコード一覧）
- [x] ATF-028: 日付範囲計算
- [x] ATF-029: ソート順（checkIn降順）
- [x] ATF-030: Firestoreエラー

### 2.6. fetchAttendancesByDateRange アクション
- [x] ATF-031: 日付範囲取得成功
- [x] ATF-032: checkInフィールドなしのレコードスキップ
- [x] ATF-033: クライアント側フィルタリング
- [x] ATF-034: ソート順（date降順）

### 2.7. getAttendancesByUserFromCache アクション
- [x] ATF-035: キャッシュあり
- [x] ATF-036: キャッシュなし

### 2.8. getAttendancesByDateRange アクション
- [x] ATF-037: キャッシュから取得
- [x] ATF-038: キャッシュなし時は空配列

### 2.9. clearCache アクション
- [x] ATF-039: 特定ユーザーのキャッシュクリア
- [x] ATF-040: 全キャッシュクリア

### 2.10. loadTodayAttendance アクション
- [x] ATF-041: 本日の勤怠読み込み

### 2.11. Getters
- [x] ATF-042: cachedUserIds
- [x] ATF-043: totalCachedRecords

### 2.12. エラーハンドリング
- [x] ATF-044: Firestore接続エラー
- [x] ATF-045: 権限エラー
- [x] ATF-046: バリデーションエラー

### 2.13. リアルタイム更新
- [x] ATF-047: データ追加検知
- [x] ATF-048: データ更新検知
- [x] ATF-049: サブスクリプション解除

---

## 3. HomeView.vue ✅ 実装完了

**ファイル**: `tests/unit/views/HomeView.spec.ts`

### 3.1. 初期表示・時刻表示
- [x] HV-001: 画面タイトル「打刻」表示
- [x] HV-002: 現在時刻がHH:mm:ss形式で表示
- [x] HV-003: 日付表示（YYYY年MM月DD日 曜日）
- [x] HV-004: 時刻自動更新（1秒ごと）
- [x] HV-005: 初期打刻状態読み込み（loadAttendanceState）

### 3.2. 出勤打刻（handleCheckIn）
- [x] HV-006: 出勤ボタン表示（未出勤時有効）
- [x] HV-007: 出勤打刻成功
- [x] HV-008: 出勤後ボタン無効化
- [x] HV-009: 出勤時刻表示
- [x] HV-010: 出勤打刻成功（位置情報失敗時）
- [x] HV-011: 出勤打刻失敗
- [x] HV-012: ユーザー未ログイン時

### 3.3. 退勤打刻（handleCheckOut）
- [x] HV-013: 退勤ボタン表示（出勤済み時有効）
- [x] HV-014: 退勤打刻成功
- [x] HV-015: 退勤後ボタン無効化
- [x] HV-016: 勤務時間表示
- [x] HV-017: 退勤打刻失敗
- [x] HV-018: 未出勤時は退勤ボタン非活性

### 3.4. 勤務状態表示（currentStatus）
- [x] HV-019: 未出勤時の表示
- [x] HV-020: 正常出勤の表示
- [x] HV-021: 遅刻の表示
- [x] HV-022: 早退の表示

### 3.5. 勤務時間計算（workingHours）
- [x] HV-023: 未出勤時（'-'表示）
- [x] HV-024: 勤務中（経過時間表示）
- [x] HV-025: 退勤済み（勤務時間表示）

### 3.6. 位置情報取得（getCurrentLocation）
- [x] HV-026: 位置情報取得成功
- [x] HV-027: 位置情報取得失敗
- [x] HV-028: 位置情報未サポート
- [x] HV-029: 権限拒否
- [x] HV-030: 位置情報利用不可
- [x] HV-031: タイムアウト

### 3.7. 住所変換（getAddressFromCoords）
- [x] HV-032: 住所取得成功
- [x] HV-033: 住所取得失敗

### 3.8. ライフサイクル
- [x] HV-034: マウント時の処理
- [x] HV-035: アンマウント時のタイマークリア

### 3.9. ローディング状態
- [x] HV-036: APIエラー時の表示
- [x] HV-037: ローディング状態表示
- [x] HV-038: ボタン非活性化

---

## 4. DashboardView.vue ✅ 実装完了

**ファイル**: `tests/unit/views/admin/DashboardView.spec.ts`

### 4.1. アクセス制御
- [x] DV-001: 管理者アクセス許可
- [x] DV-002: 一般ユーザーリダイレクト

### 4.2. 初期データ取得
- [x] DV-003: ユーザーデータ取得
- [x] DV-004: 勤怠データ取得（過去30日分）
- [x] DV-005: ローディング表示
- [x] DV-006: データ取得成功
- [x] DV-007: データ取得失敗

### 4.3. サマリー計算（summary computed）
- [x] DV-008: 出勤率表示（従業員数）
- [x] DV-009: 平均勤務時間表示（本日出勤中）
- [x] DV-010: 遅刻者数表示（遅刻・早退数）
- [x] DV-011: 早退者数表示（今月総勤務時間）

### 4.4. グラフデータ計算

#### 4.4.1. 月次出勤率推移
- [x] DV-012: 月次出勤率グラフ
- [x] DV-013: カテゴリ（過去6ヶ月の月名）
- [x] DV-014: 出勤率計算
- [x] DV-015: データなし時は0

#### 4.4.2. 部署別平均勤務時間
- [x] DV-016: 部署別勤務時間グラフ
- [x] DV-017: 部署ごとの集計
- [x] DV-018: 小数点処理

#### 4.4.3. 遅刻・早退の推移
- [x] DV-019: 遅刻・早退推移グラフ
- [x] DV-020: カテゴリ（過去7日間）
- [x] DV-021: 遅刻件数
- [x] DV-022: 早退件数

#### 4.4.4. 当日の出勤状況
- [x] DV-023: 当日出勤状況グラフ
- [x] DV-024: 出勤数
- [x] DV-025: 欠勤数

### 4.5. グラフオプション
- [x] DV-026: 出勤率グラフオプション（line, 0-100, 緑）
- [x] DV-027: 勤務時間グラフオプション（bar, dataLabels, 青）
- [x] DV-028: 遅刻早退グラフオプション（line, 2系列）
- [x] DV-029: 出勤状況グラフオプション（donut）

### 4.6. 表示
- [x] DV-030: タイトル「管理者ダッシュボード」
- [x] DV-031: サマリーカード（4つ）
- [x] DV-032: グラフ（4つ）

---

## 実装進捗サマリー

| 対象ファイル | 計画テスト数 | 実装テスト数 | 進捗率 | 備考 |
|:---|:---:|:---:|:---:|:---|
| authFirebase.ts | 25 | 21 | 100% | 一部テストを統合（AF-002にisAdmin含む、AF-003〜AF-006とAF-016〜AF-019が重複） |
| attendanceFirebase.ts | 49 | 49 | 100% | |
| HomeView.vue | 38 | 38 | 100% | |
| DashboardView.vue | 32 | 32 | 100% | |
| **合計** | **144** | **140** | **100%** | 実際のテスト実行数: 206（パラメータ化テスト含む） |

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

---

## 備考

- Vuetifyはvitest.setup.tsでグローバル設定済みのため、各テストファイルで再登録不要
- 全テストで206テストがパス（2026-01-12時点）
- Phase1の4ファイルで140テスト関数（計画144から統合により減少）
- その他のテストファイル（logger.spec.ts, mockData.spec.ts, auth.spec.ts, LoginView.spec.ts）: 45テスト関数
- パラメータ化テストにより実際のテスト実行数は206
