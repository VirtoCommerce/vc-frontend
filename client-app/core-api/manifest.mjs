/**
 * Declared plugin contributions: the condition builders a plugin's `plugin.config.ts` uses, the
 * normaliser that turns that config into `contributions.json`, and the Vite plugin that emits it.
 * Plain JS so the plugin's build (node) imports it natively, like federation.mjs. The shapes are
 * typed in the contract (`IPluginManifestConfigType`, `IPluginContributionsType`).
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const CONTRIBUTIONS_FILE_NAME = "contributions.json";
export const CONTRIBUTIONS_FORMAT = 1;

const SLOT_POLICIES = new Set(["reserve", "block", "none"]);
const MENU_SURFACES = new Set(["header", "account"]);
const HEADER_VIEWPORTS = new Set(["desktop", "mobile"]);
const SLOT_ID = /^[A-Za-z]+\/.+$/;

class ManifestError extends Error {
  constructor(where, message) {
    super(`[plugin manifest] ${where}: ${message}`);
    this.name = "ManifestError";
  }
}

function requireString(value, where, what) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ManifestError(where, `${what} must be a non-empty string, got ${JSON.stringify(value)}`);
  }
  return value;
}

function isScalar(value) {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

/**
 * `.eq` stays off the emitted JSON: non-enumerable, so neither `JSON.stringify` nor a spread sees it,
 * and the condition reads as "truthy" until someone calls it.
 */
function comparable(node) {
  Object.defineProperty(node, "eq", {
    enumerable: false,
    value: (value) => {
      if (!isScalar(value)) {
        throw new ManifestError("eq()", `expects a string, number, boolean or null, got ${JSON.stringify(value)}`);
      }
      return { ...node, eq: value };
    },
  });
  return node;
}

export function settingEnabled(key) {
  return { setting: requireString(key, "settingEnabled()", "the setting key") };
}

export function settingValue(key) {
  return comparable({ setting: requireString(key, "settingValue()", "the setting key") });
}

export function themeSetting(key) {
  return comparable({ themeSetting: requireString(key, "themeSetting()", "the theme setting key") });
}

export function authenticated() {
  return { authenticated: true };
}

/** All of them. */
export function userCan(...permissions) {
  if (permissions.length === 0) {
    throw new ManifestError("userCan()", "needs at least one permission");
  }
  const nodes = permissions.map((permission) => ({ can: requireString(permission, "userCan()", "a permission") }));
  return nodes.length === 1 ? nodes[0] : { and: nodes };
}

export function and(...conditions) {
  if (conditions.length === 0) {
    throw new ManifestError("and()", "needs at least one condition");
  }
  return { and: conditions };
}

export function or(...conditions) {
  if (conditions.length === 0) {
    throw new ManifestError("or()", "needs at least one condition");
  }
  return { or: conditions };
}

export function not(condition) {
  return { not: condition };
}

function field(path) {
  return comparable({ field: requireString(path, "field()", "the field path") });
}

const CONDITION_KEYS = ["setting", "themeSetting", "authenticated", "can", "field", "and", "or", "not"];

/**
 * Re-reads a condition into a plain node. Builders already produce well-formed ones; this catches a
 * hand-written literal, and it is what drops a stray `eq` method.
 */
function normalizeCondition(condition, where, allowField) {
  if (condition === null || typeof condition !== "object" || Array.isArray(condition)) {
    throw new ManifestError(where, `a condition must be an object, got ${JSON.stringify(condition)}`);
  }
  const keys = Object.keys(condition).filter((key) => key !== "eq");
  const [kind, ...extra] = keys;
  if (!CONDITION_KEYS.includes(kind) || extra.length) {
    throw new ManifestError(where, `unknown condition ${JSON.stringify(condition)}; use the builders`);
  }
  const hasEq = Object.prototype.propertyIsEnumerable.call(condition, "eq");
  if (hasEq && !["setting", "themeSetting", "field"].includes(kind)) {
    throw new ManifestError(where, `\`eq\` is not valid on a \`${kind}\` condition`);
  }
  const eq = hasEq ? { eq: condition.eq } : {};
  if (hasEq && !isScalar(condition.eq)) {
    throw new ManifestError(where, `\`eq\` expects a scalar, got ${JSON.stringify(condition.eq)}`);
  }
  switch (kind) {
    case "setting":
    case "themeSetting":
      return { [kind]: requireString(condition[kind], where, `\`${kind}\``), ...eq };
    case "field":
      if (!allowField) {
        throw new ManifestError(where, "a field(...) condition is only valid on a slot — nothing is rendered yet here");
      }
      return { field: requireString(condition.field, where, "`field`"), ...eq };
    case "authenticated":
      if (condition.authenticated !== true) {
        throw new ManifestError(where, "`authenticated` must be true");
      }
      return { authenticated: true };
    case "can":
      return { can: requireString(condition.can, where, "`can`") };
    case "not":
      return { not: normalizeCondition(condition.not, where, allowField) };
    default: {
      const operands = condition[kind];
      if (!Array.isArray(operands) || operands.length === 0) {
        throw new ManifestError(where, `\`${kind}\` needs a non-empty list of conditions`);
      }
      return { [kind]: operands.map((operand) => normalizeCondition(operand, where, allowField)) };
    }
  }
}

function withWhen(target, when, where, allowField = false) {
  if (when !== undefined) {
    target.when = normalizeCondition(when, where, allowField);
  }
  return target;
}

function optionalNumber(value, where, what) {
  if (value !== undefined && (typeof value !== "number" || !Number.isFinite(value))) {
    throw new ManifestError(where, `${what} must be a number`);
  }
  return value;
}

function normalizeLink(link, where) {
  const out = {
    id: requireString(link.id, where, "`id`"),
    title: requireString(link.title, where, "`title`"),
    routeName: requireString(link.routeName, where, "`routeName`"),
  };
  if (link.icon !== undefined) {
    out.icon = requireString(link.icon, where, "`icon`");
  }
  if (optionalNumber(link.priority, where, "`priority`") !== undefined) {
    out.priority = link.priority;
  }
  return withWhen(out, link.when, where);
}

function normalizeRoute(route, index) {
  const where = `routes[${index}]`;
  const out = {
    path: requireString(route.path, where, "`path`"),
    name: requireString(route.name, where, "`name`"),
  };
  if (route.parent !== undefined) {
    out.parent = requireString(route.parent, where, "`parent`");
  }
  if (route.redirect !== undefined) {
    out.redirect = requireString(route.redirect, where, "`redirect`");
  }
  return withWhen(out, route.when, where);
}

function normalizeMenu(entry, index) {
  const where = `menu[${index}]`;
  if (!MENU_SURFACES.has(entry.surface)) {
    throw new ManifestError(where, `\`surface\` must be "header" or "account", got ${JSON.stringify(entry.surface)}`);
  }
  if (entry.surface === "header") {
    const out = {
      surface: "header",
      group: requireString(entry.group, where, "`group`"),
      ...normalizeLink(entry, where),
    };
    if (entry.viewport !== undefined) {
      if (!HEADER_VIEWPORTS.has(entry.viewport)) {
        throw new ManifestError(where, '`viewport` must be "desktop" or "mobile"');
      }
      out.viewport = entry.viewport;
    }
    return out;
  }
  if (!Array.isArray(entry.children)) {
    throw new ManifestError(where, "an account section needs `children`");
  }
  const out = {
    surface: "account",
    id: requireString(entry.id, where, "`id`"),
    title: requireString(entry.title, where, "`title`"),
  };
  if (entry.icon !== undefined) {
    out.icon = requireString(entry.icon, where, "`icon`");
  }
  if (optionalNumber(entry.priority, where, "`priority`") !== undefined) {
    out.priority = entry.priority;
  }
  withWhen(out, entry.when, where);
  out.children = entry.children.map((child, childIndex) => normalizeLink(child, `${where}.children[${childIndex}]`));
  return out;
}

function normalizeSlot(slot, index) {
  const where = `slots[${index}]`;
  const at = requireString(slot.at, where, "`at`");
  if (!SLOT_ID.test(at)) {
    throw new ManifestError(where, `\`at\` must read "<category>/<name>", got ${JSON.stringify(at)}`);
  }
  if (!SLOT_POLICIES.has(slot.policy)) {
    throw new ManifestError(
      where,
      `\`policy\` must be "reserve", "block" or "none", got ${JSON.stringify(slot.policy)}`,
    );
  }
  const when = typeof slot.when === "function" ? slot.when(field) : slot.when;
  return withWhen({ at, policy: slot.policy }, when, where, true);
}

function rejectDuplicates(items, key, what) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item[key])) {
      throw new ManifestError(what, `${key} ${JSON.stringify(item[key])} is declared twice`);
    }
    seen.add(item[key]);
  }
}

function normalizeList(value, what, normalize) {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new ManifestError(what, "must be a list");
  }
  return value.map(normalize);
}

/**
 * The default export of a plugin's `plugin.config.ts`. Validates the declaration and returns it in
 * the shape the build writes to `contributions.json`; anything malformed fails the plugin's build
 * here, not the storefront at runtime.
 */
export function definePluginManifest(config) {
  if (config === null || typeof config !== "object") {
    throw new ManifestError("definePluginManifest()", "expects an object");
  }
  const out = { format: CONTRIBUTIONS_FORMAT };
  withWhen(out, config.when, "when");

  const routes = normalizeList(config.routes, "routes", normalizeRoute);
  if (routes) {
    rejectDuplicates(routes, "name", "routes");
    out.routes = routes;
  }
  const menu = normalizeList(config.menu, "menu", normalizeMenu);
  if (menu) {
    rejectDuplicates(menu, "id", "menu");
    out.menu = menu;
  }
  const slots = normalizeList(config.slots, "slots", normalizeSlot);
  if (slots) {
    rejectDuplicates(slots, "at", "slots");
    out.slots = slots;
  }
  return out;
}

/**
 * Emits `contributions.json` into the build output. It only reaches the storefront through the
 * platform descriptor, so the build fails when `public/plugin.json` does not list it in
 * `contentFiles` — otherwise every declaration would be silently ignored.
 */
export function pluginContributions(contributions) {
  let publicDir;
  return {
    name: "vc-frontend:plugin-contributions",
    apply: "build",
    configResolved(config) {
      publicDir = config.publicDir;
    },
    buildStart() {
      const pluginJsonPath = publicDir ? resolve(publicDir, "plugin.json") : undefined;
      if (!pluginJsonPath || !existsSync(pluginJsonPath)) {
        this.error(`${CONTRIBUTIONS_FILE_NAME} is only read through public/plugin.json, which is missing`);
      }
      const contentFiles = JSON.parse(readFileSync(pluginJsonPath, "utf8")).contentFiles;
      if (!Array.isArray(contentFiles) || !contentFiles.includes(CONTRIBUTIONS_FILE_NAME)) {
        this.error(
          `public/plugin.json must list "${CONTRIBUTIONS_FILE_NAME}" in contentFiles, or the host never sees it`,
        );
      }
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: CONTRIBUTIONS_FILE_NAME,
        source: JSON.stringify(contributions, null, 2) + "\n",
      });
    },
  };
}
