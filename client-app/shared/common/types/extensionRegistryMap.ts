import type { Product } from "@/core/api/graphql/types";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { ExtensionEntryType } from "@/shared/common/types/extensionRegistry";

/**
 * Here we define the extension categories and the extension entries for each category.
 * ExtensionEntryType<Props, Condition> is a type that defines the extension entry for a given category.
 */
export type ExtensionCategoryMapType = {
  headerMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType }>;
  mobileMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType }>;
  accountMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType }>;
  mobileHeader: ExtensionEntryType;
  productCard: ExtensionEntryType<
    { product?: Product; isTextShown?: boolean; lazy?: boolean },
    (product: Product) => boolean
  >;
};
