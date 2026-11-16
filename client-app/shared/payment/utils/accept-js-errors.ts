import type { BankCardErrorsType } from "@/shared/payment";

/**
 * Accept.js errors about a card field, with the translated message shown on that field.
 * https://developer.authorize.net/api/reference/features/acceptjs.html#Appendix_Error_Codes
 */
const FIELD_ERRORS: Record<string, { field: keyof BankCardErrorsType; key: string }> = {
  E_WC_05: { field: "number", key: "shared.payment.bank_card_form.errors.card_number" },
  E_WC_06: { field: "month", key: "shared.payment.bank_card_form.errors.month" },
  E_WC_07: { field: "year", key: "shared.payment.bank_card_form.errors.year" },
  E_WC_08: { field: "year", key: "shared.payment.bank_card_form.errors.expiration_date" },
  E_WC_15: { field: "securityCode", key: "shared.payment.bank_card_form.errors.security_code" },
  E_WC_17: { field: "cardholderName", key: "shared.payment.bank_card_form.errors.cardholder_name" },
};

/**
 * Splits Accept.js error messages into translated card field errors and the messages about no field (e.g. a
 * misconfigured payment method), which the caller reports its own way; their English `text` is for logs only.
 */
export function mapAcceptJsErrors(
  messages: Accept.Message[],
  t: (key: string) => string,
): { fieldErrors: BankCardErrorsType; otherErrors: Accept.Message[] } {
  const fieldErrors: BankCardErrorsType = {};
  const otherErrors: Accept.Message[] = [];

  messages.forEach((message) => {
    const fieldError = FIELD_ERRORS[message.code];
    if (fieldError) {
      fieldErrors[fieldError.field] = t(fieldError.key);
    } else {
      otherErrors.push(message);
    }
  });

  return { fieldErrors, otherErrors };
}
