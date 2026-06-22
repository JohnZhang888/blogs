import { genArticleContent, buildLeftBar, buildRightBar, sortPageEntries } from './article-content.js';
import { genIndexContent } from './index.js';
import { themeOptions, initTheme, setThemeMode } from '../theme.js';
import hljs from "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/es/highlight.min.js"

const page = document.querySelector("content");
let pageID = new URLSearchParams(window.location.search).get("page");
if (pageID === null) pageID = "index";
document.body.classList.add(`page-${pageID}`);

let content = "";
if (pageID === "index") {
  content = await genIndexContent();
} else {
  content = await genArticleContent(pageID);
}
page.innerHTML = `
  <div class="container"> 
    ${content}
  </div>
`;

const drawer = document.querySelector('.mobile-drawer');
const drawerScrim = document.querySelector('.mobile-drawer-scrim');
const drawerTabs = Array.from(document.querySelectorAll('.drawer-tab'));
const drawerPanels = {
  list: document.querySelector('.drawer-panel-list'),
  toc: document.querySelector('.drawer-panel-toc')
};
const menuButton = document.querySelector('#bookmark-button');
const drawerClose = document.querySelector('.drawer-close-button');
const themeButton = document.querySelector('.topbar-theme-button');
const themeIcon = themeButton?.querySelector('span.material-icons');
const themeLabel = themeButton?.querySelector('.topbar-theme-label');
const themeMenu = document.querySelector('.topbar-dropdown-menu');
const themeItems = Array.from(themeMenu.querySelectorAll('[data-theme]'));

async function buildDrawerContent() {
  const dataResponse = await fetch(`page-data/basic-data.json`);
  const data = await dataResponse.json();
  const sortedEntries = sortPageEntries(data);
  drawerPanels.list.innerHTML = `<div class="sidebar-title">文章列表</div>${buildLeftBar(sortedEntries, pageID !== 'index' ? pageID : '')}`;

  if (pageID !== 'index') {
    const contentResponse = await fetch(`page-data/${pageID}.md`);
    const passageMarkdown = await contentResponse.text();
    const rightBar = buildRightBar(passageMarkdown);
    drawerPanels.toc.innerHTML = `<div class="sidebar-title">目录</div>${rightBar || '<div class="sidebar-item">暂无目录</div>'}`;
  } else {
    drawerPanels.toc.innerHTML = `<div class="sidebar-title">目录</div><div class="sidebar-item">暂无目录</div>`;
  }
}

function openDrawer() {
  drawer?.classList.add('open');
  drawer?.removeAttribute('hidden');
  drawerScrim?.removeAttribute('hidden');
}

function closeDrawer() {
  drawer?.classList.remove('open');
  drawerScrim?.setAttribute('hidden', '');
}

function switchDrawerTab(tabKey) {
  drawerTabs.forEach(tab => tab.classList.toggle('drawer-tab-active', tab.dataset.drawerTab === tabKey));
  Object.entries(drawerPanels).forEach(([key, panel]) => {
    panel.hidden = key !== tabKey;
  });
}

function toggleThemeMenu() {
  themeMenu.hidden = !themeMenu.hidden;
}

function closeThemeMenu() {
  themeMenu.hidden = true;
}

menuButton?.addEventListener('click', openDrawer);
drawerClose?.addEventListener('click', closeDrawer);
drawerScrim?.addEventListener('click', closeDrawer);
drawerTabs.forEach(tab => tab.addEventListener('click', () => switchDrawerTab(tab.dataset.drawerTab)));
drawer?.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (link) {
    closeDrawer();
  }
});

themeButton?.addEventListener('click', event => {
  event.stopPropagation();
  toggleThemeMenu();
});

themeItems.forEach(item => item.addEventListener('click', () => {
  const mode = item.dataset.theme;
  setThemeMode(mode, themeItems, themeIcon, themeLabel);
  closeThemeMenu();
}));

document.addEventListener('click', event => {
  if (!event.target.closest('.topbar-dropdown')) {
    closeThemeMenu();
  }
});

window.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeDrawer();
    closeThemeMenu();
  }
});

await buildDrawerContent();
switchDrawerTab('list');
initTheme(themeItems, themeIcon, themeLabel);

if (pageID !== "index") {
  const subtitles = document.querySelectorAll(".markdownContent h2");
  for (const subtitle of subtitles) {
    subtitle.setAttribute("id", subtitle.innerHTML)
  }
  
  // Highlight code blocks
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });

  // Render math formulas after content is loaded
  if (typeof renderMathInElement !== 'undefined') {
    renderMathInElement(document.querySelector('.container'), {
      delimiters: [
        {left: "$$", right: "$$", display: true},
        {left: "$", right: "$", display: false},
        {left: "\\(", right: "\\)", display: false},
        {left: "\\[", right: "\\]", display: true}
      ]
    });
  }
}