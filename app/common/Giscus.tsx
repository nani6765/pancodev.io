import { useCallback, useEffect, useRef } from "react";

function Giscus() {
  const ref = useRef<HTMLDivElement>(null);

  const createGiscusScript = useCallback(() => {
    const giscusElem = document.createElement("script");
    giscusElem.src = "https://giscus.app/client.js";
    giscusElem.async = true;
    giscusElem.crossOrigin = "anonymous";

    giscusElem.setAttribute("data-repo", "nani6765/pancodev.io");
    giscusElem.setAttribute("data-repo-id", import.meta.env.VITE_DATA_REPO_ID);
    giscusElem.setAttribute("data-category", "General");
    giscusElem.setAttribute(
      "data-category-id",
      import.meta.env.VITE_DATA_CATEGORY_ID
    );
    giscusElem.setAttribute("data-mapping", "pathname");
    giscusElem.setAttribute("data-strict", "0");
    giscusElem.setAttribute("data-reactions-enabled", "0");
    giscusElem.setAttribute("data-emit-metadata", "0");
    giscusElem.setAttribute("data-input-position", "bottom");
    giscusElem.setAttribute("data-theme", "noborder_dark");
    giscusElem.setAttribute("data-lang", "ko");
    return giscusElem;
  }, []);

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;
    const giscusElem = createGiscusScript();
    ref.current.appendChild(giscusElem);
  }, [createGiscusScript]);

  return <section ref={ref} />;
}

export default Giscus;
