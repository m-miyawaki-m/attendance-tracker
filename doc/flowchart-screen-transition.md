# 画面遷移フローチャート

## 1. 全体フロー (役割別)

```mermaid
flowchart TD
    Start([アプリ起動]) --> CheckAuth{認証状態確認}

    CheckAuth -->|未認証| Login[ログイン画面<br/>/login]
    CheckAuth -->|認証済み| CheckRole{役割確認}

    Login --> InputCredentials[メールアドレス<br/>パスワード入力]
    InputCredentials --> MockBtn{モックアカウント<br/>自動入力}
    MockBtn -->|管理者| FillAdmin["admin@example.com<br/>自動入力"]
    MockBtn -->|一般従業員| FillEmployee["yamada@example.com<br/>自動入力"]
    FillAdmin --> LoginSubmit[ログイン実行]
    FillEmployee --> LoginSubmit
    InputCredentials --> LoginSubmit

    LoginSubmit --> AuthCheck{認証成功?}
    AuthCheck -->|失敗| Login
    AuthCheck -->|成功| CheckRole

    CheckRole -->|管理者| AdminDashboard[管理者ダッシュボード<br/>/admin/dashboard]
    CheckRole -->|一般従業員| EmployeeHome[打刻画面<br/>/]

    %% 管理者フロー
    AdminDashboard --> AdminMenu{管理者メニュー}
    AdminMenu --> EmployeeList[従業員管理<br/>/admin/employees]
    AdminMenu --> TeamView[チーム勤怠<br/>/admin/team]
    AdminMenu --> AttendanceList[勤怠一覧<br/>/attendance]
    AdminMenu --> Logout1[ログアウト]

    EmployeeList --> AdminMenu
    TeamView --> AdminMenu
    AttendanceList --> AdminMenu

    %% 一般従業員フロー
    EmployeeHome --> EmployeeTab{タブ選択}
    EmployeeTab --> CheckInOut[打刻画面<br/>/]
    EmployeeTab --> AttendanceList2[勤怠一覧<br/>/attendance]
    EmployeeTab --> Logout2[ログアウト]

    CheckInOut --> EmployeeTab
    AttendanceList2 --> EmployeeTab

    %% ログアウト
    Logout1 --> Login
    Logout2 --> Login

    style Login fill:#e3f2fd
    style AdminDashboard fill:#fff3e0
    style EmployeeHome fill:#e8f5e9
    style EmployeeList fill:#fff3e0
    style TeamView fill:#fff3e0
    style AttendanceList fill:#f3e5f5
    style AttendanceList2 fill:#f3e5f5
    style CheckInOut fill:#e8f5e9
```

## 2. 一般従業員の画面遷移詳細

```mermaid
flowchart TD
    Start([一般従業員<br/>ログイン]) --> Home[打刻画面<br/>/]

    Home --> Tab{タブ選択}

    %% 打刻タブ
    Tab -->|打刻タブ| HomeView[打刻画面]
    HomeView --> CheckStatus{出勤状態}
    CheckStatus -->|未出勤| CheckIn[出勤ボタン]
    CheckStatus -->|出勤済み| CheckOut[退勤ボタン]

    CheckIn --> GetLocation1[位置情報取得]
    GetLocation1 --> LocationSuccess1{位置情報<br/>取得成功?}
    LocationSuccess1 -->|成功| RecordCheckIn[出勤時刻記録]
    LocationSuccess1 -->|失敗| LocationError1[エラー表示]
    RecordCheckIn --> HomeView
    LocationError1 --> HomeView

    CheckOut --> GetLocation2[位置情報取得]
    GetLocation2 --> LocationSuccess2{位置情報<br/>取得成功?}
    LocationSuccess2 -->|成功| RecordCheckOut[退勤時刻記録<br/>勤務時間計算]
    LocationSuccess2 -->|失敗| LocationError2[エラー表示]
    RecordCheckOut --> HomeView
    LocationError2 --> HomeView

    %% 勤怠一覧タブ
    Tab -->|勤怠一覧タブ| AttendanceList[勤怠一覧画面<br/>/attendance]
    AttendanceList --> SelectDate[日付選択]
    SelectDate --> LoadData[全従業員の<br/>勤怠データ取得]
    LoadData --> DisplayTable[データテーブル表示<br/>- 社員番号<br/>- 名前<br/>- 役職<br/>- 出勤/退勤時刻<br/>- 勤務時間<br/>- 位置情報<br/>- ステータス]
    DisplayTable --> AttendanceList

    %% ログアウト
    Tab -->|ログアウト| Logout[ログアウト処理]
    Logout --> Login[ログイン画面<br/>/login]

    HomeView --> Tab
    AttendanceList --> Tab

    style Home fill:#e8f5e9
    style HomeView fill:#e8f5e9
    style AttendanceList fill:#f3e5f5
    style RecordCheckIn fill:#c8e6c9
    style RecordCheckOut fill:#c8e6c9
    style LocationError1 fill:#ffcdd2
    style LocationError2 fill:#ffcdd2
```

## 3. 管理者の画面遷移詳細

```mermaid
flowchart TD
    Start([管理者<br/>ログイン]) --> Dashboard[ダッシュボード<br/>/admin/dashboard]

    Dashboard --> LoadSummary[サマリーデータ読み込み<br/>- 従業員数<br/>- 本日出勤中<br/>- 遅刻・早退<br/>- 今月の総勤務時間]
    LoadSummary --> LoadCharts[グラフデータ読み込み<br/>- 月次出勤率推移<br/>- 部署別平均勤務時間<br/>- 遅刻・早退の推移<br/>- 当日の出勤状況]
    LoadCharts --> DashboardDisplay[ダッシュボード表示]

    DashboardDisplay --> Sidebar{サイドバー<br/>メニュー選択}

    %% ダッシュボード
    Sidebar -->|ダッシュボード| Dashboard

    %% 従業員管理
    Sidebar -->|従業員管理| EmployeeList[従業員管理画面<br/>/admin/employees]
    EmployeeList --> SelectMonth[対象月選択]
    SelectMonth --> LoadEmployees[従業員一覧取得]
    LoadEmployees --> CalcMonthly[月次勤怠集計<br/>- 正常出勤数<br/>- 遅刻数<br/>- 早退数<br/>- 欠勤数]
    CalcMonthly --> DisplayEmployees[従業員一覧表示]
    DisplayEmployees --> EmployeeList

    %% チーム勤怠
    Sidebar -->|チーム勤怠| TeamView[チーム勤怠画面<br/>/admin/team]
    TeamView --> SelectManager[主任選択<br/>プルダウン]
    SelectManager --> ManagerSelected{主任が<br/>選択された?}
    ManagerSelected -->|未選択| EmptyMessage[選択メッセージ表示<br/>主任を選択してください]
    ManagerSelected -->|選択済み| SelectTeamDate[日付選択]

    SelectTeamDate --> LoadTeamMembers[チームメンバー取得<br/>managerId = 選択された主任]
    LoadTeamMembers --> LoadTeamAttendance[チームメンバーの<br/>勤怠データ取得]
    LoadTeamAttendance --> CalcTeamSummary[チームサマリー計算<br/>- チームメンバー数<br/>- 正常出勤数<br/>- 遅刻・早退数<br/>- 欠勤数]
    CalcTeamSummary --> CalcWorkingHours[勤務時間計算<br/>H:mm形式]
    CalcWorkingHours --> DisplayTeam[チームメンバー<br/>勤怠一覧表示]
    DisplayTeam --> TeamView
    EmptyMessage --> TeamView

    %% 勤怠一覧
    Sidebar -->|勤怠一覧| AttendanceList[勤怠一覧画面<br/>/attendance]
    AttendanceList --> SelectAttendanceDate[日付選択]
    SelectAttendanceDate --> LoadAllAttendance[全従業員の<br/>勤怠データ取得]
    LoadAllAttendance --> DisplayAttendance[データテーブル表示<br/>- 社員番号<br/>- 名前<br/>- 役職<br/>- 出勤/退勤時刻<br/>- 勤務時間<br/>- 位置情報<br/>- ステータス]
    DisplayAttendance --> AttendanceList

    %% ログアウト
    Sidebar -->|ログアウト| Logout[ログアウト処理]
    Logout --> Login[ログイン画面<br/>/login]

    EmployeeList --> Sidebar
    TeamView --> Sidebar
    AttendanceList --> Sidebar

    style Dashboard fill:#fff3e0
    style DashboardDisplay fill:#fff3e0
    style EmployeeList fill:#fff3e0
    style DisplayEmployees fill:#fff3e0
    style TeamView fill:#fff3e0
    style DisplayTeam fill:#fff3e0
    style AttendanceList fill:#f3e5f5
    style EmptyMessage fill:#ffecb3
```

## 4. ログイン処理フロー詳細

```mermaid
flowchart TD
    Start([ログイン画面表示<br/>/login]) --> InputForm[メールアドレス<br/>パスワード入力フォーム]

    InputForm --> UserAction{ユーザー操作}

    %% モックアカウント自動入力
    UserAction -->|管理者アカウント<br/>ボタンクリック| FillAdmin["admin@example.com<br/>password を自動入力"]
    UserAction -->|一般従業員アカウント<br/>ボタンクリック| FillEmployee["yamada@example.com<br/>password を自動入力"]
    UserAction -->|手動入力| ManualInput[メールアドレス<br/>パスワード入力]

    FillAdmin --> LoginBtn[ログインボタン]
    FillEmployee --> LoginBtn
    ManualInput --> LoginBtn

    LoginBtn --> Validate{入力値検証}
    Validate -->|未入力| ValidationError[エラー表示<br/>必須項目を入力してください]
    ValidationError --> InputForm

    Validate -->|入力OK| AuthProcess[認証処理<br/>モックユーザー検索]

    AuthProcess --> AuthResult{認証結果}
    AuthResult -->|失敗| AuthError[エラー表示<br/>メールアドレスまたは<br/>パスワードが間違っています]
    AuthError --> InputForm

    AuthResult -->|成功| SaveAuth[認証情報保存<br/>Pinia Store]
    SaveAuth --> CheckRole{役割確認}

    CheckRole -->|admin| RedirectAdmin[管理者ダッシュボードへ<br/>リダイレクト<br/>/admin/dashboard]
    CheckRole -->|employee| RedirectEmployee[打刻画面へ<br/>リダイレクト<br/>/]

    RedirectAdmin --> AdminDashboard([管理者ダッシュボード])
    RedirectEmployee --> EmployeeHome([打刻画面])

    style InputForm fill:#e3f2fd
    style SaveAuth fill:#c8e6c9
    style ValidationError fill:#ffcdd2
    style AuthError fill:#ffcdd2
    style RedirectAdmin fill:#fff3e0
    style RedirectEmployee fill:#e8f5e9
```

## 5. ルートガード処理フロー

```mermaid
flowchart TD
    Start([ページ遷移<br/>リクエスト]) --> RouteGuard{ナビゲーション<br/>ガード}

    RouteGuard --> CheckMeta{route.meta確認}

    %% レイアウトなし（ログインページ）
    CheckMeta -->|layout: 'none'| AllowAccess1[アクセス許可]
    AllowAccess1 --> ShowLogin([ログイン画面表示])

    %% 認証必須チェック
    CheckMeta -->|requiresAuth: true| CheckAuthenticated{認証済み?}
    CheckAuthenticated -->|未認証| RedirectLogin[ログイン画面へ<br/>リダイレクト<br/>/login]
    RedirectLogin --> ShowLogin

    CheckAuthenticated -->|認証済み| CheckAdmin{requiresAdmin<br/>メタデータ確認}

    %% 管理者権限チェック
    CheckAdmin -->|requiresAdmin: true| IsAdmin{管理者?}
    IsAdmin -->|一般従業員| Forbidden[403 Forbidden<br/>アクセス拒否]
    Forbidden --> RedirectHome[ホームへ<br/>リダイレクト<br/>/]

    IsAdmin -->|管理者| AllowAccess2[アクセス許可]
    AllowAccess2 --> ShowAdminPage([管理者ページ表示])

    %% 一般ページ
    CheckAdmin -->|requiresAdmin: false<br/>or undefined| AllowAccess3[アクセス許可]
    AllowAccess3 --> ShowPage([ページ表示])

    style CheckAuthenticated fill:#fff3e0
    style IsAdmin fill:#fff3e0
    style AllowAccess1 fill:#c8e6c9
    style AllowAccess2 fill:#c8e6c9
    style AllowAccess3 fill:#c8e6c9
    style RedirectLogin fill:#ffecb3
    style Forbidden fill:#ffcdd2
```

## 6. レイアウト切り替えフロー

```mermaid
flowchart TD
    Start([ページ表示]) --> CheckLayout{route.meta.layout<br/>確認}

    CheckLayout -->|layout: 'none'| NoLayout[レイアウトなし<br/>RouterViewのみ]
    NoLayout --> ShowLoginPage([ログイン画面])

    CheckLayout -->|layout: 'default'<br/>or undefined| CheckRole{認証ユーザー<br/>の役割確認}

    CheckRole -->|admin| AdminLayout[管理者レイアウト<br/>showHeader: true<br/>showSidebar: true<br/>showFooter: false<br/>showTabs: false]
    AdminLayout --> RenderAdmin[MainLayout描画<br/>サイドバー表示]
    RenderAdmin --> ShowAdminContent([管理者コンテンツ<br/>表示])

    CheckRole -->|employee| EmployeeLayout[一般従業員レイアウト<br/>showHeader: true<br/>showSidebar: false<br/>showFooter: false<br/>showTabs: true]
    EmployeeLayout --> RenderEmployee[MainLayout描画<br/>タブ表示]
    RenderEmployee --> ShowEmployeeContent([一般従業員コンテンツ<br/>表示])

    style NoLayout fill:#e3f2fd
    style AdminLayout fill:#fff3e0
    style EmployeeLayout fill:#e8f5e9
```

## 7. 主要画面の内部フロー

### 7.1 打刻画面 (HomeView) の内部フロー

```mermaid
flowchart TD
    Start([打刻画面表示<br/>/]) --> InitView[画面初期化]
    InitView --> GetToday[今日の日付取得<br/>YYYY-MM-DD]
    GetToday --> FindTodayAttendance[本日の勤怠データ検索<br/>mockAttendances]

    FindTodayAttendance --> HasAttendance{勤怠データ<br/>存在?}
    HasAttendance -->|存在しない| ShowCheckInBtn[出勤ボタン表示<br/>未出勤状態]
    HasAttendance -->|存在する| CheckInExists{checkIn<br/>存在?}

    CheckInExists -->|存在しない| ShowCheckInBtn
    CheckInExists -->|存在する| CheckOutExists{checkOut<br/>存在?}

    CheckOutExists -->|存在しない| ShowCheckOutBtn[退勤ボタン表示<br/>出勤中状態<br/>出勤時刻表示]
    CheckOutExists -->|存在する| ShowCompleted[退勤済み表示<br/>出勤・退勤時刻<br/>勤務時間表示]

    %% 出勤ボタンクリック
    ShowCheckInBtn --> ClickCheckIn{出勤ボタン<br/>クリック}
    ClickCheckIn --> GetLocation1[位置情報取得<br/>navigator.geolocation]
    GetLocation1 --> LocationCheck1{位置情報<br/>取得成功?}

    LocationCheck1 -->|失敗| ShowError1[エラーメッセージ表示<br/>位置情報を取得できませんでした]
    ShowError1 --> ShowCheckInBtn

    LocationCheck1 -->|成功| CreateCheckIn[勤怠データ作成<br/>checkIn: 現在時刻<br/>checkInLocation: 位置情報<br/>status: 判定]
    CreateCheckIn --> JudgeStatus1[ステータス判定<br/>09:00以前 → present<br/>09:00以降 → late]
    JudgeStatus1 --> SaveCheckIn[データ保存<br/>mockAttendances]
    SaveCheckIn --> ShowCheckOutBtn

    %% 退勤ボタンクリック
    ShowCheckOutBtn --> ClickCheckOut{退勤ボタン<br/>クリック}
    ClickCheckOut --> GetLocation2[位置情報取得<br/>navigator.geolocation]
    GetLocation2 --> LocationCheck2{位置情報<br/>取得成功?}

    LocationCheck2 -->|失敗| ShowError2[エラーメッセージ表示<br/>位置情報を取得できませんでした]
    ShowError2 --> ShowCheckOutBtn

    LocationCheck2 -->|成功| UpdateCheckOut[勤怠データ更新<br/>checkOut: 現在時刻<br/>checkOutLocation: 位置情報]
    UpdateCheckOut --> CalcWorkingTime[勤務時間計算<br/>checkOut - checkIn]
    CalcWorkingTime --> JudgeStatus2[ステータス再判定<br/>18:00以前 → early_leave<br/>18:00以降 → 変更なし]
    JudgeStatus2 --> SaveCheckOut[データ保存<br/>mockAttendances]
    SaveCheckOut --> ShowCompleted

    style ShowCheckInBtn fill:#e8f5e9
    style ShowCheckOutBtn fill:#fff3e0
    style ShowCompleted fill:#c8e6c9
    style ShowError1 fill:#ffcdd2
    style ShowError2 fill:#ffcdd2
    style CreateCheckIn fill:#c8e6c9
    style SaveCheckIn fill:#c8e6c9
    style UpdateCheckOut fill:#c8e6c9
    style SaveCheckOut fill:#c8e6c9
```

### 7.2 ダッシュボード (DashboardView) のデータ読み込みフロー

```mermaid
flowchart TD
    Start([ダッシュボード表示<br/>/admin/dashboard]) --> InitView[画面初期化]

    InitView --> CalcSummary[サマリーデータ計算<br/>computed]
    CalcSummary --> GetToday[今日の日付取得<br/>YYYY-MM-DD]
    GetToday --> FilterTodayAttendance[本日の勤怠データ抽出<br/>mockAttendances]

    FilterTodayAttendance --> CountEmployees[従業員数カウント<br/>role === 'employee']
    CountEmployees --> CountPresent[本日出勤中カウント<br/>status === 'present']
    CountPresent --> CountLateEarly[遅刻・早退カウント<br/>status === 'late' or 'early_leave']
    CountLateEarly --> GetCurrentMonth[今月取得<br/>YYYY-MM]
    GetCurrentMonth --> FilterMonthAttendance[今月の勤怠データ抽出]
    FilterMonthAttendance --> SumWorkingMinutes[勤務時間合計<br/>workingMinutes]
    SumWorkingMinutes --> ConvertToHours[時間に変換<br/>分 / 60]
    ConvertToHours --> DisplaySummaryCards[サマリーカード表示<br/>- 従業員数<br/>- 本日出勤中<br/>- 遅刻・早退<br/>- 今月の総勤務時間]

    InitView --> LoadChartData[グラフデータ読み込み<br/>mockChartData]
    LoadChartData --> PrepareAttendanceRate[月次出勤率データ準備<br/>categories + series]
    PrepareAttendanceRate --> PrepareWorkHours[部署別平均勤務時間準備<br/>categories + series]
    PrepareWorkHours --> PrepareLateEarly[遅刻・早退推移準備<br/>categories + series]
    PrepareLateEarly --> PrepareDeptStatus[当日出勤状況準備<br/>labels + series]
    PrepareDeptStatus --> RenderCharts[グラフ描画<br/>ApexCharts]

    RenderCharts --> Chart1[月次出勤率推移<br/>Line Chart]
    RenderCharts --> Chart2[部署別平均勤務時間<br/>Bar Chart]
    RenderCharts --> Chart3[遅刻・早退の推移<br/>Multi-line Chart]
    RenderCharts --> Chart4[当日の出勤状況<br/>Donut Chart]

    DisplaySummaryCards --> Complete([ダッシュボード<br/>表示完了])
    Chart1 --> Complete
    Chart2 --> Complete
    Chart3 --> Complete
    Chart4 --> Complete

    style DisplaySummaryCards fill:#fff3e0
    style Chart1 fill:#e3f2fd
    style Chart2 fill:#e3f2fd
    style Chart3 fill:#e3f2fd
    style Chart4 fill:#e3f2fd
```

### 7.3 チーム勤怠 (TeamView) のデータ読み込みフロー

```mermaid
flowchart TD
    Start([チーム勤怠画面表示<br/>/admin/team]) --> InitView[画面初期化]

    InitView --> LoadManagers[主任リスト取得<br/>computed]
    LoadManagers --> FilterManagers[主任をフィルタ<br/>position === '主任'<br/>role === 'employee']
    FilterManagers --> MapManagers[主任データ変換<br/>id, name, label<br/>department, employeeNumber]
    MapManagers --> DisplayManagerSelect[主任選択プルダウン表示<br/>v-select]

    DisplayManagerSelect --> ManagerAction{主任選択}
    ManagerAction -->|未選択| ShowEmptyMessage[空メッセージ表示<br/>主任を選択してください]

    ManagerAction -->|選択| GetSelectedManager[selectedManagerId設定]
    GetSelectedManager --> GetSelectedDate[selectedDate取得<br/>デフォルト: 今日]
    GetSelectedDate --> LoadTeamMembers[チームメンバー取得<br/>computed]

    LoadTeamMembers --> FilterTeamMembers[チームメンバーフィルタ<br/>managerId === selectedManagerId<br/>role === 'employee']
    FilterTeamMembers --> MapTeamMembers[メンバーごとに処理<br/>map]

    MapTeamMembers --> FindAttendance[勤怠データ検索<br/>userId + date]
    FindAttendance --> AttendanceExists{勤怠データ<br/>存在?}

    AttendanceExists -->|存在しない| SetAbsent[status = 'absent'<br/>その他 = null or '-']
    AttendanceExists -->|存在する| GetCheckIn[checkIn取得]
    GetCheckIn --> GetCheckOut[checkOut取得]
    GetCheckOut --> CalcWorkingHours[勤務時間計算<br/>workingMinutes → H:mm]
    CalcWorkingHours --> GetStatus[status取得]
    GetStatus --> GetNote[note取得]

    SetAbsent --> BuildRecord[レコード構築<br/>employeeNumber, name<br/>position, checkIn<br/>checkOut, workingHours<br/>status, note]
    GetNote --> BuildRecord

    BuildRecord --> NextMember{次のメンバー?}
    NextMember -->|あり| FindAttendance
    NextMember -->|なし| CalcTeamSummary[チームサマリー計算<br/>computed]

    CalcTeamSummary --> CountTotal[チームメンバー数]
    CountTotal --> CountPresent[正常出勤数<br/>status === 'present']
    CountPresent --> CountLateEarly[遅刻・早退数<br/>status === 'late' or 'early_leave']
    CountLateEarly --> CountAbsent[欠勤数<br/>status === 'absent']
    CountAbsent --> DisplaySummary[サマリーカード表示<br/>- チームメンバー数<br/>- 正常出勤<br/>- 遅刻・早退<br/>- 欠勤]

    DisplaySummary --> DisplayTable[データテーブル表示<br/>v-data-table<br/>チームメンバー勤怠一覧]
    DisplayTable --> Complete([画面表示完了])
    ShowEmptyMessage --> Complete

    style DisplayManagerSelect fill:#fff3e0
    style ShowEmptyMessage fill:#ffecb3
    style DisplaySummary fill:#c8e6c9
    style DisplayTable fill:#e8f5e9
```

## 凡例

- **青色 (fill:#e3f2fd)**: ログイン関連
- **緑色 (fill:#e8f5e9)**: 一般従業員関連
- **オレンジ色 (fill:#fff3e0)**: 管理者関連
- **紫色 (fill:#f3e5f5)**: 共通画面（勤怠一覧）
- **濃緑色 (fill:#c8e6c9)**: 成功・完了処理
- **赤色 (fill:#ffcdd2)**: エラー処理
- **黄色 (fill:#ffecb3)**: 警告・空状態
