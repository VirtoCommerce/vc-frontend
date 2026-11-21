import DOMPurify from "dompurify";
import { Logger } from "@/core/utilities";
import { isBindingPath, parseBindings } from "./bindings";
import type { TemplatePartType } from "./bindings";
import type { ICustomSectionBehavior, ICustomSectionTag } from "./types";

export interface ICompiledText {
  text: TemplatePartType[];
}

export interface ICompiledElement {
  tag: string;
  isKitTag: boolean;
  attributes: [name: string, parts: TemplatePartType[]][];
  /** The `list` setting the element repeats for. */
  each?: string;
  condition?: { path: string; isNegated: boolean };
  /** The `text` setting the element shows as HTML. */
  html?: string;
  /** By name: the element has `data-{name}`. */
  behaviors: string[];
  /** A behavior writes the element's text. */
  hasBehaviorText: boolean;
  /** A behavior loops the element's children. */
  repeatsChildren: boolean;
  children: CompiledNodeType[];
}

export type CompiledNodeType = ICompiledElement | ICompiledText;

export interface ICompiledTemplate {
  root: ICompiledElement;
  /** The names of the behaviors the template switches on. */
  behaviors: Set<string>;
}

/** The kit tags and behaviors registered when the template compiles. */
export interface IKitType {
  tags: Readonly<Record<string, ICustomSectionTag>>;
  behaviors: Readonly<Record<string, ICustomSectionBehavior>>;
}

/** The builder's sanitizer elements without form controls; `svg`, `script`, `style` and the like go with their content. */
const ELEMENTS = (
  "a abbr acronym address area article aside audio b bdi bdo big blink blockquote br canvas caption center cite " +
  "code col colgroup data dd del details dfn dialog dir div dl dt em figcaption figure font footer h1 h2 h3 h4 h5 " +
  "h6 header hgroup hr i img ins kbd li main map mark marquee menu menuitem meter nav nobr ol p picture pre " +
  "progress q rp rt ruby s samp section small source spacer span strike strong sub summary sup table tbody td " +
  "tfoot th thead time tr track tt u ul var video wbr"
).split(" ");

const TEXT_ATTRIBUTES =
  "class role alt title lang dir hidden target rel sizes loading decoding width height datetime colspan rowspan scope".split(
    " ",
  );
const URL_ATTRIBUTES = ["href", "src", "srcset"];
const CONTROL_ATTRIBUTES = ["data-each", "data-if", "data-html"];
const DATA_PREFIX = "data-";

const EACH_REGEX = /^settings\.([\w-]+)$/;
const CONDITION_REGEX = /^(!?)\s*(\S+)$/;
const MAX_CACHED_TEMPLATES = 32;

const cache = new Map<string, ICompiledTemplate | undefined>();
let purifier: ReturnType<typeof DOMPurify> | undefined;

/**
 * Keeps only what the custom section contract and the registered kit allow, and reads it once per template
 * and kit. `undefined` for a template without exactly one root element.
 */
export function compileTemplate(template: string, kit: IKitType): ICompiledTemplate | undefined {
  const key = `${getKitSignature(kit)}\n${template}`;

  if (cache.has(key)) {
    return cache.get(key);
  }

  const compiled = compile(template, kit);

  if (cache.size >= MAX_CACHED_TEMPLATES) {
    cache.delete(cache.keys().next().value as string);
  }
  cache.set(key, compiled);

  return compiled;
}

function compile(template: string, kit: IKitType): ICompiledTemplate | undefined {
  const fragment = sanitize(template, kit);
  const elements = [...fragment.childNodes].filter((node) => node.nodeType === Node.ELEMENT_NODE) as Element[];
  const hasStrayText = [...fragment.childNodes].some(
    (node) => node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim(),
  );

  if (elements.length !== 1 || hasStrayText || Object.hasOwn(kit.tags, elements[0].localName)) {
    Logger.warn("[custom-sections] A template needs exactly one root element that is not a kit tag");
    return undefined;
  }

  const behaviors = new Set<string>();
  const root = compileElement(elements[0], { kit, isRoot: true, isInEach: false, behaviors });

  return { root, behaviors };
}

function sanitize(template: string, kit: IKitType): DocumentFragment {
  const behaviorAttributes = Object.entries(kit.behaviors).flatMap(([name, behavior]) => [
    `${DATA_PREFIX}${name}`,
    ...Object.keys(behavior.options ?? {}).map((option) => `${DATA_PREFIX}${name}-${option}`),
  ]);
  const nameAttributes = [...TEXT_ATTRIBUTES, ...CONTROL_ATTRIBUTES, ...behaviorAttributes];

  purifier ??= DOMPurify();

  return purifier.sanitize(template, {
    ALLOWED_TAGS: ELEMENTS,
    ALLOWED_ATTR: [...nameAttributes, ...URL_ATTRIBUTES],
    ALLOW_DATA_ATTR: false,
    // As the builder's sanitizer: these go with what they hold.
    ADD_FORBID_CONTENTS: ["form", "frame", "frameset", "object", "embed", "applet"],
    // Only names matter here: the renderer checks each value after its bindings resolve.
    ADD_URI_SAFE_ATTR: [...nameAttributes, ...URL_ATTRIBUTES],
    CUSTOM_ELEMENT_HANDLING: {
      tagNameCheck: (tag: string) => Object.hasOwn(kit.tags, tag),
      attributeNameCheck: (name: string, tag?: string) =>
        !!tag && Object.hasOwn(kit.tags, tag) && Object.hasOwn(kit.tags[tag].attributes, name),
      allowCustomizedBuiltInElements: false,
    },
    // The fragment is only read to build the section, never put in the page, so names cannot clobber it.
    SANITIZE_DOM: false,
    RETURN_DOM_FRAGMENT: true,
  });
}

/** Changes when a tag, a behavior or what the compiler reads of them changes. */
function getKitSignature(kit: IKitType): string {
  return JSON.stringify([
    Object.entries(kit.tags).map(([name, tag]) => [name, Object.keys(tag.attributes)]),
    Object.entries(kit.behaviors).map(([name, behavior]) => [
      name,
      Object.keys(behavior.options ?? {}),
      behavior.textAttributes,
      behavior.repeatsChildren,
    ]),
  ]);
}

interface ICompileContext {
  kit: IKitType;
  isRoot: boolean;
  isInEach: boolean;
  behaviors: Set<string>;
}

function compileChildren(parent: Node, context: ICompileContext): CompiledNodeType[] {
  return [...parent.childNodes].flatMap((node) => compileNode(node, context));
}

function compileNode(node: Node, context: ICompileContext): CompiledNodeType[] {
  if (node.nodeType === Node.TEXT_NODE) {
    return [{ text: parseBindings(node.textContent ?? "") }];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  const element = compileElement(node as Element, context);

  // A kit tag has no content: what the parser put in one written as `<vc-icon />` follows it.
  return element.isKitTag ? [element, ...compileChildren(node, context)] : [element];
}

function compileElement(element: Element, context: ICompileContext): ICompiledElement {
  const tag = element.localName;
  const compiled: ICompiledElement = {
    tag,
    isKitTag: Object.hasOwn(context.kit.tags, tag),
    attributes: [],
    behaviors: [],
    hasBehaviorText: false,
    repeatsChildren: false,
    children: [],
  };

  for (const { name, value } of element.attributes) {
    compileAttribute(compiled, name, value, context);
  }

  if (!compiled.isKitTag && !compiled.html) {
    compiled.children = compileChildren(element, {
      ...context,
      isRoot: false,
      isInEach: context.isInEach || !!compiled.each,
    });
  }

  return compiled;
}

function compileAttribute(compiled: ICompiledElement, name: string, value: string, context: ICompileContext): void {
  const trimmed = value.trim();

  switch (name) {
    case "data-each": {
      // Not on the root, not nested: the attribute is left out.
      const listId = EACH_REGEX.exec(trimmed)?.[1];
      compiled.each = listId && !context.isRoot && !context.isInEach ? listId : undefined;
      break;
    }
    case "data-if": {
      const [, negation, path] = CONDITION_REGEX.exec(trimmed) ?? [];
      compiled.condition = path && isBindingPath(path) ? { path, isNegated: negation === "!" } : undefined;
      break;
    }
    case "data-html":
      compiled.html = isBindingPath(trimmed) ? trimmed : undefined;
      break;
    default:
      compiled.attributes.push([name, parseBindings(value)]);

      if (!compiled.isKitTag) {
        compileBehaviorAttribute(compiled, name, context);
      }
  }
}

function compileBehaviorAttribute(compiled: ICompiledElement, name: string, context: ICompileContext): void {
  const behaviorName = name.slice(DATA_PREFIX.length);

  if (name.startsWith(DATA_PREFIX) && Object.hasOwn(context.kit.behaviors, behaviorName)) {
    compiled.behaviors.push(behaviorName);
    compiled.repeatsChildren ||= !!context.kit.behaviors[behaviorName].repeatsChildren;
    context.behaviors.add(behaviorName);
  }

  compiled.hasBehaviorText ||= Object.values(context.kit.behaviors).some((candidate) =>
    candidate.textAttributes?.includes(name),
  );
}
