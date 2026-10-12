/** Condition builders, `definePluginManifest` and the Vite plugin that emits it. Plain JS: runs in the plugin's node build. */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { CONTRIBUTIONS_FORMAT } from "./manifest-format.mjs";

export { CONTRIBUTIONS_FORMAT };

const SLOT_POLICIES = new Set(["reserve", "block", "none"]);
const MENU_SURFACES = new Set(["header", "account"]);
const SLOT_ID = /^[A-Za-z]+\/.+$/;

function readJsonFile(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

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

// Non-enumerable, so `.eq` stays out of the emitted JSON.
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

export function settingEnabled(module, key) {
  return {
    setting: requireString(key, "settingEnabled()", "the setting key"),
    module: requireString(module, "settingEnabled()", "the module id"),
  };
}

export function settingValue(module, key) {
  return comparable({
    setting: requireString(key, "settingValue()", "the setting key"),
    module: requireString(module, "settingValue()", "the module id"),
  });
}

export function themeSetting(key) {
  return comparable({ themeSetting: requireString(key, "themeSetting()", "the theme setting key") });
}

export function authenticated() {
  return { authenticated: true };
}

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

const CONDITION_KEYS = new Set(["setting", "themeSetting", "authenticated", "can", "field", "and", "or", "not"]);

// `eq` and `module` ride on a leaf; returns the `eq` part to spread back.
function leafModifiers(condition, kind, where) {
  const hasEq = Object.prototype.propertyIsEnumerable.call(condition, "eq");
  if (hasEq && !["setting", "themeSetting", "field"].includes(kind)) {
    throw new ManifestError(where, `\`eq\` is not valid on a \`${kind}\` condition`);
  }
  if (hasEq && !isScalar(condition.eq)) {
    throw new ManifestError(where, `\`eq\` expects a scalar, got ${JSON.stringify(condition.eq)}`);
  }
  if (Object.hasOwn(condition, "module") && kind !== "setting") {
    throw new ManifestError(where, `\`module\` is only valid on a \`setting\` condition`);
  }
  return hasEq ? { eq: condition.eq } : {};
}

// Validates hand-written literals and drops the `eq` method.
function normalizeCondition(condition, where, allowField) {
  if (condition === null || typeof condition !== "object" || Array.isArray(condition)) {
    throw new ManifestError(where, `a condition must be an object, got ${JSON.stringify(condition)}`);
  }
  const keys = Object.keys(condition).filter((key) => key !== "eq" && key !== "module");
  const [kind, ...extra] = keys;
  if (!CONDITION_KEYS.has(kind) || extra.length) {
    throw new ManifestError(where, `unknown condition ${JSON.stringify(condition)}; use the builders`);
  }
  const eq = leafModifiers(condition, kind, where);
  switch (kind) {
    case "setting":
      return {
        setting: requireString(condition.setting, where, "`setting`"),
        module: requireString(condition.module, where, "`module`"),
        ...eq,
      };
    case "themeSetting":
      return { themeSetting: requireString(condition.themeSetting, where, "`themeSetting`"), ...eq };
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
  } else if (!out.path.startsWith("/")) {
    throw new ManifestError(
      where,
      `a route without \`parent\` needs an absolute \`path\`, got ${JSON.stringify(out.path)}`,
    );
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

/** One link id may sit in several groups, as in the host's own menu; not twice in one. */
function rejectDuplicateMenuEntries(menu) {
  const seen = new Set();
  for (const entry of menu) {
    const place = entry.surface === "header" ? `group "${entry.group}"` : "the account menu";
    const key = `${entry.id}\n${place}`;
    if (seen.has(key)) {
      throw new ManifestError("menu", `id ${JSON.stringify(entry.id)} is declared twice in ${place}`);
    }
    seen.add(key);
  }
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
  return value.map((item, index) => normalize(item, index));
}

/** The default export of `plugin.config.ts`; a malformed declaration fails the plugin's build. */
export function definePluginManifest(config) {
  if (config === null || typeof config !== "object") {
    throw new ManifestError("definePluginManifest()", "expects an object");
  }
  const out = { format: CONTRIBUTIONS_FORMAT };
  withWhen(out, config.when, "when");
  if (config.blocksBoot !== undefined && typeof config.blocksBoot !== "boolean") {
    throw new ManifestError("blocksBoot", `\`blocksBoot\` must be a boolean, got ${JSON.stringify(config.blocksBoot)}`);
  }
  if (config.blocksBoot) {
    out.blocksBoot = true;
  }

  const routes = normalizeList(config.routes, "routes", normalizeRoute);
  if (routes) {
    rejectDuplicates(routes, "name", "routes");
    out.routes = routes;
  }
  const menu = normalizeList(config.menu, "menu", normalizeMenu);
  if (menu) {
    rejectDuplicateMenuEntries(menu);
    out.menu = menu;
  }
  const slots = normalizeList(config.slots, "slots", normalizeSlot);
  if (slots) {
    rejectDuplicates(slots, "at", "slots");
    out.slots = slots;
  }
  return out;
}

/** Writes the declaration into the built `plugin.json` as `contributions`. */
export function pluginContributions(contributions) {
  let publicDir;
  let outDir;
  return {
    name: "vc-frontend:plugin-contributions",
    apply: "build",
    configResolved(config) {
      publicDir = config.publicDir;
      outDir = resolve(config.root, config.build.outDir);
    },
    buildStart() {
      if (!publicDir || !readJsonFile(resolve(publicDir, "plugin.json"))) {
        this.error("the platform serves the declaration from public/plugin.json, which is missing");
      }
    },
    // Runs after Vite copied public/plugin.json.
    closeBundle() {
      const builtPluginJson = resolve(outDir, "plugin.json");
      const pluginJson = readJsonFile(builtPluginJson);
      if (!pluginJson) {
        this.error(`${builtPluginJson} is missing, so the declaration has nowhere to go; keep build.copyPublicDir on`);
      }
      writeFileSync(builtPluginJson, JSON.stringify({ ...pluginJson, contributions }, null, 2) + "\n");
    },
  };
}
