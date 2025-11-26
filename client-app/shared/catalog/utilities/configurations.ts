import isEqual from "lodash/isEqual";
import { CONFIGURABLE_SECTION_TYPES } from "../constants/configurableProducts";
import type { ConfigurationSectionInput } from "@/core/api/graphql/types";
import type { DeepReadonly } from "vue";

export function compareConfigurationInputs(
  input1: DeepReadonly<ConfigurationSectionInput>,
  input2: DeepReadonly<ConfigurationSectionInput>,
): boolean {
  const type1 = input1.type;
  const type2 = input2.type;

  if (type1 !== type2) {
    return false;
  }

  switch (type1) {
    case CONFIGURABLE_SECTION_TYPES.product:
      return isEqual(input1.option, input2.option);
    case CONFIGURABLE_SECTION_TYPES.text:
      return input1.customText === input2.customText;
    case CONFIGURABLE_SECTION_TYPES.file:
      return isEqual(input1.fileUrls, input2.fileUrls);
    default:
      return true;
  }
}
