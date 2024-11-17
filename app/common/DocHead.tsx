import { Links, Meta } from "@remix-run/react";

function DocHead() {
  return (
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />

      {/* Google tag (gtag.js)  */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${
          import.meta.env.VITE_GA_TRACKING_ID
        }`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `        
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${import.meta.env.VITE_GA_TRACKING_ID}');`,
        }}
      />

      <Meta />
      <Links />
    </head>
  );
}

export default DocHead;
