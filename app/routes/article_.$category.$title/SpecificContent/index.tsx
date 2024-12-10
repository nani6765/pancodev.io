import NaverMap from "./NaverMap";
import RangeSelector from "./RangeSelector";

type Props = {
  path: string;
};

export function HydrateFallback() {
  return <p>Loading user preferences...</p>;
}

export default function Component({ path }: Props) {
  const componentMap = {
    "guidance-naver-map-and-drawing-manager": <NaverMap />,
    "x-axis-range-selector": <RangeSelector />,
  };

  return (
    <div id="specific_content">
      {path in componentMap ? componentMap[path] : null}
    </div>
  );
}
