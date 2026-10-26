const STORAGE_KEY = "vc-card-saving-requirement";
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export interface ICardSavingRequirement {
  /** The consent record that covers saving the card, e.g. accepted auto-renewal terms. */
  consentId?: string;
  requiredAt: number;
}

/**
 * Lets a module require that the card of the current checkout is saved, e.g. because a subscription will charge it later.
 * The card forms then save the card without asking and send the consent with the payment. Kept for the browser tab
 * session until the order is paid, so it survives the step from placing the order to paying it.
 */
export function useCardSavingRequirement() {
  function require(consentId?: string): void {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ consentId, requiredAt: Date.now() } satisfies ICardSavingRequirement),
      );
    } catch {
      // Storage can be unavailable (private mode); the card form then lets the customer choose.
    }
  }

  function read(): ICardSavingRequirement | undefined {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return undefined;
      }

      const value = JSON.parse(raw) as ICardSavingRequirement;
      return Date.now() - value.requiredAt < MAX_AGE_MS ? value : undefined;
    } catch {
      return undefined;
    }
  }

  function clear(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // See require().
    }
  }

  return { require, read, clear };
}
