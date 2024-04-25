export type UserAdditionalDeductRichInfo = {
    /** id */
    id?: number
    /** 员工id */
    userId: string
    /** 专项附加扣除id */
    deductId: number | null
    /** 专项附件扣除金额 */
    deductAmount: number
    /** 开始年份 */
    startYear: number
    /** 开始月份 */
    startMonth: number
    /** 结束年份 */
    endYear: number
    /** 结束月份 */
    endMonth: number
    /** 备注 */
    remark: string
    /** 专项附加扣除名称 */
    deductName: string
}

export type DeductConfig = {
    id: number
    deductName: string
}

export type PersonInfo = {
    /**用户名 */
    userName: string
    /**部门名称 */
    deptName: string
    /**司龄 */
    serviceYear: number
    /**用户id */
    userId: string
    /**事假天数 */
    leaveDays: number
    /**病假天数 */
    sickDays: number
    /**旷工天数 */
    absenteeismDays: number
    /** 迟到次数*/
    lateTimes: number
    /**早退次数 */
    leaveEarlyTimes: number
    /**早退时长 min */
    leaveEarlyMinute: number
    /**申请补卡次数 */
    makingUpLackTimes: number
    /**上班缺卡次数 */
    onWorkLackCardTimes: number
    /**下班缺卡次数 */
    offWorkLackCardTimes: number
    /**严重迟到时长 */
    seriousLateMinute: number
    /**严重迟到次数 */
    seriousLateTimes: number
    /**迟到时长 */
    lateMinute: number
    /**全勤标志：1：全勤；0：非全勤 */
    attendanceFlag: number
    /**应出勤天数 */
    shouldAttendanceDays: number
    /**实际出勤天数 */
    attendanceDays: number
    /**打卡绩效：1：有绩效；0：无绩效 */
    performanceFlag: number
    /**个人所得税 */
    individualIncomeTax: number
    /**统计月份：例如 2023-08 */
    reportMonth: string
    /**应发工资 */
    shouldSalary: number | null
    /**实发工资 */
    alary: number | null
    /**事假扣款 */
    leaveDeduct: number
    /**病假扣款 */
    sickDeduct: number
    /**旷工扣款 */
    absenteeismDeduct: number
    /**迟到扣款 */
    lateDeduct: number
    /**早退扣款 */
    leaveEarlyDeduct: number
    /**严重迟到扣款 */
    seriousLateDeduct: number
    /**打卡扣款 */
    makingUpLackDeduct: number
    /**全勤绩效 */
    attendancePay: number
    /**打卡绩效 */
    performancePay: number
    /** 上个月工资 */
    preRealSalary: number
    /** 未提交日报天数 */
    dailyUncommittedQty: number
    /** 用工成本 */
    laborCost: number
    /** 银行名称 */
    banKName: string
    /** 银行卡号 */
    bankCard: string
    /** 社保公司部分扣款 */
    siCompanyDeduct: number
    /** 日志是否扣款 1打勾 */
    logDeductFlag: 0 | 1
    /** 专项附加扣除详情 */
    userAdditionalDeductRichInfoList: UserAdditionalDeductRichInfo[] | null
} & SetPersonConfig

export type SetPersonConfig = {
    /**基本工资 */
    basePay: number
    /**通讯补贴 */
    phoneAllowance: number
    /**岗位补贴 */
    jobAllowance: number
    /**餐补 */
    mealAllowance: number
    /**补贴1 */
    allowance1: number
    /**补贴2 */
    allowance2: number
    /**补贴3 */
    allowance3: number
    /**社保费用（个人部分） */
    siPersonDeduct: number
    /** 银行名称 */
    bankName: string
    /** 银行卡号 */
    bankCard: string
    /** 社保公司部分扣款 */
    siCompanyDeduct: number
    /** 日志是否扣款 1打勾 */
    logDeductFlag: 0 | 1
}

export type Mode = "salary" | "bonus"

export type PeopleConfig = {
    id: string
    userName: string
}

export type BonusConfig = {
    id?: number
    userName: string
    /** 金额 */
    amount: number
    userId: string
    /** 税额 */
    taxAmount: number | null
    remark: string
    createTime: number
    updateTime: number
}
