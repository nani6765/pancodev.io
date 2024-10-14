import {
  Form,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  NavLink,
  Outlet,
} from "@remix-run/react";
import * as styles from "./root.css";

export default function App() {
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
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <nav>
          <ul className={styles.header}>
            {linkList.map(({ label, path }) => (
              <li key={label}>
                <NavLink
                  prefetch="render"
                  to={path}
                  className={styles.headerItem}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div id="detail">
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
