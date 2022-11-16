import { ValidationErrorType } from "@/xapi";

export function getCartLineItemValidationErrorsGroupBySKU(
  errors: ValidationErrorType[] = []
): Record<string, ValidationErrorType[]> {
  const result: Record<string, ValidationErrorType[]> = {};

  errors?.forEach((error) => {
    const sku = error.objectId!;

    result[sku] = result[sku] || [];
    result[sku].push(error);
  });

  return result;
}
