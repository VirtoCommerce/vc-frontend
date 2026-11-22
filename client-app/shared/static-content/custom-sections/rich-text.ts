import DOMPurify from "dompurify";
import { isRecord } from "@/core/utilities";
import { opensNewWindow, withNewWindowRel } from "../sections";
import {
  FORBIDDEN_CONTENTS,
  isAttributeOfElement,
  SECTION_ELEMENTS,
  TEXT_ATTRIBUTES,
  toSafeAttributeValue,
  URL_ATTRIBUTES,
} from "./allowlist";
import { resolveBinding } from "./bindings";
import type { IBindingScope } from "./bindings";

export interface IRichText {
  html: string;
  /** Of the HTML, for the render budget. */
  elements: number;
}

type RichTextScopeType = Pick<IBindingScope, "type" | "assetsBaseUrl">;

interface ICachedRichText {
  type: string;
  assetsBaseUrl: string | undefined;
  richText: IRichText;
}

/** Each placed rich text is read once, however many renders show it. */
const MAX_CACHED_RICH_TEXTS = 64;
const EMPTY_RICH_TEXT: IRichText = { html: "", elements: 0 };

/** Its own instance: the hook below must never run for the built-in sections' rich text. */
const purifier = DOMPurify();
/** By the value itself: every row passes the same string, and a key built from it would cost its whole length. */
const cache = new Map<string, ICachedRichText>();

/**
 * A `text` setting shown with `data-html`, held to the same elements, attributes, links and images as the template.
 * The same value, section type and asset library give the same object.
 */
export function sanitizeRichText(html: string, scope: RichTextScopeType): IRichText {
  const cached = cache.get(html);

  if (cached && cached.type === scope.type && cached.assetsBaseUrl === scope.assetsBaseUrl) {
    cache.delete(html);
    cache.set(html, cached);
    return cached.richText;
  }

  const body = sanitize(html, scope);
  const richText = body ? { html: body.innerHTML, elements: body.querySelectorAll("*").length } : EMPTY_RICH_TEXT;

  if (!cached && cache.size >= MAX_CACHED_RICH_TEXTS) {
    const [oldestKey] = cache.keys();
    cache.delete(oldestKey);
  }
  cache.set(html, { type: scope.type, assetsBaseUrl: scope.assetsBaseUrl, richText });

  return richText;
}

/**
 * The rich text a `data-html` path names: a `text` setting's, else none. `resolved`: what this render read already,
 * so the count before it and the render itself read each value once.
 */
export function getRichText(
  path: string,
  scope: IBindingScope,
  resolved?: Map<string, IRichText>,
): IRichText | undefined {
  const binding = resolveBinding(path, scope);
  const value: unknown = isRecord(binding?.value) ? binding.value.html : binding?.value;

  if (binding?.field.type !== "text" || typeof value !== "string") {
    return undefined;
  }

  const richText = resolved?.get(value) ?? sanitizeRichText(value, scope);
  resolved?.set(value, richText);
  return richText;
}

/** In DOMPurify's own inert document: an image adopted into the page would load though the section never shows. */
function sanitize(html: string, scope: RichTextScopeType): Element | undefined {
  function applyAttributeRules(node: Element): void {
    for (const { name, value } of [...node.attributes]) {
      const safeValue = isAttributeOfElement(name, node.localName)
        ? toSafeAttributeValue(name, value, scope)
        : undefined;

      if (safeValue === undefined) {
        node.removeAttribute(name);
      } else if (safeValue !== value) {
        node.setAttribute(name, safeValue);
      }
    }

    if (opensNewWindow(node.getAttribute("target"))) {
      node.setAttribute("rel", withNewWindowRel(node.getAttribute("rel")));
    }
  }

  purifier.addHook("afterSanitizeAttributes", applyAttributeRules);

  try {
    const body: unknown = purifier.sanitize(html, {
      ALLOWED_TAGS: SECTION_ELEMENTS,
      ALLOWED_ATTR: [...TEXT_ATTRIBUTES, ...URL_ATTRIBUTES],
      ALLOW_DATA_ATTR: false,
      ADD_FORBID_CONTENTS: FORBIDDEN_CONTENTS,
      RETURN_DOM: true,
    });

    return body instanceof Element ? body : undefined;
  } finally {
    purifier.removeHook("afterSanitizeAttributes", applyAttributeRules);
  }
}
