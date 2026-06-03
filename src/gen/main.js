import { genArticleContent } from './article-content.js';
import { genIndexContent } from './index.js';
import hljs from "https://cdn.osyb.cn/gh/highlightjs/cdn-release@11.11.1/build/es/highlight.min.js"

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
  <p>Example Shell</p>
  <div class="container"> 
    ${content}
  </div>
`;

hljs.highlightAll();

const renderKaTeX = () => {
  if (typeof renderMathInElement !== "function") return;
  renderMathInElement(document.body, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false },
      { left: "\\[", right: "\\]", display: true }
    ],
    throwOnError: false
  });
};

if (typeof renderMathInElement === "function") {
  renderKaTeX();
} else {
  window.addEventListener("load", renderKaTeX);
}