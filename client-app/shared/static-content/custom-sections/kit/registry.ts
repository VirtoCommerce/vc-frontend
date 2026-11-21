// The kit tags and behaviors custom section templates may use. Not built on `useExtensionRegistry`, whose
// categories are slots for components with `{ component, condition }` entries: a behavior has no component, and
// a kit entry carries what the renderer, the agent and the server read of it.
import { createGlobalState } from "@vueuse/core";
import { omit } from "lodash-es";
import { shallowRef } from "vue";
import { Logger } from "@/core/utilities";
import type { ICustomSectionBehavior, ICustomSectionTag } from "../types";

interface IKitRegistry {
  tags: Readonly<Record<string, ICustomSectionTag>>;
  behaviors: Readonly<Record<string, ICustomSectionBehavior>>;
}

/** A custom element of lowercase words; the template writes it as it is. */
const TAG_NAME_REGEX = /^vc-[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** What follows `data-`; `data-each`, `data-if` and `data-html` are the template's own, `data-sb-*` and `data-pb-*` the storefront's. */
const BEHAVIOR_NAME_REGEX = /^(?!(?:each|if|html|sb|pb)(?:-|$))[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const ATTRIBUTE_NAME_REGEX = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
/** As the server refuses them on any kit tag, whatever the tag declares. */
const DENIED_TAG_ATTRIBUTE_REGEX = /^(?:on.*|style|id|is|class|srcdoc|form.*|popover.*|ping|srcset|poster|action)$/;

/** Reserved: the storefront's kit registers lazily, after a module or a plugin could claim its names. */
const RESERVED_TAG_NAMES = new Set(["vc-button", "vc-icon", "vc-badge", "vc-products"]);
const RESERVED_BEHAVIOR_NAMES = new Set([
  "inview",
  "scroll-progress",
  "pointer",
  "count-up",
  "countdown",
  "copy",
  "marquee",
]);

const useKitRegistry = createGlobalState(() => shallowRef<IKitRegistry>({ tags: {}, behaviors: {} }));

let isRegisteringBuiltIn = false;

/**
 * Adds a tag a custom section template places as `<name>`: `vc-` and lowercase words joined by `-`. Its
 * attributes are lowercase words too, and none the server refuses on a kit tag (`on*`, `style`, `id`, `class`,
 * `srcset`, `poster`…). The storefront's own tags are reserved; the first registration of a name wins. A tag
 * that breaks a rule is ignored with a warning.
 */
export function registerSectionTag(name: string, tag: ICustomSectionTag): void {
  const registry = useKitRegistry();
  const refusal = getTakenRefusal(name, registry.value.tags) ?? getTagRefusal(name, tag);

  if (refusal) {
    Logger.warn(`registerSectionTag: "${name}" ${refusal}; ignoring.`);
    return;
  }

  registry.value = { ...registry.value, tags: { ...registry.value.tags, [name]: tag } };
}

/**
 * Adds a behavior a custom section template switches on with `data-{name}`, its options written
 * `data-{name}-{option}`. No attribute of it may be another behavior's, and `data-each`, `data-if`, `data-html`,
 * `data-sb-*` and `data-pb-*` are taken. The storefront's own behaviors are reserved; the first registration of
 * a name wins. A behavior that breaks a rule is ignored with a warning.
 */
export function registerSectionBehavior(name: string, behavior: ICustomSectionBehavior): void {
  const registry = useKitRegistry();
  const refusal =
    getTakenRefusal(name, registry.value.behaviors) ?? getBehaviorRefusal(name, behavior, registry.value.behaviors);

  if (refusal) {
    Logger.warn(`registerSectionBehavior: "${name}" ${refusal}; ignoring.`);
    return;
  }

  registry.value = { ...registry.value, behaviors: { ...registry.value.behaviors, [name]: behavior } };
}

/** The storefront's own tags stay. */
export function unregisterSectionTag(name: string): void {
  const registry = useKitRegistry();

  if (RESERVED_TAG_NAMES.has(name) || !Object.hasOwn(registry.value.tags, name)) {
    return;
  }

  registry.value = { ...registry.value, tags: omit(registry.value.tags, name) };
}

/** The storefront's own behaviors stay. */
export function unregisterSectionBehavior(name: string): void {
  const registry = useKitRegistry();

  if (RESERVED_BEHAVIOR_NAMES.has(name) || !Object.hasOwn(registry.value.behaviors, name)) {
    return;
  }

  registry.value = { ...registry.value, behaviors: omit(registry.value.behaviors, name) };
}

/** Reactive: read inside a `computed` or a render, a template follows tags registered later. */
export function getSectionTags(): Readonly<Record<string, ICustomSectionTag>> {
  return useKitRegistry().value.tags;
}

export function getSectionBehaviors(): Readonly<Record<string, ICustomSectionBehavior>> {
  return useKitRegistry().value.behaviors;
}

export function isDeniedTagAttribute(name: string): boolean {
  return DENIED_TAG_ATTRIBUTE_REGEX.test(name);
}

/** The storefront's own entries, under their reserved names. Not in the facade. */
export function registerBuiltInKitEntries(
  tags: Readonly<Record<string, ICustomSectionTag>>,
  behaviors: Readonly<Record<string, ICustomSectionBehavior>>,
): void {
  isRegisteringBuiltIn = true;

  try {
    Object.entries(tags).forEach(([name, tag]) => registerSectionTag(name, tag));
    Object.entries(behaviors).forEach(([name, behavior]) => registerSectionBehavior(name, behavior));
  } finally {
    isRegisteringBuiltIn = false;
  }
}

function getTagRefusal(name: string, tag: ICustomSectionTag): string | undefined {
  if (!TAG_NAME_REGEX.test(name)) {
    return "is not a kit tag name";
  }

  if (!isRegisteringBuiltIn && RESERVED_TAG_NAMES.has(name)) {
    return "is the storefront's own";
  }

  const refused = Object.keys(tag.attributes).find(
    (attribute) => !ATTRIBUTE_NAME_REGEX.test(attribute) || isDeniedTagAttribute(attribute),
  );

  return refused ? `takes the attribute "${refused}", which a kit tag may not` : undefined;
}

function getBehaviorRefusal(
  name: string,
  behavior: ICustomSectionBehavior,
  registered: Readonly<Record<string, ICustomSectionBehavior>>,
): string | undefined {
  if (!BEHAVIOR_NAME_REGEX.test(name)) {
    return "is not a behavior name";
  }

  const options = Object.keys(behavior.options ?? {});

  if (options.some((option) => !ATTRIBUTE_NAME_REGEX.test(option))) {
    return "has an option that is not a lowercase word";
  }

  if (isRegisteringBuiltIn) {
    return undefined;
  }

  // `count` with the option `up` would write the attribute of `count-up`, and the reverse.
  const attributes = [name, ...options.map((option) => `${name}-${option}`)];
  const takenAttributes = [
    ...RESERVED_BEHAVIOR_NAMES,
    ...Object.entries(registered).flatMap(([other, { options: otherOptions }]) => [
      other,
      ...Object.keys(otherOptions ?? {}).map((option) => `${other}-${option}`),
    ]),
  ];
  const clash = attributes.find((attribute) =>
    takenAttributes.some((taken) => attribute === taken || isReservedPrefix(attribute, taken)),
  );

  return clash ? `would write data-${clash}, which another behavior takes` : undefined;
}

/** A built-in behavior may add an option later, so its name is held as a prefix too. */
function isReservedPrefix(attribute: string, taken: string): boolean {
  return RESERVED_BEHAVIOR_NAMES.has(taken) && attribute.startsWith(`${taken}-`);
}

function getTakenRefusal(name: string, entries: Readonly<Record<string, unknown>>): string | undefined {
  return Object.hasOwn(entries, name) ? "is already registered" : undefined;
}
