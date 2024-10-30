import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  useLoaderData,
} from "@remix-run/react";
import { json, LinksFunction } from "@remix-run/node";

import resetCSS from "./reset.css?url";
import globalCSS from "./global.css?url";

import NavBar from "./common/NavBar";
import DocHead from "./common/DocHead";
import faviconLinks from "./common/faviconLinks";

export async function loader() {
  return json({
    ENV: {
      GA_TRACKING_ID: process.env.GA_TRACKING_ID,
    },
  });
}

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
  const { ENV } = useLoaderData<typeof loader>();

  return (
    <html lang="ko">
      <DocHead gaId={ENV.GA_TRACKING_ID} />
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
