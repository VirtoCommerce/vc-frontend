import { createGlobalState } from "@vueuse/core";
import { shallowReactive } from "vue";
import { BUILT_IN_CONDITIONS } from "../templates/conditions";
import type { ITemplateCondition, TemplateConditionDescriptorType } from "../templates/conditions";

/** Values compare exactly (except `path`): a `VirtoFrontend_UI_Layout` of `b2c` does not match the default B2C rule. */
export const useTemplateConditions = createGlobalState(() => {
  const conditions = shallowReactive(new Map(BUILT_IN_CONDITIONS.map((condition) => [condition.name, condition])));

  function registerTemplateCondition(condition: ITemplateCondition): void {
    conditions.set(condition.name, condition);
  }

  function getTemplateCondition(name: string): ITemplateCondition | undefined {
    return conditions.get(name);
  }

  function getTemplateConditionDescriptors(): TemplateConditionDescriptorType[] {
    return [...conditions.values()].map(({ name, pageTypes, label, value }) => ({ name, pageTypes, label, value }));
  }

  return { registerTemplateCondition, getTemplateCondition, getTemplateConditionDescriptors };
});
