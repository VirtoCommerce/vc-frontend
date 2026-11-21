import DOMPurify from "dompurify";
import { Logger } from "@/core/utilities";
import { BEHAVIOR_ATTRIBUTES, BEHAVIOR_OPTION_ATTRIBUTES, isBehaviorAttribute } from "./behaviors";
import { isBindingPath, parseBindings } from "./bindings";
import { isKitTag, isKitTagAttribute } from "./kit-tags";
import type { BehaviorType } from "./behaviors";
import type { TemplatePartType } from "./bindings";
import type { KitTagType } from "./kit-tags";

export interface ICompiledText {
  text: TemplatePartType[];
}

export interface ICompiledElement {
  tag: string;
  kit?: KitTagType;
  attributes: [name: string, parts: TemplatePartType[]][];
  /** The `list` setting the element repeats for. */
  each?: string;
  condition?: { path: string; isNegated: boolean };
  /** The `text` setting the element shows as HTML. */
  html?: string;
  behaviors: BehaviorType[];
  children: CompiledNodeType[];
}

export type CompiledNodeType = ICompiledElement | ICompiledText;

export interface ICompiledTemplate {
  root: ICompiledElement;
  behaviors: Set<BehaviorType>;
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
const NAME_ATTRIBUTES = [
  ...TEXT_ATTRIBUTES,
  ...CONTROL_ATTRIBUTES,
  ...BEHAVIOR_ATTRIBUTES,
  ...BEHAVIOR_OPTION_ATTRIBUTES,
];

const EACH_REGEX = /^settings\.([\w-]+)$/;
const CONDITION_REGEX = /^(!?)\s*(\S+)$/;
const MAX_CACHED_TEMPLATES = 32;

const cache = new Map<string, ICompiledTemplate | undefined>();
let purifier: ReturnType<typeof DOMPurify> | undefined;

/**
 * Keeps only what the custom section contract lists and reads it once per template text.
 * `undefined` for a template without exactly one root element.
 */
export function compileTemplate(template: string): ICompiledTemplate | undefined {
  if (cache.has(template)) {
    return cache.get(template);
  }

  const compiled = compile(template);

  if (cache.size >= MAX_CACHED_TEMPLATES) {
    cache.delete(cache.keys().next().value as string);
  }
  cache.set(template, compiled);

  return compiled;
}

function compile(template: string): ICompiledTemplate | undefined {
  const fragment = sanitize(template);
  const elements = [...fragment.childNodes].filter((node) => node.nodeType === Node.ELEMENT_NODE) as Element[];
  const hasStrayText = [...fragment.childNodes].some(
    (node) => node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim(),
  );

  if (elements.length !== 1 || hasStrayText || isKitTag(elements[0].localName)) {
    Logger.warn("[custom-sections] A template needs exactly one root element that is not a kit tag");
    return undefined;
  }

  const behaviors = new Set<BehaviorType>();
  const root = compileElement(elements[0], { isRoot: true, isInEach: false, behaviors });

  return { root, behaviors };
}

function sanitize(template: string): DocumentFragment {
  purifier ??= DOMPurify();

  return purifier.sanitize(template, {
    ALLOWED_TAGS: ELEMENTS,
    ALLOWED_ATTR: [...NAME_ATTRIBUTES, ...URL_ATTRIBUTES],
    ALLOW_DATA_ATTR: false,
    // As the builder's sanitizer: these go with what they hold.
    ADD_FORBID_CONTENTS: ["form", "frame", "frameset", "object", "embed", "applet"],
    // Only names matter here: the renderer checks each value after its bindings resolve.
    ADD_URI_SAFE_ATTR: [...NAME_ATTRIBUTES, ...URL_ATTRIBUTES],
    CUSTOM_ELEMENT_HANDLING: {
      tagNameCheck: (tag: string) => isKitTag(tag),
      attributeNameCheck: (name: string, tag?: string) => !!tag && isKitTagAttribute(tag, name),
      allowCustomizedBuiltInElements: false,
    },
    // The fragment is only read to build the section, never put in the page, so names cannot clobber it.
    SANITIZE_DOM: false,
    RETURN_DOM_FRAGMENT: true,
  });
}

interface ICompileContext {
  isRoot: boolean;
  isInEach: boolean;
  behaviors: Set<BehaviorType>;
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
  return element.kit ? [element, ...compileChildren(node, context)] : [element];
}

function compileElement(element: Element, context: ICompileContext): ICompiledElement {
  const tag = element.localName;
  const compiled: ICompiledElement = {
    tag,
    kit: isKitTag(tag) ? tag : undefined,
    attributes: [],
    behaviors: [],
    children: [],
  };

  for (const { name, value } of element.attributes) {
    compileAttribute(compiled, name, value, context);
  }

  if (!compiled.kit && !compiled.html) {
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

      if (!compiled.kit && isBehaviorAttribute(name)) {
        compiled.behaviors.push(name);
        context.behaviors.add(name);
      }
  }
}
