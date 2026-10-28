const STORAGE_KEY = "vc-card-saving-requirement";
const MAX_AGE_MS = 2 * 60 * 60 * 1000;
// An order placed from the cart is created on the server; allow for the browser's clock running ahead of it.
const CLOCK_SKEW_MS = 5 * 60 * 1000;

export interface ICardSavingRequirement {
  /** The consent record that covers saving the card, e.g. accepted auto-renewal terms. */
  consentId?: string;
  /** The cart the consent was given for. */
  cartId?: string;
  /** The order placed from that cart, once a payment form for it has claimed the requirement. */
  orderId?: string;
  requiredAt: number;
}

/** What a payment form is paying: a cart at checkout, or an order. */
export interface ICardSavingTarget {
  cart?: { id?: string } | null;
  order?: { id?: string; createdDate?: string } | null;
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
}

/**
 * The requirement, when it covers what the form pays: the same cart, or the order placed from it. An order claims the
 * requirement when it is the first one created after the consent; any other order never gets it.
 */
function readCardSaving(target: ICardSavingTarget): ICardSavingRequirement | undefined {
  const requirement = load();
  if (!requirement) {
    return undefined;
  }

  if (target.cart?.id) {
    return requirement.cartId === target.cart.id ? requirement : undefined;
  }

  const order = target.order;
  if (!order?.id) {
    return undefined;
  }

  if (requirement.orderId) {
    return requirement.orderId === order.id ? requirement : undefined;
  }

  const createdAt = order.createdDate ? new Date(order.createdDate).getTime() : Number.NaN;
  if (Number.isNaN(createdAt) || createdAt < requirement.requiredAt - CLOCK_SKEW_MS) {
    return undefined;
  }

  const claimed = { ...requirement, orderId: order.id };
  save(claimed);
  return claimed;
}

function clearCardSaving(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // See save().
  }
}

/**
 * Lets a module require that the card of a checkout is saved, e.g. because a subscription will charge it later. The
 * card forms of that checkout then save the card without asking and send the consent with the payment. Kept for the
 * browser tab session, two hours at most, so it survives the step from placing the order to paying it.
 */
export function useCardSavingRequirement() {
  return { require: requireCardSaving, read: readCardSaving, clear: clearCardSaving };
}
