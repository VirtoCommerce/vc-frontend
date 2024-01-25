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

  interface SlidingActionsItem {
    icon: string;
    title: string;
    classes?: string;
    left?: boolean;
    // FIXME: https://virtocommerce.atlassian.net/browse/ST-5121
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clickHandler(inputObject: any): any;
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

  interface INewFile extends IFile {
    status: "new";
    progress: 0;
    file: File;
  }

  interface IUploadingFile extends IFile {
    status: "loading";
    progress: number;
  }

  interface IUploadedFile extends IFile {
    status: "success";
    progress: 100;
    id: string;
    url: string;
  }

  interface IFileFailure extends IFile {
    status: "error";
    progress: 100;
    errorMessage: string;
  }

  interface IExistingFile extends IFile {
    status: "existing";
    url: string;
  }

  interface IRemovedFile extends IFile {
    status: "removed";
  }

  type FileType = INewFile | IUploadingFile | IUploadedFile | IFileFailure | IExistingFile | IRemovedFile;
}
