// The kit tags and behaviors custom section templates may use. Not built on `useExtensionRegistry`, whose
// categories are slots for components with `{ component, condition }` entries: a behavior has no component, and
// a kit entry carries what the renderer, the agent and the server read of it.
import { createGlobalState } from "@vueuse/core";
import { omit } from "lodash-es";
import { shallowRef } from "vue";
import { isRecord, Logger } from "@/core/utilities";
import { RENDER_BUDGET } from "../limits";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_ENTRY_FIELDS,
  MAX_KIT_ENTRIES,
  MAX_NAME_LENGTH,
  MAX_OPTION_LENGTH,
  MAX_SELECT_OPTIONS,
  MAX_WRITE_LENGTH,
  MAX_WRITES,
} from "./limits";
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
/** Bound by the template itself: `data-each`, `data-if` and `data-html`. */
export const BINDING_NAMES = ["each", "if", "html"] as const;
/** The storefront's own `data-sb-*` and `data-pb-*` attributes, and bare `data-sb` and `data-pb`. */
const RESERVED_NAME_PREFIXES = ["sb", "pb"];
/** Lowercase words joined by `-`: a behavior's, an attribute's or an option's name. */
const NAME_REGEX = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
/** As the server refuses them on any kit tag, whatever the tag declares. */
const DENIED_TAG_ATTRIBUTE_REGEX =
  /^(?:on.*|style|id|is|class|srcdoc|form.*|popover.*|command|commandfor|interestfor|ping|srcset|poster|action)$/;

/** As the server reads a kit field. */
const FIELD_TYPES = new Set<ICustomSectionField["type"]>(["string", "number", "boolean", "select", "link", "date"]);
const FIELD_KEYS = new Set(["type", "options", "optionsFrom", "min", "max", "description"]);
const DATA_PREFIX = "data-";
/** The server holds a bound as a decimal, so it refuses the whole kit for one past this. */
const MAX_BOUND = 7.9e28;

const RESERVED_TAG_NAMES = new Set<string>(BUILT_IN_TAG_NAMES);
const RESERVED_BEHAVIOR_NAMES = new Set<string>(BUILT_IN_BEHAVIOR_NAMES);

const useKitRegistry = createGlobalState(() => shallowRef<IKit>({ tags: {}, behaviors: {} }));

/**
 * Adds a tag a custom section template places as `<name>`: `vc-` and lowercase words joined by `-`. Its
 * attributes are lowercase words too, none the server refuses on a kit tag (`on*`, `style`, `id`, `class`,
 * `srcset`, `poster`, the invokers `command`, `commandfor` and `interestfor`…), each a field the server reads.
 * The storefront's own tags are reserved; the first registration of a name wins. A tag that breaks a rule is
 * ignored with a warning.
 */
export function registerCustomSectionTag(name: string, tag: ICustomSectionTag): void {
  const registry = useKitRegistry();
  const refusal =
    getTakenRefusal(name, registry.value.tags) ??
    getRoomRefusal(registry.value.tags, RESERVED_TAG_NAMES) ??
    getTagRefusal(name, tag);

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
 * warning. Under reduced motion a behavior shows its end state at once; its element mounts afresh when the value,
 * an option or the motion preference changes.
 */
export function registerCustomSectionBehavior(name: string, behavior: ICustomSectionBehavior): void {
  const registry = useKitRegistry();
  const refusal =
    getTakenRefusal(name, registry.value.behaviors) ??
    getRoomRefusal(registry.value.behaviors, RESERVED_BEHAVIOR_NAMES) ??
    getBehaviorRefusal(name, behavior, registry.value.behaviors);

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

/** The server refuses these on any kit tag too, the reserved `data-` attributes included. */
export function isDeniedTagAttribute(name: string): boolean {
  return (
    DENIED_TAG_ATTRIBUTE_REGEX.test(name) ||
    (name.startsWith(DATA_PREFIX) && isReservedName(name.slice(DATA_PREFIX.length)))
  );
}

/** What follows `data-` in an attribute the template or the storefront writes itself. */
export function isReservedName(name: string): boolean {
  return (
    (BINDING_NAMES as readonly string[]).includes(name) ||
    RESERVED_NAME_PREFIXES.some((prefix) => name === prefix || name.startsWith(`${prefix}-`))
  );
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
  if (!TAG_NAME_REGEX.test(name) || name.length > MAX_NAME_LENGTH) {
    return "is not a kit tag name";
  }

  return RESERVED_TAG_NAMES.has(name) ? "is the storefront's own" : getTagShapeRefusal(tag);
}

/** What the server would refuse in a tag, whatever its name: the storefront's own tags are held to it too. */
export function getTagShapeRefusal(tag: ICustomSectionTag): string | undefined {
  const attributes = Object.entries(tag.attributes);

  if (attributes.length > MAX_ENTRY_FIELDS) {
    return `has more than ${MAX_ENTRY_FIELDS} attributes`;
  }

  for (const [attribute, field] of attributes) {
    if (!isName(attribute) || isDeniedTagAttribute(attribute)) {
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
  if (!isName(name) || isReservedName(name)) {
    return "is not a behavior name";
  }

  const shapeRefusal = getBehaviorShapeRefusal(name, behavior);

  if (shapeRefusal) {
    return shapeRefusal;
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

/** What the server or the renderer would refuse in a behavior: the storefront's own behaviors are held to it too. */
export function getBehaviorShapeRefusal(name: string, behavior: ICustomSectionBehavior): string | undefined {
  const options = Object.entries(behavior.options ?? {});

  if (options.length + (behavior.value === undefined ? 0 : 1) > MAX_ENTRY_FIELDS) {
    return `has more than ${MAX_ENTRY_FIELDS} fields in its value and options`;
  }

  return (
    getBehaviorListRefusal(name, behavior) ??
    (behavior.value === undefined ? undefined : getFieldRefusal(behavior.value)) ??
    options.map(([option, field]) => getOptionRefusal(option, field)).find(Boolean) ??
    getDescriptionRefusal(behavior.description)
  );
}

function getBehaviorListRefusal(name: string, behavior: ICustomSectionBehavior): string | undefined {
  const { writes, repeatsChildren, textAttributes } = behavior;

  if (writes !== undefined && !isTextList(writes, MAX_WRITES, MAX_WRITE_LENGTH)) {
    return `has writes that are not a list of at most ${MAX_WRITES} names of ${MAX_WRITE_LENGTH} characters`;
  }

  if (repeatsChildren !== undefined && typeof repeatsChildren !== "boolean") {
    return "has a repeatsChildren that is not true or false";
  }

  // The renderer leaves out the template's text in any element with one of these, whatever its behavior.
  if (
    textAttributes !== undefined &&
    !(Array.isArray(textAttributes) && textAttributes.every((attribute) => isOwnAttribute(name, attribute)))
  ) {
    return "has text attributes that are not a list of its own data-{name} attributes";
  }

  return undefined;
}

function getOptionRefusal(option: string, field: ICustomSectionField): string | undefined {
  if (!isName(option)) {
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

  if (field.options !== undefined && !isTextList(field.options, MAX_SELECT_OPTIONS, MAX_OPTION_LENGTH)) {
    return `has options that are not a list of at most ${MAX_SELECT_OPTIONS} texts of ${MAX_OPTION_LENGTH} characters`;
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

/** The storefront's own entries register later, so room is kept for them. */
function getRoomRefusal(entries: Readonly<Record<string, unknown>>, reserved: ReadonlySet<string>): string | undefined {
  const othersCount = Object.keys(entries).filter((name) => !reserved.has(name)).length;
  return othersCount + reserved.size >= MAX_KIT_ENTRIES
    ? `would take the kit past ${MAX_KIT_ENTRIES} entries`
    : undefined;
}

function isName(name: string): boolean {
  return NAME_REGEX.test(name) && name.length <= MAX_NAME_LENGTH;
}

function isTextList(value: unknown, maxCount: number, maxLength: number): boolean {
  return (
    Array.isArray(value) &&
    value.length <= maxCount &&
    value.every((text) => typeof text === "string" && text.length <= maxLength)
  );
}

function isOwnAttribute(behaviorName: string, attribute: unknown): boolean {
  return (
    typeof attribute === "string" &&
    (attribute === `data-${behaviorName}` || attribute.startsWith(`data-${behaviorName}-`))
  );
}

function isBound(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value) && Math.abs(value) < MAX_BOUND;
}
