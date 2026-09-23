import { shallowRef } from "vue";
import { declareAccountSection, declareMenuLinks, withdrawDeclaredNavigation } from "@/core/composables/useNavigations";
import { Logger } from "@/core/utilities";
import { evaluateResidual, isGloballyTrue, resolveGlobalTerms } from "./evaluate";
import { isPluginSettled } from "./status";
import type { IConditionContextType, ResidualConditionType } from "./evaluate";
import type {
  IHeaderMenuContributionType,
  IMenuLinkContributionType,
  IPluginContributionsType,
  IRouteContributionType,
  SlotPolicyType,
} from "./types";
import type { ExtendedMenuLinkType, MenuType } from "@/core/types";
import type { DeepPartial } from "utility-types";
import type { RouteRecordRaw, Router } from "vue-router";

/** Carried by the host's stand-in for a declared route: the plugin the route belongs to. */
export const PLACEHOLDER_META_KEY = "pluginPlaceholder";
/** Carried by every route the host registered from a declaration, placeholder or redirect. */
export const DECLARED_META_KEY = "declaredByPlugin";

const PluginRoutePlaceholder = () => import("./plugin-route-placeholder.vue");

interface IDeclaredSlotType {
  plugin: string;
  policy: SlotPolicyType;
  /** The declaration's `when`, with its global terms already decided. */
  condition: ResidualConditionType;
}

const declaredSlots = shallowRef(new Map<string, IDeclaredSlotType>());

/** What one plugin's declarations added, so the host can withdraw what the plugin never claimed. */
export interface IAppliedContributionsType {
  plugin: string;
  placeholderRoutes: string[];
  /** Declared header link id -> the route it points to. */
  links: Record<string, string>;
  /** Declared account section id -> the routes its children point to. */
  sections: Record<string, string[]>;
}

function toLink(link: IMenuLinkContributionType): ExtendedMenuLinkType {
  const out: ExtendedMenuLinkType = { id: link.id, title: link.title, route: { name: link.routeName } };
  if (link.icon !== undefined) {
    out.icon = link.icon;
  }
  if (link.priority !== undefined) {
    out.priority = link.priority;
  }
  return out;
}

function headerSchema(entry: IHeaderMenuContributionType): DeepPartial<MenuType> {
  const link = toLink(entry);
  const placed = entry.group === "main" ? [link] : { children: [link] };
  const viewports = entry.viewport ? [entry.viewport] : (["desktop", "mobile"] as const);
  return { header: Object.fromEntries(viewports.map((viewport) => [viewport, { [entry.group]: placed }])) };
}

function toRouteRecord(route: IRouteContributionType, plugin: string): RouteRecordRaw {
  const meta = { [DECLARED_META_KEY]: plugin };
  if (route.redirect) {
    return { path: route.path, name: route.name, redirect: { name: route.redirect }, meta };
  }
  return {
    path: route.path,
    name: route.name,
    component: PluginRoutePlaceholder,
    meta: { ...meta, [PLACEHOLDER_META_KEY]: plugin },
  };
}

function declareRoutes(
  contributions: IPluginContributionsType,
  context: IConditionContextType,
  router: Router,
  applied: IAppliedContributionsType,
): void {
  const { plugin } = applied;
  for (const route of Array.isArray(contributions.routes) ? contributions.routes : []) {
    if (!isGloballyTrue(route.when, context)) {
      continue;
    }
    if (route.parent !== undefined && !router.hasRoute(route.parent)) {
      Logger.warn(
        `[MF] "${plugin}" declares route "${route.name}" under "${route.parent}", which does not exist - skipped`,
      );
      continue;
    }
    if (router.hasRoute(route.name)) {
      Logger.error(`[MF] "${plugin}" declares route "${route.name}", which is already taken - skipped`);
      continue;
    }
    const record = toRouteRecord(route, plugin);
    if (route.parent === undefined) {
      router.addRoute(record);
    } else {
      router.addRoute(route.parent, record);
    }
    if (!route.redirect) {
      applied.placeholderRoutes.push(route.name);
    }
  }
}

function declareMenu(
  contributions: IPluginContributionsType,
  context: IConditionContextType,
  router: Router,
  applied: IAppliedContributionsType,
): void {
  // A link is only declared when its route resolves now: RouterLink throws on an unknown name, and
  // the header would fail to render until the plugin registered the route itself.
  const linkable = (link: IMenuLinkContributionType) => {
    if (!isGloballyTrue(link.when, context)) {
      return false;
    }
    if (!router.hasRoute(link.routeName)) {
      Logger.warn(
        `[MF] "${applied.plugin}" declares a menu link to "${link.routeName}", which is not a route - skipped; declare the route too`,
      );
      return false;
    }
    return true;
  };

  for (const entry of Array.isArray(contributions.menu) ? contributions.menu : []) {
    if (entry.surface === "header") {
      if (linkable(entry)) {
        declareMenuLinks(headerSchema(entry), [entry.id]);
        applied.links[entry.id] = entry.routeName;
      }
      continue;
    }
    const declaredChildren = Array.isArray(entry.children) ? entry.children : [];
    const children = isGloballyTrue(entry.when, context) ? declaredChildren.filter(linkable) : [];
    if (children.length === 0) {
      continue;
    }
    declareAccountSection({
      id: entry.id,
      title: entry.title,
      icon: entry.icon,
      priority: entry.priority,
      children: children.map(toLink),
    });
    applied.sections[entry.id] = children.map((child) => child.routeName);
  }
}

function declareSlots(contributions: IPluginContributionsType, context: IConditionContextType, plugin: string): void {
  const slots = new Map(declaredSlots.value);
  for (const slot of Array.isArray(contributions.slots) ? contributions.slots : []) {
    const condition = slot.when === undefined ? true : resolveGlobalTerms(slot.when, context);
    if (condition === false) {
      continue;
    }
    const owner = slots.get(slot.at);
    if (owner && owner.plugin !== plugin) {
      Logger.warn(`[MF] "${plugin}" declares slot "${slot.at}", already declared by "${owner.plugin}" - skipped`);
      continue;
    }
    slots.set(slot.at, { plugin, policy: slot.policy, condition });
  }
  declaredSlots.value = slots;
}

/**
 * Registers what a plugin declared, before any of its code is fetched: a placeholder per route, its
 * menu entries, and the slots it will fill. Every entry whose global `when` is false is simply not
 * declared, so a deep link to it 404s exactly as it does today when a module never calls `addRoute`.
 * Anything that cannot be registered safely is skipped with a log line, never thrown.
 */
export function applyContributions(
  plugin: string,
  contributions: IPluginContributionsType,
  context: IConditionContextType,
  router: Router,
): IAppliedContributionsType {
  const applied: IAppliedContributionsType = { plugin, placeholderRoutes: [], links: {}, sections: {} };
  declareRoutes(contributions, context, router, applied);
  declareMenu(contributions, context, router, applied);
  declareSlots(contributions, context, plugin);
  return applied;
}

/**
 * Once the plugin settled: its unclaimed placeholders go (the plugin's own `addRoute` replaced the
 * rest), its slot declarations go, and so does every menu entry that the plugin never registered
 * itself and that now points nowhere — all of them when it failed. A section with one dead child is
 * withdrawn whole: the plugin evidently did not register it, and half a section is worse than none.
 */
export function releaseContributions(applied: IAppliedContributionsType, router: Router, loaded: boolean): void {
  for (const name of applied.placeholderRoutes) {
    const record = router.getRoutes().find((route) => route.name === name);
    if (record?.meta?.[PLACEHOLDER_META_KEY] === applied.plugin) {
      router.removeRoute(name);
    }
  }

  const slots = new Map([...declaredSlots.value].filter(([, declared]) => declared.plugin !== applied.plugin));
  if (slots.size !== declaredSlots.value.size) {
    declaredSlots.value = slots;
  }

  const dangles = (routeName: string) => !router.hasRoute(routeName);
  const links = Object.entries(applied.links)
    .filter(([, routeName]) => !loaded || dangles(routeName))
    .map(([id]) => id);
  const sections = Object.entries(applied.sections)
    .filter(([, routeNames]) => !loaded || routeNames.some(dangles))
    .map(([id]) => id);
  if (links.length || sections.length) {
    withdrawDeclaredNavigation(links, sections);
  }
}

/**
 * The box a declared slot holds while its plugin is on the way: its policy when the declaration
 * applies to this render, `undefined` when the host should render what it would without plugins.
 * `none` holds nothing — it decorates markup the host renders anyway.
 */
export function reservationFor(
  category: string,
  name: string | undefined,
  slotContext: unknown,
): SlotPolicyType | undefined {
  if (!name) {
    return undefined;
  }
  const declared = declaredSlots.value.get(`${category}/${name}`);
  if (!declared || declared.policy === "none" || isPluginSettled(declared.plugin)) {
    return undefined;
  }
  return evaluateResidual(declared.condition, slotContext) ? declared.policy : undefined;
}

/** The plugin that declared this slot, if it has not settled yet. */
export function pendingPluginOf(category: string, name: string | undefined): string | undefined {
  const declared = name ? declaredSlots.value.get(`${category}/${name}`) : undefined;
  return declared && !isPluginSettled(declared.plugin) ? declared.plugin : undefined;
}

/** Declared, still-pending slot names of one category, for extension points that list a category. */
export function pendingSlotNames(category: string): string[] {
  const prefix = `${category}/`;
  return [...declaredSlots.value.entries()]
    .filter(([id, declared]) => id.startsWith(prefix) && !isPluginSettled(declared.plugin))
    .map(([id]) => id.slice(prefix.length));
}

/** Specs only. */
export function resetDeclaredSlots(): void {
  declaredSlots.value = new Map();
}
