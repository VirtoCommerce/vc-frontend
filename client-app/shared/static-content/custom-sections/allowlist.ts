import { toAssetSrcset, toAssetUrl, toSectionLink } from "./urls";
import type { IBindingScope } from "./bindings";

/** The server sanitizer's element allowlist minus form controls; `svg`, `script`, `style` and the like go with their content. */
export const SECTION_ELEMENTS = (
  "a abbr acronym address area article aside audio b bdi bdo big blink blockquote br canvas caption center cite " +
  "code col colgroup data dd del details dfn dialog dir div dl dt em figcaption figure font footer h1 h2 h3 h4 h5 " +
  "h6 header hgroup hr i img ins kbd li main map mark marquee menu menuitem meter nav nobr ol p picture pre " +
  "progress q rp rt ruby s samp section small source spacer span strike strong sub summary sup table tbody td " +
  "tfoot th thead time tr track tt u ul var video wbr"
).split(" ");

export const TEXT_ATTRIBUTES = (
  "class role alt title lang dir hidden target rel sizes loading decoding width height datetime colspan rowspan " +
  "scope autoplay muted loop playsinline controls preload type media open"
).split(" ");
export const URL_ATTRIBUTES = ["href", "src", "srcset", "poster", "cite"];
/** Of `TEXT_ATTRIBUTES`, those the browser reads as on whatever their value. */
export const BOOLEAN_ATTRIBUTES = new Set(["hidden", "autoplay", "muted", "loop", "playsinline", "controls", "open"]);
/** As the server sanitizer: these go with their content. */
export const FORBIDDEN_CONTENTS = ["form", "frame", "frameset", "object", "embed", "applet"];

/** The attributes only some elements take. */
const ELEMENT_ATTRIBUTES: Readonly<Record<string, readonly string[]>> = {
  autoplay: ["video"],
  muted: ["video"],
  loop: ["video"],
  playsinline: ["video"],
  controls: ["video"],
  preload: ["video"],
  poster: ["video"],
  open: ["details"],
  type: ["source"],
  media: ["source"],
  cite: ["blockquote", "q"],
};
const LINK_TARGETS = new Set(["_self", "_blank"]);
const OPENER_REGEX = /(?:^|\s)opener(?:\s|$)/i;

/**
 * A boolean attribute, a kit tag's or a native one, is on unless it says `false`. One bound to an unset setting is off
 * too: a native one is left out, as if not written, and a kit tag's says `false`.
 */
export function isBooleanAttributeOn(value: string): boolean {
  return value !== "false";
}

/** Bound to a setting that is unset: as if the attribute were not written. */
export function isUnsetBinding({ value, isBound }: { value: string; isBound: boolean }): boolean {
  return isBound && value === "";
}

export function isAttributeOfElement(name: string, tag: string): boolean {
  return !Object.hasOwn(ELEMENT_ATTRIBUTES, name) || ELEMENT_ATTRIBUTES[name].includes(tag);
}

/** The value an attribute keeps, as written or once its bindings resolve; `undefined` leaves it out. */
export function toSafeAttributeValue(
  name: string,
  value: string,
  scope: Pick<IBindingScope, "type" | "assetsBaseUrl">,
): string | undefined {
  switch (name) {
    case "class":
      return toOwnClasses(value, scope.type);
    case "target":
      return LINK_TARGETS.has(value.trim()) ? value.trim() : undefined;
    case "rel":
      return OPENER_REGEX.test(value) ? undefined : value;
    case "href":
    case "cite":
      return toSectionLink(value);
    case "src":
    case "poster":
      return toAssetUrl(value, scope.assetsBaseUrl);
    case "srcset":
      return toAssetSrcset(value, scope.assetsBaseUrl);
    default:
      return value;
  }
}

/** Only the type's own classes, `{type}`, `{type}__…`, `{type}--…` or `{type}-…`: no utility of the storefront's build. */
function toOwnClasses(value: string, type: string): string | undefined {
  const classes = value
    .split(/\s+/)
    .filter((name) => name === type || name.startsWith(`${type}-`) || name.startsWith(`${type}__`));

  return classes.length ? classes.join(" ") : undefined;
}
