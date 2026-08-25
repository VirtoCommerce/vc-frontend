import { loadRemote, registerRemotes } from "@module-federation/enhanced/runtime";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { version as CORE_VERSION } from "@/core-api/package.json";
import { checkHostCompatibility } from "./version-gate";
import type { RouteRecordRaw, Router } from "vue-router";

/**
 * Host-side loader for Module Federation plugins. For each configured
 * remote: read its manifest, version-check it, `loadRemote` its declared expose, and
 * call `init()`. Plugins bind to the host's live services via the shared facade.
 * - Version safety: an incompatible remote is skipped before any of its code runs.
 * - Isolation: one bad remote can't abort the others; outcomes are logged/returned.
 * - Every network step is time-budgeted: the app-runner awaits this loader before
 *   installing the router, so a hung remote is *bounded* — it degrades to failed/skipped
 *   within its budget rather than hanging boot forever. There are TWO budget knobs
 *   (manifestTimeoutMs, loadTimeoutMs — the latter bounds load and init separately),
 *   so one remote may legally take up to manifest + 2×load (defaults: 2s + 3s + 3s =
 *   8s). bootstrap.ts additionally holds a BOOT_BACKSTOP_MS above that sum PLUS its own
 *   DISCOVERY_TIMEOUT_MS — a true backstop that fires only when these budgets malfunction
 *   or the loader chunk fetch itself hangs; keep it > discovery + manifest + 2×load when
 *   changing the defaults here.
 * Discovery has two sources: the platform's plugin list (xAPI `store.plugins`, fetched by the
 * caller) and `APP_MODULES_FEDERATION_REMOTES`, which wins when set so a local remote is never
 * overridden by what the backend serves. The harness ships no built-in remote.
 */

/** The contract every federated plugin's declared expose must satisfy. */
interface IFederatedPlugin {
  init?: () => void | Promise<void>;
}

interface IRemoteDescriptor {
  name: string;
  /** Manifest URL, never remoteEntry.js — see the ".json" rule in resolveEnvRemotes. */
  entry: string;
  /** MF expose key: "./Module" by the platform's default, "./plugin" from our scaffold. */
  exposed: string;
  permission?: string;
  styles: string[];
  /**
   * Env descriptors may legitimately live on another origin (see isAllowedRemoteUrl); platform
   * descriptors may not. Carried on the descriptor because isCompatible re-checks the manifest
   * RESPONSE url and cannot otherwise tell the two sources apart.
   */
  allowCrossOrigin?: boolean;
  /** The platform module's version, for logs only — compatibility rides on requiredHostVersion. */
  version?: string;
}

/** One plugin as xAPI projects it (`store.plugins`); structural so the loader stays off the core GraphQL layer. */
export interface IPlatformPlugin {
  id: string;
  version?: string | null;
  permission?: string | null;
  entry?: { type?: string | null; path?: string | null; hash?: string | null } | null;
  contentFiles?: readonly ({ type?: string | null; path?: string | null; hash?: string | null } | null)[] | null;
  remote?: { name?: string | null; exposed?: string | null } | null;
}

/** Subset of the MF manifest the host reads before executing plugin code. */
interface IRemoteManifest {
  metaData?: {
    requiredHostVersion?: string;
  };
}

export interface IFederatedLoadResult {
  loaded: string[];
  failed: string[];
  /** Skipped because incompatible with this host, manifest unreadable, or the configured entry URL is invalid. */
  skipped: string[];
}

export interface IFederatedLoaderOptions {
  /** What the platform advertises for this store; ignored when the env override is set. */
  plugins?: readonly IPlatformPlugin[];
  /**
   * xAPI does not filter the list per user, so a declared permission is evaluated here. This is a
   * UX and latency filter, NOT an authorization boundary: the bundle is fetched by an injected
   * <script> that carries no credentials, so its code and stylesheets stay publicly readable by
   * URL. Each plugin's data access has to be authorized by the backend on its own.
   * No callback + declared permission => skipped.
   */
  hasPermission?: (permission: string) => boolean;
  /** Budget for reading one remote's manifest JSON; exceeded => skipped (fail closed). */
  manifestTimeoutMs?: number;
  /**
   * Budget for the load phase AND (separately) the init phase of one remote;
   * exceeded => failed. When raising the defaults, keep bootstrap.ts's
   * BOOT_BACKSTOP_MS above manifestTimeoutMs + 2×loadTimeoutMs.
   */
  loadTimeoutMs?: number;
}

// Exported for the invariant test only (bootstrap's backstop must exceed their sum).
export const DEFAULT_MANIFEST_TIMEOUT_MS = 2_000;
export const DEFAULT_LOAD_TIMEOUT_MS = 3_000;

/** Distinguishes a budget expiry from the work's own failure (see raceWithLateLogging). */
class TimeoutError extends Error {}

async function withTimeout<T>(work: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([work, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * withTimeout, plus: when the BUDGET (not the work) is what failed, the work keeps
 * running detached — its eventual settlement is logged either way, so a "failed"
 * outcome is never silently contradicted (late success) and the real cause of a late
 * failure is not discarded in favor of the synthetic timeout error. A work promise
 * that rejects on its own is NOT double-logged — the caller's catch owns that error.
 */
async function raceWithLateLogging<T>(work: Promise<T>, ms: number, label: string, lateNote: string): Promise<T> {
  try {
    return await withTimeout(work, ms, label);
  } catch (error) {
    if (error instanceof TimeoutError) {
      work
        .then(() => Logger.warn(`[MF] ${label} completed after its budget - ${lateNote}`))
        .catch((lateError) => Logger.warn(`[MF] ${label} failed after its budget`, lateError));
    }
    throw error;
  }
}

/**
 * The env override is the only cross-origin path, so its entry must not be downgradable: https
 * only, with http allowed solely for localhost development. Platform entries answer to
 * isSameOrigin instead.
 * NOTE: either way this validates the MANIFEST url only. The manifest then declares its own
 * remoteEntry.js/chunk URLs, which loadRemote fetches as-is — they are NOT re-checked, so a
 * same-origin manifest can still point at code elsewhere. Whoever controls the manifest is
 * trusted to choose its code URLs.
 */
function isAllowedRemoteUrl(entry: string): boolean {
  let url: URL;
  try {
    url = new URL(entry);
  } catch {
    return false;
  }
  if (url.protocol === "https:") {
    return true;
  }
  // URL.hostname keeps the brackets for IPv6 literals, hence "[::1]".
  const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]";
  return url.protocol === "http:" && isLocalhost;
}

interface IResolvedRemotes {
  remotes: IRemoteDescriptor[];
  /** Names whose configured entry failed validation — reported as `skipped`, never silently dropped. */
  invalidNames: string[];
}

/** Assumed on the env path only — no env descriptor declares an expose key. */
const SCAFFOLD_EXPOSE_KEY = "./plugin";
const PLATFORM_EXPOSE_KEY = "./Module";
const MF_MANIFEST_FILE = "mf-manifest.json";
const PLATFORM_SCRIPT_ENTRY_TYPE = "script";
const PLATFORM_STYLE_FILE_TYPE = "style";

/**
 * Parses and validates APP_MODULES_FEDERATION_REMOTES: a string, an allowed https/localhost URL,
 * and it must contain ".json" — the MF runtime picks manifest-vs-remoteEntry by that substring
 * (isPureRemoteEntry does `!entry.includes(".json")`), so a manifest URL without it passes the
 * version gate and is then <script>-loaded as JS, failing far from the cause. The platform path
 * satisfies the same rule by building MF_MANIFEST_FILE; keep it that way.
 */
function resolveEnvRemotes(): IResolvedRemotes | undefined {
  const resolved: IResolvedRemotes = { remotes: [], invalidNames: [] };
  const raw = import.meta.env.APP_MODULES_FEDERATION_REMOTES;
  if (!raw) {
    // Unset -> platform list. Set but unusable still returns below, so a typo surfaces as
    // skips rather than being papered over by whatever the backend serves.
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    Logger.error("[MF] APP_MODULES_FEDERATION_REMOTES is not valid JSON; ignoring", error);
    return resolved;
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    Logger.error("[MF] APP_MODULES_FEDERATION_REMOTES must be a JSON object of remote name -> manifest URL; ignoring");
    return resolved;
  }

  for (const [name, value] of Object.entries(parsed)) {
    if (typeof value !== "string") {
      Logger.error(`[MF] Skipping remote "${name}": entry must be a string URL`);
      resolved.invalidNames.push(name);
      continue;
    }
    if (!isAllowedRemoteUrl(value)) {
      Logger.error(`[MF] Skipping remote "${name}": entry must be an https URL (http only for localhost)`);
      resolved.invalidNames.push(name);
      continue;
    }
    if (!/\.json/.test(value)) {
      Logger.error(
        `[MF] Skipping remote "${name}": entry must be a manifest JSON URL containing ".json" (e.g. .../mf-manifest.json) — the MF runtime script-loads other URLs as a remoteEntry`,
      );
      resolved.invalidNames.push(name);
      continue;
    }
    resolved.remotes.push({ name, entry: value, exposed: SCAFFOLD_EXPOSE_KEY, styles: [], allowCrossOrigin: true });
  }
  return resolved;
}

/**
 * The platform serves plugin files from the storefront's own origin, so that — not the scheme — is
 * the check for a platform entry. `toAbsoluteUrl` ignores its base for an already-absolute or
 * protocol-relative path, so without this a descriptor could name any host.
 */
function isSameOrigin(url: string): boolean {
  try {
    return new URL(url).origin === globalThis.location.origin;
  } catch {
    return false;
  }
}

/**
 * Descriptor fields are backend data behind a hand-written structural type, not codegen — a
 * non-string arriving here (schema drift, a bad module) must cost one plugin, not throw out of
 * the batch and lose every plugin with it.
 */
function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/** The `$(ModuleId)` token in a platform path must survive verbatim — the platform's routes contain it. */
function toAbsoluteUrl(path: string): string | undefined {
  try {
    return new URL(path, globalThis.location.origin).toString();
  } catch {
    return undefined;
  }
}

function toManifestUrl(entryUrl: string): string {
  const url = new URL(entryUrl);
  const path = url.pathname;
  url.pathname = path.slice(0, path.lastIndexOf("/") + 1) + MF_MANIFEST_FILE;
  return url.toString();
}

function withCacheBuster(url: string, hash?: string | null): string {
  if (!hash) {
    return url;
  }
  const result = new URL(url);
  result.searchParams.set("v", hash);
  return result.toString();
}

function collectStyles(plugin: IPlatformPlugin): string[] {
  const styles: string[] = [];
  for (const file of Array.isArray(plugin.contentFiles) ? plugin.contentFiles : []) {
    const filePath = asString(file?.path);
    if (!filePath) {
      continue;
    }
    // The platform documents these kinds as lower-case by contract, but a dropped stylesheet is
    // invisible otherwise: the plugin loads and renders unstyled with nothing to point at.
    const fileType = asString(file?.type);
    if (fileType?.toLowerCase() !== PLATFORM_STYLE_FILE_TYPE) {
      Logger.info(`[MF] Plugin "${plugin.id}": ignoring content file of kind "${String(file?.type)}"`);
      continue;
    }
    const url = toAbsoluteUrl(filePath);
    if (!url || !isSameOrigin(url)) {
      Logger.error(`[MF] Ignoring stylesheet "${filePath}" of plugin "${plugin.id}": not same-origin`);
      continue;
    }
    styles.push(withCacheBuster(url, asString(file?.hash)));
  }
  return styles;
}

const STYLE_MARKER = "data-mf-plugin-style";

/**
 * No cascade fence here yet: containment needs the HOST's own CSS layered too, so the plugin layer
 * can sit below the host's utilities and above its component styles (VCST-5760). Wrapping only the
 * plugin's sheet would put it above everything unlayered instead. The marker attribute doubles as
 * the dedupe key, so a second boot adds nothing.
 */
function injectStyles(urls: string[]): void {
  const present = new Set(
    Array.from(document.head.querySelectorAll(`link[${STYLE_MARKER}]`), (node) => node.getAttribute(STYLE_MARKER)),
  );
  for (const href of urls) {
    if (present.has(href)) {
      continue;
    }
    present.add(href);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.setAttribute(STYLE_MARKER, href);
    link.href = href;
    document.head.append(link);
  }
}

/**
 * The platform serves `remoteEntry.js`; the gate needs the manifest beside it, so the entry is
 * rewritten. A plugin shipping no manifest fails the gate and is skipped.
 */
function resolvePlatformRemotes(plugins: readonly IPlatformPlugin[]): IResolvedRemotes {
  const resolved: IResolvedRemotes = { remotes: [], invalidNames: [] };

  const seen = new Set<string>();

  // Not `?? []`: a non-array (schema drift, a bad gateway) is not iterable and would throw out of
  // the whole loader — the batch must survive whatever shape arrives.
  for (const plugin of Array.isArray(plugins) ? plugins : []) {
    const name = asString(plugin?.remote?.name) || asString(plugin?.id) || "";
    const path = asString(plugin?.entry?.path);
    if (!name) {
      Logger.error("[MF] Skipping a plugin the platform advertised with no usable id or remote name");
      continue;
    }
    if (!path) {
      Logger.error(`[MF] Skipping plugin "${name}": the platform declared no entry path`);
      resolved.invalidNames.push(name);
      continue;
    }
    // Only a script entry is an MF remote; anything else would be loaded as one by mistake. An
    // absent type is accepted: the platform declares the field optional.
    const type = asString(plugin?.entry?.type)?.toLowerCase();
    if (type && type !== PLATFORM_SCRIPT_ENTRY_TYPE) {
      Logger.error(`[MF] Skipping plugin "${name}": entry type "${type}" is not supported`);
      resolved.invalidNames.push(name);
      continue;
    }
    const entryUrl = toAbsoluteUrl(path);
    if (!entryUrl || !isSameOrigin(entryUrl)) {
      Logger.error(`[MF] Skipping plugin "${name}": entry "${path}" is not same-origin`);
      resolved.invalidNames.push(name);
      continue;
    }
    // Claimed only now: a descriptor rejected above must not hold a name against a later, valid
    // plugin. Registering a name twice is a no-op in the MF runtime (no `force` — see
    // registerRemotes below), so the second descriptor's code would never execute while the load
    // loop still ran per descriptor and reported it loaded. The loser is reported by id instead,
    // since the name itself belongs to the winner.
    if (seen.has(name)) {
      Logger.error(`[MF] Skipping plugin "${String(plugin?.id)}": remote name "${name}" is already taken`);
      resolved.invalidNames.push(asString(plugin?.id) || name);
      continue;
    }
    seen.add(name);
    resolved.remotes.push({
      name,
      entry: withCacheBuster(toManifestUrl(entryUrl), asString(plugin?.entry?.hash)),
      exposed: asString(plugin?.remote?.exposed) || PLATFORM_EXPOSE_KEY,
      permission: asString(plugin?.permission),
      styles: collectStyles(plugin),
      version: asString(plugin?.version),
    });
  }
  return resolved;
}

/** Env wins when set — a local remote must not be replaced by whatever the backend serves. */
function resolveRemotes(plugins: readonly IPlatformPlugin[]): IResolvedRemotes {
  const env = resolveEnvRemotes();
  if (!env) {
    return resolvePlatformRemotes(plugins);
  }
  if (plugins.length > 0) {
    // A configured-but-empty override is the quiet way to lose every deployed plugin.
    Logger.warn(
      `[MF] APP_MODULES_FEDERATION_REMOTES is set, so ${plugins.length} platform plugin(s) are ignored; it resolved to ${env.remotes.length} remote(s)`,
    );
  }
  return env;
}

/**
 * CONTRACT GATE (version gate 1 of 2 — see version-gate.ts and the README). Fetches
 * the remote manifest (plain JSON — no code execution) and checks its declared
 * `requiredHostVersion` (semver version or range) against the host's core version.
 * Skips on incompatibility, malformed requirement, manifest read failure, or
 * timeout — all fail closed. Shared-library versions (vue, apollo, ...) are guarded
 * separately by the SHARED-DEPENDENCY GATE at loadRemote() time.
 */
/**
 * Every name ONE `addRoute` call would claim at root level. vue-router computes
 * `isRootAdd = !originalRecord` and recurses into `children` before assigning it, so each named
 * child is a root add too and evicts its namesake — checking only the top-level `name` would let
 * `{ name: "Mine", children: [{ name: "Checkout" }] }` through.
 */
function claimedRouteNames(record: unknown, into: NonNullable<RouteRecordRaw["name"]>[] = []) {
  if (!record || typeof record !== "object") {
    return into;
  }
  const { name, children } = record as { name?: unknown; children?: unknown };
  if (typeof name === "string" || typeof name === "symbol") {
    into.push(name);
  }
  for (const child of Array.isArray(children) ? children : []) {
    claimedRouteNames(child, into);
  }
  return into;
}

/** Set for the synchronous span of a plugin's init() so a refusal names the right plugin. */
let initingPlugin: string | undefined;

/**
 * `router.addRoute` evicts whatever root-level route already carries the new record's name —
 * vue-router calls `removeRoute` for it, and its own warning is dev-only. A plugin naming its
 * route `Checkout` would take the host's page over in silence, so refuse the eviction.
 *
 * Installed ONCE for the whole load+init phase, not per plugin: plugins are loaded and initialised
 * concurrently, so a per-plugin save/restore captures whatever `addRoute` it observed — which is
 * the PREVIOUS plugin's wrapper — and hands that back on the way out, leaving the host router
 * permanently guarded by a closure belonging to one plugin while the next plugin ran unguarded.
 * Covering the whole phase also covers a remote's module scope, which executes during loadRemote,
 * before any init() is called.
 *
 * Both overloads add at root level: `addRoute(record)` and `addRoute(parentName, record)`. What it
 * still does not cover is a claim made after the phase ends — see the README's security model.
 */
function installRouteGuard(): () => void {
  const router: Router | undefined = globals.router;
  if (!router) {
    return () => {};
  }
  // Captured unbound and applied with the router as receiver, so the host gets its own method
  // back - restoring a bound copy would leave `router.addRoute` permanently replaced.
  const original = router.addRoute as (...args: unknown[]) => () => void;
  const guarded = (...args: unknown[]) => {
    const record = args.length >= 2 ? args[1] : args[0];
    const taken = claimedRouteNames(record).find((claimed) => router.hasRoute(claimed));
    if (taken !== undefined) {
      // initingPlugin is set for the synchronous span of init() only; a claim made from a
      // continuation after that cannot be attributed to one plugin.
      const who = initingPlugin ? `"${initingPlugin}"` : "a plugin";
      Logger.error(`[MF] ${who} tried to replace the existing route "${String(taken)}" - refused`);
      return () => {};
    }
    return original.apply(router, args);
  };
  router.addRoute = guarded;
  return () => {
    // Only undo our own install: a plugin that replaced addRoute itself keeps what it chose,
    // and restoring blindly would resurrect a wrapper the plugin deliberately shadowed.
    if (router.addRoute === guarded) {
      router.addRoute = original;
    }
  };
}

/**
 * `plugin.init()` — called ON the module, so a module shaped `{ services, init() { this.services } }`
 * (the natural form of the platform's default `./Module` expose) keeps its receiver. Passing the
 * detached function would make `this` undefined and report the plugin failed with no hint why.
 */
async function runInit(name: string, plugin: IFederatedPlugin, budgetMs: number): Promise<void> {
  let started: void | Promise<void>;
  initingPlugin = name;
  try {
    started = plugin.init?.();
  } finally {
    initingPlugin = undefined;
  }
  await raceWithLateLogging(Promise.resolve(started), budgetMs, `plugin "${name}" init`, "state is indeterminate");
}

/** Post-redirect rule, per discovery source — see the `allowCrossOrigin` note on IRemoteDescriptor. */
function isResponseOriginAllowed(remote: IRemoteDescriptor, url: string): boolean {
  return remote.allowCrossOrigin ? isAllowedRemoteUrl(url) : isSameOrigin(url);
}

async function isCompatible(remote: IRemoteDescriptor, manifestTimeoutMs: number): Promise<boolean> {
  try {
    const readManifest = async (): Promise<IRemoteManifest> => {
      const response = await fetch(remote.entry, {
        headers: { accept: "application/json" },
        // Aborts the actual network request; withTimeout below bounds the whole step
        // even if a fetch implementation ignores the signal.
        signal: AbortSignal.timeout(manifestTimeoutMs),
      });
      // The descriptor was checked, the response was not: redirects are followed, so an entry can
      // still land somewhere its source does not allow. Each source keeps ITS OWN rule — a
      // platform entry must stay same-origin, an env entry must stay https (or loopback http) —
      // because demanding same-origin here would kill the env override, whose whole purpose is
      // cross-origin. A redirect within the source's own rule stays allowed.
      const servedFrom = asString(response.url);
      if (servedFrom && !isResponseOriginAllowed(remote, servedFrom)) {
        throw new Error(`manifest for "${remote.name}" was served from ${servedFrom}, which its source does not allow`);
      }
      if (!response.ok) {
        throw new Error(`manifest HTTP ${response.status}`);
      }
      return (await response.json()) as IRemoteManifest;
    };
    const manifest = await withTimeout(readManifest(), manifestTimeoutMs, `manifest fetch for "${remote.name}"`);

    const compatibility = checkHostCompatibility(CORE_VERSION, manifest.metaData?.requiredHostVersion);
    if (!compatibility.ok) {
      Logger.warn(`[MF] Skipping "${remote.name}": ${compatibility.reason}`);
      return false;
    }
    return true;
  } catch (error) {
    Logger.error(`[MF] Could not read/validate manifest for "${remote.name}" (${remote.entry})`, error);
    return false;
  }
}

/**
 * Log a summary so a vanished plugin is never silent during development (Logger is
 * live in dev builds and a no-op in production). NOTE: failed/skipped plugins leave
 * no prod signal yet — reporting them to Application Insights (exceptions for
 * `failed`, customEvents for `skipped`) is a tracked stage-2 follow-up: see TODO.md.
 */
function reportOutcome(result: IFederatedLoadResult, versions?: ReadonlyMap<string, string>): void {
  const { loaded, failed, skipped } = result;
  const label = (name: string): string => {
    const version = versions?.get(name);
    return version ? `${name}@${version}` : name;
  };
  if (failed.length === 0 && skipped.length === 0) {
    // Happy path: no prod noise (Logger is a no-op in production builds). But a plugin
    // author running the prescribed local flow (build --mode=development + preview,
    // where Logger IS live) otherwise gets zero confirmation their remote loaded —
    // invisible for extension-point-only plugins that render no route. One positive
    // line closes that gap.
    if (loaded.length > 0) {
      Logger.info(`[MF] plugins loaded=[${loaded.map(label).join(", ")}]`);
    }
    return;
  }
  Logger.warn(
    `[MF] plugins loaded=${loaded.length} failed=[${failed.map(label).join(", ")}] skipped=[${skipped.map(label).join(", ")}]`,
  );
}

/**
 * Registers and initializes every configured, compatible federated plugin. Resolves
 * once all have settled and returns the outcome. Never rejects — isolation is total.
 */
export async function initFederatedModules(options?: IFederatedLoaderOptions): Promise<IFederatedLoadResult> {
  const manifestTimeoutMs = options?.manifestTimeoutMs ?? DEFAULT_MANIFEST_TIMEOUT_MS;
  const loadTimeoutMs = options?.loadTimeoutMs ?? DEFAULT_LOAD_TIMEOUT_MS;

  const result: IFederatedLoadResult = { loaded: [], failed: [], skipped: [] };
  const { remotes, invalidNames } = resolveRemotes(options?.plugins ?? []);
  // Config-invalid remotes count as skipped so they surface through the same loud
  // summary log as version-gate skips — never a silent drop.
  result.skipped.push(...invalidNames);
  const versions = new Map(
    remotes.filter((remote) => remote.version).map((remote) => [remote.name, remote.version as string]),
  );

  // Before the manifest fetch: a plugin the user may not run should cost no network at all.
  const permitted = remotes.filter((remote) => {
    const permission = remote.permission?.trim();
    try {
      if (!permission || options?.hasPermission?.(permission)) {
        return true;
      }
      Logger.info(`[MF] Skipping "${remote.name}": requires permission "${permission}"`);
    } catch (error) {
      // Host-supplied callback: one bad evaluation must cost one plugin, not the batch.
      Logger.error(`[MF] Skipping "${remote.name}": the permission check threw`, error);
    }
    result.skipped.push(remote.name);
    return false;
  });

  if (permitted.length === 0) {
    if (result.skipped.length > 0) {
      reportOutcome(result, versions);
    }
    return result;
  }

  // Version-gate everything before registering/executing any remote code.
  const compatibility = await Promise.all(
    permitted.map(async (remote) => ({ remote, ok: await isCompatible(remote, manifestTimeoutMs) })),
  );
  const compatible = compatibility.filter((entry) => entry.ok).map((entry) => entry.remote);
  compatibility.filter((entry) => !entry.ok).forEach((entry) => result.skipped.push(entry.remote.name));

  if (compatible.length === 0) {
    reportOutcome(result, versions);
    return result;
  }

  try {
    // No `force`: re-registering a known name is already a silent no-op in the MF runtime, while
    // `force` tears the remote down first (module cache, global entry name, share scope) and a
    // second boot would then re-run the plugin's module scope and its init().
    registerRemotes(compatible.map((remote) => ({ name: remote.name, entry: remote.entry })));
  } catch (error) {
    // registerRemotes registers one remote at a time, so a throw can leave earlier ones registered;
    // every compatible remote is still reported failed, and this must resolve (not reject) to keep
    // the "never rejects" contract.
    compatible.forEach((remote) => result.failed.push(remote.name));
    Logger.error("[MF] registerRemotes failed", error);
    reportOutcome(result, versions);
    return result;
  }

  // One guard for the whole phase — see installRouteGuard on why it must not be per plugin.
  const releaseRouteGuard = installRouteGuard();
  await Promise.allSettled(
    compatible.map(async (remote) => {
      try {
        // Load and init are raced SEPARATELY: a timed-out plugin's init() is never
        // invoked - the timeout is real containment for the init phase. Neither phase
        // can be CANCELLED though: a loadRemote that resolves after its budget has
        // still executed the remote's module scope (top-level side effects like a CSS
        // import), and an init() that started keeps running — raceWithLateLogging logs
        // both late settlements so the "failed" outcome is never silently contradicted.
        const plugin = await raceWithLateLogging(
          loadRemote<IFederatedPlugin>(`${remote.name}/${remote.exposed.replace(/^\.\//, "")}`),
          loadTimeoutMs,
          `plugin "${remote.name}" load`,
          "its module scope has executed (init() is NOT called); state is indeterminate",
        );
        // The MF runtime resolves null instead of rejecting when an errorLoadRemote
        // failover hook is registered. None is today, but "no module delivered"
        // must never count (silently) as loaded if one ever appears.
        if (plugin === null) {
          throw new Error(`plugin "${remote.name}" load resolved to null - no module was delivered`);
        }
        if (plugin.init) {
          await runInit(remote.name, plugin, loadTimeoutMs);
        } else {
          // Most likely the platform's default "./Module" expose against the admin-shell
          // contract; its module scope ran, but nothing registered anything.
          Logger.warn(`[MF] "${remote.name}" exposes no init() — nothing was registered`);
        }
        // Only now, so a failed plugin leaves no `contentFiles` link behind. A Vite-built plugin
        // ships its CSS inside its own chunks, which arrive during loadRemote and are not ours to
        // withhold or roll back.
        injectStyles(remote.styles);
        result.loaded.push(remote.name);
      } catch (error) {
        result.failed.push(remote.name);
        Logger.error(`[MF] Failed to load federated plugin "${remote.name}"`, error);
      }
    }),
  );
  releaseRouteGuard();

  reportOutcome(result, versions);
  return result;
}
