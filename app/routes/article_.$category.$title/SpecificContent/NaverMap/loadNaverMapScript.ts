const CALLBACK_NAME = "__onNaverMapScriptLoaded";

let naverMapScriptPromise: Promise<void> | null = null;

// callback 파라미터를 붙여야 drawing 서브모듈이 document.write 없이 비동기로 로드된다.
function loadNaverMapScript() {
  naverMapScriptPromise ??= new Promise<void>((resolve, reject) => {
    (window as unknown as Record<string, () => void>)[CALLBACK_NAME] = () =>
      resolve();

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${
      import.meta.env.VITE_NCP_CLIENT_ID
    }&submodules=drawing&callback=${CALLBACK_NAME}`;
    script.onerror = () => {
      naverMapScriptPromise = null;
      reject(new Error("Failed to load Naver Maps script"));
    };
    document.head.appendChild(script);
  });

  return naverMapScriptPromise;
}

export default loadNaverMapScript;
