import { Links, Meta } from "@remix-run/react";

function DocHead() {
  return (
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Meta />
      <Links />
    </head>
  );
}

export default DocHead;
