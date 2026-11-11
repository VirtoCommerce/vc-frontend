import DOMPurify from "dompurify";
import { camelize } from "vue";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot";
import { getLinkAttr, isSafeLinkUrl } from "@/core/utilities/common";
import {
  FIELD_ATTRIBUTE,
  isDesignerPreview,
  isPreviewV2Frame,
  SECTION_ATTRIBUTE,
} from "@/plugins/builder-preview/utils";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import type { Component } from "vue";

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

export type HeadingTagType = (typeof HEADING_TAGS)[number];

const DEFAULT_HEADING_TAG: HeadingTagType = "h2";

type DeclaredPropsType = string[] | Record<string, unknown>;

/**
 * The `isSafeLinkUrl` policy for URLs inside section HTML. DOMPurify tests it after stripping whitespace, so
 * `java\tscript:` is caught; its default list would also drop app schemes such as `whatsapp:`.
 */
const ALLOWED_URI_REGEXP = /^(?!(?:javascript|vbscript|data):)/i;

const SAME_CONTEXT_TARGETS = new Set(["", "_self", "_parent", "_top"]);

const NEW_WINDOW_REL_TOKENS = ["noopener", "noreferrer"];

/** Vue internals: an async section declares its props on the loaded inner component. */
type AsyncComponentWrapperType = {
  __asyncLoader?: () => Promise<Component>;
  __asyncResolved?: Component;
};

const htmlPurifier = DOMPurify();

htmlPurifier.addHook("afterSanitizeAttributes", (node) => {
  if (!(node instanceof Element) || !opensNewWindow(node.getAttribute("target"))) {
    return;
  }

  const rel = new Set(node.getAttribute("rel")?.split(/\s+/).filter(Boolean));
  NEW_WINDOW_REL_TOKENS.forEach((token) => rel.add(token));
  node.setAttribute("rel", [...rel].join(" "));
});

const SECTION_TYPE_ALIASES: Readonly<Record<string, string>> = {
  text: "text-block",
  image: "image-block",
  title: "title-block",
};

export function registerPageBuilderSections(sections: Record<string, Component>): void {
  const { register } = useExtensionRegistry();

  Object.entries(sections).forEach(([type, component]) => register("pageBuilderSection", type, { component }));
  Object.entries(SECTION_TYPE_ALIASES)
    .filter(([, type]) => Object.hasOwn(sections, type))
    .forEach(([alias, type]) => register("pageBuilderSection", alias, { component: sections[type] }));
}

/** Reactive: a section registered later renders where it is already used. */
export function getPageBuilderSection(type: unknown): Component | undefined {
  const entries = useExtensionRegistry().getEntries("pageBuilderSection");

  return typeof type === "string" && Object.hasOwn(entries, type) ? (entries[type]?.component ?? undefined) : undefined;
}

export function getPreviewSectionAttrs(id: unknown): Record<string, string> {
  return isPreviewV2Frame() && typeof id === "string" ? { [SECTION_ATTRIBUTE]: id } : {};
}

/** Names the setting by its path (`buttons.1.label`), so the preview can tell two settings with the same text apart. */
export function getPreviewFieldAttrs(path: string): Record<string, string> {
  return isPreviewV2Frame() ? { [FIELD_ATTRIBUTE]: path } : {};
}

/** Off in the designer preview, which shows every section at once. */
export function isLazySectionsEnabled(): boolean {
  return isNewPageBuilderEnabled() && !isDesignerPreview();
}

/** Own keys only: a type such as `toString` must not resolve to `Object.prototype`. */
export function getRegisteredSection(
  registry: Record<string, Component>,
  type: string | undefined,
): Component | undefined {
  return type !== undefined && Object.hasOwn(registry, type) ? registry[type] : undefined;
}

export function toHeadingTag(value: unknown): HeadingTagType {
  // eslint-disable-next-line sonarjs/null-dereference -- false positive: `value` is a string here
  const tagName = typeof value === "string" ? value.toLowerCase() : value;
  return HEADING_TAGS.find((tag) => tag === tagName) ?? DEFAULT_HEADING_TAG;
}

/** `getLinkAttr` for a link from section settings: a link `isSafeLinkUrl` rejects renders as no link. */
export function getSectionLinkAttr(link: string | undefined): ReturnType<typeof getLinkAttr> {
  return getLinkAttr(link && isSafeLinkUrl(link) ? link : undefined);
}

export function sanitizeSectionHtml(html: string | undefined): string {
  return html
    ? htmlPurifier.sanitize(html, { USE_PROFILES: { html: true }, ADD_ATTR: ["target"], ALLOWED_URI_REGEXP })
    : "";
}

export function getLoadedSectionComponent(component: Component): Component | undefined {
  return isAsyncWrapper(component) ? component.__asyncResolved : component;
}

export async function loadSectionComponent(component: Component): Promise<Component> {
  if (!isAsyncWrapper(component)) {
    return component;
  }

  return await component.__asyncLoader();
}

export function pickDeclaredProps(component: Component, item: Record<string, unknown>): Record<string, unknown> {
  const declaredProps = getDeclaredPropNames(component);

  return Object.fromEntries(
    Object.entries(item)
      .map(([key, value]) => [camelize(key), value] as const)
      .filter(([key]) => declaredProps.has(key)),
  );
}

function getDeclaredPropNames(component: Component): Set<string> {
  const props = (component as { props?: DeclaredPropsType }).props;
  const names = Array.isArray(props) ? props : Object.keys(props ?? {});
  return new Set(names.map((name) => camelize(name)));
}

export function opensNewWindow(target: string | null): boolean {
  // eslint-disable-next-line sonarjs/null-dereference -- false positive: `target` is checked for null first
  return target !== null && !SAME_CONTEXT_TARGETS.has(target.toLowerCase());
}

function isAsyncWrapper(
  component: Component,
): component is Component & AsyncComponentWrapperType & Pick<Required<AsyncComponentWrapperType>, "__asyncLoader"> {
  return typeof (component as AsyncComponentWrapperType).__asyncLoader === "function";
}
