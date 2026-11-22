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

/** Each placed rich text is read once, however many rows show it. */
const MAX_CACHED_RICH_TEXTS = 64;

/** Its own instance: the hook below must never run for the built-in sections' rich text. */
const purifier = DOMPurify();
const cache = new Map<string, IRichText>();

/**
 * A `text` setting shown with `data-html`, held to the same elements, attributes, links and images as the template.
 * The same value, section type and asset library give the same object.
 */
export function sanitizeRichText(html: string, scope: RichTextScopeType): IRichText {
  const key = JSON.stringify([scope.type, scope.assetsBaseUrl ?? null, html]);
  const cached = cache.get(key);

  if (cached) {
    cache.delete(key);
    cache.set(key, cached);
    return cached;
  }

  const fragment = sanitize(html, scope);
  const elements = fragment.querySelectorAll("*").length;
  const container = document.createElement("div");
  container.append(fragment);
  const richText = { html: container.innerHTML, elements };

  if (cache.size >= MAX_CACHED_RICH_TEXTS) {
    const [oldestKey] = cache.keys();
    cache.delete(oldestKey);
  }
  cache.set(key, richText);

  return richText;
}

/** The rich text a `data-html` path names: a `text` setting's, else none. */
export function getRichText(path: string, scope: IBindingScope): IRichText | undefined {
  const binding = resolveBinding(path, scope);
  const value: unknown = isRecord(binding?.value) ? binding.value.html : binding?.value;

  return binding?.field.type === "text" && typeof value === "string" ? sanitizeRichText(value, scope) : undefined;
}

function sanitize(html: string, scope: RichTextScopeType): DocumentFragment {
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
    return purifier.sanitize(html, {
      ALLOWED_TAGS: SECTION_ELEMENTS,
      ALLOWED_ATTR: [...TEXT_ATTRIBUTES, ...URL_ATTRIBUTES],
      ALLOW_DATA_ATTR: false,
      ADD_FORBID_CONTENTS: FORBIDDEN_CONTENTS,
      RETURN_DOM_FRAGMENT: true,
    });
  } finally {
    purifier.removeHook("afterSanitizeAttributes", applyAttributeRules);
  }
}
