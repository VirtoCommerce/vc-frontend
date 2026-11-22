// The kit tags and behaviors custom section templates may use. Not built on `useExtensionRegistry`, whose
// categories are slots for components with `{ component, condition }` entries: a behavior has no component, and
// a kit entry carries what the renderer, the agent and the server read of it.
import { createGlobalState } from "@vueuse/core";
import { omit } from "lodash-es";
import { shallowRef } from "vue";
import { isRecord, Logger } from "@/core/utilities";
import { RENDER_BUDGET } from "../limits";
import type { ICustomSectionBehavior, ICustomSectionField, ICustomSectionTag } from "../types";

export interface IKit {
  tags: Readonly<Record<string, ICustomSectionTag>>;
  behaviors: Readonly<Record<string, ICustomSectionBehavior>>;
}

/** The storefront's own kit. It registers lazily, after a module or a plugin could claim a name, so these are reserved. */
export const BUILT_IN_TAG_NAMES = ["vc-button", "vc-icon", "vc-badge", "vc-products"] as const;
export const BUILT_IN_BEHAVIOR_NAMES = [
  "inview",
  "scroll-progress",
  "pointer",
  "count-up",
  "countdown",
  "copy",
  "marquee",
] as const;

export type BuiltInTagNameType = (typeof BUILT_IN_TAG_NAMES)[number];
export type BuiltInBehaviorNameType = (typeof BUILT_IN_BEHAVIOR_NAMES)[number];

/** A custom element of lowercase words; the template writes it as it is. */
const TAG_NAME_REGEX = /^vc-[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** What follows `data-`; `data-each`, `data-if` and `data-html` are the template's own, `data-sb-*` and `data-pb-*` the storefront's. */
const BEHAVIOR_NAME_REGEX = /^(?!(?:each|if|html|sb|pb)(?:-|$))[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const ATTRIBUTE_NAME_REGEX = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
/** As the server refuses them on any kit tag, whatever the tag declares. */
const DENIED_TAG_ATTRIBUTE_REGEX = /^(?:on.*|style|id|is|class|srcdoc|form.*|popover.*|ping|srcset|poster|action)$/;
/** The template's bindings' and the storefront's own, which the server refuses on a kit tag too. */
const RESERVED_DATA_ATTRIBUTE_REGEX = /^data-(?:(?:each|if|html|sb|pb)$|(?:sb|pb)-)/;

/** As the server reads a kit field. */
const FIELD_TYPES = new Set<ICustomSectionField["type"]>(["string", "number", "boolean", "select", "link", "date"]);
const FIELD_KEYS = new Set(["type", "options", "optionsFrom", "min", "max", "description"]);
const MAX_DESCRIPTION_LENGTH = 1024;
/** The server holds a bound as a decimal, so it refuses the whole kit for one past this. */
const MAX_BOUND = 7.9e28;

const RESERVED_TAG_NAMES = new Set<string>(BUILT_IN_TAG_NAMES);
const RESERVED_BEHAVIOR_NAMES = new Set<string>(BUILT_IN_BEHAVIOR_NAMES);

const useKitRegistry = createGlobalState(() => shallowRef<IKit>({ tags: {}, behaviors: {} }));

/**
 * Adds a tag a custom section template places as `<name>`: `vc-` and lowercase words joined by `-`. Its
 * attributes are lowercase words too, none the server refuses on a kit tag (`on*`, `style`, `id`, `class`,
 * `srcset`, `poster`…), each a field the server reads. The storefront's own tags are reserved; the first
 * registration of a name wins. A tag that breaks a rule is ignored with a warning.
 */
export function registerCustomSectionTag(name: string, tag: ICustomSectionTag): void {
  const registry = useKitRegistry();
  const refusal = getTakenRefusal(name, registry.value.tags) ?? getTagRefusal(name, tag);

  if (refusal) {
    Logger.warn(`registerCustomSectionTag: "${name}" ${refusal}; ignoring.`);
    return;
  }

  registry.value = { ...registry.value, tags: { ...registry.value.tags, [name]: tag } };
}

/**
 * Adds a behavior a custom section template switches on with `data-{name}`, its options written
 * `data-{name}-{option}`, its value and options each a field the server reads. No attribute of it may be another
 * behavior's, and `data-each`, `data-if`, `data-html`, `data-sb-*` and `data-pb-*` are taken. The storefront's own
 * behaviors are reserved; the first registration of a name wins. A behavior that breaks a rule is ignored with a
 * warning.
 */
export function registerCustomSectionBehavior(name: string, behavior: ICustomSectionBehavior): void {
  const registry = useKitRegistry();
  const refusal =
    getTakenRefusal(name, registry.value.behaviors) ?? getBehaviorRefusal(name, behavior, registry.value.behaviors);

  if (refusal) {
    Logger.warn(`registerCustomSectionBehavior: "${name}" ${refusal}; ignoring.`);
    return;
  }

  registry.value = { ...registry.value, behaviors: { ...registry.value.behaviors, [name]: behavior } };
}

/** The storefront's own tags stay. */
export function unregisterCustomSectionTag(name: string): void {
  const registry = useKitRegistry();

  if (!RESERVED_TAG_NAMES.has(name) && Object.hasOwn(registry.value.tags, name)) {
    registry.value = { ...registry.value, tags: omit(registry.value.tags, name) };
  }
}

/** The storefront's own behaviors stay. */
export function unregisterCustomSectionBehavior(name: string): void {
  const registry = useKitRegistry();

  if (!RESERVED_BEHAVIOR_NAMES.has(name) && Object.hasOwn(registry.value.behaviors, name)) {
    registry.value = { ...registry.value, behaviors: omit(registry.value.behaviors, name) };
  }
}

/** Reactive: read inside a `computed` or a render, a template follows tags and behaviors registered later. */
export function getCustomSectionKit(): IKit {
  return useKitRegistry().value;
}

export function getCustomSectionTags(): IKit["tags"] {
  return getCustomSectionKit().tags;
}

export function getCustomSectionBehaviors(): IKit["behaviors"] {
  return getCustomSectionKit().behaviors;
}

/** The attributes a behavior writes in a template: its own `data-{name}` first, then its options'. */
export function getBehaviorAttributeNames(name: string, behavior: ICustomSectionBehavior): string[] {
  return [`data-${name}`, ...Object.keys(behavior.options ?? {}).map((option) => `data-${name}-${option}`)];
}

export function isDeniedTagAttribute(name: string): boolean {
  return DENIED_TAG_ATTRIBUTE_REGEX.test(name) || RESERVED_DATA_ATTRIBUTE_REGEX.test(name);
}

/** The storefront's own entries, under their reserved names: nobody else can hold them, so they merge in. */
export function registerBuiltInKitEntries(
  tags: Readonly<Record<BuiltInTagNameType, ICustomSectionTag>>,
  behaviors: Readonly<Record<BuiltInBehaviorNameType, ICustomSectionBehavior>>,
): void {
  const registry = useKitRegistry();

  registry.value = {
    tags: { ...registry.value.tags, ...tags },
    behaviors: { ...registry.value.behaviors, ...behaviors },
  };
}

function getTagRefusal(name: string, tag: ICustomSectionTag): string | undefined {
  if (!TAG_NAME_REGEX.test(name)) {
    return "is not a kit tag name";
  }

  if (RESERVED_TAG_NAMES.has(name)) {
    return "is the storefront's own";
  }

  for (const [attribute, field] of Object.entries(tag.attributes)) {
    if (!ATTRIBUTE_NAME_REGEX.test(attribute) || isDeniedTagAttribute(attribute)) {
      return `takes the attribute "${attribute}", which a kit tag may not`;
    }

    const fieldRefusal = getFieldRefusal(field);

    if (fieldRefusal) {
      return `has the attribute "${attribute}", which ${fieldRefusal}`;
    }
  }

  if (tag.hasSideEffects !== undefined && typeof tag.hasSideEffects !== "boolean") {
    return "has a hasSideEffects that is not true or false";
  }

  if (tag.cost !== undefined && !(Number.isInteger(tag.cost) && tag.cost >= 1 && tag.cost <= RENDER_BUDGET)) {
    return `has a cost that is not a whole number from 1 to ${RENDER_BUDGET}`;
  }

  return getDescriptionRefusal(tag.description);
}

function getBehaviorRefusal(
  name: string,
  behavior: ICustomSectionBehavior,
  registered: IKit["behaviors"],
): string | undefined {
  if (!BEHAVIOR_NAME_REGEX.test(name)) {
    return "is not a behavior name";
  }

  if (behavior.writes !== undefined && !(Array.isArray(behavior.writes) && behavior.writes.every(isText))) {
    return "has writes that are not a list of names";
  }

  if (behavior.repeatsChildren !== undefined && typeof behavior.repeatsChildren !== "boolean") {
    return "has a repeatsChildren that is not true or false";
  }

  const options = Object.entries(behavior.options ?? {});
  const fieldRefusal =
    (behavior.value === undefined ? undefined : getFieldRefusal(behavior.value)) ??
    options.map(([option, field]) => getOptionRefusal(option, field)).find(Boolean) ??
    getDescriptionRefusal(behavior.description);

  if (fieldRefusal) {
    return fieldRefusal;
  }

  // `count` with the option `up` would write the attribute of `count-up`, and the reverse.
  const attributes = getBehaviorAttributeNames(name, behavior);
  const takenAttributes = [
    ...[...RESERVED_BEHAVIOR_NAMES].map((reserved) => `data-${reserved}`),
    ...Object.entries(registered).flatMap(([other, otherBehavior]) => getBehaviorAttributeNames(other, otherBehavior)),
  ];
  const clash = attributes.find((attribute) =>
    takenAttributes.some((taken) => attribute === taken || isReservedPrefix(attribute, taken)),
  );

  return clash ? `would write ${clash}, which another behavior takes` : undefined;
}

function getOptionRefusal(option: string, field: ICustomSectionField): string | undefined {
  if (!ATTRIBUTE_NAME_REGEX.test(option)) {
    return `has the option "${option}", which is not lowercase words`;
  }

  const fieldRefusal = getFieldRefusal(field);
  return fieldRefusal ? `has the option "${option}", which ${fieldRefusal}` : undefined;
}

/** As the server checks a kit field: one bad field would make it refuse the whole kit for every template. */
function getFieldRefusal(field: unknown): string | undefined {
  if (!isRecord(field)) {
    return "is not a field";
  }

  const unknownKey = Object.keys(field).find((key) => !FIELD_KEYS.has(key));

  if (unknownKey) {
    return `has the key "${unknownKey}", which a field does not have`;
  }

  if (!FIELD_TYPES.has(field.type as ICustomSectionField["type"])) {
    return "has no type of string, number, boolean, select, link or date";
  }

  if (field.options !== undefined && !(Array.isArray(field.options) && field.options.every(isText))) {
    return "has options that are not a list of strings";
  }

  if (field.optionsFrom !== undefined && !(field.type === "select" && field.optionsFrom === "icons")) {
    return 'has an optionsFrom other than "icons" of a select';
  }

  // No value of such a select could be taken.
  if (field.type === "select" && field.options === undefined && field.optionsFrom === undefined) {
    return "is a select with neither options nor optionsFrom";
  }

  if ([field.min, field.max].some((bound) => bound !== undefined && !isBound(bound))) {
    return "has a min or a max that is not a number within range";
  }

  return field.description === undefined ? undefined : getDescriptionRefusal(field.description);
}

function getDescriptionRefusal(description: unknown): string | undefined {
  return typeof description === "string" && description.length <= MAX_DESCRIPTION_LENGTH
    ? undefined
    : `has a description that is not a text of ${MAX_DESCRIPTION_LENGTH} characters at most`;
}

/** A built-in behavior may add an option later, so its name is held as a prefix too. */
function isReservedPrefix(attribute: string, taken: string): boolean {
  return RESERVED_BEHAVIOR_NAMES.has(taken.slice("data-".length)) && attribute.startsWith(`${taken}-`);
}

function getTakenRefusal(name: string, entries: Readonly<Record<string, unknown>>): string | undefined {
  return Object.hasOwn(entries, name) ? "is already registered" : undefined;
}

function isBound(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value) && Math.abs(value) < MAX_BOUND;
}

function isText(value: unknown): value is string {
  return typeof value === "string";
}
