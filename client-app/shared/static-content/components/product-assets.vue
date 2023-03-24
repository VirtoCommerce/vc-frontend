<template>
  <div v-if="model" class="mt-5 flex flex-col lg:flex-row lg:space-x-8">
    <div class="-mx-5 md:mx-0 lg:w-8/12 xl:w-9/12">
      <ProductTitledBlock
        v-if="model.title"
        class="mt-5"
        image-src="/static/images/description.svg"
        :title="model.title || $t('shared.catalog.product_details.description_block_title')"
      >
        <ul class="ml-6 list-disc">
          <li v-for="(asset, index) in model.assets" :key="index">
            <a :href="asset.url" class="text-[color:var(--color-primary)] hover:underline">
              {{ asset.name || asset.filename }}
            </a>
          </li>
        </ul>
      </ProductTitledBlock>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ProductTitledBlock } from "@/shared/catalog";

defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any;
}>();
</script>
