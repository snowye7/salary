import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { ConfigProvider } from "antd"
import zhCN from "antd/locale/zh_CN"
import "dayjs/locale/zh-cn"
import { StyleProvider } from "@ant-design/cssinjs"
import nanoclone from "nanoclone"

window.structuredClone = window.structuredClone ?? nanoclone

ReactDOM.createRoot(document.getElementById("root")!).render(
    <ConfigProvider
        locale={zhCN}
        theme={{
            components: {
                Segmented: {
                    itemSelectedBg: "#3b82f6",
                    itemSelectedColor: "#fff"
                }
            }
        }}
    >
        <StyleProvider hashPriority="high">
            <App />
        </StyleProvider>
    </ConfigProvider>
)
