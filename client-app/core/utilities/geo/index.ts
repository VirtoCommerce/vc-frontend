export interface ILatLng {
  lat: number;
  lng: number;
}

/**
 * Converts a geo-location string to latitude and longitude coordinates.
 * @param geoLocation - A string in the format "lat,lng" (e.g., "40.7128,-74.0060")
 * @returns An object with lat and lng properties
 * @throws Error if the input string is invalid or coordinates are out of valid range
 */
export function geoLocationStringToLatLng(geoLocation: string | undefined): ILatLng | null {
  if (!geoLocation || typeof geoLocation !== "string") {
    throw new Error("Invalid input: geoLocation must be a non-empty string");
  }

  const trimmedLocation = geoLocation.trim();
  if (!trimmedLocation) {
    throw new Error("Invalid input: geoLocation cannot be empty or only whitespace");
  }

  const parts = trimmedLocation.split(",");
  if (parts.length !== 2) {
    throw new Error("Invalid format: geoLocation must contain exactly one comma separating latitude and longitude");
  }

  const latStr = parts[0]?.trim();
  const lngStr = parts[1]?.trim();

  if (!latStr || !lngStr) {
    throw new Error("Invalid format: both latitude and longitude must be provided");
  }

  const lat = Number(latStr);
  const lng = Number(lngStr);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new Error("Invalid coordinates: latitude and longitude must be valid numbers");
  }

  if (lat < -90 || lat > 90) {
    throw new Error("Invalid latitude: must be between -90 and 90 degrees");
  }

  if (lng < -180 || lng > 180) {
    throw new Error("Invalid longitude: must be between -180 and 180 degrees");
  }

  return { lat, lng };
}
