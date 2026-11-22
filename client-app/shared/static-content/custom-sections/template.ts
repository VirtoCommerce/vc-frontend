import DOMPurify from "dompurify";
import { Logger } from "@/core/utilities";
import {
  FORBIDDEN_CONTENTS,
  isAttributeOfElement,
  SECTION_ELEMENTS,
  TEXT_ATTRIBUTES,
  URL_ATTRIBUTES,
} from "./allowlist";
import { isBindingPath, parseBindings } from "./bindings";
import { BINDING_NAMES, getBehaviorAttributeNames } from "./kit/registry";
import { MAX_TEMPLATE_ATTRIBUTES } from "./limits";
import { createLruCache } from "./lru-cache";
import type { TemplatePartType } from "./bindings";
import type { IKit } from "./kit/registry";
import type { UponSanitizeAttributeHookEvent } from "dompurify";

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
  children: CompiledNodeType[];
}

export type CompiledNodeType = ICompiledElement | ICompiledText;

export interface ICompiledTemplate {
  /** New for each compile, so a changed template mounts afresh instead of patching what it rendered. */
  id: number;
  root: ICompiledElement;
  behaviors: Set<string>;
}

const CONTROL_ATTRIBUTES = BINDING_NAMES.map((name) => `data-${name}`);
const DATA_PREFIX = "data-";

const EACH_REGEX = /^settings\.([\w-]+)$/;
const CONDITION_REGEX = /^(!?)\s*(\S+)$/;
const MAX_CACHED_TEMPLATES = 32;
const MAX_DEPTH = 32;

/** A section still shown keeps its compiled template, so it does not remount. */
const cache = createLruCache<string, ICompiledTemplate | undefined>(MAX_CACHED_TEMPLATES);
let compiledCount = 0;
let purifier: ReturnType<typeof DOMPurify> | undefined;

/**
 * Keeps only what the custom section contract and the registered kit allow, and reads it once per template
 * and kit. `undefined` for a template without exactly one root element.
 */
export function compileTemplate(template: string, kit: IKit): ICompiledTemplate | undefined {
  const key = `${getKitSignature(kit)}\n${template}`;

  if (cache.has(key)) {
    return cache.get(key);
  }

  const compiled = compile(template, kit);
  cache.set(key, compiled);

  return compiled;
}

function compile(template: string, kit: IKit): ICompiledTemplate | undefined {
  const fragment = sanitize(template, kit);
  const elements = [...fragment.childNodes].filter((node): node is Element => node instanceof Element);
  const hasStrayText = [...fragment.childNodes].some(
    (node) => node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim(),
  );

  if (elements.length !== 1 || hasStrayText || Object.hasOwn(kit.tags, elements[0].localName)) {
    Logger.warn("[custom-sections] A template needs exactly one root element that is not a kit tag");
    return undefined;
  }

  const behaviors = new Set<string>();
  const root = compileElement(elements[0], {
    kit,
    depth: 0,
    isRoot: true,
    isInEach: false,
    isInRepeat: false,
    behaviors,
  });

  return { id: ++compiledCount, root, behaviors };
}

function sanitize(template: string, kit: IKit): DocumentFragment {
  const behaviorAttributes = Object.entries(kit.behaviors).flatMap(([name, behavior]) =>
    getBehaviorAttributeNames(name, behavior),
  );
  const nameAttributes = [...TEXT_ATTRIBUTES, ...CONTROL_ATTRIBUTES, ...behaviorAttributes];

  purifier ??= DOMPurify();

  // DOMPurify drops `for` off anything but a label or an output; a kit tag becomes a component, never this element.
  function keepDeclaredFor(node: Element, event: UponSanitizeAttributeHookEvent): void {
    const tag = Object.hasOwn(kit.tags, node.localName) ? kit.tags[node.localName] : undefined;

    if (event.attrName === "for" && tag && Object.hasOwn(tag.attributes, "for")) {
      event.forceKeepAttr = true;
    }
  }

  // Counted as written, before DOMPurify drops any; taken out once it is done, as content past the depth is.
  const overwritten = new Set<Element>();

  function countAttributes(node: Element): void {
    if (node instanceof Element && node.attributes.length > MAX_TEMPLATE_ATTRIBUTES) {
      overwritten.add(node);
    }
  }

  purifier.addHook("uponSanitizeAttribute", keepDeclaredFor);
  purifier.addHook("beforeSanitizeAttributes", countAttributes);

  try {
    const fragment = purifier.sanitize(template, {
      ALLOWED_TAGS: SECTION_ELEMENTS,
      ALLOWED_ATTR: [...nameAttributes, ...URL_ATTRIBUTES],
      ALLOW_DATA_ATTR: false,
      ADD_FORBID_CONTENTS: FORBIDDEN_CONTENTS,
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

    overwritten.forEach((element) => element.remove());
    return fragment;
  } finally {
    purifier.removeHook("uponSanitizeAttribute", keepDeclaredFor);
    purifier.removeHook("beforeSanitizeAttributes", countAttributes);
  }
}

/** Changes when a tag, a behavior or what the compiler reads of them changes. */
function getKitSignature(kit: IKit): string {
  return JSON.stringify([
    Object.entries(kit.tags).map(([name, tag]) => [name, Object.keys(tag.attributes), tag.hasSideEffects]),
    Object.entries(kit.behaviors).map(([name, behavior]) => [
      name,
      Object.keys(behavior.options ?? {}),
      behavior.textAttributes,
      behavior.repeatsChildren,
    ]),
  ]);
}

interface ICompileContext {
  kit: IKit;
  /** Of the nodes compiling: the root's children are at 1. */
  depth: number;
  isRoot: boolean;
  isInEach: boolean;
  /** Inside an element a behavior repeats: a repeating behavior here would double again at every level. */
  isInRepeat: boolean;
  behaviors: Set<string>;
}

/** Content nested deeper than `MAX_DEPTH` is left out, so a hostile draft cannot exhaust the stack. */
function compileChildren(parent: Node, context: ICompileContext): CompiledNodeType[] {
  return context.depth < MAX_DEPTH ? [...parent.childNodes].flatMap((node) => compileNode(node, context)) : [];
}

function compileNode(node: Node, context: ICompileContext): CompiledNodeType[] {
  if (node.nodeType === Node.TEXT_NODE) {
    return [{ text: parseBindings(node.textContent ?? "") }];
  }

  if (!(node instanceof Element)) {
    return [];
  }

  const element = compileElement(node, context);

  if (!element.isKitTag) {
    return [element];
  }

  // A kit tag has no content: what the parser put in one written as `<vc-icon />` follows it.
  const following = compileChildren(node, context);
  return context.isInRepeat && context.kit.tags[element.tag].hasSideEffects ? following : [element, ...following];
}

function compileElement(element: Element, context: ICompileContext): ICompiledElement {
  const tag = element.localName;
  const compiled: ICompiledElement = {
    tag,
    isKitTag: Object.hasOwn(context.kit.tags, tag),
    attributes: [],
    behaviors: [],
    children: [],
  };

  for (const { name, value } of element.attributes) {
    compileAttribute(compiled, name, value, context);
  }

  if (!compiled.isKitTag && !compiled.html) {
    compiled.children = compileChildren(element, {
      ...context,
      depth: context.depth + 1,
      isRoot: false,
      isInEach: context.isInEach || !!compiled.each,
      isInRepeat:
        context.isInRepeat || compiled.behaviors.some((name) => !!context.kit.behaviors[name].repeatsChildren),
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
      compileOtherAttribute(compiled, name, value, context);
  }
}

function compileOtherAttribute(
  compiled: ICompiledElement,
  name: string,
  value: string,
  context: ICompileContext,
): void {
  if (!compiled.isKitTag && !isAttributeOfElement(name, compiled.tag)) {
    return;
  }

  const behaviorName = name.slice(DATA_PREFIX.length);
  const behavior =
    !compiled.isKitTag && name.startsWith(DATA_PREFIX) && Object.hasOwn(context.kit.behaviors, behaviorName)
      ? context.kit.behaviors[behaviorName]
      : undefined;

  if (behavior?.repeatsChildren && context.isInRepeat) {
    return;
  }

  compiled.attributes.push([name, parseBindings(value)]);

  if (behavior) {
    compiled.behaviors.push(behaviorName);
    context.behaviors.add(behaviorName);
  }
}
