/**
 * A list of product sorting options.
 * @type {Array<{id: string, name: string}>}
 * @property {string} id - The filter id.
 * @property {string} name - The i18n key for the sorting option name.
 */
export const PRODUCT_SORTING_LIST = [
  { id: "", name: "shared.featured" },
  { id: "name-ascending", name: "shared.alphabetically_a_z" },
  { id: "name-descending", name: "shared.alphabetically_z_a" },
  { id: "price-ascending", name: "shared.price_low_to_high" },
  { id: "price-descending", name: "shared.price_high_to_low" },
  { id: "createddate-descending", name: "shared.date_new_to_old" },
  { id: "createddate-ascending", name: "shared.date_old_to_new" },
];
