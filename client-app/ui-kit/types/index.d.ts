import type { fileSizeUnits, COLORS, MAIN_COLORS } from "@/ui-kit/constants";
import type { BREAKPOINTS } from "@/ui-kit/constants";
import type { SwiperOptions } from "swiper";
import type { SwiperEvents } from "swiper/types";
import type { Ref } from "vue";
import type { RouteLocationRaw } from "vue-router";

declare global {
  type VcColorType = (typeof COLORS)[number];
  type VcMainColorType = (typeof MAIN_COLORS)[number];

  type NonNullableSwiperOptionsType = {
    [
      prop in keyof Omit<
        SwiperOptions,
        "navigation" | "pagination" | "createElements" | "onAny" | "swipeHandler" | "_emitClasses"
      >
    ]?: NonNullable<SwiperOptions[prop]>;
  };

  interface ICarouselOptions extends NonNullableSwiperOptionsType {
    swipeHandler?: boolean;
    on?: SwiperEvents;
  }

  interface IBreadcrumb {
    title: string;
    /**
     * Not needed for last element
     */
    route?: RouteLocationRaw;
  }

  interface IStepsItem {
    id?: string;
    text: string;
    icon?: string;
    route?: RouteLocationRaw;
    disabled?: boolean;
    hidden?: boolean;
  }

  type TProvidedObjectOfExpansionPanels = {
    panels: Ref<Record<string, boolean>>;
    toggle: (panelId: string) => void;
  };

  type FileSizeUnitsType = (typeof fileSizeUnits)[number];

  interface IFileSize {
    value: number;
    unit: FileSizeUnitsType;
  }

  interface IFile {
    id?: string;
    name: string;
    contentType?: string;
    size: number;
    url?: string;
    status: string;
    progress?: number;
    errorMessage?: string;
    file?: File;
  }

  interface IAttachedFile extends IFile {
    status: "attached";
    url: string;
  }

  interface INewFile extends IFile {
    status: "new";
    progress: 0;
    file: File;
  }

  interface IUploadingFile extends INewFile {
    status: "uploading";
    progress: number;
  }

  interface IUploadedFile extends IUploadingFile {
    status: "uploaded";
    progress: 100;
    id: string;
    url: string;
  }

  interface IFailedFile extends IFile {
    status: "error";
    errorMessage: string;
  }

  interface IRemovedFile extends IFile {
    status: "removed";
  }

  type FileType = INewFile | IUploadingFile | IUploadedFile | IFailedFile | IAttachedFile | IRemovedFile;

  type BrowserTargetType = "_blank" | "_self";

  type AddressType = {
    city?: string;
    countryCode?: string;
    countryName?: string;
    line1?: string;
    line2?: string;
    postalCode?: string;
    regionName?: string;
  };

  type BreakpointsType = keyof typeof BREAKPOINTS;

  /** Border side type for components */
  type VcBorderSideType = "top" | "bottom" | "left" | "right" | "x" | "y";

  /** Table item type */
  type VcTableItemType = {
    id?: string | number;
    [key: string]: unknown;
  };

  // Commerce data as ui-kit components read it: only the fields they use, shaped so the theme's GraphQL
  // objects (MoneyType, PriceType, Property, CommonVendor, ImageType, PreparedLineItemType) fit as they are.

  /** Money amount */
  type VcMoneyType = {
    amount: number;
    formattedAmount: string;
    formattedAmountWithoutCurrency?: string;
    currency?: { symbol?: string };
  };

  /** List and actual price of a product */
  type VcPriceType = {
    list: VcMoneyType;
    actual: VcMoneyType;
  };

  /** Product property shown as a label and a value */
  type VcPropertyType = {
    name: string;
    label: string;
    value?: string | number | boolean | null;
  };

  type VcVendorType = {
    name: string;
  };

  type VcProductImageType = {
    url: string;
  };

  /** Line item type */
  type VcLineItemType = {
    id: string;
    name: string;
    sku?: string;
    imageUrl?: string;
    route?: RouteLocationRaw;
    properties?: VcPropertyType[];
    listPrice?: VcMoneyType;
    actualPrice?: VcMoneyType;
    extendedPrice?: VcMoneyType;
    listTotal?: VcMoneyType;
    showPlacedPrice?: boolean;
    deleted?: boolean;
  };
}
