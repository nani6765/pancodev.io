import { Link, useLocation } from "@remix-run/react";

import * as styles from "./styles.css";

import type { MouseEvent } from "react";

function NavBar() {
  const { pathname } = useLocation();
  const isCurrentPath = (path: string) => path === pathname;
  const linkClassName = (path: string) => {
    if (isCurrentPath(path)) {
      return styles.activeHeaderLink;
    }
    return styles.headerLink;
  };
  const preventLinkEventWhenCurrentPath = (
    e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>,
    path: string
  ) => {
    if (isCurrentPath(path)) {
      e.preventDefault();
    }
  };

  const linkList = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "Content",
      path: "/articles",
    },
    { label: "Talk", path: "/small_talk" },
  ];

  return (
    <nav className="root-section">
      <ul className={styles.header}>
        {linkList.map(({ label, path }) => (
          <li key={label} className={styles.headerItem}>
            <Link
              to={path}
              prefetch="render"
              preventScrollReset
              className={linkClassName(path)}
              onClick={(e) => preventLinkEventWhenCurrentPath(e, path)}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default NavBar;
