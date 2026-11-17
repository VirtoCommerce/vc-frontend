import { BUILT_IN_CONDITIONS } from "../templates/conditions";
import type { ITemplateCondition, TemplateConditionDescriptorType } from "../templates/conditions";

/** Values compare exactly, path and language aside: a product layout of `b2c` does not match the default B2C rule. */
export function useTemplateConditions() {
  function getTemplateCondition(name: string): ITemplateCondition | undefined {
    return BUILT_IN_CONDITIONS.find((condition) => condition.name === name);
  }

  function getTemplateConditionDescriptors(): TemplateConditionDescriptorType[] {
    return BUILT_IN_CONDITIONS.map(({ name, pageTypes, label, value }) => ({ name, pageTypes, label, value }));
  }

  return { getTemplateCondition, getTemplateConditionDescriptors };
}
