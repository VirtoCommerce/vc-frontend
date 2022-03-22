import { getMenus } from "@/core/api/graphql/common";
import { MenuLinkType } from "@/core/api/graphql/types";

export const menu: Record<string, MenuLinkType[]> = {};

export async function initMenu(): Promise<void> {
  (await getMenus()).forEach((item) => (menu[`${item.name}`] = item.items || []));
}
