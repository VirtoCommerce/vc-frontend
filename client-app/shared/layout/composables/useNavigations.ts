import { computed, inject, shallowRef, triggerRef } from "vue";
import { menuInjectionKey } from "@core/injection-keys";
import { MenuLink } from "@/shared/layout";
import menuSchema from "@/config/menu";
import { useI18n } from "vue-i18n";

const openedMenuLinksStack = shallowRef<MenuLink[]>([]);

function goBack() {
  openedMenuLinksStack.value.pop();
  triggerRef(openedMenuLinksStack);
}

function goMainMenu() {
  openedMenuLinksStack.value = [];
  triggerRef(openedMenuLinksStack);
}

function selectMenuItem(item: MenuLink) {
  if (!item.children) return;
  openedMenuLinksStack.value.push(item);
  triggerRef(openedMenuLinksStack);
}

export default function useNavigations() {
  const $menu = inject(menuInjectionKey);
  const { t } = useI18n();

  const mainMenuLinks: MenuLink[] = menuSchema.header.main.map<MenuLink>((item) => ({
    id: item.id,
    route: item.route,
    title: t(item.title),
    children: ($menu?.[item.id] || []).map((childrenItem) => ({
      id: childrenItem.url?.split("/").pop(),
      title: childrenItem.title,
      route: childrenItem.url,
    })),
  }));

  return {
    goBack,
    goMainMenu,
    selectMenuItem,
    mainMenuLinks: computed(() => mainMenuLinks),
    openedItem: computed<MenuLink | undefined>(() => openedMenuLinksStack.value[openedMenuLinksStack.value.length - 1]),
  };
}
