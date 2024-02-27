import { computed, ref } from "vue";
import type { PreparedLineItemType } from "@/core/types";

const validationErrors = ref<ValidationErrorType[]>([]);

export function useLineItemsValidation() {
  function setValidationStatus(
    item: PreparedLineItemType,
    status: { isValid: true } | { isValid: false; errorMessage: string },
  ): void {
    const existingValidationError = validationErrors.value.find((error) => error.objectId === item.id);

    if (!existingValidationError && !status.isValid) {
      validationErrors.value.push({
        objectId: item.id,
        errorMessage: status.errorMessage,
      });
      return;
    }

    if (existingValidationError && !status.isValid) {
      existingValidationError.errorMessage = status.errorMessage;
      return;
    }

    if (existingValidationError && status.isValid) {
      validationErrors.value = validationErrors.value.filter((error) => error.objectId !== item.id);
    }
  }

  return {
    validationErrors: computed(() => validationErrors.value),
    setValidationStatus,
  };
}
