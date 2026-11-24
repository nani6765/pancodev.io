import { lazy, Suspense } from "react";

import type { ComponentType, LazyExoticComponent } from "react";

type Props = {
  path: string;
};

export function HydrateFallback() {
  return <p>Loading user preferences...</p>;
}

// 지도·차트 번들은 해당 글에서만 필요하므로 글 slug에 맞는 컴포넌트만 내려받는다.
const componentMap: Record<string, LazyExoticComponent<ComponentType>> = {
  "guidance-naver-map-and-drawing-manager": lazy(() => import("./NaverMap")),
  "x-axis-range-selector": lazy(() => import("./RangeSelector")),
};

export default function Component({ path }: Props) {
  const SpecificComponent = componentMap[path];

  return (
    <div id="specific_content">
      {SpecificComponent ? (
        <Suspense fallback={null}>
          <SpecificComponent />
        </Suspense>
      ) : null}
    </div>
  );
}
