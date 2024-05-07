import type { I18n } from "@/i18n";
import type { Router } from "vue-router";

type GlobalVariablesType = {
  storeId?: string;
  catalogId?: string;
  userId?: string;
  organizationId?: string;
  cultureName?: string;
  currencyCode?: string;
  i18n?: I18n;
  router?: Router;
};

const globalVariables: GlobalVariablesType = {};

export const globals = globalVariables as Readonly<Required<GlobalVariablesType>>;

export function setGlobals(variables: GlobalVariablesType) {
  Object.assign(globalVariables, variables);
}
