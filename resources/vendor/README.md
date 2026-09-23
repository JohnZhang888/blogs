# resources/vendor

Third‑party assets that used to be loaded from public CDNs at runtime. They are
committed here so the site is fully self‑contained: no request ever leaves the
origin, and the pages work offline / behind a firewall.

Every file is the unmodified upstream artifact (minus dropped font fallbacks,
noted below). Licenses are kept next to the files.

| Folder | Package | Version | Upstream source | License |
| --- | --- | --- | --- | --- |
| `katex/` | [KaTeX](https://katex.org/) | 0.17.0 | `katex@0.17.0` on npm | MIT — `katex/LICENSE.txt` |
| `highlight.js/` | [highlight.js](https://highlightjs.org/) | 11.11.1 | `@highlightjs/cdn-assets@11.11.1` on npm | BSD‑3‑Clause — `highlight.js/LICENSE.txt` |
| `clipboard-js/` | [clipboard.js](https://github.com/lgarithm/clipboard-js) | 0.3.6 | `clipboard-js@0.3.6` on npm | MIT — `clipboard-js/LICENSE.txt` |
| `marked/` | [marked](https://marked.js.org/) | 18.0.14 | `marked@18.0.14` on npm | MIT — `marked/LICENSE.txt` |
| `material-icons/` | [Material Icons](https://fonts.google.com/icons) | v145 | `fonts.gstatic.com` (regular weight, ligature build) | Apache‑2.0 — `material-icons/LICENSE.txt` |

## Notes

- **`katex/katex.min.css`** — the upstream stylesheet ships `woff2`, `woff` and
  `ttf` sources per face. Only the 20 `woff2` files are vendored (every browser
  that can run this site supports woff2), so the `woff`/`ttf` entries were
  stripped from the `src:` lists. No other byte of the file changed.
- **`highlight.js/highlight.min.js`** — the self‑contained ES module build
  (`es/highlight.min.js`), imported directly by `src/gen/main.js`.
- **`clipboard-js/index.min.css`** — this is upstream's *demo page* stylesheet.
  The site has always loaded it (it is not required by `clipboard.min.js`), so it
  is vendored as‑is to keep rendering byte‑for‑byte identical. Removing it is a
  safe follow‑up if the stray `p { margin: 0 0 16px }` rule is not wanted.
- **`material-icons/material-icons.css`** — hand‑written wrapper around the
  vendored `material-icons.woff2`, matching the CSS Google Fonts served. Glyphs
  are selected by ligature, e.g. `<span class="material-icons">home</span>`.

## Refreshing an asset

```sh
npm pack katex@0.17.0 && tar xzf katex-0.17.0.tgz
# copy package/dist/... over the matching folder here, then re-apply the
# woff/ttf stripping described above for katex.min.css
```
