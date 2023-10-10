import { Button, DatePicker, Switch, Table, message } from "antd"
import { ColumnType } from "antd/es/table"
import dayjs from "dayjs"
import { Fragment, useEffect, useState } from "react"
import "./App.css"
import NumberInput from "./components/inputNumber"
import { baseUrl } from "./constant"

interface PersonInfo extends SetPersonConfig {
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
    realSalary: number | null
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
}

interface SetPersonConfig {
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
    socialSecurityCharges: number
}

const canSetPersonInfoList: { title: string; key: keyof SetPersonConfig }[] = [
    { title: "基本工资", key: "basePay" },
    { title: "通讯补贴", key: "phoneAllowance" },
    { title: "岗位补贴", key: "jobAllowance" },
    { title: "餐补", key: "mealAllowance" },
    { title: "业绩提成", key: "allowance1" },
    { title: "绩效奖金", key: "allowance2" },
    { title: "额外奖金", key: "allowance3" },
    { title: "社保个人费用", key: "socialSecurityCharges" }
]

function App() {
    const [tableData, setTableData] = useState<PersonInfo[]>([])

    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })

    function changeTableDataValue(index: number, key: keyof SetPersonConfig, value: string | number) {
        let result = [...tableData]
        if (batch) {
            result = result.map(it => ({ ...it, [key]: value }))
        } else {
            result[index] = { ...result[index], [key]: value }
        }
        setTableData(result)
    }

    const [lastMonth, setLastMonth] = useState<dayjs.Dayjs | null>(dayjs().subtract(1, "month"))

    // function shouldgetSalary(props:PersonInfo){
    //     const {basePay,jobAllowance,phoneAllowance,mealAllowance,leaveDays} = props
    // }

    const columns: ColumnType<PersonInfo>[] = [
        {
            title: "序号",
            fixed: "left",
            width: 60,
            align: "center",
            render: (...rest) => {
                const [, , index] = rest
                return index + 1
            }
        },
        {
            dataIndex: "userName",
            width: 80,
            fixed: "left",
            align: "center",
            title: "姓名",
            render: c => <div style={{ fontWeight: 700 }}>{c}</div>
        },
        {
            dataIndex: "deptName",
            fixed: "left",
            align: "center",
            width: 120,
            title: "部门"
        },
        ...canSetPersonInfoList.map(it => {
            return {
                dataIndex: it.key,
                width: 160,
                align: "center",
                title: it.title,
                render: (...rest) => {
                    const [props, , index] = rest
                    return canChange ? (
                        <NumberInput unit={it.key === "mealAllowance" ? "元/天" : "元"} value={props as number} onChange={e => changeTableDataValue(index, it.key, e ?? 0)} />
                    ) : (
                        <div style={{ height: 32, lineHeight: "32px" }}>
                            {props ?? 0}
                            {it.key === "mealAllowance" ? "元/天" : "元"}
                        </div>
                    )
                }
            } as ColumnType<PersonInfo>
        }),
        {
            dataIndex: "leaveDays",
            width: 140,
            align: "center",
            title: "事假天数",
            render: c => <div>{c}天</div>
        },
        {
            dataIndex: "leaveDeduct",
            width: 140,
            align: "center",
            title: "事假扣款",
            render: c => <div>{c}元</div>
        },
        {
            dataIndex: "sickDays",
            width: 140,
            align: "center",
            title: "病假天数",
            render: c => <div>{c}天</div>
        },
        {
            dataIndex: "sickDeduct",
            width: 140,
            align: "center",
            title: "病假扣款",
            render: c => <div>{c}元</div>
        },
        {
            dataIndex: "absenteeismDays",
            width: 140,
            align: "center",
            title: "旷工天数",
            render: c => <div>{c}天</div>
        },
        {
            dataIndex: "absenteeismDeduct",
            width: 140,
            align: "center",
            title: "旷工扣款",
            render: c => <div>{c}元</div>
        },
        {
            dataIndex: "lateTimes",
            width: 140,
            align: "center",
            title: "迟到次数",
            render: c => <div>{c}次</div>
        },
        {
            dataIndex: "lateDeduct",
            width: 140,
            align: "center",
            title: "迟到扣款",
            render: c => <div>{c}元</div>
        },
        {
            dataIndex: "leaveEarlyTimes",
            width: 140,
            align: "center",
            title: "早退次数",
            render: c => <div>{c}次</div>
        },
        {
            dataIndex: "leaveEarlyDeduct",
            width: 140,
            align: "center",
            title: "早退扣款",
            render: c => <div>{c}元</div>
        },
        // {
        //     dataIndex: "leaveEarlyMinute",
        //     width: 140,
        //     align: "center",
        //     title: "早退时长",
        //     render: c => <div>{c}分钟</div>
        // },
        {
            dataIndex: "makingUpLackTimes",
            width: 140,
            align: "center",
            title: "补卡次数",
            render: c => <div>{c}次</div>
        },
        {
            dataIndex: "onWorkLackCardTimes",
            width: 160,
            align: "center",
            title: "上班缺卡次数",
            render: c => <div>{c}次</div>
        },
        {
            dataIndex: "offWorkLackCardTimes",
            width: 160,
            align: "center",
            title: "下班缺卡次数",
            render: c => <div>{c}次</div>
        },
        // {
        //     dataIndex: "seriousLateMinute",
        //     width: 160,
        //     align: "center",
        //     title: "严重迟到时长",
        //     render: c => <div>{c}分钟</div>
        // },
        {
            dataIndex: "seriousLateTimes",
            width: 160,
            align: "center",
            title: "严重迟到次数",
            render: c => <div>{c}次</div>
        },
        {
            dataIndex: "seriousLateDeduct",
            width: 160,
            align: "center",
            title: "严重迟到扣款",
            render: c => <div>{c}元</div>
        },
        // {
        //     dataIndex: "lateMinute",
        //     width: 140,
        //     align: "center",
        //     title: "迟到时长",
        //     render: c => <div>{c}分钟</div>
        // },
        {
            dataIndex: "serviceYear",
            width: 140,
            align: "center",
            title: "司龄补贴",
            render: props => {
                return <div>{props}*100元</div>
            }
        },
        {
            dataIndex: "attendanceFlag",
            width: 140,
            align: "center",
            title: "是否全勤",
            render: props => {
                return props === 1 ? <div style={{ color: "green" }}>全勤</div> : <div style={{ color: "red" }}>非全勤</div>
            }
        },
        {
            dataIndex: "attendanceDays",
            width: 160,
            align: "center",
            title: "实际全勤天数",
            render: c => <div>{c}天</div>
        },
        {
            dataIndex: "shouldAttendanceDays",
            width: 140,
            align: "center",
            title: "应全勤天数",
            render: c => <div>{c}天</div>
        },
        {
            dataIndex: "performanceFlag",
            width: 140,
            align: "center",
            title: "打卡绩效",
            render: props => {
                return props === 1 ? <div style={{ color: "green" }}>有绩效</div> : <div style={{ color: "red" }}>无绩效</div>
            }
        },
        {
            dataIndex: "makingUpLackDeduct",
            width: 140,
            align: "center",
            title: "打卡扣款",
            render: c => <div>{c}元</div>
        },
        {
            dataIndex: "individualIncomeTax",
            width: 120,
            align: "center",
            title: "个人所得税",
            render: c => <div>{c}元</div>
        },
        {
            dataIndex: "attendancePay",
            width: 120,
            align: "center",
            title: "全部绩效",
            render: c => <div>{c}元</div>
        },
        {
            dataIndex: "performancePay",
            width: 120,
            align: "center",
            title: "打卡绩效",
            render: c => <div>{c}元</div>
        },
        {
            dataIndex: "shouldSalary",
            width: 140,
            align: "center",
            fixed: "right",
            title: "应发工资",
            render: c => <div style={{ fontWeight: 700 }}>{c ? `${c}元` : "暂未运算"}</div>
        },
        {
            dataIndex: "preRealSalary",
            width: 140,
            align: "center",
            fixed: "right",
            title: "上月实发工资",
            render: c => <div style={{ fontWeight: 700 }}>{c ? `${c}元` : "暂未运算"}</div>
        },
        {
            dataIndex: "realSalary",
            width: 140,
            align: "center",
            fixed: "right",
            title: "实发工资",
            render: c => <div style={{ fontWeight: 700 }}>{c ? `${c}元` : "暂未运算"}</div>
        }
    ]

    useEffect(() => {
        function changeResize() {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        }
        window.addEventListener("resize", changeResize)
        return () => window.removeEventListener("resize", changeResize)
    }, [])

    const [loading, setLoading] = useState(true)

    async function submit() {
        setLoading(true)
        const result = await fetch(`${baseUrl}/attendanceInfo/calculate`, {
            method: "POST",
            body: JSON.stringify(tableData),
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (!result.ok) {
            message.warning("更新数据失败")
            setLoading(false)
            return
        }
        message.success("更新数据成功")
        getPersonInfo()
    }

    async function exportExcel() {
        if (!lastMonth) {
            message.warning("未选日期")
            return
        }
        const result = await fetch(`${baseUrl}/attendanceInfo/export?reportMonth=${lastMonth.format("YYYY-MM")}`, { method: "GET" })
        const resultBlob = await result.blob()
        const a = document.createElement("a")
        a.style.display = "none"
        a.download = `${lastMonth.format("YYYY-MM")}数科技员工工资考勤表.xlsx`
        a.href = URL.createObjectURL(resultBlob)
        a.click()
        a.remove()
    }

    async function getPersonInfo() {
        if (!lastMonth) {
            message.warning("未选日期")
            return
        }
        setLoading(true)
        const result = await fetch(`${baseUrl}/attendanceInfo/list?reportMonth=${lastMonth.format("YYYY-MM")}`, { method: "GET" })
        setLoading(false)
        if (!result.ok) {
            message.warning("获取数据失败")
            setTableData([])
            return
        }
        const resultData = await result.json()
        setTableData((resultData.data ?? []) as PersonInfo[])
    }

    useEffect(() => {
        getPersonInfo()
    }, [lastMonth])

    const [batch, setBatch] = useState(false)

    const [canChange, setCanChange] = useState(false)

    async function changePerson() {
        message.loading("正在获取钉钉人员考勤数据...", 0)
        const result = await fetch(`${baseUrl}/attendanceInfo/pull`, { method: "GET" })
        message.destroy()
        if (!result.ok) {
            message.warning("拉取上个月人员和考勤信息失败")
            return
        }
        getPersonInfo()
    }

    return (
        <Fragment>
            <main className="px-4" style={{ width: "100vw", height: "100vh" }}>
                <div className="flex h-14 justify-between items-center">
                    <div className="flex gap-1 items-center">
                        <img src="/logo.png" alt="" width={40} />
                        <div style={{ lineHeight: "40px", fontSize: 20 }}>江苏格数科技智能薪酬管理平台</div>
                    </div>
                    <div className="flex gap-8 footer items-center">
                        <DatePicker picker="month" value={lastMonth} onChange={setLastMonth} />
                        <div className="flex items-center">
                            <div>修改：</div>
                            <Switch checked={canChange} onChange={setCanChange} />
                        </div>
                        <div className="flex items-center">
                            <div>批量修改：</div>
                            <Switch checked={batch} onChange={setBatch} />
                        </div>
                        <Button className="bg-white" onClick={changePerson}>
                            拉取上个月人员和考勤信息
                        </Button>
                        <Button className="bg-white" onClick={exportExcel}>
                            导出员工薪资数据
                        </Button>
                        <Button type="primary" onClick={submit}>
                            修改并更新
                        </Button>
                    </div>
                </div>
                <Table loading={loading} columns={columns} dataSource={tableData} scroll={{ x: Math.floor(windowSize.width) - 16, y: Math.floor(windowSize.height) - 60 - 56 - 20 }} rowKey="userId" pagination={false}></Table>
            </main>
        </Fragment>
    )
}

export default App
