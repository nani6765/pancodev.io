import { Line } from "react-chartjs-2";
import { useEffect, useRef, useState } from "react";
import { Chart as ChartJS, LineElement } from "chart.js/auto";

import { dummy } from "./data";
import {
  LineChartOptions,
  rangeSelectorPlugin,
  type RangeSelectorPlugin,
} from "./chart";

import * as style from "./style.css";

ChartJS.register(LineElement);

function SimilarityLineChart() {
  const chartRef = useRef<ChartJS<"line", number[], number>>(null);
  const [state, setState] = useState(70);
  const data = {
    labels: dummy.map((labelAndValue) => labelAndValue[0]),
    datasets: [
      {
        label: "data",
        borderColor: "rgb(156, 167, 184)",
        backgroundColor: "rgba(156, 167, 184, 0.2)",
        fill: "start",
        data: dummy.map((labelAndValue) => labelAndValue[1]),
      },
    ],
  };

  const setStateFunction = (nextState: number | ((prev: number) => number)) => {
    const newState =
      typeof nextState === "function" ? nextState(state) : nextState;
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    const plugin = chart.config.plugins?.find(
      (plugin) => plugin.id === "rangeSelectorPlugin"
    );
    if (!plugin) {
      return;
    }

    const rangeSelectorPlugin = plugin as RangeSelectorPlugin;
    if (rangeSelectorPlugin.verticalLine !== newState) {
      rangeSelectorPlugin.verticalLine = newState;
    }
    setState(newState);
    chart.update();
  };

  const changeSimilarity = (trigger: "up" | "down") => {
    setStateFunction((prev) => (trigger === "up" ? prev + 1 : prev - 1));
  };

  useEffect(() => {
    const verticalLineChangeEvent = (e: Event) => {
      if (!("detail" in e)) {
        return;
      }
      setState((prev) => {
        if (prev !== Number(e.detail)) {
          return Number(e.detail);
        }
        return prev;
      });
    };

    window.addEventListener("verticalLineChange", verticalLineChangeEvent);
    return () =>
      window.removeEventListener("verticalLineChange", verticalLineChangeEvent);
  }, []);

  return (
    <div className={style.chartWrapper}>
      <div className={style.chartHeader}>
        <div className={style.inputWrapper}>
          <input
            className={style.input}
            type="text"
            value={state}
            onChange={(e) => setStateFunction(Number(e.target.value))}
          />
          <div className={style.nav}>
            <div className={style.upBtn} onClick={() => changeSimilarity("up")}>
              <img src="/icon/up.svg" style={{ width: "8px", height: "8px" }} />
            </div>
            <div
              className={style.downBtn}
              onClick={() => changeSimilarity("down")}
            >
              <img
                src="/icon/down.svg"
                style={{ width: "8px", height: "8px" }}
              />
            </div>
          </div>
        </div>
        <div>
          선택한 값 :{" "}
          {dummy.reduce(
            (acc, [index, value]) => (index >= state ? acc + value : acc),
            0
          )}
        </div>
      </div>
      <div className={style.innerWrapper}>
        <Line
          ref={chartRef}
          data={data}
          options={LineChartOptions}
          plugins={[rangeSelectorPlugin(state)]}
        />
      </div>
    </div>
  );
}

export default SimilarityLineChart;
