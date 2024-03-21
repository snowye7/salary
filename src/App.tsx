import { Segmented } from "antd"
import createStore from "easy-zustand"
import { Fragment, useEffect, useState } from "react"
import "./App.css"
import Bonus from "./components/Bonus"
import Salary from "./components/Salary"
import { Mode } from "./type"

const ModeObj: Record<string, Mode> = {
    薪资管理: "salary",
    奖金管理: "bonus"
}

export const useWindowSize = createStore({ width: window.innerWidth, height: window.innerHeight })

function App() {
    const [mode, setMode] = useState<Mode>("salary")

    const [, setWindowSize] = useWindowSize()

    useEffect(() => {
        function changeResize() {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        }
        window.addEventListener("resize", changeResize)
        return () => window.removeEventListener("resize", changeResize)
    }, [])

    return (
        <Fragment>
            <main className="px-4" style={{ width: "100vw", height: "100vh" }}>
                <div className="flex h-14 items-center">
                    <div className="flex gap-1 items-center">
                        <img src="/logo.png" alt="" width={40} />
                        <div style={{ lineHeight: "40px", fontSize: 20 }}>江苏格数科技智能薪酬管理平台</div>
                    </div>

                    <div className=" pl-8">
                        <Segmented
                            value={ModeObj[mode]}
                            options={Object.keys(ModeObj)}
                            onChange={value => {
                                setMode(ModeObj[value])
                            }}
                        />
                    </div>

                    <div id="filter" className="flex flex-1 gap-8 footer items-center justify-end"></div>
                </div>
                {mode === "salary" ? <Salary></Salary> : <Bonus></Bonus>}
            </main>
        </Fragment>
    )
}

export default App
