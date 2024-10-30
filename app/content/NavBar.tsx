import { NavLink } from "@remix-run/react";
import * as styles from "./styles.css";

function NavBar() {
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
            <NavLink prefetch="render" to={path} className={styles.headerLink}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default NavBar;
