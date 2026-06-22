export const themeOptions = [
  { value: 'auto', label: '跟随浏览器', icon: 'computer' },
  { value: 'light', label: '浅色', icon: 'wb_sunny' },
  { value: 'dark', label: '深色', icon: 'nightlight' }
];

const themeCookieName = 'themeMode';
const hljsThemeLinkId = 'hljs-theme';
const hljsThemeUrls = {
  light: 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/styles/github.min.css',
  dark: 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/styles/github-dark.min.css'
};

function readCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')); 
  return match ? match[2] : '';
}

function writeCookie(name, value) {
  document.cookie = `${name}=${value};path=/;max-age=31536000;SameSite=Lax`;
}

export function getPreferredMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setHljsTheme(mode) {
  const link = document.getElementById(hljsThemeLinkId);
  if (!link) return;
  link.href = mode === 'dark' ? hljsThemeUrls.dark : hljsThemeUrls.light;
}

export function applyMode(mode) {
  const target = mode === 'dark' ? 'dark' : 'light';
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(target);
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(target);
  setHljsTheme(target);
}

export function renderThemeMenu(themeItems, mode) {
  themeItems.forEach(item => {
    item.hidden = item.dataset.theme === mode;
  });
}

export function updateThemeButton(themeItems, themeIcon, themeLabel, mode) {
  const option = themeOptions.find(opt => opt.value === mode) || themeOptions[0];
  if (themeIcon) {
    themeIcon.className = `material-icons ${option.icon}`;
    themeIcon.textContent = option.icon;
  }
  if (themeLabel) {
    themeLabel.textContent = option.label;
  }
  renderThemeMenu(themeItems, mode);
}

export function setThemeMode(mode, themeItems, themeIcon, themeLabel) {
  writeCookie(themeCookieName, mode);
  const actualMode = mode === 'auto' ? getPreferredMode() : mode;
  applyMode(actualMode);
  updateThemeButton(themeItems, themeIcon, themeLabel, mode);
}

export function initTheme(themeItems, themeIcon, themeLabel) {
  const stored = readCookie(themeCookieName) || 'auto';
  const active = stored === 'auto' ? getPreferredMode() : stored;
  applyMode(active);
  updateThemeButton(themeItems, themeIcon, themeLabel, stored);

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    if (readCookie(themeCookieName) === 'auto') {
      const actualMode = getPreferredMode();
      applyMode(actualMode);
      updateThemeButton(themeItems, themeIcon, themeLabel, 'auto');
    }
  });
}
