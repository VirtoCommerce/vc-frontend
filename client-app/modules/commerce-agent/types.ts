/**
 * The agent's event stream, mirroring `commerce_common/streaming.py` in the reference.
 * A host renders the types it knows and ignores the rest, so an event added on the service
 * side never breaks this one.
 */
export type AgentEventType =
  | "text_delta"
  | "tool_call"
  | "tool_result"
  | "ui"
  | "ui_partial"
  | "cart_update"
  | "progress"
  | "turn_complete"
  | "error";

export interface IAgentEvent {
  type: AgentEventType;
  data: Record<string, unknown>;
}

export interface IAgentSession {
  sessionId: string;
  name?: string;
  organization?: string;
}

/** One product as the service enriches it; the card reads these fields only. */
export interface IAgentProduct {
  product_id: string;
  title: string;
  price: number;
  currency?: string;
  image_url?: string;
  in_stock?: boolean;
  short_description?: string;
}

export interface IAgentProductPick {
  product: IAgentProduct;
  reason?: string;
}

export interface IAgentProductsPayload {
  title?: string;
  items: IAgentProductPick[];
}

export interface IAgentSuggestionsPayload {
  suggestions: string[];
}

/** One rendered component in a turn: the service's component name and its payload. */
export interface IAgentComponent {
  component: string;
  payload: Record<string, unknown>;
}

export interface IAgentTurn {
  role: "user" | "assistant";
  text: string;
  components: IAgentComponent[];
  /** Set when the turn ended badly; the text is safe to show. */
  error?: string;
}

/**
 * One cart line as the service serializes it on `cart_update` (`cart_line_payload` in the
 * reference). This is the agent's own view of the cart, not the storefront's `CartType`:
 * it is a signal that the cart changed behind the theme's back, not a replacement for it.
 */
export interface IAgentCartLine {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  line_total: number;
  image_url?: string;
  option_values?: Record<string, string>;
  variant_of?: string;
}

export interface IAgentCart {
  items: IAgentCartLine[];
  item_count: number;
  subtotal: number;
  currency?: string;
}
