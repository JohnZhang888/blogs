// 洛谷风格表格合并（table span）
//
// 参考：https://help.luogu.com.cn/rules/academic/handbook/markdown#table-span
// - `^`：与同一列上方的单元格合并（向上合并），被合并的单元格消失，上方单元格 rowspan + 1。
// - `<`：与同一行左侧的单元格合并（向左合并），被合并的单元格消失，左侧单元格 colspan + 1。
// - 合并标记必须是单元格内唯一的纯文本内容（允许前后空白），不能与其它文字或 Markdown 格式混用。
//
// 实现思路：基于“源坐标”的网格，逐行逐列扫描。
// owner[r][c] 记录覆盖网格位置 (r, c) 的单元格（可能来自更早的行/列），
// 因此 `^` 会并入 owner[r-1][c]，`<` 会并入 owner[r][c-1]，即使目标单元格本身已被合并也能正确追踪。

// 对单个 <table> 元素应用表格合并，就地修改 DOM。
export function applyTableSpan(table) {
  const rows = Array.from(table.querySelectorAll('tr'));
  if (rows.length === 0) return;

  // 先快照所有单元格，避免后续删除导致索引错位。
  const cellMatrix = rows.map((row) => Array.from(row.cells));
  const rowCount = rows.length;
  const colCount = cellMatrix.reduce((max, cells) => Math.max(max, cells.length), 0);
  if (colCount === 0) return;

  // owner[r][c]：覆盖网格 (r, c) 的单元格对象；null 表示尚未确定。
  const owner = Array.from({ length: rowCount }, () => new Array(colCount).fill(null));

  for (let r = 0; r < rowCount; r++) {
    const cells = cellMatrix[r];
    for (let c = 0; c < cells.length; c++) {
      const cell = cells[c];
      const text = cell.textContent.trim();

      if (text === '^' && r > 0) {
        // 向上合并：并入上方网格位置的持有者。
        const above = owner[r - 1][c];
        if (above) {
          above.rowSpan = (above.rowSpan || 1) + 1;
          owner[r][c] = above;
          cell.remove();
          continue;
        }
      } else if (text === '<' && c > 0) {
        // 向左合并：并入左侧网格位置的持有者。
        const left = owner[r][c - 1];
        if (left) {
          left.colSpan = (left.colSpan || 1) + 1;
          owner[r][c] = left;
          cell.remove();
          continue;
        }
      }

      // 普通单元格：直接持有当前网格位置。
      owner[r][c] = cell;
    }
  }
}

// 对一段已渲染的 HTML 字符串应用表格合并，返回处理后的 HTML。
// 仅在浏览器环境（存在 document）下生效。
export function applyTableSpanToHTML(html) {
  if (typeof document === 'undefined') return html;
  const container = document.createElement('div');
  container.innerHTML = html;
  container.querySelectorAll('table').forEach(applyTableSpan);
  return container.innerHTML;
}
