/**
 * Standalone entry — exists only so `vite build` has an HTML input and so the
 * remote is trivially runnable on its own port during dev. The plugin's real
 * surface is the federated `./plugin` expose (src/index.ts), consumed by the host.
 */
const el = document.getElementById("app");
if (el) {
  el.textContent = "news remote — consumed via Module Federation ‘./plugin’";
}
