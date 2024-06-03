<template>
  <div>
    <router-link
      v-if="getLinkType(item.route) === 'internal'"
      class="catalog-menu-link"
      :to="item.route ?? '#'"
      @click="select"
    >
      {{ item.title }}
    </router-link>
    <a
      v-if="getLinkType(item.route) === 'external'"
      class="catalog-menu-link"
      :href="item.route as string"
      target="_blank"
      @click="select"
    >
      {{ item.title }}
    </a>

    <div>
      <template v-for="(child, index) in visibleChildren" :key="index">
        <router-link
          v-if="getLinkType(child.route) === 'internal'"
          class="catalog-menu-child-link"
          :to="child.route ?? '#'"
          @click="select"
        >
          {{ child.title }}
        </router-link>
        <a
          v-if="getLinkType(item.route) === 'external'"
          class="catalog-menu-child-link"
          :href="child.route as string"
          target="_blank"
          @click="select"
        >
          {{ child.title }}
        </a>
      </template>

      <button
        v-if="children.length > SHORT_VIEW_ITEMS_COUNT"
        type="button"
        class="flex items-center px-2 py-1 text-sm"
        @click="toggleShowAll"
      >
        <span class="text-[--link-color] hover:text-[--link-hover-color]">
          {{ buttonText }}
        </span>

        <VcIcon :name="buttonIcon" size="xxs" class="ml-1 text-primary" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getLinkAttr } from "@/core/utilities";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "select"): void;
}

interface IProps {
  item: ExtendedMenuLinkType;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const { t } = useI18n();

const SHORT_VIEW_ITEMS_COUNT = 5;
const showAll = ref(false);

const children = computed<ExtendedMenuLinkType[]>(() => props.item.children || []);
const visibleChildren = computed<ExtendedMenuLinkType[]>(() =>
  showAll.value ? children.value : children.value.slice(0, SHORT_VIEW_ITEMS_COUNT),
);

const buttonIcon = computed<string>(() => (showAll.value ? "chevron-up" : "chevron-down"));
const buttonText = computed<string>(() => (showAll.value ? t("common.buttons.hide") : t("common.buttons.show_more")));

function toggleShowAll() {
  showAll.value = !showAll.value;
}

function select() {
  emit("select");
}

function getLinkType(link?: RouteLocationRaw): "internal" | "external" {
  if ("externalLink" in getLinkAttr(link)) {
    return "external";
  }

  return "internal";
}
</script>

<style scoped lang="scss">
.catalog-menu-link {
  @apply mb-2 block px-2 py-1 text-base font-bold hover:bg-neutral-100;
}

.catalog-menu-child-link {
  @apply mb-1 block truncate px-2 py-1 text-sm leading-4 text-neutral hover:bg-neutral-100;
}
</style>
