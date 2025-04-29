/**
 * A list of product sorting options.
 * @type {Array<{id: string, name: string}>}
 * @property {string} id - The filter id.
 * @property {string} name - The i18n key for the sorting option name.
 */
export const PRODUCT_SORTING_LIST = [
  { id: "", name: "shared.sorting.featured" },
  { id: "name-ascending", name: "shared.sorting.alphabetically_a_z" },
  { id: "name-descending", name: "shared.sorting.alphabetically_z_a" },
  { id: "price-ascending", name: "shared.sorting.price_low_to_high" },
  { id: "price-descending", name: "shared.sorting.price_high_to_low" },
  { id: "createddate-descending", name: "shared.sorting.date_new_to_old" },
  { id: "createddate-ascending", name: "shared.sorting.date_old_to_new" },
];
