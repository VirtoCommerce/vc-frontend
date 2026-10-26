import type { InputKeyValueType } from "@/core/api/graphql/types";

/** Payment parameters the platform reads to save a card or pay with a saved one (Payment module StoredCredentialParameterNames). */
export const STORED_CREDENTIAL_PARAMETERS = {
  storedPaymentMethodId: "storedPaymentMethodId",
  storeForFutureUse: "storeForFutureUse",
  consentId: "consentId",
  storedCredentialUsage: "storedCredentialUsage",
} as const;

const INTENT_KEYS = [
  STORED_CREDENTIAL_PARAMETERS.storeForFutureUse,
  STORED_CREDENTIAL_PARAMETERS.consentId,
  STORED_CREDENTIAL_PARAMETERS.storedCredentialUsage,
] as const;

const STORAGE_KEY_PREFIX = "vc-stored-credential-intent:";
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

type IntentParametersType = Partial<Record<(typeof INTENT_KEYS)[number], string>>;

interface IStoredIntent {
  parameters: IntentParametersType;
  savedAt: number;
}

function readIntent(orderId: string): IntentParametersType | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_PREFIX + orderId);
    if (!raw) {
      return undefined;
    }

    const value = JSON.parse(raw) as IStoredIntent;
    return Date.now() - value.savedAt < MAX_AGE_MS ? value.parameters : undefined;
  } catch {
    return undefined;
  }
}

function pickIntent(parameters?: (InputKeyValueType | null | undefined)[] | null): IntentParametersType {
  const intent: IntentParametersType = {};
  for (const parameter of parameters ?? []) {
    const key = INTENT_KEYS.find((x) => x === parameter?.key);
    if (key && parameter?.value) {
      intent[key] = parameter.value;
    }
  }
  return intent;
}

/**
 * Remembers, for one order, whether the customer asked to save the card and under which consent. A payment that leaves
 * the site (a hosted payment page, a 3-D Secure redirect) comes back without them; the next authorization of that order
 * gets them back from here. Kept for the browser tab session, two hours at most.
 */
export function rememberStoredCredentialIntent(
  orderId: string,
  parameters?: (InputKeyValueType | null | undefined)[] | null,
): void {
  const intent = pickIntent(parameters);
  if (!orderId || !Object.keys(intent).length) {
    return;
  }

  try {
    sessionStorage.setItem(
      STORAGE_KEY_PREFIX + orderId,
      JSON.stringify({ parameters: intent, savedAt: Date.now() } satisfies IStoredIntent),
    );
  } catch {
    // Storage can be unavailable (private mode); the return from the provider then carries no card choice.
  }
}

export function forgetStoredCredentialIntent(orderId: string): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY_PREFIX + orderId);
  } catch {
    // See rememberStoredCredentialIntent().
  }
}

/**
 * The parameters of an order's authorization with the card choice remembered for that order added back when the call
 * itself doesn't carry it. A call that already carries any card choice is sent as it is.
 */
export function withStoredCredentialIntent(
  orderId: string | null | undefined,
  parameters?: (InputKeyValueType | null | undefined)[] | null,
): InputKeyValueType[] {
  const result = (parameters ?? []).filter((x): x is InputKeyValueType => !!x);
  const sent = new Set(result.map((x) => x.key));
  // the call already says what to do with the card (pay with a saved one, save it or not)
  if (!orderId || [STORED_CREDENTIAL_PARAMETERS.storedPaymentMethodId, ...INTENT_KEYS].some((x) => sent.has(x))) {
    return result;
  }

  const remembered = readIntent(orderId) ?? {};

  for (const key of INTENT_KEYS) {
    const value = remembered[key];
    if (value) {
      result.push({ key, value });
    }
  }

  return result;
}
