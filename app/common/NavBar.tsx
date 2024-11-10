import { Link, useLocation } from "@remix-run/react";

import blogConfig from "@/blog.config.json";

import * as styles from "./styles.css";

import type { MouseEvent } from "react";
type LinkMouseEvent = MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>;

function NavBar() {
  const { pathname } = useLocation();
  const { paths } = blogConfig;
  const isCurrentPath = (path: string) => path === pathname;
  const linkClassName = (path: string) =>
    isCurrentPath(path) ? styles.activeHeaderLink : styles.headerLink;
  const preventLinkEventWhenCurrentPath = (e: LinkMouseEvent, path: string) => {
    if (isCurrentPath(path)) {
      e.preventDefault();
    }
  };

  const linkList = paths.map(({ label, path_name }) => ({
    label,
    path: path_name,
    className: linkClassName(path_name),
    onClick: (e: LinkMouseEvent) =>
      preventLinkEventWhenCurrentPath(e, path_name),
  }));

  return (
    <nav className="root-section">
      <ul className={styles.header}>
        {linkList.map(({ label, path, className, onClick }) => (
          <li key={label} className={styles.headerItem}>
            <Link
              to={path}
              prefetch="render"
              onClick={onClick}
              preventScrollReset
              className={className}
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
