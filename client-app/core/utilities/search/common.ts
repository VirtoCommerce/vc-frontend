import { globals } from "@/core/globals";
import { isDateString } from "../date";

/**
 * Formats a label based on its type
 * @param label - The label to format
 * @returns A formatted string representing the label
 */
export function getFormattedLabel(label: string): string {
  const { d, t } = globals.i18n.global;

  if (isDateString(label)) {
    return d(new Date(label));
  }

  switch (label.toLowerCase()) {
    case "true":
      return t("common.labels.true_property");
    case "false":
      return t("common.labels.false_property");
    default:
      return label;
  }
}
