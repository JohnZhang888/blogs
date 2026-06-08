import { marked } from "https://cdn.osyb.cn/npm/marked/lib/marked.esm.js"


export async function genArticleContent(pageID) {
  const dataResponse = await fetch(`page-data/basic-data.json`);
  const data = await dataResponse.json();
  const pageData = data[pageID];

  const contentResponse = await fetch(`page-data/${pageID}.md`);
  const passageMarkdown = await contentResponse.text();
  

  const markdownParsed = marked.parse(passageMarkdown);

  const dataResponseList = await fetch(`page-data/basic-data.json`);
  const dataList = await dataResponseList.json();
  console.log(dataList);

  const sortedEntries = Object.entries(dataList).sort(([idA, itemA], [idB, itemB]) => {
    const pinA = Number(itemA.pinValue ?? 0);
    const pinB = Number(itemB.pinValue ?? 0);
    if (pinA !== pinB) {
      return pinB - pinA;
    }

    const dateA = itemA.date ?? "";
    const dateB = itemB.date ?? "";
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA);
    }

    const titleA = itemA.title ?? "";
    const titleB = itemB.title ?? "";
    return titleA.localeCompare(titleB);
  });

  let leftBarList = ``;
  for (const [id, item] of sortedEntries) {
    console.log(id);
    console.log(item);
    if (id == pageID) {
      leftBarList += `<a href="./?page=${id}"><div class="sidebar-item-selected">${item.title}</div></a>`;
    }
    else {
      leftBarList += `<a href="./?page=${id}"><div class="sidebar-item">${item.title}</div></a>`;
    }
  }

  const subtitles = Array.from(
    passageMarkdown.matchAll(/^##\s+(.*)$/gm),
    (match) => match[1].trim()
  );

  let rightBarList = ``;
  for (const subtitle of subtitles) {
    rightBarList += `<a href="#${subtitle}"><div class="sidebar-item">${subtitle}</div></a>`
  }

  return `
  <div class="responsive-row">
          <div class="box-left">
            <div class="sidebar-title">文章列表</div>
            ${leftBarList}
          </div>
          <div class="box-right">
            <div class="sidebar-title">目录</div>
            ${rightBarList}
          </div>
          <div class="box-center">
            <h1 style="margin-top: -8px;">${pageData.title}</h1>
            <div style="margin: 12px 0 8px 0">
              <p class="faded-text" style="margin: 0 0 0 0;"><i class="bi bi-pencil-fill"></i>&ensp;${pageData.author}&emsp;&emsp;<i class="bi bi-calendar-fill"></i>&ensp;${pageData.date}</p>
              <p class="faded-text" style="margin: 4px 0 0 0;">${pageData.description}</p>
              ${markdownParsed}
            </div>
          </div>
          
        </div>
  `;
}