import { useNavigations } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useUser } from "@/shared/account/composables";
import { loadModuleLocale } from "../utils";
import { MODULE_ID, ENABLED_KEY } from "./constants";
import type { MenuType } from "@/core/types";
import type { I18n } from "@/i18n";
import type { DeepPartial } from "utility-types";
import type { Router, RouteRecordRaw } from "vue-router";

const PointsHistory = () => import("./pages/points-history.vue");

const { isEnabled } = useModuleSettings(MODULE_ID);
const { mergeMenuSchema } = useNavigations();

const route: RouteRecordRaw = {
    path: "points-history",
    name: "PointsHistory",
    component: PointsHistory,
};

const menuItems: DeepPartial<MenuType> = {
    header: {
        desktop: {
            account: {
                children: [
                    {
                        id: "points-history",
                        route: { name: "PointsHistory" },
                        title: "loyalty.navigation.route_name",
                        icon: "star",
                        priority: 200,
                    },
                ],
            },
        },
        mobile: {
            account: {
                children: [
                    {
                        id: "points-history",
                        route: { name: "PointsHistory" },
                        title: "loyalty.navigation.route_name",
                        icon: "star",
                        priority: 200,
                    },
                ],
            },
        },
    },
};

export function init(router: Router, i18n: I18n) {
    const { isAuthenticated } = useUser();
    if (isEnabled(ENABLED_KEY)) {
        router.addRoute("Account", route);
        void loadModuleLocale(i18n, "loyalty");
    }
    if (isAuthenticated.value && isEnabled(ENABLED_KEY)) {
        mergeMenuSchema(menuItems);
    }
}
