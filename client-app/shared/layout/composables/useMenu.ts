import { IMenuItem } from "./../types/index";
import { useI18n } from "vue-i18n";
import menuSchema from "@/config/menu";
import _ from "lodash";
import { ref } from "vue";

export default () => {
  const { t } = useI18n();

  const headerMenu = ref<IMenuItem[]>(menuSchema?.header?.main);

  const mobileAccountMenu = ref<IMenuItem[]>(menuSchema?.header?.mobile_account);

  //localize header menu items
  function localizeMenuItems(menuItems: IMenuItem[]) {
    _.each(menuItems, (item) => {
      item.title = t(item.title);
      if (item.children) {
        _.each(item.children, (child) => {
          child.title = t(child.title);
        });
      }
    });
  }

  localizeMenuItems(headerMenu.value);

  localizeMenuItems(mobileAccountMenu.value);

  return {
    headerMenu,
    mobileAccountMenu,
  };
};
