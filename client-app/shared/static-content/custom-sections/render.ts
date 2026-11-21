import { createCommentVNode, createTextVNode, Fragment, h, isVNode, mergeProps, withDirectives } from "vue";
import { isRecord, Logger } from "@/core/utilities";
import { getPreviewFieldAttrs, opensNewWindow, sanitizeSectionHtml, withNewWindowRel } from "../sections";
import { getBehaviorDirective, REPEATED_COPY_ATTRIBUTE } from "./behaviors";
import { isSetValue, renderParts, resolveBinding, toFieldMap } from "./bindings";
import { getSectionBehaviors, getSectionTags, toFieldValue, toTagProps } from "./kit";
import { getSettingVariables } from "./setting-variables";
import { toAssetSrcset, toAssetUrl, toSectionLink } from "./urls";
import type { IBindingScope } from "./bindings";
import type { CompiledNodeType, ICompiledElement, ICompiledTemplate } from "./template";
import type { ICustomSectionBehavior, ICustomSectionField } from "./types";
import type { IThemeSchemaField } from "@/core/theme-snapshot";
import type { DirectiveArguments, VNode, VNodeArrayChildren } from "vue";

export interface IRenderOptions {
  type: string;
  /** The placed section: its settings by id. */
  settings: Record<string, unknown>;
  fields: readonly IThemeSchemaField[];
  /** Images come only from under it, when the theme names it. */
  assetsBaseUrl?: string;
}

interface IRenderedAttribute {
  name: string;
  value: string;
  /** Its value comes from a binding, so an empty one means the setting is unset. */
  isBound: boolean;
}

interface IBehaviorAttributes {
  /** Every behavior's attribute, its own and its options', with the field its value must fit, if any. */
  fields: Map<string, ICustomSectionField | undefined>;
  textAttributes: Set<string>;
}

const LINK_TARGETS = new Set(["_self", "_blank"]);
const OPENER_REGEX = /(?:^|\s)opener(?:\s|$)/i;
/** The copies a repeating behavior adds: out of the tab order and hidden from assistive technology. */
const COPY_PROPS = { "aria-hidden": "true", inert: "", [REPEATED_COPY_ATTRIBUTE]: "" };

const behaviorAttributes = new WeakMap<object, IBehaviorAttributes>();

export function renderCustomSection(template: ICompiledTemplate, options: IRenderOptions): VNode | null {
  const scope: IBindingScope = {
    type: options.type,
    assetsBaseUrl: options.assetsBaseUrl,
    settings: options.settings,
    fields: toFieldMap(options.fields),
  };
  const rootProps = {
    key: template.id,
    "data-sb-type": options.type,
    style: getSettingVariables(options.fields, options.settings, options.assetsBaseUrl),
  };
  const [root] = renderElement(template.root, scope, rootProps);

  return isVNode(root) ? root : null;
}

function renderNodes(
  nodes: readonly CompiledNodeType[],
  scope: IBindingScope,
  props: Record<string, unknown> = {},
): VNodeArrayChildren {
  return nodes.flatMap((node) =>
    "text" in node ? [createTextVNode(renderParts(node.text, scope))] : renderElement(node, scope, props),
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
  const keys = toRowKeys(rows);

  return [
    h(
      Fragment,
      rows.map((values, index) =>
        renderShown(
          node,
          { ...scope, row: { listId, index, values, fields } },
          { ...props, key: keys[index], style: { "--i": String(index), "--n": String(rows.length) } },
        ),
      ),
    ),
  ];
}

/** By the rows' own ids when every row has a different one, so a reordered row keeps what its element holds. */
function toRowKeys(rows: Record<string, unknown>[]): (string | number)[] {
  const ids = rows.map((row) => row.id);
  const hasOwnIds =
    ids.every((id) => (typeof id === "string" && id !== "") || typeof id === "number") &&
    new Set(ids).size === ids.length;

  return hasOwnIds ? (ids as (string | number)[]) : rows.map((_, index) => index);
}

/** A comment holds the place of an element `data-if` hides, so its siblings keep theirs. */
function renderShown(node: ICompiledElement, scope: IBindingScope, props: Record<string, unknown>): VNode {
  if (node.condition) {
    const isSet = isSetValue(resolveBinding(node.condition.path, scope)?.value);

    if (isSet === node.condition.isNegated) {
      return createCommentVNode("", true);
    }
  }

  const rendered = renderAttributeEntries(node.attributes, scope);

  if (node.isKitTag) {
    return renderKitTag(node, rendered, props);
  }

  const behaviors = getSectionBehaviors();
  const { fields, textAttributes } = getBehaviorAttributes(behaviors);
  const kept = rendered.filter((attribute) => fitsBehaviorField(attribute, fields));
  const values = new Map(kept.map(({ name, value }) => [name, value]));
  const applied = node.behaviors.filter((name) => Object.hasOwn(behaviors, name) && values.has(`data-${name}`));
  const hasText = kept.some(({ name }) => textAttributes.has(name));
  const isRepeated = applied.some((name) => !!behaviors[name].repeatsChildren);

  const vnode = h(
    node.tag,
    mergeProps(renderAttributes(node, kept, scope), getFieldAttributes(node, scope), props),
    renderChildren(node, scope, hasText, isRepeated),
  );
  const directives: DirectiveArguments = applied.map((name) => [
    getBehaviorDirective(behaviors[name]),
    values.get(`data-${name}`),
  ]);

  return directives.length ? withDirectives(vnode, directives) : vnode;
}

/** A tag that throws on its attributes renders nothing rather than the whole section failing. */
function renderKitTag(node: ICompiledElement, rendered: IRenderedAttribute[], props: Record<string, unknown>): VNode {
  const tags = getSectionTags();
  const tag = Object.hasOwn(tags, node.tag) ? tags[node.tag] : undefined;

  if (!tag) {
    return createCommentVNode("", true);
  }

  // An attribute bound to an unset setting is as if it were not written: a boolean one is then off.
  const values = Object.fromEntries(
    rendered.filter(({ value, isBound }) => !isBound || value !== "").map(({ name, value }) => [name, value]),
  );

  try {
    const { props: tagProps, slotText } = toTagProps(tag, values);
    return h(tag.component, { ...tagProps, ...props }, slotText === undefined ? undefined : () => slotText);
  } catch (error) {
    Logger.error(`[custom-sections] The ${node.tag} tag failed to map its attributes`, error);
    return createCommentVNode("", true);
  }
}

function renderChildren(
  node: ICompiledElement,
  scope: IBindingScope,
  hasText: boolean,
  isRepeated: boolean,
): VNodeArrayChildren | undefined {
  if (node.html || hasText) {
    return undefined;
  }

  const children = renderNodes(node.children, scope);

  return isRepeated
    ? [
        h(Fragment, { key: "run" }, children),
        h(Fragment, { key: "copy" }, renderNodes(node.children, scope, COPY_PROPS)),
      ]
    : children;
}

function renderAttributeEntries(
  attributes: ICompiledElement["attributes"],
  scope: IBindingScope,
): IRenderedAttribute[] {
  return attributes.map(([name, parts]) => ({
    name,
    value: renderParts(parts, scope),
    isBound: parts.some((part) => typeof part !== "string"),
  }));
}

/** A behavior's attribute bound to an unset setting, or holding a value its field does not take, is left out. */
function fitsBehaviorField(
  { name, value, isBound }: IRenderedAttribute,
  fields: IBehaviorAttributes["fields"],
): boolean {
  if (!fields.has(name)) {
    return true;
  }

  const field = fields.get(name);

  return !(isBound && value === "") && (!field || toFieldValue(field, value) !== undefined);
}

function getBehaviorAttributes(behaviors: Readonly<Record<string, ICustomSectionBehavior>>): IBehaviorAttributes {
  let attributes = behaviorAttributes.get(behaviors);

  if (!attributes) {
    const fields = new Map<string, ICustomSectionField | undefined>();

    for (const [name, behavior] of Object.entries(behaviors)) {
      fields.set(`data-${name}`, behavior.value);
      Object.entries(behavior.options ?? {}).forEach(([option, field]) => fields.set(`data-${name}-${option}`, field));
    }

    attributes = {
      fields,
      textAttributes: new Set(Object.values(behaviors).flatMap((behavior) => behavior.textAttributes ?? [])),
    };
    behaviorAttributes.set(behaviors, attributes);
  }

  return attributes;
}

function renderAttributes(
  node: ICompiledElement,
  rendered: IRenderedAttribute[],
  scope: IBindingScope,
): Record<string, unknown> {
  const attributes: Record<string, string> = {};

  for (const { name, value } of rendered) {
    const safeValue = toSafeAttributeValue(name, value, scope);

    if (safeValue !== undefined) {
      attributes[name] = safeValue;
    }
  }

  if (opensNewWindow(attributes.target ?? null)) {
    attributes.rel = withNewWindowRel(attributes.rel);
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

function toSafeAttributeValue(name: string, value: string, scope: IBindingScope): string | undefined {
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
