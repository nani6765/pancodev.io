import NaverMap from "./NaverMap";

const componentMap = {
  "guidance-naver-map-and-drawing-manager": <NaverMap />,
};

type Props = {
  path: string;
};

export function HydrateFallback() {
  return <p>Loading user preferences...</p>;
}

export default function Component({ path }: Props) {
  return (
    <div id="specific_content">
      {path in componentMap ? componentMap[path] : null}
    </div>
  );
}
