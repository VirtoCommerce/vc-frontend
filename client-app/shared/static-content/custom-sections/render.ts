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
import { isRecord, Logger } from "@/core/utilities";
import { getPreviewFieldAttrs, opensNewWindow, sanitizeSectionHtml } from "../sections";
import { getBehaviorDirective, REPEATED_COPY_ATTRIBUTE } from "./behaviors";
import { isSetValue, renderParts, resolveBinding, toFieldMap } from "./bindings";
import { getSectionBehaviors, getSectionTags, toTagProps } from "./kit";
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
}

const NEW_WINDOW_REL_TOKENS = ["noopener", "noreferrer"];
const LINK_TARGETS = new Set(["_self", "_blank"]);
const OPENER_REGEX = /(?:^|\s)opener(?:\s|$)/i;

export function renderCustomSection(template: ICompiledTemplate, options: IRenderOptions): VNode | null {
  const scope: IBindingScope = { type: options.type, settings: options.settings, fields: toFieldMap(options.fields) };
  const rootProps = {
    "data-sb-type": options.type,
    style: getSettingVariables(options.fields, options.settings),
  };
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

  if (node.isKitTag) {
    return renderKitTag(node, scope, props);
  }

  const vnode = h(
    node.tag,
    mergeProps(renderAttributes(node, scope), getFieldAttributes(node, scope), props),
    renderChildren(node, scope),
  );
  const behaviors = getSectionBehaviors();
  const directives: DirectiveArguments = node.behaviors
    .filter((name) => Object.hasOwn(behaviors, name))
    .map((name) => [
      getBehaviorDirective(behaviors[name]),
      renderParts(node.attributes.find(([attribute]) => attribute === `data-${name}`)?.[1] ?? [], scope),
    ]);

  return directives.length ? withDirectives(vnode, directives) : vnode;
}

/** A tag that throws on its attributes renders nothing rather than the whole section failing. */
function renderKitTag(node: ICompiledElement, scope: IBindingScope, props: Record<string, unknown>): VNode {
  const tags = getSectionTags();
  const tag = Object.hasOwn(tags, node.tag) ? tags[node.tag] : undefined;

  if (!tag) {
    return createCommentVNode("", true);
  }

  try {
    const { props: tagProps, slotText } = toTagProps(tag, renderAttributeValues(node.attributes, scope));
    return h(tag.component, { ...tagProps, ...props }, slotText === undefined ? undefined : () => slotText);
  } catch (error) {
    Logger.error(`[custom-sections] The ${node.tag} tag failed to map its attributes`, error);
    return createCommentVNode("", true);
  }
}

function renderChildren(node: ICompiledElement, scope: IBindingScope): VNodeArrayChildren | undefined {
  if (node.html || node.hasBehaviorText) {
    return undefined;
  }

  const children = renderNodes(node.children, scope);

  if (!node.repeatsChildren) {
    return children;
  }

  const copies = renderNodes(node.children, scope).map((child) =>
    isVNode(child) && child.type !== Text && child.type !== Comment
      ? cloneVNode(child, { "aria-hidden": "true", [REPEATED_COPY_ATTRIBUTE]: "" })
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
    const safeValue = toSafeAttributeValue(name, value, scope.type);

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

function toSafeAttributeValue(name: string, value: string, type: string): string | undefined {
  switch (name) {
    case "class":
      return toOwnClasses(value, type);
    case "target":
      return LINK_TARGETS.has(value.trim()) ? value.trim() : undefined;
    case "rel":
      return OPENER_REGEX.test(value) ? undefined : value;
    case "href":
    case "cite":
      return toSectionLink(value);
    case "src":
    case "poster":
      return toAssetUrl(value);
    case "srcset":
      return toAssetSrcset(value);
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
