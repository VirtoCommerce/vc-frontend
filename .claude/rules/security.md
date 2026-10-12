---
paths:
  - "**/*.vue"
  - "**/*.ts"
  - "**/*.html"
---

# Security

Semgrep (`.semgrep/vc-security.yml`) runs in CI in baseline mode: the job doesn't fail on findings; new alerts show in the "Semgrep OSS" code-scanning check — treat one as a defect. Escape hatch: `// nosemgrep: <id>` (`<!-- nosemgrep: <id> -->` in templates) with a reason.

1. No raw `v-html`. Use `v-html-safe` (vue-html-secure), DOMPurify, `{{ }}` or `VcMarkdownRender` for markdown. Raw `v-html` only for bundled SVG already sanitized (ui-kit icons). A "transform" (`format`, `replaceUnicode`, `highlight`) inside `v-html` is not sanitization (`vc-vhtml-fake-sanitizer`).
2. No dynamic `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`. Print/export templates escape interpolated data.
3. Navigating to a URL from input: return URLs via `useReturnUrl().getReturnUrl()`; anything else assigned to `location` goes through `toSameOriginPath()`. `getReturnUrlValue()` only extracts the param — never navigate with it alone.
4. `target="_blank"` needs `rel="noopener noreferrer"`; `window.open(url, "_blank", "noopener,noreferrer")`.
5. No `javascript:`, `vbscript:` or `data:text/html|svg` URLs in `href`, `src`, `to`.
6. Tokens/secrets: auth tokens live only in `useAuth`'s storage. Never add another token/secret to `localStorage`/`sessionStorage`, never read one from the URL query, never hardcode one. Use `crypto.randomUUID` / `getRandomValues`, not `Math.random`, for nonces, tokens, OTP.
7. `postMessage` listeners check `event.origin`; senders never use `"*"`.
8. Third-party scripts load via `useScriptTag` with `integrity` + `crossOrigin` when the vendor publishes a hash (see `useDynamicScript` in `payment-processing-cyber-source.vue`).
9. Any CSV/XLSX export escapes formula injection (cells starting with `=`, `+`, `-`, `@`).
10. Don't log tokens, passwords or personal data via `Logger`.
