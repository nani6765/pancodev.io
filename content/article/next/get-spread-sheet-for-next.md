---
title: "NextJS Google Spread Sheet 불러오기"
description: "A guide on integrating Google Sheets with Next.js to manage SEO dynamically, including fetching and structuring data via Google Sheets API."
keywords: ["GCP", "Spread Sheet", "SEO"]
category: next
created_at: 2024-12-21 19:00
---

# NextJS Google Spread Sheet 불러오기

각자 관리하고 있는 사이트마다 SEO를 어떻게 관리하고 있는지 잘 모르겠다. 우리 회사는 담당자의 요청에 의해 프론트엔드 개발자가 변경하여 사이트를 다시 배포하는 방식으로 이를 대응하고 있는데, 예전부터 굉장히 불편하다고 생각했다. 단순히 SEO를 변경하는 것 하나를 위하여 작업이 들어가야 하고 그 변경된 작업은 새롭게 배포가 발생하기 전까지 반영될 수 없기에 효율이 떨어진다. 이를 조금 더 스마트하게 대응하기 위하여 같이 일하는 동료 중 한 분이 “구글 Spread Sheet에 seo를 등록해놓고 이걸 불러올까요?” 라는 의견을 내주셨고, 진행해보기로 했다.

현재 우리 회사는 프로젝트 배포를 위하여 firebase를 사용하고 있는데 이 때문에 [GCP IAM Service Account key 파일이 프로젝트 내부에 위치](https://pancodev.io/article/next/next-deploy-with-firebase-2)해 있다. 이 key파일을 이용하여 Google API의 Authentication을 그대로 사용할 계획이다. 먼저 필요한 package들을 설치해주자.

```bash
yarn add googleapis fs-extra
yarn add -D tsc
```

`googleapis` 의 [Sheets API](https://developers.google.com/sheets/api/reference/rest?hl=ko)를 통해 Spread Sheet와 연동할 계획이고, 불러온 데이터를 .json 포멧으로 저장하여 i18-next를 통해 접근할 계획이다. 그것을 위해 `fs-extra` 이고 사용할 메서드는 `writeFileSync` 하나에 불과하기 때문에 NODE의 fs를 사용해도 무방하다. ~~다만 조금 더 빠른 작업 속도를 위해 라이브러리를 설치했다.~~ 그리고 타입스크립트 파일을 실행시켜주기 위해 `tsc`를 설치했다.

```tsx
import { google, sheets_v4 } from "googleapis";
import { default as keyFile } from "@/your-key-file.json";

const getGoogleSpreadSheetForSeo = async () => {
  const { client_email, private_key } = keyFile;
  const authorize = new google.auth.JWT(client_email, undefined, private_key, [
    "https://www.googleapis.com/auth/spreadsheets",
  ]);

  /**
   * @see: https://developers.google.com/sheets/api/quickstart/nodejs?hl=ko#set_up_the_sample
   */
  const googleSheet = google.sheets({
    version: "v4",
    auth: authorize,
  });

  /* ... */
};
```

먼저 첫번째로 Spread Sheet 데이터에 접근하기 위하여 구글 인증을 진행해야 한다. 앞서 설명했던 대로 우리는 IAM Service KeyFile을 사용하여 [구글 API에 사용가능한 access Token을 발급](https://firebase.google.com/docs/cloud-messaging/migrate-v1?hl=ko#use-credentials-to-mint-access-tokens)한다. 해당 access Token에 부여 가능한 [Scope 목록](https://developers.google.com/identity/protocols/oauth2/scopes?hl=ko)을 확인해보면 예제 코드에서 `.readonly` 를 붙이면 “읽기” 권한만 부여받을 수 있다. 이번 예제에서도 읽기 이외의 수정, 생성, 삭제등의 동작은 필요하지 않기에 권한 부여를 빡빡하게 하고 싶다면 `.readonly` 를 붙여서 사용하도록 하자. 이제 생성된 `googleSheet` 와 구글 시트 ID를 조합하여 원하는 시트의 열 데이터에 접근할 수 있다.

[!note] SpreadSheet ID는 URL에서 확인할 수 있다. `https://docs.google.com/spreadsheets/d/${YOUR_SHEET_ID}/edit?gid=0#gid=0`

```tsx
const spreadsheetId = "YOUR_SHEET_ID";

const getColumnData = async (googleSheet: sheets_v4.Sheets, range: string) => {
  const response = await googleSheet.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return (response.data.values as string[][]) || [];
};
```

```tsx
/**
 * @see: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/get?hl=ko
 */
const [columnA, columnE, columnF, columnG, columnH] = await Promise.allSettled([
  getColumnData(googleSheet, "A:A"),
  getColumnData(googleSheet, "E:E"), // 한글 제목
  getColumnData(googleSheet, "F:F"), // 한글 설명
  getColumnData(googleSheet, "G:G"), // 영문 제목
  getColumnData(googleSheet, "H:H"), // 영문 설명
]);
```

[Sheet API의 문서](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/get?hl=ko)를 확인해보면 가져오고자 하는 범위를 [A1 표기법](https://developers.google.com/sheets/api/guides/concepts?hl=ko#cell)으로 선택하여 지정해주어야 하기에, ~~한 번에 모든 범위를 선택하고 그것을 핸들링하고 싶었지만~~ 번거롭지만 한글 제목, 한글 설명, 영문 제목, 영문 설명이 위치한 열을 선택하여 데이터를 가져왔다.

```tsx
type SEO = Record<string, Record<"title" | "description", string>>;
const createObjectFromColumns = (
  keyColumn: string[][],
  titleColumn: string[][],
  descriptionColumn: string[][]
) => {
  const result: SEO = {};

  // 첫 번째 행은 헤더(제목)
  for (let i = 1; i < keyColumn.length; i++) {
    const key = keyColumn[i]?.[0] || "";
    const title = titleColumn[i]?.[0] || "";
    const description = descriptionColumn[i]?.[0] || "";

    if (key) {
      result[key] = { title, description };
    }
  }

  return result;
};
```

```tsx
const columnAData = columnA.status === "fulfilled" ? columnA.value : [[]];
const columnEData = columnE.status === "fulfilled" ? columnE.value : [[]];
const columnFData = columnF.status === "fulfilled" ? columnF.value : [[]];
const columnGData = columnG.status === "fulfilled" ? columnG.value : [[]];
const columnHData = columnH.status === "fulfilled" ? columnH.value : [[]];
const koSEO = createObjectFromColumns(columnAData, columnEData, columnFData);
const enSEO = createObjectFromColumns(columnAData, columnGData, columnHData);

return { koSEO, enSEO };
```

```tsx
const getSeoData = async () => {
  const { koSEO, enSEO } = await getGoogleSpreadSheetForSeo();
  try {
    fs.writeFileSync(
      path.join(__dirname, "../public/locales/ko/seo.json"),
      JSON.stringify(koSEO)
    );
    fs.writeFileSync(
      path.join(__dirname, "../public/locales/en/seo.json"),
      JSON.stringify(enSEO)
    );
  } catch (err) {
    console.log("err : ", err);
  }
};
```

구분자(인 동시에 i18-next에서 key로 사용될)인 A열을 기점으로 페이지별로 제목(title)과 설명(description)에 해당하는 내용을 저장하여 Object 파일을 새성하였다. 그리고 이를 i18-next에서 참조하는 locale 폴더에 저장하고, 페이지별 코드를 구성할 때 [next-seo](https://www.npmjs.com/package/next-seo/v/4.24.0)에게 `title` 과 `description` 을 TFunction의 ReturnType을 전달하는 것으로 마무리하였다.

귀찮음에서 시작한 작업이라 간단하게 진행되었기에 아직 고민해볼 점이 남아있는 task이다. 현재 spread sheet를 불러오는 로직의 실행 시점은 CI/CD에서 빌드 이전에 동작하도록 구성해 놓았는데, 이렇다면 결국 SEO가 변경될 때 배포가 다시 진행되어야 한다는 점은 변함이 없다. 페이지 별로 (동적으로) SSR 단에서 Spread Sheet에 접근하는 방식도 설계해보았지만 페이지에 최초에 접근할 때 많은 시간이 소요되기에 적절한 방법이 아니라 판단하고 이 방식을 채택하였다. 최초의 Needs는 “배포없이 SEO 변경사항에 대응하고 싶다.” 이기에 조금 더 적절한 방법을 고민해보아야겠다.
