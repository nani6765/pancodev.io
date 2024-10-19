//@see https://dev.to/chrisbenjamin/tutorial-add-sitemapxml-and-robotstxt-to-remix-site-4n23
import blogConfig from "@/blog.config.json";

export const loader = () => {
  // handle "GET" request
  // set up our text content that will be returned in the response
  const robotText = ` 
        User-agent: *
        Allow: /
    
        Sitemap: ${blogConfig.siteUrl}/sitemap.xml
        `;

  // return the text content, a status 200 success response, and set the content type to text/plain

  return new Response(robotText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
