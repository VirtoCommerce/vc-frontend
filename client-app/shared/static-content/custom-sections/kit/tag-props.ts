import { camelize } from "vue";
import { toFieldValue } from "./fields";
import { isDeniedTagAttribute } from "./registry";
import type { CustomSectionValueType, ICustomSectionTag } from "../types";

/** Whatever type a tag declares them, these hold an address. */
const LINK_ATTRIBUTES = new Set(["to", "href", "src"]);

export function toTagProps(
  tag: ICustomSectionTag,
  values: Record<string, string>,
): { props: Record<string, unknown>; slotText?: string } {
  const checked: Record<string, CustomSectionValueType> = {};

  for (const [name, field] of Object.entries(tag.attributes)) {
    const checkedField = LINK_ATTRIBUTES.has(name) ? { ...field, type: "link" as const } : field;
    const value =
      Object.hasOwn(values, name) && !isDeniedTagAttribute(name) ? toFieldValue(checkedField, values[name]) : undefined;

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
