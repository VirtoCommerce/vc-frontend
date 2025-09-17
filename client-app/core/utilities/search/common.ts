import { globals } from "@/core/globals";
import { isDateString } from "../date";

/**
 * Formats a label or value based on its type
 * @param labelOrValue - The label or value to format
 * @returns A formatted string
 */
export function getFormattedLabel(labelOrValue: string): string {
  const { d, t } = globals.i18n.global;

  if (isDateString(labelOrValue)) {
    return d(new Date(labelOrValue));
  }

  switch (labelOrValue.toLowerCase()) {
    case "true":
      return t("common.labels.true_property");
    case "false":
      return t("common.labels.false_property");
    default:
      return labelOrValue;
  }
}
