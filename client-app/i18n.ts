import { createI18n as _createI18n } from "vue-i18n";

export type I18n = ReturnType<typeof createI18n>;

export function createI18n() {
  return _createI18n({
    legacy: false,
    globalInjection: true,
  });
}
