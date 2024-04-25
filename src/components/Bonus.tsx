import { useRequest } from "ahooks"
import { Fragment, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { BonusConfig, PeopleConfig } from "../type"
import { baseUrl } from "../constant"
import { Button, Form, Input, Modal, Popconfirm, Select, message } from "antd"
import Table, { ColumnType } from "antd/es/table"
import { useWindowSize } from "../App"
import { FormInstance, useForm } from "antd/es/form/Form"
import NumberInput from "./inputNumber"
import dayjs from "dayjs"

async function getPeopleOptions() {
    const result = await fetch(`${baseUrl}/userInfo/getList`, { method: "POST" })
    if (!result.ok) {
        return []
    }
    const list = await result.json()
    if (!list.success) {
        message.warning(list.message)
        return []
    }
    return list.data as PeopleConfig[]
}

function parseDate(dateString: string) {
    const date = new Date(
        Date.UTC(
            parseInt(dateString.substring(0, 4)), // 年份
            parseInt(dateString.substring(5, 7)) - 1, // 月份（注意 JavaScript 的月份从 0 开始）
            parseInt(dateString.substring(8, 10)), // 日
            parseInt(dateString.substring(11, 13)), // 小时
            parseInt(dateString.substring(14, 16)), // 分钟
            parseInt(dateString.substring(17, 19)), // 秒
            parseInt(dateString.substring(20, 23)) // 毫秒
        )
    )
    return date
}

export default function Bonus() {
    const { data: PeopleOptions } = useRequest(getPeopleOptions)

    const [windowSize] = useWindowSize()

    async function getBonus() {
        const result = await fetch(`${baseUrl}/bonus/getList`, {
            method: "POST",
            body: JSON.stringify({ userId: bonusPeople ?? void 0 }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (!result.ok) {
            message.warning("获取奖金数据失败")
            return []
        }
        const resultData = await result.json()
        if (!resultData.success) {
            message.warning(resultData.message)
            return []
        }
        return (resultData.data ?? []) as BonusConfig[]
    }

    const [bonusPeople, setBonusPeople] = useState<string | null>(null)

    const { data: bonusData, loading, run } = useRequest(getBonus, { refreshDeps: [bonusPeople] })

    const bonusColumns: ColumnType<BonusConfig>[] = [
        {
            title: "序号",
            width: 60,
            align: "center",
            render: (_, __, index) => index + 1
        },
        {
            dataIndex: "userName",
            width: 110,
            align: "center",
            title: "姓名"
        },
        {
            dataIndex: "amount",
            width: 140,
            align: "center",
            title: "金额",
            render: c => <div>{c}元</div>
        },
        {
            dataIndex: "taxAmount",
            width: 140,
            align: "center",
            title: "税额",
            render: c => <div>{c}元</div>
        },
        {
            dataIndex: "remark",
            width: 140,
            align: "center",
            title: "备注",
            render: c => <div>{c}</div>
        },
        {
            width: 140,
            align: "center",
            title: "创建时间",
            render: (_, $) => <div>{dayjs($.createTime).format("YYYY-MM-DD HH:mm:ss")}</div>
        },
        {
            width: 140,
            align: "center",
            title: "更新时间",
            render: (_, $) => <div>{dayjs($.updateTime).format("YYYY-MM-DD HH:mm:ss")}</div>
        },
        {
            width: 100,
            align: "center",
            title: "操作",
            render: (_, $) => {
                return (
                    <div className="flex gap-2 justify-center">
                        <Button
                            type="link"
                            onClick={() => {
                                updateRef.current = $
                                setHandleType("update")
                                form.setFieldsValue({
                                    userId: $.userId,
                                    amount: $.amount,
                                    remark: $.remark
                                })
                            }}
                        >
                            编辑
                        </Button>
                        <Popconfirm
                            title="确认删除吗？"
                            onConfirm={async () => {
                                const result = await fetch(`${baseUrl}/bonus/delete/${$.id}`)
                                if (!result.ok) {
                                    message.warning("删除失败")
                                    return
                                }
                                const data = await result.json()
                                if (!data.success) {
                                    message.warning(data.message)
                                    return
                                }
                                message.success("删除成功")
                                run()
                            }}
                            okText="是"
                            cancelText="否"
                        >
                            <Button type="link" danger>
                                删除
                            </Button>
                        </Popconfirm>
                    </div>
                )
            }
        }
    ]

    const [handleType, setHandleType] = useState<"add" | "update" | null>(null)

    const [form] = useForm<BonusConfig>()

    const updateRef = useRef<null | BonusConfig>(null)

    async function handleSubmit() {
        const { userId, amount, remark } = form.getFieldsValue()
        if (handleType === "add") {
            const result = await fetch(`${baseUrl}/bonus/insert`, {
                method: "POST",
                body: JSON.stringify({ userId, amount, remark }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (!result.ok) {
                message.warning("新增失败")
                return
            }
            const data = await result.json()
            if (!data.success) {
                message.warning(data.message)
                return
            }
            message.success("新增成功")
            run()
            setHandleType(null)
            form.resetFields()
            return
        }
        const result = await fetch(`${baseUrl}/bonus/update`, {
            method: "POST",
            body: JSON.stringify({ id: updateRef.current?.id!, userId, amount, remark }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (!result.ok) {
            message.warning("修改失败")
            return
        }
        const data = await result.json()
        if (!data.success) {
            message.warning(data.message)
            return
        }
        message.success("修改成功")
        run()
        setHandleType(null)
        form.resetFields()
    }

    return (
        <Fragment>
            {document.getElementById("filter") &&
                createPortal(
                    <>
                        <Select className="w-[200px]" placeholder="请选择人员" allowClear value={bonusPeople} onChange={setBonusPeople} options={PeopleOptions?.map(it => ({ label: it.userName, value: it.id }))}></Select>
                        <Button onClick={() => setHandleType("add")}>新增人员奖金</Button>
                    </>,
                    document.getElementById("filter")!
                )}

            <Table loading={loading} columns={bonusColumns} dataSource={bonusData} scroll={{ y: Math.floor(windowSize.height) - 60 - 56 - 20 }} rowKey="id" pagination={false}></Table>

            {!!handleType && (
                <Modal open={true} title={handleType === "update" ? "修改" : "新增" + "奖金"} footer={null} onCancel={() => setHandleType(null)}>
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Form.Item name="userId" label="姓名" required rules={[{ message: "姓名不能为空", required: true }]}>
                            <Select placeholder="请选择人员" allowClear options={PeopleOptions?.map(it => ({ label: it.userName, value: it.id }))}></Select>
                        </Form.Item>
                        <Form.Item name="amount" label="奖金" required rules={[{ message: "奖金金额不能为空", required: true }]}>
                            <NumberInput unit={"元"} AntInput={{ placeholder: "请输入奖金金额" }}></NumberInput>
                        </Form.Item>
                        <Form.Item name="remark" label="备注">
                            <Input.TextArea placeholder="请输入备注"></Input.TextArea>
                        </Form.Item>
                        <div className="flex justify-end gap-3">
                            <Button onClick={() => setHandleType(null)}>取消</Button>
                            <Button htmlType="submit" type="primary">
                                确定
                            </Button>
                        </div>
                    </Form>
                </Modal>
            )}
        </Fragment>
    )
}
