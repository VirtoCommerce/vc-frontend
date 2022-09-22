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

  interface SlidingActionsItem {
    icon: string;
    title: string;
    classes?: string;
    left?: boolean;
    clickHandler(inputObject: any): any;
  }

  interface IBreadcrumbs {
    title: MaybeRef<string>;
    /**
     * Not needed for last element
     */
    route?: RouteLocationRaw;
  }

  interface ITableColumn {
    id: string;
    title?: string;
    sortable?: boolean;
    align?: "center" | "right" | "left";
    classes?: string;
  }

  interface IProductProperties {
    [key: string]: { value: string }[];
  }
}
