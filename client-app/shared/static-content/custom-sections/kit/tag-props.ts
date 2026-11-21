import { camelize } from "vue";
import { toFieldValue } from "./fields";
import type { CustomSectionValueType, ICustomSectionTag } from "../types";

/** The checked attributes as the tag's props and the text of its default slot. */
export function toTagProps(
  tag: ICustomSectionTag,
  values: Record<string, string>,
): { props: Record<string, unknown>; slotText?: string } {
  const checked: Record<string, CustomSectionValueType> = {};

  for (const [name, field] of Object.entries(tag.attributes)) {
    const value = Object.hasOwn(values, name) ? toFieldValue(field, values[name]) : undefined;

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
