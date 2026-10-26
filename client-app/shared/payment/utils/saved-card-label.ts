/** How a saved card is named to the customer: brand and last 4 digits, never more of the number. */
export function savedCardLabel(brand?: string | null, last4?: string | null): string {
  return `${brand || "Card"} •••• ${last4 ?? "????"}`;
}

/** The first GraphQL error's message (e.g. "This card pays for 2 subscriptions."), or the fallback. */
export function savedCardErrorMessage(error: unknown, fallback: string): string {
  const graphQLErrors = (error as { graphQLErrors?: { message?: string }[] })?.graphQLErrors;
  return graphQLErrors?.[0]?.message || fallback;
}
