import { camelize } from "vue";
import { toAssetUrl } from "../urls";
import { IMAGE_ATTRIBUTE, LINK_ATTRIBUTES } from "./constants";
import { toFieldValue } from "./fields";
import { isDeniedTagAttribute } from "./registry";
import type { CustomSectionValueType, ICustomSectionField, ICustomSectionTag } from "../types";

export function toTagProps(
  tag: ICustomSectionTag,
  values: Record<string, string>,
  assetsBaseUrl?: string,
): { props: Record<string, unknown>; slotText?: string } {
  const checked: Record<string, CustomSectionValueType> = {};

  for (const [name, field] of Object.entries(tag.attributes)) {
    const value =
      Object.hasOwn(values, name) && !isDeniedTagAttribute(name)
        ? toAttributeValue(name, field, values[name], assetsBaseUrl)
        : undefined;

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

function toAttributeValue(
  name: string,
  field: ICustomSectionField,
  value: string,
  assetsBaseUrl: string | undefined,
): CustomSectionValueType | undefined {
  if (name === IMAGE_ATTRIBUTE) {
    return toAssetUrl(value, assetsBaseUrl);
  }

  return toFieldValue(LINK_ATTRIBUTES.has(name) ? { ...field, type: "link" } : field, value);
}
