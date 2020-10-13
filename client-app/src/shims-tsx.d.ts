import Vue, { VNode } from "vue";
import { LocaleMessages } from "vue-i18n";
import { Dictionary } from './core/models/dictionary';

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }

  interface Window {
    BASE_URL: string;
    STORE_NAME: string;
    CURRENCY_CODE: string;
    LOCALE: string;
    USER_ID: string;
    THEME_SETTINGS: Dictionary<any>;
    CATEGORY_ID: string;
    FALLBACK_IMG_URL: string;
    LOCALIZATION_MESSAGES: LocaleMessages;
    Features: Features;
  }

  interface Features {
    OrdersBrowsingFeature: boolean;
    PaymentBrowsingFeature: boolean;
    InvoiceBrowsingFeature: boolean;
    ManageUsersFeature: boolean;
    ManageRolesFeature: boolean;
    ContractsInfoBrowsingFeature: boolean;
    RetrieveReorderingFeature: boolean;
    OrderApprovalFeature: boolean;
    ProductTextSearchFeature: boolean;
    ProductsFilteringFeature: boolean;
    ProductDetailsBrowsingFeature: boolean;
    ProductPriceBrowsingFeature: boolean;
    ProductRecommendationFeature: boolean;
    OrderDraftFeature: boolean;
    WishListFeature: boolean;
    SubmitOrderFeature: boolean;
    ProductInventoryBrowsingFeature: boolean;
    ManageShipmentDetailsFeature: boolean;
    ManagePaymentDetailsFeature: boolean;
  }
}
