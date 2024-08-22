import type { NamedValue } from "vue-i18n";

export type ErrorType = {
  objectId?: string;
  code?: string;
  description?: string;
  parameters?: string[] | NamedValue;
};
