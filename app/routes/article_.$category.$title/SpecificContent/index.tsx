import NaverMap from "./NaverMap";

const componentMap = {
  "reflections-on-react-re-rendering": <NaverMap />,
};

type Props = {
  path: string;
};

export function HydrateFallback() {
  return <p>Loading user preferences...</p>;
}

export default function Component({ path }: Props) {
  return <>{path in componentMap ? componentMap[path] : null}</>;
}
