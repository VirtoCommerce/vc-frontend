import type { fileSizeUnits, COLORS, MAIN_COLORS } from "@/ui-kit/constants";
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

  interface ITableColumn {
    id: string;
    title?: string;
    sortable?: boolean;
    align?: "center" | "right" | "left";
    classes?: string;
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
}
