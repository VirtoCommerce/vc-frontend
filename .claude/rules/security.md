---
paths:
  - "**/*.vue"
  - "**/*.ts"
  - "**/*.html"
---

# Security

Semgrep (`.semgrep/vc-security.yml`) runs in CI; ERROR rules block. Escape hatch: `// nosemgrep: <id>` with a reason.

1. No raw `v-html`. Use `v-html-safe` (vue-html-secure), DOMPurify, `{{ }}` or `VcMarkdownRender` for markdown. Raw `v-html` only for bundled SVG already sanitized (ui-kit icons). A "transform" (`format`, `replaceUnicode`, `highlight`) inside `v-html` is not sanitization (`vc-vhtml-fake-sanitizer`).
2. No dynamic `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`. Print/export templates escape interpolated data.
3. Redirects to dynamic or `returnUrl` targets go through `toSameOriginPath()` / `getReturnUrlValue()` (open redirect).
4. `target="_blank"` needs `rel="noopener noreferrer"`; `window.open(url, "_blank", "noopener,noreferrer")`.
5. No `javascript:`, `vbscript:` or `data:text/html|svg` URLs in `href`, `src`, `to`.
6. Tokens/secrets: never read from URL query, never stored in `localStorage`/`sessionStorage`, never hardcoded. Use `crypto.randomUUID` / `getRandomValues`, not `Math.random`, for nonces, tokens, OTP.
7. `postMessage` listeners check `event.origin`; senders never use `"*"`.
8. External scripts load with SRI through the integrity-aware loader.
9. Spreadsheet/CSV export (`exceljs addRow`, `toCSV`) escapes formula injection (`=`, `+`, `-`, `@` prefixes).
10. Don't log tokens, passwords or personal data via `Logger`.
