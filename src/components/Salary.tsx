import { Fragment, useEffect, useRef, useState } from "react"
import { DeductConfig, PersonInfo, SetPersonConfig, UserAdditionalDeductRichInfo } from "../type"
import { baseUrl } from "../constant"
import { useRequest } from "ahooks"
import dayjs, { Dayjs } from "dayjs"
import Table, { ColumnType } from "antd/es/table"
import { Button, DatePicker, Input, Modal, Popconfirm, Radio, Select, Switch, message } from "antd"
import Tip from "./Tip"
import { CheckOutlined, CloseOutlined, PlusCircleFilled } from "@ant-design/icons"
import NumberInput from "./inputNumber"
import { useWindowSize } from "../App"
import { createPortal } from "react-dom"

const canSetPersonInfoList: { title: string; key: keyof SetPersonConfig }[] = [
    { title: "基本工资", key: "basePay" },
    { title: "通讯补贴", key: "phoneAllowance" },
    { title: "岗位补贴", key: "jobAllowance" },
    { title: "餐补", key: "mealAllowance" },
    { title: "业绩提成", key: "allowance1" },
    { title: "绩效奖金", key: "allowance2" },
    { title: "额外奖金", key: "allowance3" },
    { title: "社保个人费用", key: "socialSecurityCharges" },
    { title: "社保公司扣款", key: "siCompanyDeduct" }
]

async function getDeductOptions() {
    const result = await fetch(`${baseUrl}/additionalDeduct/getAllList`, { method: "POST" })
    if (!result.ok) {
        return []
    }
    const list = await result.json()
    return list.data as DeductConfig[]
}

export default function Salary() {
    const { data: DeductOptions } = useRequest(getDeductOptions)

    const [tableData, setTableData] = useState<PersonInfo[]>([])

    function changeTableDataValue(index: number, key: keyof SetPersonConfig, value: string | number) {
        let result = [...tableData]
        if (batch) {
            result = result.map(it => ({ ...it, [key]: value }))
        } else {
            result[index] = { ...result[index], [key]: value }
        }
        setTableData(result)
    }

    const [windowSize] = useWindowSize()

    const [lastMonth, setLastMonth] = useState<Dayjs | null>(dayjs().subtract(1, "month"))

    const [currentPeople, setCurrentPeople] = useState<PersonInfo | null>(null)

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
            width: 110,
            fixed: "left",
            align: "center",
            title: "姓名",
            render: (c, row) => (
                <div style={{ fontWeight: 700, display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>{c}</div>
                    <img onClick={() => setCurrentPeople(structuredClone(row))} style={{ width: 20, height: 20, marginTop: 2, cursor: "pointer" }} src="/个人所得税.png" alt="" />
                </div>
            )
        },
        {
            dataIndex: "bankCard",
            align: "center",
            width: 220,
            title: "银行账号",
            render: (...rest) => {
                const [state, , index] = rest
                return canChange ? (
                    <Input style={{ width: 200 }} value={state} onChange={e => changeTableDataValue(index, "bankCard", e.target.value ?? 0)} />
                ) : (
                    <Tip>
                        <div style={{ height: 32, lineHeight: "32px" }}>{state ?? "暂无"}</div>
                    </Tip>
                )
            }
        },
        {
            dataIndex: "bankName",
            align: "center",
            width: 220,
            title: "银行名称",
            render: (...rest) => {
                const [state, , index] = rest
                return canChange ? (
                    <Input style={{ width: 200 }} value={state} onChange={e => changeTableDataValue(index, "bankName", e.target.value ?? 0)} />
                ) : (
                    <Tip>
                        <div style={{ height: 32, lineHeight: "32px" }}>{state ?? "暂无"}</div>
                    </Tip>
                )
            }
        },
        {
            dataIndex: "realSalary",
            width: 140,
            align: "center",
            title: "实发工资",
            render: c => <div style={{ fontWeight: 700 }}>{typeof c === "number" ? `${c}元` : "暂未运算"}</div>
        },
        {
            dataIndex: "preRealSalary",
            width: 140,
            align: "center",
            title: "上月实发工资",
            render: c => <div style={{ fontWeight: 700 }}>{typeof c === "number" ? `${c}元` : "暂未运算"}</div>
        },

        {
            dataIndex: "deptName",
            align: "center",
            width: 120,
            title: "部门"
        },
        {
            dataIndex: "logDeductFlag",
            width: 160,
            align: "center",
            title: "日志是否扣款",
            render: (...rest) => {
                const [state, , index] = rest
                return canChange ? (
                    <Radio.Group onChange={e => changeTableDataValue(index, "logDeductFlag", e.target.value)} value={state}>
                        <Radio value={1}>是</Radio>
                        <Radio value={0}>否</Radio>
                    </Radio.Group>
                ) : (
                    <div>{state === 1 ? <CheckOutlined /> : <CloseOutlined />}</div>
                )
            }
        },
        ...canSetPersonInfoList.map(it => {
            return {
                dataIndex: it.key,
                width: 140,
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
            // dataIndex: "leaveDays",
            width: 110,
            align: "center",
            title: "事假",
            render: (_, $) => (
                <div>
                    {$.leaveDays}天/{$.leaveDeduct}元
                </div>
            )
        },
        // {
        //     // dataIndex: "leaveDeduct",
        //     width: 140,
        //     align: "center",
        //     title: "事假扣款",
        //     render: c => <div>{c}元</div>
        // },
        {
            dataIndex: "sickDays",
            width: 110,
            align: "center",
            title: "病假",
            render: (_, $) => (
                <div>
                    {$.sickDays}天/{$.sickDeduct}元
                </div>
            )
        },
        // {
        //     dataIndex: "sickDeduct",
        //     width: 140,
        //     align: "center",
        //     title: "病假扣款",
        //     render: c => <div>{c}元</div>
        // },
        {
            dataIndex: "absenteeismDays",
            width: 110,
            align: "center",
            title: "旷工",
            render: (_, $) => (
                <div>
                    {$.absenteeismDays}天/{$.absenteeismDeduct}元
                </div>
            )
        },
        // {
        //     dataIndex: "absenteeismDeduct",
        //     width: 140,
        //     align: "center",
        //     title: "旷工扣款",
        //     render: c => <div>{c}元</div>
        // },
        {
            dataIndex: "lateTimes",
            width: 110,
            align: "center",
            title: "迟到",
            render: (_, $) => (
                <div>
                    {$.lateTimes}次/{$.lateDeduct}元
                </div>
            )
        },
        // {
        //     dataIndex: "lateDeduct",
        //     width: 140,
        //     align: "center",
        //     title: "迟到扣款",
        //     render: c => <div>{c}元</div>
        // },
        {
            dataIndex: "leaveEarlyTimes",
            width: 110,
            align: "center",
            title: "早退",
            render: (_, $) => (
                <div>
                    {$.leaveEarlyTimes}次/{$.leaveEarlyDeduct}元
                </div>
            )
        },
        // {
        //     dataIndex: "leaveEarlyDeduct",
        //     width: 140,
        //     align: "center",
        //     title: "早退扣款",
        //     render: c => <div>{c}元</div>
        // },
        // {
        //     dataIndex: "leaveEarlyMinute",
        //     width: 140,
        //     align: "center",
        //     title: "早退时长",
        //     render: c => <div>{c}分钟</div>
        // },
        {
            dataIndex: "makingUpLackTimes",
            width: 110,
            align: "center",
            title: "补卡",
            render: c => <div>{c}次</div>
        },
        {
            dataIndex: "onWorkLackCardTimes",
            width: 120,
            align: "center",
            title: "上班缺卡次数",
            render: c => <div>{c}次</div>
        },
        {
            dataIndex: "offWorkLackCardTimes",
            width: 120,
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
            width: 120,
            align: "center",
            title: "严重迟到次数",
            render: c => <div>{c}次</div>
        },
        {
            dataIndex: "seriousLateDeduct",
            width: 120,
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
            width: 110,
            align: "center",
            title: "司龄补贴",
            render: props => {
                return <div>{props}*100元</div>
            }
        },
        {
            dataIndex: "dailyUncommittedQty",
            width: 130,
            align: "center",
            title: "未提交日报天数",
            render: props => {
                return <div>{props}*20元</div>
            }
        },
        {
            dataIndex: "attendanceFlag",
            width: 100,
            align: "center",
            title: "是否全勤",
            render: props => {
                return props === 1 ? <div style={{ color: "green" }}>全勤</div> : <div style={{ color: "red" }}>非全勤</div>
            }
        },
        {
            dataIndex: "attendanceDays",
            width: 120,
            align: "center",
            title: "实际全勤天数",
            render: c => <div>{c}天</div>
        },
        {
            dataIndex: "shouldAttendanceDays",
            width: 110,
            align: "center",
            title: "应全勤天数",
            render: c => <div>{c}天</div>
        },
        {
            dataIndex: "performanceFlag",
            width: 110,
            align: "center",
            title: "打卡绩效",
            render: props => {
                return props === 1 ? <div style={{ color: "green" }}>有绩效</div> : <div style={{ color: "red" }}>无绩效</div>
            }
        },
        {
            dataIndex: "makingUpLackDeduct",
            width: 110,
            align: "center",
            title: "打卡扣款",
            render: c => <div>{c}元</div>
        },
        {
            dataIndex: "individualIncomeTax",
            width: 110,
            align: "center",
            title: "个人所得税",
            render: c => <div>{c}元</div>
        },
        {
            dataIndex: "attendancePay",
            width: 110,
            align: "center",
            title: "全部绩效",
            render: c => <div>{c}元</div>
        },
        {
            dataIndex: "performancePay",
            width: 110,
            align: "center",
            title: "打卡绩效",
            render: c => <div>{c}元</div>
        },
        {
            dataIndex: "laborCost",
            width: 110,
            align: "center",
            title: "用工成本",
            render: c => <div>{c}元</div>
        },
        {
            dataIndex: "shouldSalary",
            width: 140,
            align: "center",
            fixed: "right",
            title: "应发工资",
            render: c => <div style={{ fontWeight: 700 }}>{typeof c === "number" ? `${c}元` : "暂未运算"}</div>
        }
    ]

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

    const downloadRef = useRef<HTMLAnchorElement>(null)

    async function exportExcel() {
        if (!lastMonth) {
            message.warning("未选日期")
            return
        }
        downloadRef.current?.click()
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

    const [batch, setBatch] = useState(false)

    const [canChange, setCanChange] = useState(false)

    const modalColumns: ColumnType<UserAdditionalDeductRichInfo>[] = [
        {
            width: 80,
            align: "center",
            title: "序号",
            render: (_, __, index) => index + 1
        },
        {
            dataIndex: "deductId",
            width: 260,
            align: "center",
            title: "专项附加扣除名称",
            render: (_, $, index) => {
                return (
                    <Select
                        style={{ width: 260 }}
                        value={_}
                        options={DeductOptions?.map(it => ({ label: it.deductName, value: it.id })) ?? []}
                        onChange={e => {
                            const data = [...(currentPeople!.userAdditionalDeductRichInfoList ?? [])]
                            data[index].deductId = e
                            data[index].deductName = DeductOptions?.find(it => it.id === e)!.deductName!
                            setCurrentPeople({ ...currentPeople!, userAdditionalDeductRichInfoList: data })
                        }}
                    ></Select>
                )
            }
        },
        {
            dataIndex: "deductAmount",
            width: 140,
            align: "center",
            title: "专项附加扣除金额",
            render: (_, $, index) => {
                return (
                    <NumberInput
                        value={_}
                        onChange={e => {
                            const data = [...(currentPeople!.userAdditionalDeductRichInfoList ?? [])]
                            data[index].deductAmount = e as number
                            setCurrentPeople({ ...currentPeople!, userAdditionalDeductRichInfoList: data })
                        }}
                        unit={"元"}
                    ></NumberInput>
                )
            }
        },
        {
            width: 120,
            align: "center",
            title: "开始时间",
            render: (_, $, index) => {
                const value = dayjs(`${$.startYear}-${$.startMonth}`)
                const onChange = (e: Dayjs | null) => {
                    const data = [...(currentPeople!.userAdditionalDeductRichInfoList ?? [])]
                    data[index].startYear = e!.year()
                    data[index].startMonth = e!.month() + 1
                    setCurrentPeople({ ...currentPeople!, userAdditionalDeductRichInfoList: data })
                }
                return <DatePicker picker="month" value={value} onChange={onChange} />
            }
        },
        {
            width: 120,
            align: "center",
            title: "结束时间",
            render: (_, $, index) => {
                const value = dayjs(`${$.endYear}-${$.endMonth}`)
                const onChange = (e: Dayjs | null) => {
                    const data = [...(currentPeople!.userAdditionalDeductRichInfoList ?? [])]
                    data[index].endYear = e!.year()
                    data[index].endMonth = e!.month() + 1
                    setCurrentPeople({ ...currentPeople!, userAdditionalDeductRichInfoList: data })
                }
                return <DatePicker picker="month" value={value} onChange={onChange} />
            }
        },
        {
            dataIndex: "remark",
            width: 200,
            align: "center",
            title: "备注",
            render: (_, $, index) => {
                return (
                    <Input
                        value={_}
                        onChange={e => {
                            const data = [...(currentPeople!.userAdditionalDeductRichInfoList ?? [])]
                            data[index].remark = e.target.value
                            setCurrentPeople({ ...currentPeople!, userAdditionalDeductRichInfoList: data })
                        }}
                        placeholder="请输入备注"
                    ></Input>
                )
            }
        },
        {
            width: 120,
            align: "center",
            title: "操作",
            render: (_, $, index) => {
                return (
                    <Popconfirm
                        title="确认删除吗？"
                        onConfirm={() => {
                            const data = [...(currentPeople!.userAdditionalDeductRichInfoList ?? [])]
                            data.splice(index, 1)
                            setCurrentPeople({ ...currentPeople!, userAdditionalDeductRichInfoList: data })
                        }}
                        okText="是"
                        cancelText="否"
                    >
                        <Button type="link" danger>
                            删除
                        </Button>
                    </Popconfirm>
                )
            }
        }
    ]

    return (
        <Fragment>
            <Table loading={loading} columns={columns} dataSource={tableData} scroll={{ x: Math.floor(windowSize.width) - 16, y: Math.floor(windowSize.height) - 60 - 56 - 20 }} rowKey="userId" pagination={false}></Table>

            {!!currentPeople && (
                <Modal
                    title={currentPeople.userName + "个人所得税专项附加扣除详情"}
                    open={true}
                    width={1200}
                    onCancel={() => {
                        setCurrentPeople(null)
                    }}
                    onOk={async () => {
                        const result = await fetch(`${baseUrl}/userAdditionalDeduct/batchUpdate`, {
                            method: "POST",
                            body: JSON.stringify({
                                userId: currentPeople.userId,
                                userAdditionalDeductList: currentPeople.userAdditionalDeductRichInfoList?.map(it => {
                                    return Object.assign({}, it, { id: undefined })
                                })
                            }),
                            headers: {
                                "Content-Type": "application/json"
                            }
                        })
                        if (!result.ok) {
                            message.warning("更新数据失败")
                            return
                        }
                        message.success("更新数据成功")
                        setCurrentPeople(null)
                        getPersonInfo()
                    }}
                >
                    <div className="py-2 flex justify-end">
                        <Button
                            type="primary"
                            icon={<PlusCircleFilled></PlusCircleFilled>}
                            onClick={() =>
                                setCurrentPeople(state => {
                                    const data = [...(state?.userAdditionalDeductRichInfoList ?? [])]
                                    const [endYear, endMonth] = dayjs().format("YYYY-MM").split("-").map(Number)
                                    const [startYear, startMonth] = dayjs().subtract(1, "month").format("YYYY-MM").split("-").map(Number)
                                    data.push({ id: Date.now(), userId: state?.userId!, deductId: DeductOptions?.[0].id ?? null, deductName: DeductOptions?.[0].deductName ?? "", deductAmount: 1000, endMonth, endYear, remark: "", startMonth, startYear })
                                    return { ...state!, userAdditionalDeductRichInfoList: data }
                                })
                            }
                        >
                            新增专项附加扣除
                        </Button>
                    </div>
                    <Table rowKey={"id"} columns={modalColumns} dataSource={currentPeople.userAdditionalDeductRichInfoList ?? []} pagination={false}></Table>
                </Modal>
            )}

            {document.getElementById("filter") &&
                createPortal(
                    <>
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
                        <a ref={downloadRef} href={`${baseUrl}/attendanceInfo/export?reportMonth=${lastMonth?.format("YYYY-MM")}`} style={{ display: "none" }} download={`${lastMonth?.format("YYYY-MM")}格数科技考勤表.xlsx`}></a>
                        <Button className="bg-white" onClick={exportExcel}>
                            导出员工薪资数据
                        </Button>
                        <Button type="primary" onClick={submit}>
                            修改并更新
                        </Button>
                    </>,
                    document.getElementById("filter")!
                )}
        </Fragment>
    )
}
