import { useState, useCallback, useEffect } from "react";
import { exceptionSnapShotEvent } from "./function";

type Props = { drawingManager: naver.maps.drawing.DrawingManager | null };

function useDrawingShortCut({ drawingManager }: Props) {
  const [selectedOverlayId, setSelectedOverlayId] = useState("");

  const handModeShortCutEventHandler = useCallback(
    (e: KeyboardEvent) => {
      if (!drawingManager || !exceptionSnapShotEvent(e)) {
        return;
      }
      const key = e.key.toLowerCase();

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
          ).removeDrawing(selectedOverlayId);
          return;
        default:
          return;
      }
    },
    [selectedOverlayId, drawingManager]
  );

  useEffect(() => {
    const setSelectedOverlay = (e: naver.maps.drawing.DrawingOverlay) => {
      console.log(e);
      setSelectedOverlayId(e.id);
    };

    window.addEventListener("keydown", handModeShortCutEventHandler);
    const listener = drawingManager?.addListener(
      naver.maps.drawing.DrawingEvents.SELECT,
      setSelectedOverlay
    );
    return () => {
      window.removeEventListener("keydown", handModeShortCutEventHandler);
      if (listener && drawingManager) {
        drawingManager.removeListener(listener);
      }
    };
  }, [drawingManager, handModeShortCutEventHandler]);
}

export default useDrawingShortCut;
