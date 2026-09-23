import { genArticleContent, buildLeftBar, buildRightBar, sortPageEntries, generateIdFromTitle } from './article-content.js';
import { genIndexContent } from './index.js';
import { themeOptions, initTheme, setThemeMode } from '../theme.js';
import hljs from "../../resources/vendor/highlight.js/highlight.min.js"

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
  if (!drawer) return;

  // 先让抽屉进入可渲染状态（去掉 hidden 会从 display:none 变为可见）
  drawer.removeAttribute('hidden');
  drawerScrim?.removeAttribute('hidden');

  // 强制一次重排，确保浏览器先应用“关闭”状态的样式（translateX(-110%)、opacity:0），
  // 否则首次展开时起始样式和 .open 状态在同一帧内计算，过渡动画不会触发
  void drawer.offsetWidth;

  drawer.classList.add('open');
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

function openThemeMenu() {
  themeMenu.classList.remove('closing');
  themeMenu.classList.add('show');
  themeButton?.setAttribute('aria-expanded', 'true');
}

function toggleThemeMenu() {
  if (themeMenu.classList.contains('show')) {
    closeThemeMenu();
  } else {
    openThemeMenu();
  }
}

function closeThemeMenu() {
  if (!themeMenu.classList.contains('show')) {
    return;
  }

  themeMenu.classList.remove('show');
  themeMenu.classList.add('closing');
  themeButton?.setAttribute('aria-expanded', 'false');

  const finishClose = () => {
    themeMenu.classList.remove('closing');
    themeMenu.removeEventListener('animationend', finishClose);
    themeMenu.removeEventListener('animationcancel', finishClose);
  };

  themeMenu.addEventListener('animationend', finishClose, { once: true });
  themeMenu.addEventListener('animationcancel', finishClose, { once: true });
}

// 折叠框展开/收起动画（Web Animations API）
// - 用 .fold-open 类作为“视觉展开”状态的真实来源，点击时立即切换（箭头同步旋转）；
//   用 details.open 属性反映最终状态（无障碍/语义），在动画结束后更新。
// - 动画期间保持 details.open 为 true，避免浏览器原生 <details> 收起机制
//   干扰高度过渡（否则 Chrome 下收起动画会卡住/失效）。
function initFoldAnimation(details) {
  const summary = details.querySelector(':scope > summary');
  const body = details.querySelector(':scope > .fold-body');
  if (!summary || !body) return;

  const DURATION = 300;
  const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
  // 每次点击递增；只有“最新那次动画”的收尾允许落地，避免快速连点/动画被打断时，
  // 延迟的旧 onfinish 清掉内联高度导致回弹。
  let animId = 0;

  // 默认展开的折叠框（:::info{open} 或 <details open>）→ 箭头朝上
  if (details.open) {
    details.classList.add('fold-open');
  }

  summary.addEventListener('click', (event) => {
    event.preventDefault();
    const opening = !details.classList.contains('fold-open');
    const id = ++animId;

    // 冻结当前高度（正在播放动画时取当前渲染高度），并取消进行中的动画
    body.style.height = `${body.getBoundingClientRect().height}px`;
    body.getAnimations().forEach((animation) => animation.cancel());

    let keyframes;
    if (opening) {
      details.classList.add('fold-open');
      details.open = true;
      keyframes = [
        { height: '0px', opacity: 0 },
        { height: `${body.scrollHeight}px`, opacity: 1 },
      ];
    } else {
      details.classList.remove('fold-open');
      keyframes = [
        { height: `${body.getBoundingClientRect().height}px`, opacity: 1 },
        { height: '0px', opacity: 0 },
      ];
    }

    // 收尾：动画结束（onfinish）或兜底超时后应用最终状态。
    // 后台标签页/动画时间线被冻结时 onfinish 可能不触发，用 setTimeout 兜底，
    // 保证折叠框最终一定处于正确状态（展开→height:auto，收起→height:0 且 open=false）。
    let applied = false;
    const applyFinal = () => {
      if (applied || id !== animId) return;
      applied = true;
      if (opening) {
        body.style.height = 'auto';
      } else {
        details.open = false;
        body.style.height = '0px';
      }
      body.style.opacity = '';
    };

    const animation = body.animate(keyframes, { duration: DURATION, easing: EASING });
    animation.onfinish = applyFinal;
    setTimeout(applyFinal, DURATION + 150);
  });
}

// 事件绑定
menuButton?.addEventListener('click', openDrawer);
drawerClose?.addEventListener('click', closeDrawer);
drawerScrim?.addEventListener('click', closeDrawer);
drawerTabs.forEach(tab => tab.addEventListener('click', () => switchDrawerTab(tab.dataset.drawerTab)));

// 移动端抽屉内的链接点击处理（包含关闭抽屉和滚动）
drawer?.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (link) {
    closeDrawer();
    
    // 检查是否是目录链接（包含#hash）
    if (link.getAttribute('href')?.startsWith('#')) {
      event.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }
});

// 主题相关事件
themeButton?.addEventListener('click', event => {
  event.stopPropagation();
  toggleThemeMenu();
});

themeItems.forEach(item => item.addEventListener('click', () => {
  const mode = item.dataset.theme;
  setThemeMode(mode, themeItems, themeIcon, themeLabel);
  closeThemeMenu();
}));

// 全局点击事件处理程序 - 处理所有目录链接的平滑滚动和主题菜单关闭
document.addEventListener('click', event => {
  // 处理目录链接的平滑滚动
  const link = event.target.closest('a[href^="#"]');
  if (link && link.getAttribute('href') !== '#') {
    const targetId = link.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      event.preventDefault();
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      return; // 防止继续执行主题菜单关闭逻辑
    }
  }
  
  // 处理主题菜单关闭
  if (!event.target.closest('.topbar-dropdown')) {
    closeThemeMenu();
  }
});

// 键盘事件
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
  // 使用与article-content.js相同的ID生成逻辑
  const subtitles = document.querySelectorAll(".markdown-content h2");
  for (const subtitle of subtitles) {
    const idText = subtitle.textContent.trim()
      .replace(/[^\w\s\u4e00-\u9fa5]/g, '')
      .toLowerCase()
      .replace(/[\s]+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (idText) {
      subtitle.setAttribute("id", idText);
    }
  }

  // 折叠框：为文章内已存在的原生 <details> 补充动画所需的 .fold-body 结构，
  // 并绑定展开/收起动画（:::info 等折叠框渲染时已自带该结构）。
  // 原生 <details> 在移除 [open] 时浏览器内部机制会干扰 CSS grid-template-rows
  // 过渡（Chrome 下收起动画会卡住/失效），因此用 Web Animations API 精确控制
  // .fold-body 高度，展开/收起双向动画都可靠。
  document.querySelectorAll('.markdown-content details').forEach((details) => {
    if (!details.querySelector(':scope > .fold-body')) {
      const body = document.createElement('div');
      body.className = 'fold-body';
      const inner = document.createElement('div');
      inner.className = 'fold-body-inner';
      while (details.children.length > 1) {
        inner.appendChild(details.children[1]);
      }
      body.appendChild(inner);
      details.appendChild(body);
    }
    // 为手写 <details> 的 summary 补上箭头（:::info 等折叠框渲染时已自带）
    const summary = details.querySelector(':scope > summary');
    if (summary && !summary.querySelector('.fold-chevron')) {
      const chevron = document.createElement('span');
      chevron.className = 'fold-chevron material-icons';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.textContent = 'expand_more';
      summary.insertBefore(chevron, summary.firstChild);
    }
    initFoldAnimation(details);
  });

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