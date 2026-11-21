import { getThemeVariableName } from "@/core/plugins/config.plugin";
import { toAssetUrl } from "./urls";
import type { IThemeSchemaField } from "@/core/theme-snapshot";

const FIELD_ID_REGEX = /^[\w-]+$/;
const TOKEN_REGEX = /^[a-z][a-z0-9_]*$/;
const COLOR_TOKEN_PREFIX = "color_";

/** The root's style: `--setting-{id}` per setting the CSS can use, `_` written as `-`. */
export function getSettingVariables(
  fields: readonly IThemeSchemaField[],
  settings: Record<string, unknown>,
): Record<string, string> {
  return Object.fromEntries(
    fields.flatMap((field) => {
      const id = field.id;
      const value = id && FIELD_ID_REGEX.test(id) ? toVariableValue(field.type, settings[id]) : undefined;

      return id && value !== undefined ? [[`--setting-${id.replaceAll("_", "-")}`, value]] : [];
    }),
  );
}

function toVariableValue(type: string | undefined, value: unknown): string | undefined {
  switch (type) {
    case "color-token":
      return typeof value === "string" && TOKEN_REGEX.test(value) ? `var(${toColorVariableName(value)})` : undefined;
    case "images": {
      const url = typeof value === "string" ? toAssetUrl(value) : undefined;
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
function toColorVariableName(token: string): string {
  return getThemeVariableName(token.startsWith(COLOR_TOKEN_PREFIX) ? token : `${COLOR_TOKEN_PREFIX}${token}`);
}

function toFiniteNumber(value: unknown): number | undefined {
  const number = typeof value === "string" && value.trim() ? Number(value) : value;
  return typeof number === "number" && Number.isFinite(number) ? number : undefined;
}
