import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { Chart as ChartJS, LineElement } from "chart.js/auto";
import { LineChartOptions, rangeSelectorPlugin } from "./chart";

import { dummy } from "./data";
import * as style from "./style.css";

ChartJS.register(LineElement);

function SimilarityLineChart() {
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
      <Line
        data={data}
        options={LineChartOptions}
        plugins={[rangeSelectorPlugin(state)]}
      />
    </div>
  );
}

export default SimilarityLineChart;
