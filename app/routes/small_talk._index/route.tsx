import * as style from "@app/content/styles.css";

function SmallTalkList() {
  return (
    <div className="root-section">
      <ul className={style.contentList}>
        <li className={style.contentItem}>
          Lorem ipsum dolor sit, amet consectetur
        </li>
        <li className={style.contentItem}>
          Lorem ipsum dolor sit, amet consectetur
        </li>
        <li className={style.contentItem}>
          Lorem ipsum dolor sit, amet consectetur
        </li>
      </ul>
    </div>
  );
}

export default SmallTalkList;
