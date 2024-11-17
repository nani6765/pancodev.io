import { Links, Meta } from "@remix-run/react";

type Props = {
  gaId: string;
};

function DocHead({ gaId }: Props) {
  return (
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      {/* Google tag (gtag.js)  */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `        
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');`,
        }}
      />
      {/* Naver Maps API */}
      <script
        type="text/javascript"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${"pt9lnh23vv"}`}
      />

      <Meta />
      <Links />
    </head>
  );
}

export default DocHead;
