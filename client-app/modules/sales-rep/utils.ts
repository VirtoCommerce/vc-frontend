// The backend exposes the customer's default address as a structured object and leaves formatting to
// the storefront (schema note: e.g. "City, Region"). Keep this the single source of that format so the
// My customers list and the customer profile render locations consistently.
type LocationPartsType =
  | { postalCode?: string | null; zip?: string | null; city?: string | null; regionName?: string | null }
  | null
  | undefined;

export function formatCustomerLocation(address: LocationPartsType, options?: { withPostalCode?: boolean }): string {
  const cityRegion = [address?.city, address?.regionName].filter(Boolean).join(", ");

  if (!options?.withPostalCode) {
    return cityRegion;
  }

  // `postalCode` is the canonical member-address field; `zip` is a legacy alias kept as a fallback.
  const postalCode = address?.postalCode || address?.zip;
  // Postal code first (prefixed with "#"), then "City, Region", middot-separated to match the
  // design (e.g. "#23220 · Richmond, Virginia").
  const code = postalCode ? `#${postalCode}` : "";
  return [code, cityRegion].filter(Boolean).join(" · ");
}
