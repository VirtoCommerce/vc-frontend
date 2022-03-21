import { useI18n } from "vue-i18n";
import menuSchema from "@/config/menu";
import _ from "lodash";

export default () => {
  const { t } = useI18n();

  const headerMenu = menuSchema?.header?.main;

  //localize header menu items
  _.each(headerMenu, (item) => {
    item.title = t(item.title);
    if (item.children) {
      _.each(item.children, (child) => {
        child.title = t(child.title);
      });
    }
  });

  return {
    headerMenu,
  };
};
