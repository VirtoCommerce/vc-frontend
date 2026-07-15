import { ValidationErrorObjectType } from "@/core/enums";
import { LOYALTY_VALIDATION_ERROR_MESSAGE_KEYS } from "../enums";
import type { ShortCartFragment, LineItemType, OrderLineItemType, ValidationErrorType } from "@/core/api/graphql/types";
import type { ItemForAddBulkItemsToCartResultsModalType } from "@/shared/cart";
import type { NamedValue } from "vue-i18n";

export type LoyaltyValidationMessageType = { code: string; text: string };

/**
 * Single resolver shared by the inline cart/checkout alerts and the Place Order safety-net toast:
 * maps each loyalty `errorCode` to its i18n key and folds `errorParameters` into interpolation
 * params, so the two call sites can never drift apart.
 *
 * @param messageKeys - code → i18n key map (full-length by default, compact variant for tight spaces)
 * @param hasTranslation - optional i18n `te` guard; when provided, codes without a translation are skipped
 */
export function getLoyaltyValidationMessages(
  errors: Pick<ValidationErrorType, "errorCode" | "errorParameters">[],
  options: {
    translate: (key: string, params: NamedValue) => string;
    messageKeys?: Record<string, string>;
    hasTranslation?: (key: string) => boolean;
  },
): LoyaltyValidationMessageType[] {
  const { translate, messageKeys = LOYALTY_VALIDATION_ERROR_MESSAGE_KEYS, hasTranslation } = options;

  return errors.reduce<LoyaltyValidationMessageType[]>((acc, error) => {
    const code = error.errorCode;
    if (!code) {
      return acc;
    }

    const messageKey = messageKeys[code];
    if (!messageKey || (hasTranslation && !hasTranslation(messageKey))) {
      return acc;
    }

    const params = (error.errorParameters ?? []).reduce<Record<string, string | number>>((result, param) => {
      if (param?.key) {
        const parsed = Number(param.value);
        result[param.key] =
          param.value != null && param.value !== "" && !Number.isNaN(parsed) ? parsed : (param.value ?? "");
      }
      return result;
    }, {});

    acc.push({ code, text: translate(messageKey, params) });
    return acc;
  }, []);
}

export function getItemsForAddBulkItemsToCartResultsModal(
  inputItems: OrderLineItemType[] | LineItemType[],
  cart: ShortCartFragment,
): ItemForAddBulkItemsToCartResultsModalType[] {
  return inputItems.map<ItemForAddBulkItemsToCartResultsModalType>((item) => ({
    productExists: !!item.product,
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    slug: item.product?.slug,
    isAddedToCart: !cart.validationErrors.some(
      (error) => error.objectType == ValidationErrorObjectType.CatalogProduct && error.objectId === item.productId,
    ),
  }));
}
