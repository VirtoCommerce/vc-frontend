import { isRecord } from "@/core/utilities";
import type { IThemeSchemaField } from "@/core/theme-snapshot";

/** A literal, or a binding by its path (`settings.title`, `item.label`). */
export type TemplatePartType = string | { path: string };

export interface IRowScope {
  /** The `list` setting the row belongs to. */
  listId: string;
  index: number;
  values: Record<string, unknown>;
  fields: ReadonlyMap<string, IThemeSchemaField>;
}

export interface IBindingScope {
  /** The section type, whose own classes a template may use. */
  type: string;
  /** Where the asset library's images are, when the theme names it. */
  assetsBaseUrl?: string;
  settings: Record<string, unknown>;
  fields: ReadonlyMap<string, IThemeSchemaField>;
  row?: IRowScope;
}

export interface IResolvedBinding {
  value: unknown;
  field: IThemeSchemaField;
  /** Where the value sits in the section's settings, as the designer names a setting: `cards.0.title`. */
  path: (string | number)[];
}

const BINDING_REGEX = /\{\{([^{}]*)\}\}/g;
const BINDING_PATH_REGEX = /^(?:settings\.[\w-]+(?:\.[\w-]+)?|item\.[\w-]+)$/;

export function toFieldMap(fields: readonly IThemeSchemaField[] | undefined): Map<string, IThemeSchemaField> {
  return new Map(
    (fields ?? []).flatMap((field) => (typeof field.id === "string" && field.id ? [[field.id, field] as const] : [])),
  );
}

export function isBindingPath(path: string): boolean {
  return BINDING_PATH_REGEX.test(path);
}

/** A binding that is no path of a setting is left out. */
export function parseBindings(text: string): TemplatePartType[] {
  const parts: TemplatePartType[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(BINDING_REGEX)) {
    const path = match[1].trim();

    parts.push(text.slice(lastIndex, match.index));
    parts.push(isBindingPath(path) ? { path } : "");
    lastIndex = match.index + match[0].length;
  }

  parts.push(text.slice(lastIndex));

  return parts.filter((part) => part !== "");
}

/** Only declared settings resolve: `settings.<id>`, `settings.<id>.<field>` of an object, `item.<field>` in a row. */
export function resolveBinding(path: string, scope: IBindingScope): IResolvedBinding | undefined {
  const [root, key, subKey] = path.split(".");

  if (root === "item") {
    const field = scope.row?.fields.get(key);

    return scope.row && field
      ? { value: readSetting(scope.row.values, key, field), field, path: [scope.row.listId, scope.row.index, key] }
      : undefined;
  }

  const field = scope.fields.get(key);

  if (!field) {
    return undefined;
  }

  if (!subKey) {
    return { value: readSetting(scope.settings, key, field), field, path: [key] };
  }

  const owner = readSetting(scope.settings, key, field);
  const subField = field.element?.find(({ id }) => id === subKey);

  return subField
    ? { value: readSetting(isRecord(owner) ? owner : {}, subKey, subField), field: subField, path: [key, subKey] }
    : undefined;
}

/** The rows of a `list` setting: its objects, in order. */
export function getListRows(listId: string, scope: IBindingScope): Record<string, unknown>[] {
  const field = scope.fields.get(listId);
  const value = field ? readSetting(scope.settings, listId, field) : undefined;
  return field?.type === "list" && Array.isArray(value) ? value.filter(isRecord) : [];
}

/** Inserted as text, never as HTML. */
export function toBindingText(value: unknown): string {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : "";
}

export function renderParts(parts: readonly TemplatePartType[], scope: IBindingScope): string {
  return parts
    .map((part) => (typeof part === "string" ? part : toBindingText(resolveBinding(part.path, scope)?.value)))
    .join("");
}

/** Set: not `false`, `""`, `null` or an empty list. */
export function isSetValue(value: unknown): boolean {
  return (
    value !== false && value !== "" && value !== null && value !== undefined && !(Array.isArray(value) && !value.length)
  );
}

/**
 * The placed value, or the field's default where the placed item has none of its own, as a setting added to the
 * type after the section was placed. Own keys only: an id such as `constructor` names a setting, never what every
 * object inherits.
 */
export function readSetting(values: Record<string, unknown>, key: string, field: IThemeSchemaField): unknown {
  return Object.hasOwn(values, key) ? values[key] : field.default;
}
