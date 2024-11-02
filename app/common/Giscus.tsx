import { useCallback, useEffect, useRef } from "react";

type Props = {
  dataRepoId: string;
  dataCategoryId: string;
};

function Giscus({ dataRepoId, dataCategoryId }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const createGiscusScript = useCallback(() => {
    const giscusElem = document.createElement("script");
    giscusElem.src = "https://giscus.app/client.js";
    giscusElem.async = true;
    giscusElem.crossOrigin = "anonymous";

    giscusElem.setAttribute("data-repo", "nani6765/pancodev.io");
    giscusElem.setAttribute("data-repo-id", dataRepoId);
    giscusElem.setAttribute("data-category", "General");
    giscusElem.setAttribute("data-category-id", dataCategoryId);
    giscusElem.setAttribute("data-mapping", "pathname");
    giscusElem.setAttribute("data-strict", "0");
    giscusElem.setAttribute("data-reactions-enabled", "0");
    giscusElem.setAttribute("data-emit-metadata", "0");
    giscusElem.setAttribute("data-input-position", "bottom");
    giscusElem.setAttribute("data-theme", "noborder_dark");
    giscusElem.setAttribute("data-lang", "ko");
    return giscusElem;
  }, [dataRepoId, dataCategoryId]);

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;
    const giscusElem = createGiscusScript();
    ref.current.appendChild(giscusElem);
  }, [createGiscusScript]);

  return <section ref={ref} />;
}

export default Giscus;
