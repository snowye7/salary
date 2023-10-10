import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { ConfigProvider } from "antd"
import zhCN from "antd/locale/zh_CN"
import "dayjs/locale/zh-cn"

ReactDOM.createRoot(document.getElementById("root")!).render(
    <ConfigProvider locale={zhCN}>
        <App />
    </ConfigProvider>
)
