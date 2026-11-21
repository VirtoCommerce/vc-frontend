import DOMPurify from "dompurify";
import { opensNewWindow, withNewWindowRel } from "../sections";
import {
  FORBIDDEN_CONTENTS,
  isAttributeOfElement,
  SECTION_ELEMENTS,
  TEXT_ATTRIBUTES,
  toSafeAttributeValue,
  URL_ATTRIBUTES,
} from "./allowlist";
import type { IBindingScope } from "./bindings";

/** Its own instance: the hook below must never run for the built-in sections' rich text. */
const purifier = DOMPurify();

/** A `text` setting shown with `data-html`, held to the same elements, attributes, links and images as the template. */
export function sanitizeRichText(html: string, scope: Pick<IBindingScope, "type" | "assetsBaseUrl">): string {
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
    });
  } finally {
    purifier.removeHook("afterSanitizeAttributes", applyAttributeRules);
  }
}
