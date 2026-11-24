/**
 * The most elements and behaviors a section renders: list rows, repeated children and a kit tag's `cost` included.
 * Over it, the section renders nothing.
 */
export const RENDER_BUDGET = 5000;

/** What a kit tag counts against the render budget when it names no `cost`. */
export const DEFAULT_TAG_COST = 1;

/**
 * The most characters of settings a section renders: every bound value in its text and attributes, and its rich
 * text, list rows and repeated children included. Over it, the section renders nothing.
 */
export const MAX_RENDERED_TEXT = 262_144;

/**
 * The most characters of the template's own text a section renders, in its text and attributes, list rows and
 * repeated children included: a short template with a long list could otherwise fill the page's memory. Over it,
 * the section renders nothing.
 */
export const MAX_RENDERED_TEMPLATE_TEXT = 2_097_152;

/**
 * The most attributes an element of a template has, counted as the parser leaves them, before the sanitizer drops
 * any; one with more is left out. The server counts the raw text, where a repeated attribute counts again.
 */
export const MAX_TEMPLATE_ATTRIBUTES = 64;

/** How deep a template's elements nest; what lies deeper is left out, so a hostile draft cannot exhaust the stack. */
export const MAX_TEMPLATE_DEPTH = 32;

/** How deep a section's CSS nests its rules; what lies deeper is left out, so hostile CSS cannot exhaust the stack. */
export const MAX_CSS_DEPTH = 32;

/** A custom section type's name, `custom-` included. */
export const MAX_CUSTOM_SECTION_TYPE_LENGTH = 64;
