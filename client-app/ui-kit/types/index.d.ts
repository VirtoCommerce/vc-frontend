import type { fileSizeUnits } from "@/ui-kit/constants";
import type { SwiperOptions } from "swiper";
import type { Ref } from "vue";
import type { RouteLocationRaw } from "vue-router";

declare global {
  type NonNullableSwiperOptions = {
    [prop in keyof Omit<
      SwiperOptions,
      "navigation" | "pagination" | "createElements" | "onAny" | "swipeHandler" | "_emitClasses"
    >]?: NonNullable<SwiperOptions[prop]>;
  };

  interface CarouselOptions extends NonNullableSwiperOptions {
    swipeHandler?: boolean;
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

  type VcPushMessageType = {
    id: string;
    createdDate: number | Date;
    isRead?: boolean;
    shortMessage: string;
    isHidden?: boolean;
  };
}
