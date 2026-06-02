import { genArticleContent } from './article-content.js';

const page = document.querySelector("html");
// let url = window.location.href;
// console.log(url);
// let res = url.match(/\/([^/]*)$/);
// let pageID = "";
// if (res === null) {
//   pageID = "index";
// } else pageID = res[1];
let pageID = new URLSearchParams(window.location.search).get("page");
if (pageID === null) pageID = "index";
console.log(pageID);

let content = "";
if (pageID !== "index") {
  content = await genArticleContent(pageID);
}
page.innerHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <p>Example Shell</p>
  ${content}
</body>
</html>
`;
