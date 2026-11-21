import { toSectionLink } from "../urls";
import type { CustomSectionValueType, ICustomSectionField } from "../types";

/** The date part; the browser's parser takes the rest of an ISO 8601 date-time. */
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(?:$|T)/;

/** `undefined` for a value the field does not take: the attribute is left out. */
export function checkFieldValue(field: ICustomSectionField, value: string): CustomSectionValueType | undefined {
  switch (field.type) {
    case "number": {
      const number = value.trim() ? Number(value) : Number.NaN;
      const isInRange =
        (field.min === undefined || number >= field.min) && (field.max === undefined || number <= field.max);

      return Number.isFinite(number) && isInRange ? number : undefined;
    }
    case "boolean":
      return value !== "false";
    case "select":
      return field.options?.includes(value) ? value : undefined;
    case "link":
      return toSectionLink(value);
    case "date":
      return ISO_DATE_REGEX.test(value.trim()) && !Number.isNaN(Date.parse(value)) ? value.trim() : undefined;
    default:
      return value;
  }
}
