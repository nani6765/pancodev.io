import { Link } from "@remix-run/react";
import * as styles from "@commonStyle/content.css";

function CloseLink({
  prev,
  next,
}: Pick<SmallTalk["metadata"], "prev" | "next">) {
  return (
    <section className="recent-small-talk">
      {prev.content_path && (
        <Link
          to={`/small_talk/${prev.content_path}`}
          className={styles.prevLink}
        >
          &laquo;&nbsp;{prev.content_title}
        </Link>
      )}

      {next.content_path && (
        <Link
          to={`/small_talk/${next.content_path}`}
          className={styles.nextLink}
        >
          {next.content_title}&nbsp;&raquo;
        </Link>
      )}
    </section>
  );
}

export default CloseLink;
