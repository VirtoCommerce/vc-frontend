import { SwiperOptions } from "swiper/types/swiper-options";
import { RouteLocationRaw } from "vue-router";

type NonNullableSwiperOptions = {
  [prop in keyof Omit<
    SwiperOptions,
    "navigation" | "pagination" | "createElements" | "onAny" | "swipeHandler" | "_emitClasses"
  >]?: NonNullable<SwiperOptions[prop]>;
};

export interface CarouselOptions extends NonNullableSwiperOptions {
  swipeHandler?: boolean;
}

export interface IValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  regex?: RegExp;
}

export interface ItemAction {
  icon: string;
  title: string;
  bgColor: string;
  leftActions?: boolean;
  clickHandler(item: any): any;
}

export interface IBreadcrumbs {
  title: string;
  route: RouteLocationRaw;
}

export interface ITableColumn {
  id: string;
  title: string;
  sortable?: boolean;
  titlePosition?: "text-center" | "text-right" | "text-left";
}

export interface IProductProperties {
  [key: string]: { value: string }[];
}
