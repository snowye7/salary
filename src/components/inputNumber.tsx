import { InputNumber, InputNumberProps } from "antd"

export interface NumberInputProps {
    AntInput?: Omit<InputNumberProps, "value" | "onChange" | "min" | "addonAfter" | "controls">
    value?: number
    onChange?: (value: string | number | null) => void
    unit: string
    controls?: boolean
    style?: React.CSSProperties
}

export default function NumberInput(props: NumberInputProps) {
    const { AntInput, value, onChange, unit, controls, style } = props
    return <InputNumber style={style} className="h-[32px]" {...AntInput} min={0} addonAfter={unit} value={value} onChange={onChange} controls={!!controls}></InputNumber>
}
