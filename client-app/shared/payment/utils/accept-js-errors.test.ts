import { describe, expect, it } from "vitest";
import { mapAcceptJsErrors } from "./accept-js-errors";

const t = (key: string) => `t:${key}`;

describe("mapAcceptJsErrors", () => {
  it("translates the card field errors and puts each on its field", () => {
    const { fieldErrors, otherErrors } = mapAcceptJsErrors(
      [
        { code: "E_WC_05", text: "Please provide valid credit card number." },
        { code: "E_WC_08", text: "Expiration date must be in the future." },
        { code: "E_WC_15", text: "Please provide valid CVV." },
      ],
      t,
    );

    expect(fieldErrors).toEqual({
      number: "t:shared.payment.bank_card_form.errors.card_number",
      year: "t:shared.payment.bank_card_form.errors.expiration_date",
      securityCode: "t:shared.payment.bank_card_form.errors.security_code",
    });
    expect(otherErrors).toEqual([]);
  });

  it("leaves the errors about no field to the caller", () => {
    const other = { code: "E_WC_21", text: "User authentication failed due to invalid authentication values." };

    const { fieldErrors, otherErrors } = mapAcceptJsErrors([other], t);

    expect(fieldErrors).toEqual({});
    expect(otherErrors).toEqual([other]);
  });
});
