import { isBooleanAttributeOn } from "../allowlist";
import { toFiniteNumber } from "../numbers";
import { toSectionLink } from "../urls";
import type { CustomSectionValueType, ICustomSectionField } from "../types";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
/** With its offset: a time without one would name a different moment in each visitor's time zone. */
const ISO_TIME_REGEX = /^\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;

/** `undefined` for a value the field does not take: the attribute is left out. */
export function toFieldValue(field: ICustomSectionField, value: string): CustomSectionValueType | undefined {
  switch (field.type) {
    case "number": {
      const number = toFiniteNumber(value);
      const isInRange =
        number !== undefined &&
        (field.min === undefined || number >= field.min) &&
        (field.max === undefined || number <= field.max);

      return isInRange ? number : undefined;
    }
    case "boolean":
      return isBooleanAttributeOn(value);
    case "select":
      // The icon names stay with the catalog; an unknown one draws nothing.
      if (field.optionsFrom) {
        return value.trim() || undefined;
      }

      return field.options?.includes(value) ? value : undefined;
    case "link":
      return toSectionLink(value);
    case "date":
      return isIsoDate(value.trim()) ? value.trim() : undefined;
    default:
      return value;
  }
}

/** As the server takes it: a date, or a date and a time with its offset. */
function isIsoDate(value: string): boolean {
  const [date, ...times] = value.split("T");

  return (
    ISO_DATE_REGEX.test(date) &&
    times.length <= 1 &&
    times.every((time) => ISO_TIME_REGEX.test(time)) &&
    !Number.isNaN(Date.parse(value))
  );
}
