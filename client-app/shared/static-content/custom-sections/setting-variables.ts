import { getThemeVariableName, toPaletteVariable } from "@/core/plugins/config.plugin";
import { toFiniteNumber } from "./numbers";
import { toAssetUrl } from "./urls";
import type { IThemeSchemaField } from "@/core/theme-snapshot";

const FIELD_ID_REGEX = /^[\w-]+$/;
const COLOR_TOKEN_PREFIX = "color_";

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
        id && FIELD_ID_REGEX.test(id) ? toVariableValue(field.type, settings[id], assetsBaseUrl) : undefined;

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
      return toColorVariable(value);
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

/** The designer stores palette tokens as `color_primary_500`; a token without the prefix gets it. */
function toColorVariable(token: unknown): string | undefined {
  if (typeof token !== "string" || !token) {
    return undefined;
  }

  return toPaletteVariable(token.startsWith(COLOR_TOKEN_PREFIX) ? token : `${COLOR_TOKEN_PREFIX}${token}`);
}
