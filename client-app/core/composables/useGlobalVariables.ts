import { shallowReactive } from "vue";
import type { Router } from "vue-router";
import type { I18n } from "@/i18n";

type TGlobals = {
  i18n: I18n | null;
  router: Router | null;
};

const globals = shallowReactive<TGlobals>({
  i18n: null,
  router: null,
});

export default function useGlobalVariables() {
  return globals;
}
