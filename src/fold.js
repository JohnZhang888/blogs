// 洛谷风格折叠框（callout / fold）
//
// 参考：https://help.luogu.com.cn/rules/academic/handbook/markdown#callfold
//
// 语法：
//   :::info[我是标题]
//   折叠框内容
//   :::
//
// 支持 info / success / warning / error 四种类型；使用 {open} 参数使折叠框默认展开；
// 通过增加冒号数量实现嵌套（最内层三个冒号，每往外一层增加一个冒号）。
//
// 实现方式：注册一个 marked 块级扩展。tokenizer 用“栈”扫描匹配的关闭行（`:...:`），
// 支持任意层嵌套；body 通过 this.lexer.blockTokens 递归解析（嵌套折叠框自动生效），
// 标题通过 this.lexer.inline 解析行内语法（支持 LaTeX 占位符）。renderer 输出
// <details class="fold fold-{type}"{open}> 结构，配合 styles/_fold.scss 实现 UI 与动画。

const FOLD_TYPES = {
  info:    { label: '信息', icon: 'info' },
  success: { label: '成功', icon: 'check_circle' },
  warning: { label: '警告', icon: 'warning' },
  error:   { label: '错误', icon: 'error' },
};

// 折叠框类型关键字（用于 start() 的快速预检）
const TYPE_WORDS = '(?:info|success|warning|error)';

export const foldExtension = {
  name: 'fold',
  level: 'block',

  // 提示 marked 在可能起始的位置停下并调用 tokenizer。
  start(src) {
    return src.match(new RegExp(`^:{3,}\\s*${TYPE_WORDS}\\b`))?.index;
  },

  tokenizer(src) {
    // 打开行：:::info[标题] {open}
    // 分组：1 = 冒号串，2 = 类型，3 = 标题，4 = 尾部参数（{open} 等）
    const rule = new RegExp(
      `^(:{3,})\\s*(${TYPE_WORDS})(?:\\[([^\\]]*)\\])?((?:\\s*\\{[^}]*\\})*)\\s*\\n`
    );
    const match = rule.exec(src);
    if (!match) return undefined;

    const colonCount = match[1].length;
    const foldType = match[2];
    const title = (match[3] ?? '').trim();
    const open = /\{open\}/.test(match[4] ?? '');

    const bodyStart = match[0].length;
    const openLineRe = new RegExp(`^(:{3,})\\s*${TYPE_WORDS}\\b`);
    const closeLineRe = /^(:{3,})\s*$/;

    // 逐行扫描，用栈匹配关闭行（支持嵌套）。
    const stack = [];
    let pos = bodyStart;
    let closingLineStart = -1;
    let closingEnd = -1;

    while (pos < src.length) {
      let lineEnd = src.indexOf('\n', pos);
      if (lineEnd === -1) lineEnd = src.length;
      const line = src.slice(pos, lineEnd);

      const openMatch = line.match(openLineRe);
      const closeMatch = line.match(closeLineRe);

      if (openMatch) {
        stack.push(openMatch[1].length);
      } else if (closeMatch) {
        if (stack.length === 0) {
          // 栈为空：这一行就是当前折叠框的关闭行。
          closingLineStart = pos;
          closingEnd = lineEnd < src.length ? lineEnd + 1 : lineEnd;
          break;
        }
        stack.pop();
      }

      pos = lineEnd < src.length ? lineEnd + 1 : lineEnd;
    }

    // 未找到闭合行（语法不完整），回退为普通文本处理。
    if (closingLineStart === -1) return undefined;

    const token = {
      type: 'fold',
      raw: src.slice(0, closingEnd),
      foldType,
      open,
      title,
      titleTokens: [],
      tokens: [],
    };

    // 正文：从 bodyStart 到关闭行之前，递归解析为块级 tokens（含嵌套折叠框）。
    const bodyText = src.slice(bodyStart, closingLineStart);
    this.lexer.blockTokens(bodyText, token.tokens);

    // 标题：解析为行内 tokens（支持 LaTeX 占位符等）。
    if (title) {
      this.lexer.inline(title, token.titleTokens);
    }

    return token;
  },

  renderer(token) {
    const meta = FOLD_TYPES[token.foldType] ?? FOLD_TYPES.info;
    const titleHtml = token.title
      ? this.parser.parseInline(token.titleTokens)
      : escapeHtml(meta.label);

    const bodyHtml = this.parser.parse(token.tokens);

    return [
      `<details class="fold fold-${token.foldType}"${token.open ? ' open' : ''}>`,
      '<summary>',
      '<span class="fold-chevron material-icons" aria-hidden="true">expand_more</span>',
      `<span class="fold-type-icon material-icons" aria-hidden="true">${meta.icon}</span>`,
      `<span class="fold-title">${titleHtml}</span>`,
      '</summary>',
      '<div class="fold-body"><div class="fold-body-inner">',
      bodyHtml,
      '</div></div>',
      '</details>',
    ].join('\n');
  },
};

// 将折叠框扩展注册到 marked（应在模块全局作用域调用一次）。
export function registerFold(marked) {
  marked.use({ extensions: [foldExtension] });
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]);
}
