// tests/unit/data/mockData.spec.ts
import { describe, it, expect } from 'vitest'
import {
  mockUsers,
  mockAttendances,
  mockChartData,
  mockSummary,
  statusConfig,
  departments,
} from '@/data/mockData'

describe('Mock Data', () => {
  describe('mockUsers', () => {
    it('正しい数のユーザーが存在する', () => {
      expect(mockUsers).toHaveLength(21)
    })

    it('管理者ユーザーが存在する', () => {
      const admin = mockUsers.find((u) => u.role === 'admin')
      expect(admin).toBeDefined()
      expect(admin?.email).toBe('admin@example.com')
    })

    it('一般従業員が存在する', () => {
      const employees = mockUsers.filter((u) => u.role === 'employee')
      expect(employees.length).toBeGreaterThan(0)
    })

    it('全てのユーザーに必須フィールドが存在する', () => {
      mockUsers.forEach((user) => {
        expect(user.id).toBeTruthy()
        expect(user.name).toBeTruthy()
        expect(user.email).toBeTruthy()
        expect(user.role).toBeTruthy()
        expect(user.department).toBeTruthy()
      })
    })
  })

  describe('mockAttendances', () => {
    it('打刻データが存在する', () => {
      expect(mockAttendances.length).toBeGreaterThan(0)
    })

    it('全ての打刻データに必須フィールドが存在する', () => {
      mockAttendances.forEach((att) => {
        expect(att.id).toBeTruthy()
        expect(att.userId).toBeTruthy()
        expect(att.date).toBeTruthy()
        expect(att.checkIn).toBeInstanceOf(Date)
        expect(att.checkInLocation).toBeDefined()
        expect(att.status).toBeTruthy()
      })
    })

    it('位置情報が正しい形式である', () => {
      mockAttendances.forEach((att) => {
        expect(att.checkInLocation.latitude).toBeTypeOf('number')
        expect(att.checkInLocation.longitude).toBeTypeOf('number')
        expect(att.checkInLocation.accuracy).toBeTypeOf('number')
      })
    })

    it('退勤済みの打刻データは退勤情報を持つ', () => {
      const checkedOut = mockAttendances.filter((att) => att.checkOut !== null)
      checkedOut.forEach((att) => {
        expect(att.checkOut).toBeInstanceOf(Date)
        expect(att.checkOutLocation).toBeDefined()
        expect(att.workingMinutes).toBeGreaterThan(0)
      })
    })
  })

  describe('mockChartData', () => {
    it('出勤率データが存在する', () => {
      expect(mockChartData.attendanceRate.categories).toHaveLength(6)
      expect(mockChartData.attendanceRate.series).toHaveLength(1)
      expect(mockChartData.attendanceRate.series[0].data).toHaveLength(6)
    })

    it('平均勤務時間データが存在する', () => {
      expect(mockChartData.averageWorkHours.categories.length).toBeGreaterThan(0)
      expect(mockChartData.averageWorkHours.series).toHaveLength(1)
    })

    it('遅刻・早退データが存在する', () => {
      expect(mockChartData.lateEarlyLeave.categories).toHaveLength(3)
      expect(mockChartData.lateEarlyLeave.series).toHaveLength(2)
    })

    it('部署別出勤状況データが存在する', () => {
      expect(mockChartData.departmentStatus.labels).toHaveLength(2)
      expect(mockChartData.departmentStatus.series).toHaveLength(2)
    })
  })

  describe('mockSummary', () => {
    it('サマリーデータが正しい型である', () => {
      expect(mockSummary.todayAttendanceRate).toBeTypeOf('number')
      expect(mockSummary.averageWorkHours).toBeTypeOf('number')
      expect(mockSummary.todayLateCount).toBeTypeOf('number')
      expect(mockSummary.todayEarlyLeaveCount).toBeTypeOf('number')
    })

    it('出勤率が0-100の範囲内である', () => {
      expect(mockSummary.todayAttendanceRate).toBeGreaterThanOrEqual(0)
      expect(mockSummary.todayAttendanceRate).toBeLessThanOrEqual(100)
    })
  })

  describe('statusConfig', () => {
    it('全てのステータスが定義されている', () => {
      expect(statusConfig.present).toBeDefined()
      expect(statusConfig.late).toBeDefined()
      expect(statusConfig.early_leave).toBeDefined()
      expect(statusConfig.absent).toBeDefined()
    })

    it('各ステータスにテキストとカラーが存在する', () => {
      Object.values(statusConfig).forEach((config) => {
        expect(config.text).toBeTruthy()
        expect(config.color).toBeTruthy()
      })
    })
  })

  describe('departments', () => {
    it('部署リストが存在する', () => {
      expect(departments.length).toBeGreaterThan(0)
    })

    it('全ての部署が文字列である', () => {
      departments.forEach((dept) => {
        expect(dept).toBeTypeOf('string')
      })
    })
  })
})
