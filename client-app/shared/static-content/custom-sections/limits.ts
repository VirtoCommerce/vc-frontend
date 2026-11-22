/**
 * The most elements and behaviors a section renders: list rows, repeated children and a kit tag's `cost` included.
 * Over it, the section renders nothing.
 */
export const RENDER_BUDGET = 5000;

/**
 * The most characters of settings a section renders: every bound value in its text and attributes, and its rich
 * text, list rows and repeated children included. Over it, the section renders nothing.
 */
export const MAX_RENDERED_TEXT = 262_144;

/** The most attributes an element of a template is written with, as the server counts them; one with more is left out. */
export const MAX_TEMPLATE_ATTRIBUTES = 64;
