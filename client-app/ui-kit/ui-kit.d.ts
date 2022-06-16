import { SwiperOptions } from "swiper/types/swiper-options";
import { RouteLocationRaw } from "vue-router";

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

  interface IValidationRules {
    required?: boolean;
    min?: number;
    max?: number;
    regex?: RegExp;
  }

  interface ItemAction {
    icon: string;
    title: string;
    bgColor: string;
    leftActions?: boolean;
    clickHandler(item: any): any;
  }

  interface IBreadcrumbs {
    title: string;
    /**
     * Not needed for last element
     */
    route?: RouteLocationRaw;
  }

  interface ITableColumn {
    id: string;
    title: string;
    sortable?: boolean;
    titlePosition?: "text-center" | "text-right" | "text-left";
  }

  interface IProductProperties {
    [key: string]: { value: string }[];
  }
}
