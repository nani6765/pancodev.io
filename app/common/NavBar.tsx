import { Link, useLocation } from "@remix-run/react";
import * as styles from "./styles.css";

function NavBar() {
  const { pathname } = useLocation();

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
              className={
                pathname === path
                  ? `${styles.headerLink} active`
                  : styles.headerLink
              }
              preventScrollReset
              onClick={(e) => e.preventDefault()}
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
