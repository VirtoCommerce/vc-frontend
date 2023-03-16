import type { GlobalsType, NonNullableGlobalsType } from "./types/global-variables";

const globals: GlobalsType = {
  storeId: "",
  catalogId: "",
  userId: "",
  cultureName: "",
  currencyCode: "",
  i18n: null,
  router: null,
};

export default globals as Readonly<NonNullableGlobalsType>;

export function setGlobalVariables(variables: Partial<NonNullableGlobalsType>) {
  Object.assign(globals, variables);
}
