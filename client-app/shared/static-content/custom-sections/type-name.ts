const CUSTOM_SECTION_TYPE_REGEX = /^custom-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_CUSTOM_SECTION_TYPE_LENGTH = 64;

/** A name the storefront can use in a selector as it is. */
export function isCustomSectionType(type: unknown): type is string {
  return (
    typeof type === "string" && type.length <= MAX_CUSTOM_SECTION_TYPE_LENGTH && CUSTOM_SECTION_TYPE_REGEX.test(type)
  );
}
