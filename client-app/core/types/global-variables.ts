import type { I18n } from "@/i18n";
import type { Router } from "vue-router";

export type GlobalsType = {
  storeId: string;
  catalogId: string;
  userId: string;
  cultureName: string;
  currencyCode: string;
  i18n: I18n | null;
  router: Router | null;
};

export type NonNullableGlobalsType = { [prop in keyof GlobalsType]: NonNullable<GlobalsType[prop]> };
