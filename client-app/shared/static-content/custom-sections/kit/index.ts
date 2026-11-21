import { camelize } from "vue";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { checkFieldValue } from "./fields";
import type { CustomSectionValueType, ICustomSectionBehavior, ICustomSectionField, ICustomSectionTag } from "../types";

export { registerBuiltInKit } from "./built-in";

/** What the designer's catalog says of the kit, for the agent and the server: no components, no loaders. */
export interface ICustomSectionKitCatalog {
  tags: Record<string, { description: string; attributes: Record<string, ICustomSectionField> }>;
  behaviors: Record<
    string,
    {
      description: string;
      value?: ICustomSectionField;
      options?: Record<string, ICustomSectionField>;
      writes?: string[];
    }
  >;
}

/** Reactive: a tag registered later reaches the templates already shown. */
export function getKitTags(): Readonly<Record<string, ICustomSectionTag>> {
  return useExtensionRegistry().getEntries("customSectionTag");
}

/** Reactive, as the tags. */
export function getKitBehaviors(): Readonly<Record<string, ICustomSectionBehavior>> {
  return useExtensionRegistry().getEntries("customSectionBehavior");
}

/** Copies only data, so the catalog can be posted and hashed. */
export function getKitCatalog(): ICustomSectionKitCatalog {
  const tags = Object.entries(getKitTags()).map(([name, { description, attributes }]) => [
    name,
    { description, attributes },
  ]);
  const behaviors = Object.entries(getKitBehaviors()).map(([name, { description, value, options, writes }]) => [
    name,
    { description, value, options, writes },
  ]);

  return JSON.parse(
    JSON.stringify({ tags: Object.fromEntries(tags), behaviors: Object.fromEntries(behaviors) }),
  ) as ICustomSectionKitCatalog;
}

/** The checked attributes as the tag's props and the text of its default slot. */
export function toTagProps(
  tag: ICustomSectionTag,
  values: Record<string, string>,
): { props: Record<string, unknown>; slotText?: string } {
  const checked: Record<string, CustomSectionValueType> = {};

  for (const [name, field] of Object.entries(tag.attributes)) {
    const value = Object.hasOwn(values, name) ? checkFieldValue(field, values[name]) : undefined;

    if (value !== undefined) {
      checked[name] = value;
    }
  }

  const slotText = tag.slotAttribute === undefined ? undefined : checked[tag.slotAttribute];
  const props = tag.mapProps
    ? tag.mapProps(checked)
    : Object.fromEntries(
        Object.entries(checked)
          .filter(([name]) => name !== tag.slotAttribute)
          .map(([name, value]) => [camelize(name), value]),
      );

  return { props, slotText: slotText === undefined ? undefined : String(slotText) };
}
