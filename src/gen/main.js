import { genArticleContent } from './article-content.js';
import { genIndexContent } from './index.js';

const page = document.querySelector("body");
let pageID = new URLSearchParams(window.location.search).get("page");
if (pageID === null) pageID = "index";
console.log(pageID);

let content = "";
if (pageID === "index") {
  content = await genIndexContent();
} else {
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
  <div class="container"> 
    ${content}
  </div>
</body>
</html>
`;