import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  Outlet,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { LinksFunction } from "@remix-run/node";

import resetCSS from "./reset.css?url";
import globalCSS from "./global.css?url";

import NavBar from "./content/NavBar";
import DocHead from "./content/DocHead";
import faviconLinks from "./content/faviconLinks";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap",
  },
  { rel: "stylesheet", href: resetCSS },
  { rel: "stylesheet", href: globalCSS },
  { rel: "alternate", type: "application/rss+xml", href: "/rss.xml" },
  ...faviconLinks,
];

export default function App() {
  return (
    <html lang="ko">
      <DocHead />
      <body>
        <NavBar />

        <div id="detail">
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html>
      <head>
        <title>404</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : error instanceof Error
            ? error.message
            : "Unknown Error"}
        </h1>
        <Scripts />
      </body>
    </html>
  );
}
