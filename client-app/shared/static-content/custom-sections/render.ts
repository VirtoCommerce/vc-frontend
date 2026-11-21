import {
  cloneVNode,
  Comment,
  createCommentVNode,
  createTextVNode,
  Fragment,
  h,
  isVNode,
  mergeProps,
  Text,
  withDirectives,
} from "vue";
import { isRecord } from "@/core/utilities";
import { getPreviewFieldAttrs, opensNewWindow, sanitizeSectionHtml } from "../sections";
import { getBehaviorDirective, MARQUEE_COPY_ATTRIBUTE } from "./behaviors";
import { isSetValue, renderParts, resolveBinding, toFieldMap } from "./bindings";
import { renderKitTag } from "./kit-tags";
import { getSettingVariables } from "./setting-variables";
import { toAssetSrcset, toAssetUrl, toSectionLink } from "./urls";
import type { IBindingScope } from "./bindings";
import type { CompiledNodeType, ICompiledElement, ICompiledTemplate } from "./template";
import type { IThemeSchemaField } from "@/core/theme-snapshot";
import type { DirectiveArguments, VNode, VNodeArrayChildren } from "vue";

export interface IRenderOptions {
  type: string;
  /** The placed section: its settings by id. */
  settings: Record<string, unknown>;
  fields: readonly IThemeSchemaField[];
  /** Go on the root, as a section's own attributes: the anchor id and the preview's attributes. */
  rootAttributes: Record<string, unknown>;
}

/** The behaviors whose directive writes the element's text, so the template's text there is not rendered. */
const TEXT_OWNING_ATTRIBUTES = ["data-count-up", "data-countdown-part"];
const NEW_WINDOW_REL_TOKENS = ["noopener", "noreferrer"];

export function renderCustomSection(template: ICompiledTemplate, options: IRenderOptions): VNode | null {
  const scope: IBindingScope = { settings: options.settings, fields: toFieldMap(options.fields) };
  const rootProps = mergeProps(options.rootAttributes, {
    "data-sb-type": options.type,
    style: getSettingVariables(options.fields, options.settings),
  });
  const [root] = renderElement(template.root, scope, rootProps);

  return isVNode(root) ? root : null;
}

function renderNodes(nodes: readonly CompiledNodeType[], scope: IBindingScope): VNodeArrayChildren {
  return nodes.flatMap((node) =>
    "text" in node ? [createTextVNode(renderParts(node.text, scope))] : renderElement(node, scope),
  );
}

function renderElement(
  node: ICompiledElement,
  scope: IBindingScope,
  props: Record<string, unknown> = {},
): VNodeArrayChildren {
  const listId = node.each;

  if (!listId) {
    return [renderShown(node, scope, props)];
  }

  const field = scope.fields.get(listId);
  const value = scope.settings[listId];
  const rows = field?.type === "list" && Array.isArray(value) ? value.filter(isRecord) : [];
  const fields = toFieldMap(field?.element);

  return [
    h(
      Fragment,
      rows.map((values, index) =>
        renderShown(
          node,
          { ...scope, row: { listId, index, values, fields } },
          { ...props, key: index, style: { "--i": String(index), "--n": String(rows.length) } },
        ),
      ),
    ),
  ];
}

/** A comment holds the place of an element `data-if` hides, so its siblings keep theirs. */
function renderShown(node: ICompiledElement, scope: IBindingScope, props: Record<string, unknown>): VNode {
  if (node.condition) {
    const isSet = isSetValue(resolveBinding(node.condition.path, scope)?.value);

    if (isSet === node.condition.isNegated) {
      return createCommentVNode("", true);
    }
  }

  if (node.kit) {
    return renderKitTag(node.kit, renderAttributeValues(node.attributes, scope), props);
  }

  const vnode = h(
    node.tag,
    mergeProps(renderAttributes(node, scope), getFieldAttributes(node, scope), props),
    renderChildren(node, scope),
  );
  const directives: DirectiveArguments = node.behaviors.map((behavior) => [
    getBehaviorDirective(behavior),
    renderParts(node.attributes.find(([name]) => name === behavior)?.[1] ?? [], scope),
  ]);

  return directives.length ? withDirectives(vnode, directives) : vnode;
}

function renderChildren(node: ICompiledElement, scope: IBindingScope): VNodeArrayChildren | undefined {
  if (node.html || node.attributes.some(([name]) => TEXT_OWNING_ATTRIBUTES.includes(name))) {
    return undefined;
  }

  const children = renderNodes(node.children, scope);

  if (!node.behaviors.includes("data-marquee")) {
    return children;
  }

  const copies = renderNodes(node.children, scope).map((child) =>
    isVNode(child) && child.type !== Text && child.type !== Comment
      ? cloneVNode(child, { "aria-hidden": "true", [MARQUEE_COPY_ATTRIBUTE]: "" })
      : child,
  );

  return [h(Fragment, { key: "run" }, children), h(Fragment, { key: "copy" }, copies)];
}

function renderAttributeValues(
  attributes: ICompiledElement["attributes"],
  scope: IBindingScope,
): Record<string, string> {
  return Object.fromEntries(attributes.map(([name, parts]) => [name, renderParts(parts, scope)]));
}

function renderAttributes(node: ICompiledElement, scope: IBindingScope): Record<string, unknown> {
  const attributes: Record<string, string> = {};

  for (const [name, value] of Object.entries(renderAttributeValues(node.attributes, scope))) {
    const safeValue = toSafeAttributeValue(name, value);

    if (safeValue !== undefined) {
      attributes[name] = safeValue;
    }
  }

  if (opensNewWindow(attributes.target ?? null)) {
    const rel = new Set([...(attributes.rel?.split(/\s+/).filter(Boolean) ?? []), ...NEW_WINDOW_REL_TOKENS]);
    attributes.rel = [...rel].join(" ");
  }

  if (node.html) {
    const binding = resolveBinding(node.html, scope);
    const value: unknown = isRecord(binding?.value) ? binding.value.html : binding?.value;

    return {
      ...attributes,
      innerHTML: binding?.field.type === "text" && typeof value === "string" ? sanitizeSectionHtml(value) : "",
    };
  }

  return attributes;
}

function toSafeAttributeValue(name: string, value: string): string | undefined {
  switch (name) {
    case "href":
      return toSectionLink(value);
    case "src":
      return toAssetUrl(value);
    case "srcset":
      return toAssetSrcset(value);
    default:
      return value;
  }
}

/** Names the setting an element shows as its whole text, so the designer edits it in place. */
function getFieldAttributes(node: ICompiledElement, scope: IBindingScope): Record<string, string> {
  const parts = node.children.length === 1 && "text" in node.children[0] ? node.children[0].text : [];
  const bindings = parts.filter((part) => typeof part !== "string" || part.trim());
  const [binding] = bindings;
  const resolved =
    bindings.length === 1 && typeof binding !== "string" ? resolveBinding(binding.path, scope) : undefined;

  return resolved?.field.type === "string" && resolved.field.format !== "url"
    ? getPreviewFieldAttrs(resolved.path.join("."))
    : {};
}
