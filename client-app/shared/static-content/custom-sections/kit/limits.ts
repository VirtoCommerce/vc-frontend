// The server's caps on the kit the designer's catalog uploads: past any of them it refuses the whole kit, so
// the storefront's registry keeps every entry within them. Import-free, for the Vite config's tests too.

/** Tags, and behaviors, in the kit: the storefront's own included. */
export const MAX_KIT_ENTRIES = 256;
/** A tag's attributes, or a behavior's value and options together. */
export const MAX_ENTRY_FIELDS = 64;
/** A tag's, a behavior's, an attribute's or an option's name. */
export const MAX_NAME_LENGTH = 64;
export const MAX_SELECT_OPTIONS = 256;
export const MAX_OPTION_LENGTH = 256;
export const MAX_WRITES = 32;
export const MAX_WRITE_LENGTH = 128;
export const MAX_DESCRIPTION_LENGTH = 1024;
export const MAX_GUIDE_LENGTH = 16_384;
export const MAX_ICONS = 10_000;
export const MAX_ICON_NAME_LENGTH = 100;
/** Entries in each map of the design facts: breakpoints, tokens. */
export const MAX_DESIGN_ENTRIES = 1024;
/** A design fact's name or text. */
export const MAX_DESIGN_TEXT_LENGTH = 1024;
