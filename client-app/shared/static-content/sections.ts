import DOMPurify from "dompurify";
import { camelize } from "vue";
import type { Component } from "vue";

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

export type HeadingTagType = (typeof HEADING_TAGS)[number];

const DEFAULT_HEADING_TAG: HeadingTagType = "h2";

type DeclaredPropsType = string[] | Record<string, unknown>;

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

/** Own keys only: a type such as `toString` must not resolve to `Object.prototype`. */
export function getRegisteredSection(
  registry: Record<string, Component>,
  type: string | undefined,
): Component | undefined {
  return type !== undefined && Object.hasOwn(registry, type) ? registry[type] : undefined;
}

export function toHeadingTag(value: unknown): HeadingTagType {
  return HEADING_TAGS.find((tag) => tag === value) ?? DEFAULT_HEADING_TAG;
}

export function sanitizeSectionHtml(html: string | undefined): string {
  return html ? htmlPurifier.sanitize(html, { USE_PROFILES: { html: true }, ADD_ATTR: ["target"] }) : "";
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

function opensNewWindow(target: string | null): boolean {
  // eslint-disable-next-line sonarjs/null-dereference -- false positive: `target` is checked for null first
  return target !== null && !SAME_CONTEXT_TARGETS.has(target.toLowerCase());
}

function isAsyncWrapper(
  component: Component,
): component is Component & AsyncComponentWrapperType & Pick<Required<AsyncComponentWrapperType>, "__asyncLoader"> {
  return typeof (component as AsyncComponentWrapperType).__asyncLoader === "function";
}
