<template>
  <div class="relative bg-[--header-bottom-bg-color] text-[--header-bottom-text-color]">
    <nav class="relative z-[2] flex min-h-[5.5rem] items-center gap-x-5 bg-inherit px-5 py-3 xl:px-12">
      <router-link :to="$context.settings.default_return_url ?? '/'">
        <VcImage :src="logoUrl" :alt="$context.storeName" class="h-8 xl:h-[2.8rem]" lazy />
      </router-link>

      <template v-if="organization">
        <div class="hidden h-6 w-0.5 bg-primary xl:block"></div>

        <div class="hidden max-w-36 text-base italic leading-[18px] text-neutral-800 xl:line-clamp-2">
          {{ organization?.name }}
        </div>
      </template>

      <SearchBar />

      <ul class="-mx-2 flex items-center">
        <li v-for="item in desktopMainMenuItems" :key="item.id">
          <component :is="(item.id && customLinkComponents[item.id]) || LinkDefault" :item="item" />
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside, syncRefs, useScrollLock } from "@vueuse/core";
import { ref, shallowRef, watch } from "vue";
import { useRoute } from "vue-router";
import { useNavigations, useWhiteLabeling } from "@/core/composables";
import { useUser } from "@/shared/account/composables/useUser";
import { SearchBar } from "@/shared/layout";
import { useCustomHeaderLinkComponents } from "@/shared/layout/composables/useCustomHeaderLinkComponents";
import LinkDefault from "@/shared/layout/components/header/_internal/link-components/link-default.vue";

const { organization } = useUser();
const { logoUrl } = useWhiteLabeling();
const { desktopMainMenuItems } = useNavigations();
const { customLinkComponents } = useCustomHeaderLinkComponents();

const catalogMenuElement = shallowRef<HTMLElement | null>(null);
const showCatalogMenuButton = shallowRef<HTMLElement | null>(null);
const catalogMenuVisible = ref(false);

const route = useRoute();

onClickOutside(
  catalogMenuElement,
  () => {
    catalogMenuVisible.value = false;
  },
  { ignore: [showCatalogMenuButton] },
);

syncRefs(catalogMenuVisible, useScrollLock(document.body));

watch(route, () => {
  catalogMenuVisible.value = false;
});
</script>
