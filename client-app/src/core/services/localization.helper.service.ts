import { BvTableFieldArray } from "bootstrap-vue";
import i18n from "@i18n";

/**
 * localize one column label by key and locale file node
 * @param gridColumnsLocalizationNode
 * @param columnKey
 */
export function localizeGridColumn(gridColumnsLocalizationNode: string, columnKey: string) {
  return i18n.t(`${gridColumnsLocalizationNode}.${columnKey.split(".").join("_")}`) as string;
}

/**
 * localize Bootstrap-Vue table columns
 * @param gridColumnsLocalizationNode
 * @param columns
 */
export function localizeGridColumns( gridColumnsLocalizationNode: string, columns: BvTableFieldArray): BvTableFieldArray {
  return columns.map(column =>
    typeof column === "string"
      ? {
        key: column,
        label: localizeGridColumn(gridColumnsLocalizationNode, column)
      }
      : {
        ...column,
        label: localizeGridColumn(gridColumnsLocalizationNode, column.key)
      }
  );
}
