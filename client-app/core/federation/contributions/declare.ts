import { shallowRef } from "vue";
import { declareAccountSection, declareMenuLinks, withdrawDeclaredNavigation } from "@/core/composables/useNavigations";
import { Logger } from "@/core/utilities";
import { evaluateResidual, isGloballyTrue, resolveGlobalTerms } from "./evaluate";
import { isPluginSettled } from "./status";
import type { IConditionContextType, ResidualConditionType } from "./evaluate";
import type {
  IAccountMenuContributionType,
  IHeaderMenuContributionType,
  IMenuLinkContributionType,
  IPluginContributionsType,
  IRouteContributionType,
  SlotPolicyType,
} from "./types";
import type { ExtendedMenuLinkType, MenuType } from "@/core/types";
import type { DeepPartial } from "utility-types";
import type { RouteRecordRaw, Router } from "vue-router";

/** On a placeholder route: the owning plugin's name. */
export const PLACEHOLDER_META_KEY = "pluginPlaceholder";

const PluginRoutePlaceholder = () => import("./plugin-route-placeholder.vue");

interface IDeclaredSlotType {
  plugin: string;
  policy: SlotPolicyType;
  condition: ResidualConditionType;
}

const declaredSlots = shallowRef(new Map<string, IDeclaredSlotType>());

export interface IAppliedContributionsType {
  plugin: string;
  placeholderRoutes: string[];
  /** link id -> route name */
  links: Record<string, string>;
  /** section id -> its children's route names */
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
  return { header: { desktop: { [entry.group]: placed }, mobile: { [entry.group]: placed } } };
}

function toRouteRecord(route: IRouteContributionType, plugin: string): RouteRecordRaw {
  return {
    path: route.path,
    name: route.name,
    component: PluginRoutePlaceholder,
    meta: {
      [PLACEHOLDER_META_KEY]: plugin,
      // The parent's organization gate is not the plugin route's to inherit: the real route may clear
      // it (the Sales Rep Hub does). The placeholder re-navigates once the plugin settles, and the
      // gate then runs against the real route's meta.
      requiresOrganization: false,
    },
  };
}

/** Why the router cannot take this route as declared, or undefined if it can. */
function unroutableReason(route: IRouteContributionType, router: Router): string | undefined {
  if (route.parent !== undefined && !router.hasRoute(route.parent)) {
    return `under "${route.parent}", which does not exist`;
  }
  if (router.hasRoute(route.name)) {
    return "which is already taken";
  }
  return undefined;
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
    const reason = unroutableReason(route, router);
    if (reason) {
      Logger.warn(`[MF] "${plugin}" declares route "${route.name}", ${reason} - skipped`);
      continue;
    }
    const record = toRouteRecord(route, plugin);
    if (route.parent === undefined) {
      router.addRoute(record);
    } else {
      router.addRoute(route.parent, record);
    }
    applied.placeholderRoutes.push(route.name);
  }
}

function declareAccountEntry(
  entry: IAccountMenuContributionType,
  context: IConditionContextType,
  linkable: (link: IMenuLinkContributionType) => boolean,
  applied: IAppliedContributionsType,
): void {
  const declaredChildren = Array.isArray(entry.children) ? entry.children : [];
  const children = isGloballyTrue(entry.when, context) ? declaredChildren.filter(linkable) : [];
  if (children.length === 0) {
    return;
  }
  const declared = declareAccountSection({
    id: entry.id,
    title: entry.title,
    icon: entry.icon,
    priority: entry.priority,
    children: children.map(toLink),
  });
  if (declared) {
    applied.sections[entry.id] = children.map((child) => child.routeName);
  }
}

function declareMenu(
  contributions: IPluginContributionsType,
  context: IConditionContextType,
  router: Router,
  applied: IAppliedContributionsType,
): void {
  // RouterLink throws on an unknown route name.
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
    if (entry.surface !== "header") {
      declareAccountEntry(entry, context, linkable, applied);
    } else if (linkable(entry) && declareMenuLinks(headerSchema(entry), [entry.id], applied.plugin)) {
      applied.links[entry.id] = entry.routeName;
    }
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
 * Entries whose global `when` is false are not declared. Throws on an entry the router rejects or
 * a malformed one, after withdrawing whatever the plugin had declared so far.
 */
export function applyContributions(
  plugin: string,
  contributions: IPluginContributionsType,
  context: IConditionContextType,
  router: Router,
): IAppliedContributionsType {
  const applied: IAppliedContributionsType = {
    plugin,
    placeholderRoutes: [],
    links: {},
    sections: {},
  };
  try {
    declareRoutes(contributions, context, router, applied);
    declareMenu(contributions, context, router, applied);
    declareSlots(contributions, context, plugin);
  } catch (error) {
    releaseContributions(applied, router, false);
    throw error;
  }
  return applied;
}

/**
 * Drops unclaimed placeholders, slot declarations, and menu entries that now point nowhere (all of
 * them if the plugin failed). A section with one dead child is withdrawn whole.
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

/** The slot's declaration while it still holds its box: plugin pending and policy not `none`. */
function holdingDeclaration(category: string, name: string | undefined): IDeclaredSlotType | undefined {
  const declared = name ? declaredSlots.value.get(`${category}/${name}`) : undefined;
  return declared && declared.policy !== "none" && !isPluginSettled(declared.plugin) ? declared : undefined;
}

/** The policy to hold for this render while the declaring plugin is pending; `none` holds nothing. */
export function reservationFor(
  category: string,
  name: string | undefined,
  slotContext: unknown,
): SlotPolicyType | undefined {
  const declared = holdingDeclaration(category, name);
  return declared && evaluateResidual(declared.condition, slotContext) ? declared.policy : undefined;
}

/** Like `reservationFor`, ignoring field conditions: the call site already gated the slot. */
export function heldPolicyOf(category: string, name: string | undefined): SlotPolicyType | undefined {
  return holdingDeclaration(category, name)?.policy;
}

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
