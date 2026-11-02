import DOMPurify from "dompurify";
import { camelize } from "vue";
import type { Component } from "vue";

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

export type HeadingTagType = (typeof HEADING_TAGS)[number];

const DEFAULT_HEADING_TAG: HeadingTagType = "h2";

type DeclaredPropsType = string[] | Record<string, unknown> | undefined;

/**
 * `defineAsyncComponent` keeps the declared props on the inner component, so they are known only after
 * `__asyncLoader` resolves. Vue reads the same field for hydration and KeepAlive.
 */
type AsyncComponentWrapperType = { __asyncLoader?: () => Promise<Component> };

const loadedComponents = new WeakMap<object, Component>();

const htmlPurifier = DOMPurify();

htmlPurifier.addHook("afterSanitizeAttributes", (node) => {
  if (node instanceof Element && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export function toHeadingTag(value: unknown): HeadingTagType {
  return HEADING_TAGS.find((tag) => tag === value) ?? DEFAULT_HEADING_TAG;
}

/** Sanitizes HTML authored in a Page Builder setting before it is rendered with `v-html`. */
export function sanitizeSectionHtml(html: string | undefined): string {
  return html ? htmlPurifier.sanitize(html, { USE_PROFILES: { html: true }, ADD_ATTR: ["target"] }) : "";
}

/** Returns the section component ready to render, or `undefined` while a lazy one is not loaded yet. */
export function getLoadedSectionComponent(component: Component): Component | undefined {
  return isAsyncWrapper(component) ? loadedComponents.get(component) : component;
}

export async function loadSectionComponent(component: Component): Promise<Component> {
  if (!isAsyncWrapper(component)) {
    return component;
  }

  const loaded = await component.__asyncLoader();
  loadedComponents.set(component, loaded);
  return loaded;
}

/** Keeps only the entries of a Page Builder item that the section component declares as props. */
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

function isAsyncWrapper(component: Component): component is Component & Required<AsyncComponentWrapperType> {
  return typeof (component as AsyncComponentWrapperType).__asyncLoader === "function";
}
