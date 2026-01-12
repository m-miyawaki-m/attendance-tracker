# コンポーネントツリー

## 1. 全体構造

```
App.vue
├── MainLayout.vue (条件付き)
│   ├── v-app-bar (メインヘッダー)
│   │   ├── v-app-bar-nav-icon (管理者のみ)
│   │   ├── v-app-bar-title
│   │   ├── v-chip (ユーザー情報)
│   │   └── v-btn (ログアウトボタン)
│   │
│   ├── v-app-bar (タブナビゲーション - 一般従業員のみ)
│   │   └── v-tabs
│   │       └── v-tab × 2
│   │
│   ├── v-navigation-drawer (サイドバー - 管理者のみ)
│   │   └── v-list
│   │       └── v-list-item × 4
│   │
│   └── v-main
│       └── RouterView (各画面コンポーネント)
│
└── RouterView (レイアウトなしの画面)
```

## 2. 画面別コンポーネントツリー

### 2.1 ログイン画面 (LoginView.vue)

**パス:** `/login`
**レイアウト:** なし

```mermaid
graph TD
    LoginView[LoginView.vue]
    LoginView --> VContainer1[v-container fluid]
    VContainer1 --> VRow1[v-row justify=center align=center]
    VRow1 --> VCol1[v-col cols=12 md=6 lg=4]
    VCol1 --> VCard1[v-card]

    VCard1 --> VCardTitle1[v-card-title]
    VCardTitle1 --> VIcon1[v-icon mdi-account-circle]

    VCard1 --> VCardText1[v-card-text]
    VCardText1 --> VForm[v-form]

    VForm --> VTextField1[v-text-field<br/>type=email<br/>label=メールアドレス]
    VForm --> VTextField2[v-text-field<br/>type=password<br/>label=パスワード]

    VCard1 --> VCardActions1[v-card-actions]
    VCardActions1 --> VBtn1[v-btn ログイン]

    VCard1 --> VDivider1[v-divider]

    VCard1 --> VCardText2[v-card-text]
    VCardText2 --> VBtn2[v-btn 管理者アカウント]
    VCardText2 --> VBtn3[v-btn 一般従業員アカウント]

    style LoginView fill:#e3f2fd
```

**主要な状態:**
- `email: ref<string>('')`
- `password: ref<string>('')`

**主要なメソッド:**
- `login()` - ログイン処理
- `fillAdminAccount()` - 管理者アカウント自動入力
- `fillEmployeeAccount()` - 一般従業員アカウント自動入力

---

### 2.2 打刻画面 (HomeView.vue)

**パス:** `/`
**権限:** 一般従業員
**レイアウト:** タブナビゲーション

```mermaid
graph TD
    HomeView[HomeView.vue]
    HomeView --> VContainer2[v-container fluid]
    VContainer2 --> VRow2[v-row]
    VRow2 --> VCol2[v-col cols=12]
    VCol2 --> Title1[h1 打刻]

    VContainer2 --> VRow3[v-row justify=center]
    VRow3 --> VCol3[v-col cols=12 md=8 lg=6]
    VCol3 --> VCard2[v-card]

    VCard2 --> VCardText3[v-card-text]
    VCardText3 --> Clock[リアルタイム時計表示]
    VCardText3 --> Status[出勤状態表示]
    VCardText3 --> Info[本日の勤怠情報]

    VCard2 --> VCardActions2[v-card-actions]
    VCardActions2 --> CheckInBtn[v-btn 出勤<br/>v-if=未出勤]
    VCardActions2 --> CheckOutBtn[v-btn 退勤<br/>v-if=出勤済み]
    VCardActions2 --> CompletedMsg[退勤済みメッセージ<br/>v-if=退勤済み]

    style HomeView fill:#e8f5e9
```

**主要な状態:**
- `currentTime: ref<Date>(new Date())`
- `todayAttendance: computed<Attendance | undefined>()`

**主要なメソッド:**
- `handleCheckIn()` - 出勤処理
- `handleCheckOut()` - 退勤処理
- `getCurrentPosition()` - 位置情報取得

---

### 2.3 勤怠一覧画面 (AttendanceListView.vue)

**パス:** `/attendance`
**権限:** 一般従業員・管理者
**レイアウト:** タブナビゲーション (一般) / サイドバー (管理者)

```mermaid
graph TD
    AttendanceView[AttendanceListView.vue]
    AttendanceView --> VContainer3[v-container fluid]
    VContainer3 --> VRow4[v-row]
    VRow4 --> VCol4[v-col cols=12]
    VCol4 --> Title2[h1 勤怠一覧]

    VContainer3 --> VRow5[v-row]
    VRow5 --> VCol5[v-col cols=12 md=4]
    VCol5 --> VTextField3[v-text-field<br/>type=date<br/>label=日付]

    VContainer3 --> VRow6[v-row]
    VRow6 --> VCol6[v-col cols=12]
    VCol6 --> VCard3[v-card]

    VCard3 --> VCardTitle2[v-card-title]
    VCardTitle2 --> VIcon2[v-icon mdi-calendar-clock]

    VCard3 --> VCardText4[v-card-text]
    VCardText4 --> VDataTable1[v-data-table]

    VDataTable1 --> Template1[template #item.employeeNumber]
    VDataTable1 --> Template2[template #item.name]
    VDataTable1 --> Template3[template #item.position]
    VDataTable1 --> Template4[template #item.checkIn]
    VDataTable1 --> Template5[template #item.checkOut]
    VDataTable1 --> Template6[template #item.location]
    VDataTable1 --> Template7[template #item.status<br/>v-chip]
    VDataTable1 --> Template8[template #item.note]

    style AttendanceView fill:#f3e5f5
```

**主要な状態:**
- `selectedDate: ref<string>(today)`
- `employeeAttendanceList: computed<AttendanceListItem[]>()`

**主要なメソッド:**
- `formatTime(date)` - 時刻フォーマット
- `getStatusText(status)` - ステータステキスト取得
- `getStatusColor(status)` - ステータス色取得

---

### 2.4 管理者ダッシュボード (DashboardView.vue)

**パス:** `/admin/dashboard`
**権限:** 管理者
**レイアウト:** サイドバー

```mermaid
graph TD
    DashboardView[DashboardView.vue]
    DashboardView --> VContainer4[v-container fluid]
    VContainer4 --> VRow7[v-row]
    VRow7 --> VCol7[v-col cols=12]
    VCol7 --> Title3[h1 管理者ダッシュボード]

    VContainer4 --> VRow8[v-row サマリーカード]
    VRow8 --> VCol8_1[v-col cols=12 md=3]
    VRow8 --> VCol8_2[v-col cols=12 md=3]
    VRow8 --> VCol8_3[v-col cols=12 md=3]
    VRow8 --> VCol8_4[v-col cols=12 md=3]

    VCol8_1 --> VCard4_1[v-card 従業員数]
    VCol8_2 --> VCard4_2[v-card 本日出勤中]
    VCol8_3 --> VCard4_3[v-card 遅刻・早退]
    VCol8_4 --> VCard4_4[v-card 今月の総勤務時間]

    VCard4_1 --> VCardText5_1[v-card-text]
    VCardText5_1 --> VIcon3_1[v-icon mdi-account-group]
    VCardText5_1 --> Count1[従業員数表示]

    VContainer4 --> VRow9[v-row グラフエリア]
    VRow9 --> VCol9_1[v-col cols=12 md=6]
    VRow9 --> VCol9_2[v-col cols=12 md=6]
    VRow9 --> VCol9_3[v-col cols=12 md=6]
    VRow9 --> VCol9_4[v-col cols=12 md=6]

    VCol9_1 --> VCard5_1[v-card]
    VCard5_1 --> VCardTitle3_1[v-card-title 月次出勤率推移]
    VCard5_1 --> VCardText6_1[v-card-text]
    VCardText6_1 --> Apexchart1[apexchart<br/>type=line]

    VCol9_2 --> VCard5_2[v-card]
    VCard5_2 --> VCardTitle3_2[v-card-title 部署別平均勤務時間]
    VCard5_2 --> VCardText6_2[v-card-text]
    VCardText6_2 --> Apexchart2[apexchart<br/>type=bar]

    VCol9_3 --> VCard5_3[v-card]
    VCard5_3 --> VCardTitle3_3[v-card-title 遅刻・早退の推移]
    VCard5_3 --> VCardText6_3[v-card-text]
    VCardText6_3 --> Apexchart3[apexchart<br/>type=line]

    VCol9_4 --> VCard5_4[v-card]
    VCard5_4 --> VCardTitle3_4[v-card-title 当日の出勤状況]
    VCard5_4 --> VCardText6_4[v-card-text]
    VCardText6_4 --> Apexchart4[apexchart<br/>type=donut]

    style DashboardView fill:#fff3e0
```

**主要な状態:**
- `summary: computed<SummaryData>()`
- `chartData: ChartData` (mockChartData)
- `attendanceRateOptions: ApexChartOptions`
- `avgWorkHoursOptions: ApexChartOptions`
- `lateEarlyLeaveOptions: ApexChartOptions`
- `departmentStatusOptions: ApexChartOptions`

---

### 2.5 従業員管理画面 (EmployeeListView.vue)

**パス:** `/admin/employees`
**権限:** 管理者
**レイアウト:** サイドバー

```mermaid
graph TD
    EmployeeListView[EmployeeListView.vue]
    EmployeeListView --> VContainer5[v-container fluid]
    VContainer5 --> VRow10[v-row]
    VRow10 --> VCol10[v-col cols=12]
    VCol10 --> Title4[h1 従業員管理]

    VContainer5 --> VRow11[v-row]
    VRow11 --> VCol11[v-col cols=12 md=4]
    VCol11 --> VTextField4[v-text-field<br/>type=month<br/>label=対象月]

    VContainer5 --> VRow12[v-row]
    VRow12 --> VCol12[v-col cols=12]
    VCol12 --> VCard6[v-card]

    VCard6 --> VCardTitle4[v-card-title]
    VCardTitle4 --> VIcon4[v-icon mdi-account-group]

    VCard6 --> VCardText7[v-card-text]
    VCardText7 --> VDataTable2[v-data-table]

    VDataTable2 --> Template9[template #item.employeeNumber]
    VDataTable2 --> Template10[template #item.name]
    VDataTable2 --> Template11[template #item.position]
    VDataTable2 --> Template12[template #item.attendanceStatus]
    Template12 --> VChip1[v-chip 正常]
    Template12 --> VChip2[v-chip 遅刻]
    Template12 --> VChip3[v-chip 早退]
    Template12 --> VChip4[v-chip 欠勤]
    VDataTable2 --> Template13[template #item.note]

    style EmployeeListView fill:#fff3e0
```

**主要な状態:**
- `selectedMonth: ref<string>(currentYearMonth)`
- `employeeList: computed<EmployeeListItem[]>()`

---

### 2.6 チーム勤怠管理画面 (TeamView.vue)

**パス:** `/admin/team`
**権限:** 管理者
**レイアウト:** サイドバー

```mermaid
graph TD
    TeamView[TeamView.vue]
    TeamView --> VContainer6[v-container fluid]
    VContainer6 --> VRow13[v-row]
    VRow13 --> VCol13[v-col cols=12]
    VCol13 --> Title5[h1 チーム勤怠管理]

    VContainer6 --> VRow14[v-row 主任選択]
    VRow14 --> VCol14_1[v-col cols=12 md=6]
    VCol14_1 --> VSelect1[v-select<br/>主任を選択]
    VCol14_1 --> Caption1[p.text-caption<br/>利用可能な主任: N人]
    VRow14 --> VCol14_2[v-col cols=12 md=6]
    VCol14_2 --> VTextField5[v-text-field<br/>type=date<br/>label=日付]

    VContainer6 --> VRow15[v-row チームサマリー<br/>v-if=selectedManagerId]
    VRow15 --> VCol15_1[v-col cols=12 md=3]
    VRow15 --> VCol15_2[v-col cols=12 md=3]
    VRow15 --> VCol15_3[v-col cols=12 md=3]
    VRow15 --> VCol15_4[v-col cols=12 md=3]

    VCol15_1 --> VCard7_1[v-card チームメンバー数]
    VCol15_2 --> VCard7_2[v-card 正常出勤]
    VCol15_3 --> VCard7_3[v-card 遅刻・早退]
    VCol15_4 --> VCard7_4[v-card 欠勤]

    VCard7_1 --> VCardText8_1[v-card-text]
    VCardText8_1 --> VIcon5_1[v-icon mdi-account-group]
    VCardText8_1 --> Count2[メンバー数表示]

    VContainer6 --> VRow16[v-row チームメンバー勤怠一覧<br/>v-if=selectedManagerId]
    VRow16 --> VCol16[v-col cols=12]
    VCol16 --> VCard8[v-card]

    VCard8 --> VCardTitle5[v-card-title]
    VCardTitle5 --> VIcon6[v-icon mdi-account-multiple]
    VCardTitle5 --> ManagerName[selectedManagerNameのチームメンバー]

    VCard8 --> VCardText9[v-card-text]
    VCardText9 --> VDataTable3[v-data-table]

    VDataTable3 --> Template14[template #item.employeeNumber]
    VDataTable3 --> Template15[template #item.name]
    VDataTable3 --> Template16[template #item.position]
    VDataTable3 --> Template17[template #item.checkIn]
    VDataTable3 --> Template18[template #item.checkOut]
    VDataTable3 --> Template19[template #item.workingHours]
    VDataTable3 --> Template20[template #item.status<br/>v-chip]
    VDataTable3 --> Template21[template #item.note]

    VContainer6 --> VRow17[v-row 主任未選択時<br/>v-else]
    VRow17 --> VCol17[v-col cols=12]
    VCol17 --> VCard9[v-card]
    VCard9 --> VCardText10[v-card-text]
    VCardText10 --> VIcon7[v-icon mdi-account-search]
    VCardText10 --> EmptyMsg[主任を選択してください]

    style TeamView fill:#fff3e0
```

**主要な状態:**
- `selectedDate: ref<string>(today)`
- `selectedManagerId: ref<string | null>(null)`
- `managers: computed<ManagerOption[]>()`
- `selectedManagerName: computed<string>()`
- `teamAttendanceList: computed<TeamAttendanceItem[]>()`
- `teamSummary: computed<TeamSummary>()`

**主要なメソッド:**
- `formatTime(date)` - 時刻フォーマット
- `getStatusText(status)` - ステータステキスト取得
- `getStatusColor(status)` - ステータス色取得

---

### 2.7 共通レイアウト (MainLayout.vue)

**使用箇所:** 全画面（ログイン画面以外）

```mermaid
graph TD
    MainLayout[MainLayout.vue]
    MainLayout --> VApp[v-app]

    VApp --> VAppBar1[v-app-bar<br/>メインヘッダー<br/>v-if=showHeader]
    VAppBar1 --> VAppBarNavIcon[v-app-bar-nav-icon<br/>v-if=showSidebar]
    VAppBar1 --> VAppBarTitle[v-app-bar-title<br/>勤怠管理システム]
    VAppBar1 --> VSpacer1[v-spacer]
    VAppBar1 --> VChip5[v-chip<br/>ユーザー情報<br/>v-if=isAuthenticated]
    VChip5 --> VIcon8[v-icon mdi-account]
    VChip5 --> UserName[userName]
    VAppBar1 --> VBtn4[v-btn<br/>ログアウト<br/>v-if=isAuthenticated]
    VBtn4 --> VIcon9[v-icon mdi-logout]

    VApp --> VAppBar2[v-app-bar<br/>タブナビゲーション<br/>v-if=showTabs]
    VAppBar2 --> VTabs[v-tabs]
    VTabs --> VTab1[v-tab 打刻]
    VTabs --> VTab2[v-tab 勤怠一覧]

    VApp --> VNavigationDrawer[v-navigation-drawer<br/>サイドバー<br/>v-if=showSidebar]
    VNavigationDrawer --> VList1[v-list]
    VList1 --> VListItem1[v-list-item 管理メニュー]
    VList1 --> VDivider2[v-divider]
    VList1 --> VListItem2[v-list-item ダッシュボード]
    VList1 --> VListItem3[v-list-item 従業員管理]
    VList1 --> VListItem4[v-list-item チーム勤怠]
    VList1 --> VListItem5[v-list-item 勤怠一覧]

    VApp --> VMain[v-main]
    VMain --> Slot[slot]

    VApp --> VFooter[v-footer<br/>v-if=showFooter]

    VApp --> VSnackbar[v-snackbar]
    VSnackbar --> VBtn5[v-btn 閉じる]

    style MainLayout fill:#e1f5fe
```

**Props:**
- `showHeader?: boolean` (default: true)
- `showSidebar?: boolean` (default: false)
- `showFooter?: boolean` (default: false)
- `showTabs?: boolean` (default: false)

**主要な状態:**
- `drawer: ref<boolean>(true)` - サイドバー開閉状態
- `snackbar: ref<boolean>(false)` - スナックバー表示状態
- `snackbarMessage: ref<string>('')` - スナックバーメッセージ
- `snackbarColor: ref<string>('success')` - スナックバー色
- `currentTab: ref<string | null>(null)` - 現在のタブ

**Computed:**
- `currentYear` - 現在の年
- `tabs` - タブ定義（役割に応じて変更）
- `menuItems` - サイドバーメニュー項目

**主要なメソッド:**
- `handleLogout()` - ログアウト処理
- `isActive(path)` - アクティブメニュー判定

---

## 3. コンポーネント依存関係

```mermaid
graph TD
    App[App.vue]
    App --> MainLayout[MainLayout.vue]
    App --> RouterView[RouterView]

    MainLayout --> LoginView[LoginView.vue]
    MainLayout --> HomeView[HomeView.vue]
    MainLayout --> AttendanceListView[AttendanceListView.vue]
    MainLayout --> DashboardView[DashboardView.vue]
    MainLayout --> EmployeeListView[EmployeeListView.vue]
    MainLayout --> TeamView[TeamView.vue]

    RouterView --> LoginView

    subgraph "Vuetify コンポーネント"
        VApp[v-app]
        VAppBar[v-app-bar]
        VNavigationDrawer[v-navigation-drawer]
        VMain[v-main]
        VContainer[v-container]
        VRow[v-row]
        VCol[v-col]
        VCard[v-card]
        VBtn[v-btn]
        VTextField[v-text-field]
        VSelect[v-select]
        VDataTable[v-data-table]
        VChip[v-chip]
        VIcon[v-icon]
        VTabs[v-tabs]
        VTab[v-tab]
        VList[v-list]
        VListItem[v-list-item]
    end

    subgraph "サードパーティ"
        Apexchart[apexchart<br/>vue3-apexcharts]
    end

    DashboardView --> Apexchart

    subgraph "Store"
        AuthStore[useAuthStore<br/>Pinia]
    end

    MainLayout --> AuthStore
    LoginView --> AuthStore
    HomeView --> AuthStore

    subgraph "Router"
        VueRouter[Vue Router]
    end

    App --> VueRouter
    MainLayout --> VueRouter

    subgraph "Mock Data"
        MockData[mockData.ts<br/>mockUsers<br/>mockAttendances<br/>mockChartData<br/>statusConfig]
    end

    HomeView --> MockData
    AttendanceListView --> MockData
    DashboardView --> MockData
    EmployeeListView --> MockData
    TeamView --> MockData

    style App fill:#ffebee
    style MainLayout fill:#e1f5fe
    style LoginView fill:#e3f2fd
    style HomeView fill:#e8f5e9
    style AttendanceListView fill:#f3e5f5
    style DashboardView fill:#fff3e0
    style EmployeeListView fill:#fff3e0
    style TeamView fill:#fff3e0
```

## 4. 主要コンポーネントの責務

### 4.1 App.vue
- アプリケーション全体のルートコンポーネント
- レイアウト設定の決定（役割・認証状態に応じて）
- MainLayout または RouterView の条件付きレンダリング

### 4.2 MainLayout.vue
- 共通レイアウトコンポーネント
- ヘッダー、サイドバー、タブナビゲーションの表示制御
- ログアウト処理
- スナックバー表示

### 4.3 LoginView.vue
- ログイン画面
- 認証処理
- モックアカウント自動入力
- 役割に応じたリダイレクト

### 4.4 HomeView.vue
- 打刻画面（一般従業員用）
- リアルタイム時計表示
- 出勤・退勤処理
- 位置情報取得
- 本日の勤怠状態表示

### 4.5 AttendanceListView.vue
- 勤怠一覧画面（一般従業員・管理者共通）
- 日付選択
- 全従業員の勤怠データ表示
- ステータス別色分け表示

### 4.6 DashboardView.vue
- 管理者ダッシュボード
- サマリーデータ表示（4つのカード）
- グラフ表示（4つのグラフ）
- データ集計・計算

### 4.7 EmployeeListView.vue
- 従業員管理画面（管理者用）
- 月選択
- 従業員一覧表示
- 月次勤怠集計

### 4.8 TeamView.vue
- チーム勤怠管理画面（管理者用）
- 主任選択（v-select）
- 日付選択
- チームサマリー表示
- チームメンバー勤怠一覧表示

## 5. コンポーネント間のデータフロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Login as LoginView
    participant Auth as AuthStore
    participant Router as Vue Router
    participant Layout as MainLayout
    participant View as 各画面コンポーネント
    participant Mock as mockData

    User->>Login: メールアドレス・パスワード入力
    Login->>Auth: login(email, password)
    Auth->>Mock: ユーザー検索
    Mock-->>Auth: ユーザーデータ
    Auth->>Auth: 認証情報保存
    Auth-->>Login: 認証成功

    Login->>Router: 役割に応じてリダイレクト
    Router->>Layout: レイアウト表示
    Layout->>Auth: isAuthenticated確認
    Layout->>Auth: isAdmin確認
    Layout->>View: RouterView描画

    View->>Mock: データ取得
    Mock-->>View: モックデータ
    View->>View: computed でデータ計算
    View-->>User: 画面表示

    User->>View: 操作（打刻、データ選択など）
    View->>Mock: データ更新
    Mock-->>View: 更新完了
    View-->>User: 画面更新

    User->>Layout: ログアウトクリック
    Layout->>Auth: logout()
    Auth->>Auth: 認証情報クリア
    Auth-->>Layout: ログアウト完了
    Layout->>Router: ログイン画面へリダイレクト
```

## 6. Vuetify コンポーネント使用状況

| コンポーネント | 使用画面 | 用途 |
|-------------|---------|------|
| v-app | MainLayout | アプリケーションラッパー |
| v-app-bar | MainLayout | ヘッダー、タブナビゲーション |
| v-navigation-drawer | MainLayout | サイドバー（管理者用） |
| v-container | 全画面 | コンテナ |
| v-row / v-col | 全画面 | グリッドレイアウト |
| v-card | 全画面 | カードコンテナ |
| v-btn | 全画面 | ボタン |
| v-text-field | LoginView, AttendanceListView, EmployeeListView, TeamView | テキスト入力、日付・月選択 |
| v-select | TeamView | 主任選択プルダウン |
| v-data-table | AttendanceListView, EmployeeListView, TeamView | データテーブル |
| v-chip | MainLayout, AttendanceListView, EmployeeListView, TeamView | ステータス表示、ユーザー情報 |
| v-icon | 全画面 | アイコン表示 |
| v-tabs / v-tab | MainLayout | タブナビゲーション |
| v-list / v-list-item | MainLayout | サイドバーメニュー |
| v-snackbar | MainLayout | 通知メッセージ |
| apexchart | DashboardView | グラフ表示 |

## 7. 再利用可能なコンポーネント候補（将来の拡張）

現在は全て単一ファイルコンポーネントですが、以下のような共通コンポーネントを抽出できます：

1. **StatusChip.vue** - ステータス表示用チップ
   - 使用箇所: AttendanceListView, EmployeeListView, TeamView
   - Props: `status: AttendanceStatus`

2. **DatePicker.vue** - 日付選択コンポーネント
   - 使用箇所: AttendanceListView, TeamView
   - Props: `modelValue: string`, `label: string`

3. **SummaryCard.vue** - サマリーカード
   - 使用箇所: DashboardView, TeamView
   - Props: `icon: string`, `value: number`, `title: string`, `color: string`

4. **AttendanceTable.vue** - 勤怠テーブル
   - 使用箇所: AttendanceListView, TeamView
   - Props: `items: AttendanceItem[]`, `headers: DataTableHeader[]`

5. **MonthPicker.vue** - 月選択コンポーネント
   - 使用箇所: EmployeeListView
   - Props: `modelValue: string`, `label: string`
