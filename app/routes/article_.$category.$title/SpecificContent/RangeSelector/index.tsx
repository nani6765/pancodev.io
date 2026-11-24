import { Line } from "react-chartjs-2";
import { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from "chart.js";

import { dummy } from "./data";
import { LineChartOptions, rangeSelectorPlugin } from "./chart";

import * as style from "./style.css";

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Filler
);

const INITIAL_VERTICAL_LINE = 70;

const chartData = {
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

const arrowIconStyle = { width: "8px", height: "8px" };
const upIcon = <img src="/icon/up.svg" style={arrowIconStyle} />;
const downIcon = <img src="/icon/down.svg" style={arrowIconStyle} />;

function SimilarityLineChart() {
  const chartRef = useRef<ChartJS<"line", number[], number>>(null);
  const [state, setState] = useState(INITIAL_VERTICAL_LINE);
  // react-chartjs-2는 차트 생성 시점의 plugins만 사용하므로 플러그인은 한 번만 만든다.
  const [plugin] = useState(() => rangeSelectorPlugin(INITIAL_VERTICAL_LINE));
  const moveVerticalLine = (nextState: number) => {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    plugin.verticalLine = nextState;
    setState(nextState);
    chart.update();
  };

  const changeSimilarity = (trigger: "up" | "down") => {
    moveVerticalLine(trigger === "up" ? state + 1 : state - 1);
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
            onChange={(e) => moveVerticalLine(Number(e.target.value))}
          />
          <div className={style.nav}>
            <div className={style.upBtn} onClick={() => changeSimilarity("up")}>
              {upIcon}
            </div>
            <div
              className={style.downBtn}
              onClick={() => changeSimilarity("down")}
            >
              {downIcon}
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
          data={chartData}
          options={LineChartOptions}
          plugins={[plugin]}
        />
      </div>
    </div>
  );
}

export default SimilarityLineChart;
