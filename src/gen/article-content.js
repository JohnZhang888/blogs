import { marked } from "https://cdn.osyb.cn/npm/marked/lib/marked.esm.js"

export async function genArticleContent(pageID) {
  const dataResponse = await fetch(`/${pageID}/data.json`);
  const passageData = await dataResponse.json();

  const contentResponse = await fetch(`/${pageID}/content.md`);
  const passageMarkdown = await contentResponse.text();

  const markdownParsed = marked.parse(passageMarkdown);

  return `
  <h1>${passageData.title}</h1>
  <p>作者：${passageData.author}</p>
  <p>日期：${passageData.date}</p>
  ${markdownParsed}
  `;
}
