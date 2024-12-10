import { Chart as ChartJS } from "chart.js/auto";
import type { CoreScaleOptions, Scale, Plugin } from "chart.js/auto";

export interface RangeSelectorPlugin extends Plugin<"line"> {
  isDragging: boolean;
  verticalLine: number;
  offset: number;
  eventHandlers: {
    type: keyof HTMLElementEventMap;
    handler: (e: MouseEvent) => void;
  }[];
  animationFrame: null | number;
  calculateVerticalLinePosition: (xAxis: Scale<CoreScaleOptions>) => number;
  verticalImage: HTMLImageElement;
}

export const LineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  hover: {
    /**
     * 차트 위에 마우스를 올릴 때 point가 커지는 이벤트를 방지합니다.
     */
    mode: undefined,
  },
  elements: {
    point: {
      /**
       * 차트 위에 마우스를 올릴 때 point가 커지는 이벤트를 방지합니다.
       */
      radius: 0,
      borderWidth: 0,
      hoverBorderWidth: 0,
      hoverRadius: 0,
    },
  },
  layout: {
    padding: 0,
  },

  scales: {
    x: {
      type: "linear" as const,
      grid: {
        display: false,
      },
      ticks: {
        color: "#818DA1",
        font: {
          size: 12,
        },
        callback: function (value: string | number) {
          if (Number(value) < 1) {
            return;
          }
          return value;
        },
        /**
         * 10단위로 X축에 tick을 찍습니다.
         * 의도 : 0, 10, 20, 30 ...
         */
        autoSkip: false,
        stepSize: 10,
      },
    },
    y: {
      ticks: {
        color: "#818DA1",
        font: {
          size: 12,
        },
        callback: function (value: string | number) {
          if (Number(value) < 1 && Number(value) !== 0) {
            return;
          }
          const compactNumeric = new Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(Number(value));
          return compactNumeric;
        },
        beginAtZero: true,
      },
      min: 0,
    },
  },
};

/**
 * 이미 그려진 Rect를 지우고, 새로운 Rect를 그립니다.
 * Rect는 verticalLine부터 차트의 X축 끝까지 그려집니다.
 * verticalLine의 포지션은 initialVerticalLine로 전달받은 값의 %입니다.
 * ex) initialVerticalLine으로 70을 전달받았으면 X축의 70% 지점으로 position이 잡힙
 *     => 70% 부터 100%까지 Rect를 그림
 */
const drawRange = (
  ctx: CanvasRenderingContext2D,
  xAxis: Scale<CoreScaleOptions>,
  yAxis: Scale<CoreScaleOptions>,
  linePosition: number
) => {
  const { left, right } = xAxis;
  const { top, bottom } = yAxis;

  if (left + linePosition > right) {
    return;
  }

  ctx.clearRect(
    left + linePosition,
    top,
    right - (left + linePosition),
    bottom - top
  );
  ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
  ctx.fillRect(
    left + linePosition,
    top,
    right - (left + linePosition),
    bottom - top
  );
};

/**
 * stroke위에 그려질 Image('<' 모양 아이콘)의 포지션을 계산합니다.
 * Image의 위치는 stroke의 y축 정중앙입니다.
 */
const getImagePosition = (
  image: HTMLImageElement,
  verticalLine: number,
  yAxis: Scale<CoreScaleOptions>
) => {
  return {
    imageX: verticalLine - image.width / 2,
    imageY: (yAxis.top + yAxis.bottom) / 2 - image.height / 2,
  };
};

/**
 * chart의 canvas위에 stroke(y축 평향 직선)와 Image를 그립니다.
 * verticalLine의 포지션은 initialVerticalLine로 전달받은 값의 %입니다.
 * ex) initialVerticalLine으로 70을 전달받았으면 X축의 70% 지점에 stroke를 그림
 */
const drawVerticalLine = (
  ctx: CanvasRenderingContext2D,
  verticalLine: number,
  yAxis: Scale<CoreScaleOptions>,
  verticalImage: HTMLImageElement
) => {
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#1678EF";
  ctx.moveTo(verticalLine, yAxis.top);
  ctx.lineTo(verticalLine, yAxis.bottom);
  ctx.stroke();

  if (verticalImage.src) {
    const { imageX, imageY } = getImagePosition(
      verticalImage,
      verticalLine,
      yAxis
    );
    ctx.drawImage(verticalImage, imageX, imageY);
  } else {
    verticalImage.src = "/icon/arrow-left.svg";
    verticalImage.onload = () => {
      const { imageX, imageY } = getImagePosition(
        verticalImage,
        verticalLine,
        yAxis
      );
      ctx.drawImage(verticalImage, imageX, imageY);
    };
  }
};

/**
 * 마우스 이벤트가 발생했을 때 마우스의 위치가 verticalLine 세로 정중앙(= 이미지가 그려진 위치)인지 확인합니다.
 * canvas위에 그려진 Image에는 이벤트 핸들러를 붙일 수 없음으로 이와 같이 계산합니다. (canvas 위에 Image를 그려도, 결국 합쳐져서 canvas로 HTML에 그려짐)
 * 포지션을 계산할 때 x축, y축으로 각 5px정도 여유를 둬서 계산합니다. (사용성 개선)
 */
const isMouseOverAtVerticalImage = ({
  rect,
  event,
  axisLeft,
  axisWidth,
  axisHeight,
  verticalLine,
}: {
  rect: DOMRect;
  event: MouseEvent;
  axisLeft: number;
  axisWidth: number;
  axisHeight: number;
  verticalLine: number;
}) => {
  const x = event.clientX - rect.left - axisLeft;
  const xPosition = (x / axisWidth) * 100;

  const y = event.clientY - rect.top;
  const yPosition = (y / axisHeight) * 100;

  return (
    (yPosition >= 45 || yPosition <= 55) &&
    Math.abs(xPosition - verticalLine) < 5
  );
};

/**
 * canvas 위 mouse click event를 정의합니다.
 * isMouseOverAtVerticalImage에 의해 이미지가 그려진 위치에 대한 클릭에서만 동작합니다.
 * isDragging이 true로 변경되면 mouseMoveEvent가 동작됩니다.
 */
const mouseClickEvent = (
  event: MouseEvent,
  chart: ChartJS<"line">,
  context: RangeSelectorPlugin
) => {
  const { scales, canvas } = chart;
  if (!canvas || !scales) return;

  const xAxis = scales["x"];
  const yAxis = scales["y"];
  if (!xAxis || !yAxis) return;

  const rect = chart.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;

  if (
    isMouseOverAtVerticalImage({
      rect: rect,
      event: event,
      axisLeft: xAxis.left,
      axisWidth: xAxis.width,
      axisHeight: yAxis.height,
      verticalLine: context.verticalLine,
    })
  ) {
    context.offset = x - (rect.width * context.verticalLine) / 100;
    context.isDragging = true;
  }
};

/**
 * canvas 위 mouse move event를 정의합니다.
 * isMouseOverAtVerticalImage에 의해 이미지가 그려진 위치에 마우스를 올리면 커서를 변경합니다.
 * isDragging이 true인 경우 움직인 길이만큼 계산하여 verticalLine의 위치를 다시 그립니다.
 * 이후 차트를 업데이트하여 drawRange, drawVerticalLine를 실행시킵니다.
 * 동시에 CustomEvent를 발송하는데, verticalLine의 값을 React Component에게 알려주기 위함입니다.
 * 성능 개선을 위해 requestAnimationFrame을 사용합니다.
 * @see: https://developer.mozilla.org/ko/docs/Web/API/Window/requestAnimationFrame
 */
const mouseMoveEvent = (
  event: MouseEvent,
  chart: ChartJS<"line">,
  context: RangeSelectorPlugin
) => {
  const { scales, canvas } = chart;
  if (!canvas || !scales) return;

  const xAxis = scales["x"];
  const yAxis = scales["y"];
  if (!xAxis || !yAxis) return;

  const { verticalLine } = context;

  if (
    isMouseOverAtVerticalImage({
      rect: chart.canvas.getBoundingClientRect(),
      event,
      axisLeft: xAxis.left,
      axisWidth: xAxis.width,
      axisHeight: yAxis.height,
      verticalLine,
    })
  ) {
    chart.canvas.style.cursor = "pointer";
  } else {
    chart.canvas.style.cursor = "default";
  }

  if (!context.isDragging) {
    return;
  }
  const rect = chart.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const newPosition = Math.round(((x - context.offset) / rect.width) * 100);

  if (newPosition < 0 || newPosition > 99) {
    return;
  }

  if (chart) {
    context.verticalLine = newPosition;

    if (context.animationFrame) {
      cancelAnimationFrame(context.animationFrame);
    }

    context.animationFrame = requestAnimationFrame(() => {
      window.dispatchEvent(
        new CustomEvent("verticalLineChange", {
          detail: Math.round(context.verticalLine),
        })
      );
      chart.update("active");
    });
  }
};

/**
 * "mouseup", "mouseleave"에 동작합니다.
 * isDragging의 값을 false로 변경하여 mouseup, mouseleave 이후 mouseMoveEvent가 동작하지 않도록 합니다.
 */
const mouseEndEvent = (context: RangeSelectorPlugin) => {
  context.isDragging = false;
};

export const rangeSelectorPlugin = (initialVerticalLine: number) => ({
  id: "rangeSelectorPlugin",
  isDragging: false,
  verticalLine: initialVerticalLine,
  offset: 0,
  isEventHandlersRegistered: false,
  animationFrame: null as null | number,
  eventHandlers: [] as {
    type: keyof HTMLElementEventMap;
    handler: (e: MouseEvent) => void;
  }[], // 타입 정의
  calculateVerticalLinePosition(xAxis: Scale<CoreScaleOptions>) {
    return (this.verticalLine * (xAxis.right - xAxis.left)) / 100;
  },
  verticalImage: new Image(),
  /**
   * @see: https://github.com/chartjs/Chart.js/blob/47245a7/src/types/index.d.ts#L2234
   */
  afterRender(chart: ChartJS<"line">) {
    const { ctx, canvas } = chart;
    if (!canvas || !ctx) return;

    const mouseDownHandler = (e: MouseEvent) => mouseClickEvent(e, chart, this);
    const mouseMoveHandler = (e: MouseEvent) => mouseMoveEvent(e, chart, this);
    const mouseUpHandler = () => mouseEndEvent(this);
    const mouseLeaveHandler = () => mouseEndEvent(this);

    // 이벤트 등록
    canvas.addEventListener("mousedown", mouseDownHandler);
    canvas.addEventListener("mousemove", mouseMoveHandler);
    canvas.addEventListener("mouseup", mouseUpHandler);
    canvas.addEventListener("mouseleave", mouseLeaveHandler);

    this.eventHandlers = [
      { type: "mousedown", handler: mouseDownHandler },
      { type: "mousemove", handler: mouseMoveHandler },
      { type: "mouseup", handler: mouseUpHandler },
      { type: "mouseleave", handler: mouseLeaveHandler },
    ];
  },
  /**
   * 차트를 그리기 이전에 drawRange를 호출합니다.
   * 차트는 가장 최신에 그린 것일 수록 위에 그려집니다.
   * drawRange를 afterDraw에 호출하게 되면 drawRange에 의해 그려진 rect 뒤에 차트 라인은 보이지 않게 됩니다.
   */
  beforeDraw(chart: ChartJS<"line">) {
    const { ctx, data, scales } = chart;
    if (!ctx || !data || !scales) return;

    const xAxis = scales["x"];
    const yAxis = scales["y"];
    if (!xAxis || !yAxis) return;

    const verticalLinePos = this.calculateVerticalLinePosition(xAxis);
    drawRange(ctx, xAxis, yAxis, verticalLinePos);
  },
  /**
   * 차트를 그린 이후 drawVerticalLine을 호출합니다.
   * 차트는 가장 최신에 그린 것일 수록 위에 그려집니다.
   * drawVerticalLine beforeDraw 호출하게 되면 drawVerticalLine을 의해 그려진 선과 이미지가 차트 라인에게 가려집니다.
   */
  afterDraw(chart: ChartJS<"line">) {
    const { ctx, data, scales } = chart;
    if (!ctx || !data || !scales) return;

    const xAxis = chart.scales["x"];
    const yAxis = chart.scales["y"];
    if (!xAxis || !yAxis) return;

    const verticalLinePos = this.calculateVerticalLinePosition(xAxis);
    drawVerticalLine(
      ctx,
      xAxis.left + verticalLinePos,
      yAxis,
      this.verticalImage
    );
  },
});
