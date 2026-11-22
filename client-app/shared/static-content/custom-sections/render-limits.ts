import { getListRows, resolveBinding, toBindingText, toFieldMap } from "./bindings";
import { getCustomSectionBehaviors, getCustomSectionTags } from "./kit";
import { MAX_RENDERED_TEXT, RENDER_BUDGET } from "./limits";
import { getRichText } from "./rich-text";
import type { IBindingScope, TemplatePartType } from "./bindings";
import type { ICompiledElement } from "./template";

interface IRenderSize {
  elements: number;
  characters: number;
}

/**
 * Whether the section stays within the render budget and the text cap, counted before anything renders, as
 * written, whatever `data-if` hides. Rows multiply what they hold, a short template with a long list included.
 */
export function fitsRenderLimits(root: ICompiledElement, scope: IBindingScope): boolean {
  const size: IRenderSize = { elements: 0, characters: 0 };

  addElementSize(root, scope, size, 1);
  return !isOverLimits(size);
}

function isOverLimits(size: IRenderSize): boolean {
  return size.elements > RENDER_BUDGET || size.characters > MAX_RENDERED_TEXT;
}

/** `times`: how often the element renders where it stands; a repeating behavior renders its children twice. */
function addElementSize(node: ICompiledElement, scope: IBindingScope, size: IRenderSize, times: number): void {
  const listId = node.each;

  if (!listId) {
    addOwnSize(node, scope, size, times);
    return;
  }

  const rows = getListRows(listId, scope);
  const fields = toFieldMap(scope.fields.get(listId)?.element);

  // Every row adds at least its element, so the count stops within the budget's number of rows.
  for (let index = 0; index < rows.length && !isOverLimits(size); index++) {
    addOwnSize(node, { ...scope, row: { listId, index, values: rows[index], fields } }, size, times);
  }
}

function addOwnSize(node: ICompiledElement, scope: IBindingScope, size: IRenderSize, times: number): void {
  const behaviors = getCustomSectionBehaviors();
  const tags = getCustomSectionTags();
  const own = node.isKitTag && Object.hasOwn(tags, node.tag) ? (tags[node.tag].cost ?? 1) : 1;
  const richText = node.html ? getRichText(node.html, scope) : undefined;
  const isRepeated = node.behaviors.some((name) => !!behaviors[name]?.repeatsChildren);
  const boundText = countBoundText(
    node.attributes.flatMap(([, parts]) => parts),
    scope,
  );

  size.elements += (own + node.behaviors.length + (richText?.elements ?? 0)) * times;
  size.characters += (boundText + (richText?.html.length ?? 0)) * times;

  for (const child of node.children) {
    if (isOverLimits(size)) {
      return;
    }

    if ("text" in child) {
      size.characters += countBoundText(child.text, scope) * (isRepeated ? 2 : 1) * times;
    } else {
      addElementSize(child, scope, size, (isRepeated ? 2 : 1) * times);
    }
  }
}

function countBoundText(parts: readonly TemplatePartType[], scope: IBindingScope): number {
  return parts.reduce(
    (sum, part) =>
      typeof part === "string" ? sum : sum + toBindingText(resolveBinding(part.path, scope)?.value).length,
    0,
  );
}
