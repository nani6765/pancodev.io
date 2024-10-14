import { NavLink } from "@remix-run/react";
import * as styles from "./styles.css";

function NavBar() {
  const linkList = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "Article",
      path: "/article/1",
    },
    { label: "Book", path: "/article" },
  ];

  return (
    <nav>
      <ul className={styles.header}>
        {linkList.map(({ label, path }) => (
          <li key={label}>
            <NavLink prefetch="render" to={path} className={styles.headerItem}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default NavBar;
