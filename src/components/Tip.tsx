import { Tooltip } from "antd"
import { CSSProperties, FC, ReactNode } from "react"

export interface TipProps {
    className?: string
    style?: CSSProperties
    color?: string
    title?: string
    children?: ReactNode
    onClick?: () => void
}

const Tip: FC<TipProps> = props => {
    const { className, style, children, color, title, onClick } = props

    return (
        <Tooltip color={color} title={title ?? ""} className={className} style={style}>
            <div className="one-line" onClick={onClick} style={{ cursor: onClick ? "pointer" : "auto" }}>
                {children}
            </div>
        </Tooltip>
    )
}

export default Tip
