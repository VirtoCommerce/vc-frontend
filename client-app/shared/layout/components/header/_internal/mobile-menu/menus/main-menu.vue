<template>
  <section class="grow divide-y divide-additional-50 divide-opacity-20 overflow-y-auto">
    <ul class="flex flex-col gap-y-2 px-9 py-6">
      <li>
        <MobileMenuLink :link="menuItem" class="py-1 text-2xl font-bold" @close="$emit('close')">
          {{ menuItem.title }}
        </MobileMenuLink>
      </li>
      <li v-for="item in mobileMainMenuItems" :key="item.title">
        <LinkCart v-if="item.id === 'cart'" :item="item" @close="$emit('close')" />
        <LinkCompare v-else-if="item.id === 'compare'" :item="item" @close="$emit('close')" />
        <LinkDefault v-else :item="item" @close="$emit('close')" @select-item="$emit('selectItem', item)" />
      </li>
    </ul>

    <div class="flex flex-col gap-y-2 px-9 py-6">
      <template v-if="isAuthenticated">
        <!-- Account -->
        <div class="mb-4 mt-2 flex flex-row gap-4 text-xl">
          <div
            class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-accent-300"
          >
            <VcImage v-if="user.photoUrl" :src="user.photoUrl" :alt="user.contact?.fullName" class="size-12" lazy />
            <VcIcon v-else name="user" />
          </div>

          <div class="flex flex-col leading-tight">
            <div class="flex flex-wrap items-center gap-x-1 text-accent-100">
              <template v-if="operator">
                <span class="line-clamp-3 font-bold [word-break:break-word]">
                  {{ operator.contact?.fullName || operator.userName }}
                </span>

                <span class="text-accent-200">
                  {{ $t("shared.layout.header.top_header.logged_in_as") }}
                </span>
              </template>

              <span class="line-clamp-3 font-bold [word-break:break-word]">
                {{ user.contact?.fullName || user.userName }}
              </span>
            </div>

            <div>
              <button type="button" class="font-bold text-[--mobile-menu-navigation-color]" @click="signMeOut">
                {{ $t("shared.layout.header.link_logout") }}
              </button>
            </div>
          </div>
        </div>

        <!-- Account link -->
        <ul>
          <li>
            <MobileMenuLink
              v-if="extendedMobileAccountMenuItem"
              :link="extendedMobileAccountMenuItem"
              class="py-1 text-2xl font-bold"
              @select="$emit('selectItem', extendedMobileAccountMenuItem!)"
            >
              {{ extendedMobileAccountMenuItem.title }}
            </MobileMenuLink>
          </li>

          <!-- Corporate link -->
          <li>
            <MobileMenuLink
              v-if="mobileCorporateMenuItem && isCorporateMember"
              :link="mobileCorporateMenuItem"
              class="py-1 text-2xl font-bold"
              @select="$emit('selectItem', mobileCorporateMenuItem!)"
            >
              {{ mobileCorporateMenuItem.title }}
            </MobileMenuLink>
          </li>
        </ul>
      </template>

      <!-- Unauthorized links -->
      <ul v-else class="mb-1">
        <li>
          <MobileMenuLink
            v-for="item in unauthorizedMenuItems"
            :key="item.title"
            :link="item"
            class="py-1.5 text-2xl font-bold"
            @close="$emit('close')"
          >
            {{ item.title }}
          </MobileMenuLink>
        </li>
      </ul>

      <!-- Settings link -->
      <MobileMenuLink
        v-if="supportedCurrencies.length > 1"
        :link="settingsMenuItem"
        class="py-1 text-2xl font-bold"
        @select="$emit('selectItem', settingsMenuItem)"
      >
        {{ $t("shared.layout.header.mobile.settings") }}
      </MobileMenuLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { cloneDeep } from "lodash";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useCurrency, useNavigations } from "@/core/composables";
import { useSignMeOut, useUser } from "@/shared/account";
import type { ExtendedMenuLinkType } from "@/core/types";
import LinkCart from "@/shared/layout/components/header/_internal/mobile-menu/link-components/link-cart.vue";
import LinkCompare from "@/shared/layout/components/header/_internal/mobile-menu/link-components/link-compare.vue";
import LinkDefault from "@/shared/layout/components/header/_internal/mobile-menu/link-components/link-default.vue";
import MobileMenuLink from "@/shared/layout/components/header/_internal/mobile-menu/mobile-menu-link.vue";

interface IProps {
  menuItem: ExtendedMenuLinkType;
}

interface IEmits {
  (event: "close"): void;
  (event: "selectItem", item: ExtendedMenuLinkType): void;
}

defineEmits<IEmits>();
defineProps<IProps>();

const { signMeOut } = useSignMeOut();
const { user, operator, isAuthenticated, isMultiOrganization, isCorporateMember } = useUser();
const { mobileMainMenuItems, mobileCorporateMenuItem, mobileAccountMenuItem } = useNavigations();
const { t } = useI18n();
const { supportedCurrencies } = useCurrency();

const extendedMobileAccountMenuItem = computed(() => {
  if (isMultiOrganization.value) {
    const item = cloneDeep(mobileAccountMenuItem.value);

    item?.children?.push({
      id: "contact-organizations",
      title: t("common.labels.my_organizations"),
      icon: "/static/images/dashboard/icons/company.svg#main",
      children: [{}], // Ensures arrow visibility for submenu navigation
      priority: 10,
    });

    return item;
  }
  return mobileAccountMenuItem.value;
});

const unauthorizedMenuItems: ExtendedMenuLinkType[] = [
  { route: { name: "SignIn" }, title: t("shared.layout.header.link_sign_in") },
  { route: { name: "SignUp" }, title: t("shared.layout.header.link_register_now") },
];

const settingsMenuItem: ExtendedMenuLinkType = {
  id: "settings",
  icon: "/static/images/common/settings.svg#main",
  children: [{}],
};
</script>
