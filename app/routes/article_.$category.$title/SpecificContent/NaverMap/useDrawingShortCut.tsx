import { useEffect, useRef } from "react";
import { exceptionSnapShotEvent } from "./function";

type Props = { drawingManager: naver.maps.drawing.DrawingManager | null };

function useDrawingShortCut({ drawingManager }: Props) {
  // 선택된 오버레이 id는 키보드 핸들러에서만 읽으므로 리렌더링을 일으키지 않는 ref에 둔다.
  const selectedOverlayIdRef = useRef("");

  useEffect(() => {
    if (!drawingManager) {
      return;
    }

    const toggleMode = (
      target:
        | naver.maps.drawing.DrawingMode.RECTANGLE
        | naver.maps.drawing.DrawingMode.POLYGON
    ) => {
      const currentMode = drawingManager.getOptions("drawingMode");
      if (currentMode === target) {
        drawingManager.setOptions({
          drawingMode: naver.maps.drawing.DrawingMode.HAND,
        });
      } else {
        drawingManager.setOptions({
          drawingMode: target,
        });
      }
    };

    const handModeShortCutEventHandler = (e: KeyboardEvent) => {
      if (!exceptionSnapShotEvent(e)) {
        return;
      }
      const key = e.key.toLowerCase();

      switch (true) {
        case key === "a" || key === "ㅁ":
          drawingManager.setOptions({
            drawingMode: naver.maps.drawing.DrawingMode.HAND,
          });
          return;
        case key === "s" || key === "ㄴ":
          toggleMode(naver.maps.drawing.DrawingMode.RECTANGLE);
          return;
        case key === "d" || key === "ㅇ":
          toggleMode(naver.maps.drawing.DrawingMode.POLYGON);
          return;
        case key === "backspace":
          (
            drawingManager as naver.maps.drawing.DrawingManager & {
              removeDrawing: (
                overlayOrId: naver.maps.drawing.DrawingOverlay | string
              ) => void;
            }
          ).removeDrawing(selectedOverlayIdRef.current);
          return;
        default:
          return;
      }
    };

    const setSelectedOverlay = (e: naver.maps.drawing.DrawingOverlay) => {
      selectedOverlayIdRef.current = e.id;
    };

    window.addEventListener("keydown", handModeShortCutEventHandler);
    const listener = drawingManager.addListener(
      naver.maps.drawing.DrawingEvents.SELECT,
      setSelectedOverlay
    );
    return () => {
      window.removeEventListener("keydown", handModeShortCutEventHandler);
      drawingManager.removeListener(listener);
    };
  }, [drawingManager]);
}

export default useDrawingShortCut;
