import {
  Form,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  Outlet,
} from "@remix-run/react";
import * as styles from "./root.css";

export default function App() {
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
            {["Home", "Blog", "Book"].map((v) => (
              <li key={v} className={styles.headerItem}>
                {v}
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
