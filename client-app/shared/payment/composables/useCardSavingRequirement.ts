import { readonly, ref } from "vue";

const STORAGE_KEY = "vc-card-saving-requirement";
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

/** Increased on every require() and clear(), so a mounted card form can read the requirement again. */
const revision = ref(0);

export interface ICardSavingRequirement {
  /** The consent record that covers saving the card, e.g. accepted auto-renewal terms. */
  consentId?: string;
  /** The cart the consent was given for; it also covers the order placed from that cart. */
  cartId?: string;
  requiredAt: number;
}

/** What a payment form is paying: a cart at checkout, or an order. */
export interface ICardSavingTarget {
  cart?: { id?: string } | null;
  order?: { id?: string; shoppingCartId?: string | null } | null;
}

function load(): ICardSavingRequirement | undefined {
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

function save(value: ICardSavingRequirement): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); the card form then lets the customer choose.
  }
}

function requireCardSaving(consentId: string | undefined, cartId: string): void {
  save({ consentId, cartId, requiredAt: Date.now() });
  revision.value++;
}

/** The requirement, when it covers what the form pays: the same cart, or the order placed from that cart. */
function readCardSaving(target: ICardSavingTarget): ICardSavingRequirement | undefined {
  const requirement = load();
  if (!requirement) {
    return undefined;
  }

  if (target.cart?.id) {
    return requirement.cartId === target.cart.id ? requirement : undefined;
  }

  const order = target.order;
  if (!order?.id || !order.shoppingCartId) {
    return undefined;
  }

  return requirement.cartId === order.shoppingCartId ? requirement : undefined;
}

function clearCardSaving(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // See save().
  }
  revision.value++;
}

/**
 * Lets a module require that the card of a checkout is saved, e.g. because a subscription will charge it later. The
 * card forms of that checkout then save the card without asking and send the consent with the payment. Kept for the
 * browser tab session, two hours at most, so it survives the step from placing the order to paying it.
 *
 * `revision` changes whenever the requirement is set or cleared: a form shown before the consent was given (e.g. on
 * single-page checkout, where the terms are accepted below the card form) watches it and reads the requirement again.
 */
export function useCardSavingRequirement() {
  return { require: requireCardSaving, read: readCardSaving, clear: clearCardSaving, revision: readonly(revision) };
}
