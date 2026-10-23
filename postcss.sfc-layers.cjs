const { closeSync, fstatSync, openSync, readFileSync } = require("node:fs");
const path = require("node:path");

/**
 * Puts every Vue SFC style module into its cascade layer: `client-app/ui-kit/**` → `vc.kit`,
 * every other component → `vc.app`. Entry stylesheets, and App.vue that loads main.scss,
 * are layered by hand, so they are never touched here.
 */
const SFC_STYLE_QUERY = /\?vue&type=style/;
const HOISTED_AT_RULES = new Set(["charset", "import"]);

const LAYERS_FILE = path.join(__dirname, "client-app/assets/styles/_layers.scss");

/** The name lists of the `@layer a, b;` statements in `source`, in order. */
function parseLayerOrder(source, file) {
  const statements = source.match(/^@layer\s[^;]*;/gm);

  if (!statements) {
    throw new Error(`${file}: no layer order found; expected lines of the form "@layer theme, base, …;"`);
  }

  // Names only: the text is copied into CSS as is, where a Sass `//` comment or `#{}` makes the
  // browser drop the statement.
  const invalid = statements.find((statement) => /\/\/|\/\*|#\{|\{/.test(statement));

  if (invalid) {
    throw new Error(`${file}: "${invalid}" must hold layer names only (no block, comment or interpolation)`);
  }

  return statements.map((statement) => statement.slice("@layer ".length, -1));
}

let cached = { mtimeMs: -1, order: [] };

// Each wrapped module restates the order: a chunk may load before the entry CSS that declares it
// (the federation build links one ahead of index.css), and its first `@layer` would fix the order.
function layerOrder() {
  const fd = openSync(LAYERS_FILE, "r");

  try {
    const { mtimeMs } = fstatSync(fd);

    if (mtimeMs !== cached.mtimeMs) {
      cached = { mtimeMs, order: parseLayerOrder(readFileSync(fd, "utf-8"), LAYERS_FILE) };
    }
  } finally {
    closeSync(fd);
  }

  return cached.order;
}

const sfcLayers = () => ({
  postcssPlugin: "vc-sfc-layers",
  Once(root, { result, AtRule }) {
    const id = result.opts.from ?? "";

    if (!SFC_STYLE_QUERY.test(id)) {
      return;
    }

    const file = id.split("?")[0];

    if (file.endsWith("/client-app/App.vue")) {
      return;
    }

    const nodes = root.nodes.filter((node) => node.type !== "atrule" || !HOISTED_AT_RULES.has(node.name));

    if (!nodes.length) {
      return;
    }

    const layer = new AtRule({ name: "layer", params: file.includes("/client-app/ui-kit/") ? "vc.kit" : "vc.app" });

    // `append` moves the nodes; the constructor's `nodes` option would clone them.
    root.append(...layerOrder().map((params) => new AtRule({ name: "layer", params })), layer.append(nodes));
    // So the dev server rebuilds the module when the order changes.
    result.messages.push({ type: "dependency", plugin: "vc-sfc-layers", file: LAYERS_FILE, parent: id });
  },
});

sfcLayers.postcss = true;
sfcLayers.parseLayerOrder = parseLayerOrder;

module.exports = sfcLayers;
