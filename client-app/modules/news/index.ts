import { loadModuleLocale } from "../utils";
import type { I18n } from "@/i18n";

export function init(i18n: I18n) {
  void loadModuleLocale(i18n, "news");
}
