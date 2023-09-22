<template>
  <div class="pb-16 pt-6 lg:py-24" :class="background">
    <div class="mx-auto w-full max-w-screen-2xl px-5 md:px-12">
      <div class="grid grid-cols-1 items-center gap-x-20 gap-y-10 lg:grid-cols-2">
        <div :class="[imagePosition === 'right' ? 'order-2 lg:order-1' : 'order-1 lg:order-2']">
          <div class="mb-4 text-2xl font-bold lg:text-5xl">{{ title }}</div>
          <div class="text-lg">{{ subtitle }}</div>
          <div v-if="buttons?.length" class="mt-6 flex space-x-6 lg:mt-14">
            <VcButton
              v-for="(item, index) in buttons"
              :key="index"
              v-bind="getLinkAttr(item.link)"
              class="flex-1 lg:flex-none"
            >
              {{ item.label }}
            </VcButton>
          </div>
        </div>
        <div
          class="aspect-video rounded bg-gray-200"
          :class="[imagePosition === 'right' ? 'order-1 lg:order-2' : 'order-2 lg:order-1']"
        >
          <img :src="image" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

type ImagePositionType = "left" | "right";
type ButtonsType = {
  label: string;
  link: string;
};

interface IProps {
  id: string;
  background?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  imagePosition?: ImagePositionType;
  buttons?: Array<ButtonsType>;
}

defineProps<IProps>();

type LinkAttrType = { to: RouteLocationRaw } | { link: string } | object;
const getLinkAttr = (link?: string): LinkAttrType => {
  if (link) {
    if (link.startsWith("/")) {
      return { to: link };
    } else {
      return { externalLink: link };
    }
  }
  return {};
};
</script>
