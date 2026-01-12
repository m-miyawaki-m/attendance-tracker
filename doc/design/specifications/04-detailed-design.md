# 勤怠管理システム 詳細設計書

## 1. ユーティリティ関数

### 1.1 日時フォーマット

```typescript
// HH:mm形式に変換
const formatTime = (date: Date | string | null): string => {
  if (!date) return '-'
  return new Date(date).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// YYYY-MM-DD形式取得
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0]
}

// YYYY-MM形式取得
const getCurrentMonthString = (): string => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}
```

### 1.2 勤務時間計算

```typescript
// 分を H:mm形式に変換
const formatWorkingHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}:${mins.toString().padStart(2, '0')}`
}

// 出勤・退勤時刻から勤務時間（分）を計算
const calculateWorkingMinutes = (checkIn: Date, checkOut: Date): number => {
  return Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000)
}
```

### 1.3 ステータス設定

```typescript
interface StatusConfig {
  text: string
  color: string
}

const statusConfig: Record<string, StatusConfig> = {
  present: { text: '正常', color: 'success' },
  late: { text: '遅刻', color: 'warning' },
  early_leave: { text: '早退', color: 'info' },
  absent: { text: '欠勤', color: 'error' },
}

const getStatusText = (status: string): string => {
  return statusConfig[status]?.text || status
}

const getStatusColor = (status: string): string => {
  return statusConfig[status]?.color || 'grey'
}
```

### 1.4 位置情報取得

```typescript
const getCurrentPosition = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('位置情報がサポートされていません'))
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}
```

## 2. 計算ロジック

### 2.1 ダッシュボードサマリー計算

```typescript
const summary = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayAttendances = attendances.filter((att) => att.date === today)

  // 今月の総勤務時間
  const currentMonth = getCurrentMonthString()
  const monthlyAttendances = attendances.filter((att) =>
    att.date.startsWith(currentMonth)
  )
  const totalMinutes = monthlyAttendances.reduce(
    (sum, att) => sum + (att.workingMinutes || 0), 0
  )

  return {
    totalEmployees: users.filter((user) => user.role === 'employee').length,
    todayPresent: todayAttendances.filter((att) => att.checkIn !== null).length,
    todayLateEarly: todayAttendances.filter((att) =>
      att.status === 'late' || att.status === 'early_leave'
    ).length,
    monthlyTotalHours: Math.floor(totalMinutes / 60)
  }
})
```

### 2.2 従業員別月次集計

```typescript
const employeeList = computed(() => {
  return users
    .filter((user) => user.role === 'employee')
    .map((user) => {
      const monthAttendances = attendances.filter(
        (att) => att.userId === user.id && att.date.startsWith(selectedMonth)
      )

      const attendanceStatus = {
        present: monthAttendances.filter(att => att.status === 'present').length,
        late: monthAttendances.filter(att => att.status === 'late').length,
        early_leave: monthAttendances.filter(att => att.status === 'early_leave').length,
        absent: monthAttendances.filter(att => att.status === 'absent').length,
      }

      return { ...user, attendanceStatus }
    })
})
```

### 2.3 チームメンバー取得

```typescript
const teamAttendanceList = computed(() => {
  if (!selectedManagerId) return []

  // 選択した主任の配下メンバーを取得
  const teamMembers = users.filter(
    (user) => user.managerId === selectedManagerId && user.role === 'employee'
  )

  return teamMembers.map((user) => {
    const attendance = attendances.find(
      (att) => att.userId === user.id && att.date === selectedDate
    )

    let workingHours = '-'
    if (attendance?.workingMinutes) {
      workingHours = formatWorkingHours(attendance.workingMinutes)
    }

    return {
      employeeNumber: user.employeeNumber || '-',
      name: user.name,
      position: user.position,
      checkIn: attendance?.checkIn || null,
      checkOut: attendance?.checkOut || null,
      workingHours,
      note: attendance?.note || '',
      status: attendance ? attendance.status : 'absent',
    }
  })
})
```

## 3. グラフ設定

### 3.1 月次出勤率推移（折れ線グラフ）

```typescript
const attendanceRateOptions = {
  chart: {
    type: 'line',
    height: 350
  },
  xaxis: {
    categories: ['8月', '9月', '10月', '11月', '12月', '1月']
  },
  yaxis: {
    min: 0,
    max: 100,
    title: { text: '出勤率 (%)' }
  },
  stroke: {
    curve: 'smooth'
  }
}

const attendanceRateSeries = [{
  name: '出勤率',
  data: [95, 92, 98, 94, 96, 93]
}]
```

### 3.2 部署別平均勤務時間（棒グラフ）

```typescript
const departmentHoursOptions = {
  chart: {
    type: 'bar',
    height: 350
  },
  xaxis: {
    categories: ['営業部', '開発部', '総務部']
  },
  yaxis: {
    title: { text: '平均勤務時間 (時間)' }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%'
    }
  }
}

const departmentHoursSeries = [{
  name: '平均勤務時間',
  data: [8.2, 9.1, 7.8]
}]
```

### 3.3 遅刻・早退推移（複数折れ線グラフ）

```typescript
const lateTrendOptions = {
  chart: {
    type: 'line',
    height: 350
  },
  xaxis: {
    categories: ['8月', '9月', '10月', '11月', '12月', '1月']
  },
  stroke: {
    curve: 'smooth'
  },
  legend: {
    position: 'top'
  }
}

const lateTrendSeries = [
  { name: '遅刻', data: [3, 5, 2, 4, 3, 6] },
  { name: '早退', data: [2, 1, 3, 2, 4, 2] }
]
```

### 3.4 当日出勤状況（ドーナツグラフ）

```typescript
const todayStatusOptions = {
  chart: {
    type: 'donut',
    height: 350
  },
  labels: ['出勤', '欠勤'],
  colors: ['#4CAF50', '#F44336'],
  legend: {
    position: 'bottom'
  }
}

const todayStatusSeries = [8, 2] // 出勤8名、欠勤2名
```

## 4. テストデータ仕様

### 4.1 組織階層

```
管理者 (admin@example.com)
├── 営業部主任: 鈴木一郎 (user03)
│   ├── 山田太郎 (user01)
│   └── 中村誠 (user08)
├── 開発部主任: 伊藤直樹 (user06)
│   ├── 佐藤花子 (user02)
│   └── 高橋健太 (user05)
└── 総務部主任: 渡辺優子 (user07)
    ├── 田中美咲 (user04)
    └── 小林麻衣 (user09)
```

### 4.2 テストアカウント

| メールアドレス | パスワード | 役割 | 名前 |
|---------------|-----------|------|------|
| admin@example.com | adminadmin | 管理者 | 管理者 |
| user01@example.com | user01 | 一般 | 山田太郎 |
| user02@example.com | password123 | 一般 | 佐藤花子 |
| user03@example.com | password123 | 主任 | 鈴木一郎 |
| ... | password123 | 一般 | ... |
| user20@example.com | password123 | 一般 | テスト20 |

### 4.3 勤怠データ仕様

| フィールド | 値の範囲 |
|-----------|---------|
| date | 過去30日間 |
| checkIn | 8:30〜9:30（ランダム） |
| checkOut | 17:30〜19:00（ランダム） |
| status | present(70%), late(15%), early_leave(10%), absent(5%) |
| workingMinutes | checkIn/checkOutから計算 |

## 5. セキュリティ設計

### 5.1 認証フロー

```
1. ユーザーがログイン情報を入力
2. Firebase Authenticationで認証
3. 認証成功 → Firestoreからユーザー情報取得
4. Piniaストアに保存
5. 役割に応じたページへリダイレクト
```

### 5.2 認可ルール

| リソース | 一般従業員 | 管理者 |
|---------|-----------|--------|
| 自身の勤怠 | 読み取り/書き込み | 読み取り/書き込み |
| 他者の勤怠 | 読み取りのみ | 読み取り/書き込み |
| ユーザー情報 | 自身のみ | 全員 |
| ダッシュボード | - | アクセス可 |

### 5.3 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーコレクション
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId ||
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // 勤怠コレクション
    match /attendances/{attendanceId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null &&
                               (resource.data.userId == request.auth.uid ||
                                get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

### 5.4 位置情報の取り扱い

| 項目 | 対応 |
|------|------|
| 取得 | ユーザー許可が必要 |
| 保存 | 緯度・経度・精度のみ |
| 表示 | 管理者のみ閲覧可能 |
| エラー | 取得失敗時は位置情報なしで記録 |

## 6. テスト方針

### 6.1 ユニットテスト

| 対象 | テスト内容 |
|------|-----------|
| ユーティリティ関数 | フォーマット、計算ロジック |
| Piniaストア | アクション、ゲッター |
| コンポーネント | レンダリング、イベント |

### 6.2 テストツール

| ツール | 用途 |
|--------|------|
| Vitest | テストランナー |
| Vue Test Utils | コンポーネントテスト |
| @vitest/ui | テストUI |

### 6.3 テストコマンド

```bash
npm run test:unit        # テスト実行
npm run test:unit:ui     # UIでテスト実行
npm run test:coverage    # カバレッジレポート
```

### 6.4 カバレッジ目標

| カテゴリ | 目標 |
|---------|------|
| ユーティリティ | 90%以上 |
| ストア | 80%以上 |
| コンポーネント | 70%以上 |

## 7. 開発・運用

### 7.1 開発コマンド

```bash
npm run dev              # 開発サーバー起動
npm run build            # プロダクションビルド
npm run preview          # ビルドプレビュー
npm run type-check       # TypeScript型チェック
npm run lint             # ESLint実行
npm run format           # Prettier実行
```

### 7.2 Firebase Emulatorコマンド

```bash
npm run firebase:emulators        # Emulator起動
npm run seed:emulator             # テストデータ生成
npm run firebase:emulators:export # データ保存
npm run firebase:emulators:import # データ復元
```

### 7.3 データ移行コマンド

```bash
npm run export:production         # 本番データエクスポート
npm run seed:emulator:from-export # 本番データをEmulatorへ
npm run export:emulator           # Emulatorデータエクスポート
npm run upload:to-production      # Emulatorデータを本番へ
```

## 8. 関連ドキュメント

- [要件定義書](./01-requirements.md)
- [システム概要設計書](./02-overview.md)
- [基本設計書](./03-basic-design.md)
- [コンポーネントツリー](../diagrams/component-tree.md)
- [画面遷移図](../diagrams/screen-transition/flowchart.md)
- [開発フロー](../../development/DEVELOPMENT_FLOW.md)
- [Firebase Emulatorセットアップ](../../development/FIREBASE_EMULATOR_SETUP.md)
