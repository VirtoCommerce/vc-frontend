import { createCommentVNode, createTextVNode, Fragment, h, isVNode, mergeProps, withDirectives } from "vue";
import { Logger } from "@/core/utilities";
import { getPreviewFieldAttrs, opensNewWindow, withNewWindowRel } from "../sections";
import { BOOLEAN_ATTRIBUTES, isBooleanAttributeOn, isUnsetBinding, toSafeAttributeValue } from "./allowlist";
import { getBehaviorDirective, hasBehaviorFailed, REPEATED_COPY_ATTRIBUTE, SECTION_TYPE_ATTRIBUTE } from "./behaviors";
import { getListRows, isSetValue, renderParts, resolveBinding, toFieldMap } from "./bindings";
import {
  getBehaviorAttributeNames,
  getCustomSectionBehaviors,
  getCustomSectionTags,
  toFieldValue,
  toTagProps,
} from "./kit";
import { MAX_RENDERED_TEXT, RENDER_BUDGET } from "./limits";
import { fitsRenderLimits } from "./render-limits";
import { getRichText } from "./rich-text";
import { getSettingVariables } from "./setting-variables";
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
  /** The visitor's motion preference: an element with behaviors mounts afresh when it changes. */
  isReducedMotion?: boolean;
}

interface IRenderScope extends IBindingScope {
  isReducedMotion: boolean;
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
  /** The attributes of elements whose text a behavior writes, with that behavior. */
  textAttributes: Map<string, ICustomSectionBehavior>;
}

/** The copies a repeating behavior adds: out of the tab order and hidden from assistive technology. */
const COPY_PROPS = { "aria-hidden": "true", inert: "", [REPEATED_COPY_ATTRIBUTE]: "" };

const behaviorAttributes = new WeakMap<object, IBehaviorAttributes>();
const overBudgetTemplates = new WeakSet<ICompiledTemplate>();

export function renderCustomSection(template: ICompiledTemplate, options: IRenderOptions): VNode | null {
  const scope: IRenderScope = {
    type: options.type,
    assetsBaseUrl: options.assetsBaseUrl,
    settings: options.settings,
    fields: toFieldMap(options.fields),
    isReducedMotion: !!options.isReducedMotion,
  };

  if (!fitsRenderLimits(template.root, scope)) {
    if (!overBudgetTemplates.has(template)) {
      overBudgetTemplates.add(template);
      Logger.warn(
        `[custom-sections] The ${options.type} section would render more than ${RENDER_BUDGET} elements and ` +
          `behaviors or ${MAX_RENDERED_TEXT} characters of settings; it renders nothing.`,
      );
    }
    return null;
  }

  const rootProps = {
    key: template.id,
    [SECTION_TYPE_ATTRIBUTE]: options.type,
    style: getSettingVariables(options.fields, options.settings, options.assetsBaseUrl),
  };
  const [root] = renderElement(template.root, scope, rootProps);

  return isVNode(root) ? root : null;
}

/**
 * `repeat`: the children of an element a behavior repeats, as the run or its copy. Their text goes in a span in
 * both, so the run and the copy hold the same items and the copy's can be hidden from assistive technology.
 * Blank text stays bare: as an element, it would take a gap.
 */
function renderNodes(
  nodes: readonly CompiledNodeType[],
  scope: IRenderScope,
  repeat?: "run" | "copy",
  textProps: Record<string, string> = {},
): VNodeArrayChildren {
  const props = repeat === "copy" ? COPY_PROPS : {};

  return nodes.flatMap((node, position) => {
    if (!("text" in node)) {
      return renderElement(node, scope, props, position);
    }

    const text = renderParts(node.text, scope);

    return [repeat && text.trim() ? h("span", { ...props, ...textProps }, text) : createTextVNode(text)];
  });
}

/** `position`: among the element's siblings in the template, so siblings alike never share a key. */
function renderElement(
  node: ICompiledElement,
  scope: IRenderScope,
  props: Record<string, unknown> = {},
  position = 0,
): VNodeArrayChildren {
  const listId = node.each;

  if (!listId) {
    return [renderShown(node, scope, props, position)];
  }

  const field = scope.fields.get(listId);
  const rows = getListRows(listId, scope);
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
          position,
        ),
      ),
    ),
  ];
}

/** By the rows' own ids when every row has a different one, so a reordered row keeps what its element holds. */
function toRowKeys(rows: Record<string, unknown>[]): (string | number)[] {
  const ids = rows.map((row) => row.id);

  return ids.every(isRowId) && new Set(ids).size === ids.length ? ids : rows.map((_, index) => index);
}

function isRowId(id: unknown): id is string | number {
  return (typeof id === "string" && id !== "") || typeof id === "number";
}

/** A comment holds the place of an element `data-if` hides, so its siblings keep theirs. */
function renderShown(
  node: ICompiledElement,
  scope: IRenderScope,
  props: Record<string, unknown>,
  position: number,
): VNode {
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

  const behaviors = getCustomSectionBehaviors();
  const { fields, textAttributes } = getBehaviorAttributes(behaviors);
  const kept = rendered.filter((attribute) => fitsBehaviorField(attribute, fields));
  const values = new Map(kept.map(({ name, value }) => [name, value]));
  const applied = node.behaviors.filter((name) => Object.hasOwn(behaviors, name) && values.has(`data-${name}`));
  // A behavior whose chunk failed to load leaves the template's text in place until a later load succeeds.
  const hasText = kept.some(({ name }) => {
    const behavior = textAttributes.get(name);
    return !!behavior && !hasBehaviorFailed(behavior);
  });
  const isRepeated = applied.some((name) => !!behaviors[name].repeatsChildren);

  // Vue pairs an element's directives by position, and a behavior reads its value, its options and the motion
  // preference once: a change to any of them mounts the element afresh.
  const behaviorValues = kept.filter(({ name }) => fields.has(name)).map(({ name, value }) => [name, value]);
  const behaviorKey = applied.length
    ? { key: JSON.stringify([props.key ?? null, position, scope.isReducedMotion, behaviorValues]) }
    : {};
  const vnode = h(
    node.tag,
    // The designer edits a text where it shows alone: not where a behavior writes it, nor beside its copy.
    mergeProps(
      renderAttributes(node, kept, scope),
      isRepeated || hasText ? {} : getFieldAttributes(node, scope),
      props,
      behaviorKey,
    ),
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
  const tags = getCustomSectionTags();
  const tag = Object.hasOwn(tags, node.tag) ? tags[node.tag] : undefined;

  if (!tag) {
    return createCommentVNode("", true);
  }

  // An attribute bound to an unset setting is as if it were not written: a boolean one is then off.
  const values = Object.fromEntries(
    rendered.filter((attribute) => !isUnsetBinding(attribute)).map(({ name, value }) => [name, value]),
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
  scope: IRenderScope,
  hasText: boolean,
  isRepeated: boolean,
): VNodeArrayChildren | undefined {
  if (node.html || hasText) {
    return undefined;
  }

  return isRepeated
    ? [
        h(Fragment, { key: "run" }, renderNodes(node.children, scope, "run", getFieldAttributes(node, scope))),
        h(Fragment, { key: "copy" }, renderNodes(node.children, scope, "copy")),
      ]
    : renderNodes(node.children, scope);
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

  return !isUnsetBinding({ value, isBound }) && (!field || toFieldValue(field, value) !== undefined);
}

function getBehaviorAttributes(behaviors: Readonly<Record<string, ICustomSectionBehavior>>): IBehaviorAttributes {
  let attributes = behaviorAttributes.get(behaviors);

  if (!attributes) {
    const fields = new Map<string, ICustomSectionField | undefined>();

    for (const [name, behavior] of Object.entries(behaviors)) {
      const [own, ...options] = getBehaviorAttributeNames(name, behavior);
      const optionFields = Object.values(behavior.options ?? {});

      fields.set(own, behavior.value);
      options.forEach((attribute, index) => fields.set(attribute, optionFields[index]));
    }

    attributes = {
      fields,
      textAttributes: new Map(
        Object.values(behaviors).flatMap((behavior) =>
          (behavior.textAttributes ?? []).map((attribute) => [attribute, behavior] as const),
        ),
      ),
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

  for (const { name, value, isBound } of rendered) {
    const isOff = BOOLEAN_ATTRIBUTES.has(name) && (isUnsetBinding({ value, isBound }) || !isBooleanAttributeOn(value));
    const safeValue = isOff ? undefined : toSafeAttributeValue(name, value, scope);

    if (safeValue !== undefined) {
      attributes[name] = safeValue;
    }
  }

  if (opensNewWindow(attributes.target ?? null)) {
    attributes.rel = withNewWindowRel(attributes.rel);
  }

  if (node.html) {
    return { ...attributes, innerHTML: getRichText(node.html, scope)?.html ?? "" };
  }

  return attributes;
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
