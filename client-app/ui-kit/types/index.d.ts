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
    [prop in keyof Omit<
      SwiperOptions,
      "navigation" | "pagination" | "createElements" | "onAny" | "swipeHandler" | "_emitClasses"
    >]?: NonNullable<SwiperOptions[prop]>;
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

  // Table types - for backward compatibility with ui-kit components
  /** @deprecated Use VcTableColumnType instead */
  type ITableColumn = VcTableColumnType;

  /** @deprecated Use VcTableSortInfoType instead */
  type ISortInfo = VcTableSortInfoType;

  /**
   * @deprecated Use VcTableSortDirectionType for type, or import SortDirection from @/core/enums for values
   */
  const enum SortDirection {
    Ascending = "asc",
    Descending = "desc",
  }
}
