import type { CATALOG_PAGINATION_MODES } from "@/shared/catalog/constants/catalog";

export type CatalogPaginationModeType = (typeof CATALOG_PAGINATION_MODES)[keyof typeof CATALOG_PAGINATION_MODES];
