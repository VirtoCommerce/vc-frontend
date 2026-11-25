import { getThemeVariableName, toPaletteVariable } from "@/core/plugins/config.plugin";
import { readSetting } from "./bindings";
import { toFiniteNumber } from "./numbers";
import { toAssetUrl } from "./urls";
import type { IThemeSchemaField } from "@/core/theme-snapshot";

const FIELD_ID_REGEX = /^[\w-]+$/;

/** The root's style: `--setting-{id}` per setting the CSS can use, `_` written as `-`. */
export function getSettingVariables(
  fields: readonly IThemeSchemaField[],
  settings: Record<string, unknown>,
  assetsBaseUrl?: string,
): Record<string, string> {
  return Object.fromEntries(
    fields.flatMap((field) => {
      const id = field.id;
      const value =
        id && FIELD_ID_REGEX.test(id)
          ? toVariableValue(field.type, readSetting(settings, id, field), assetsBaseUrl)
          : undefined;

      return id && value !== undefined ? [[getThemeVariableName(`setting_${id}`), value]] : [];
    }),
  );
}

function toVariableValue(
  type: string | undefined,
  value: unknown,
  assetsBaseUrl: string | undefined,
): string | undefined {
  switch (type) {
    case "color-token":
      return toPaletteVariable(value);
    case "images": {
      const url = typeof value === "string" ? toAssetUrl(value, assetsBaseUrl) : undefined;
      return url ? `url("${url.replaceAll('"', "%22")}")` : undefined;
    }
    case "number":
    case "slider":
      return toFiniteNumber(value)?.toString();
    case "checkbox":
      return value === true ? "1" : "0";
    default:
      return undefined;
  }
}
