import type { CATALOG_MODES } from "@/shared/catalog/constants/catalog";

export type CatalogModeType = (typeof CATALOG_MODES)[keyof typeof CATALOG_MODES];
