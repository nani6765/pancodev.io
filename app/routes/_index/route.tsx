import * as style from "./style.css";
import blogConfig from "@/blog.config.json";
import generateMetaTag from "@/function/generateMetaTag";

export const meta = () =>
  generateMetaTag({
    title: [blogConfig.title],
    description: blogConfig.description,
    author: blogConfig.author,
    url: blogConfig.siteUrl,
  });

function Home() {
  return (
    <div className="root-section">
      <img
        className={style.profile}
        src={blogConfig.home.profile}
        alt={blogConfig.author}
        draggable={false}
      />
      <p className={style.description}>
        {blogConfig.home.description.map((v) => (
          <span key={v}>{v}</span>
        ))}
      </p>

      <div className={style.linkList}>
        {blogConfig.links.map(({ type, url, icon }) => (
          <a href={url} target="_blank" rel="noopener noreferrer">
            <img
              className={style.linkIcon}
              src={icon}
              alt={`${blogConfig.author}_${type}`}
            />
          </a>
        ))}
      </div>
    </div>
  );
}

export default Home;
