<template>
  <VcWidget class="product-info" size="lg">
    <div class="product-info__container">
      <div class="product-info__side">
        <ImageGallery :images="product.images">
          <template #badges>
            <DiscountBadge :price="product.price!" />
          </template>
        </ImageGallery>

        <ProductVideos class="product-info__videos" :videos="product.videos" />
      </div>

      <div class="product-info__print">
        <VcImage :src="product.imgSrc" class="product-info__print-img" />
      </div>

      <div class="product-info__content">
        <div v-if="model?.blocks?.length" class="product-info__blocks">
          <template v-for="(block, index) in model.blocks">
            <component
              :is="block.type"
              v-if="block.type !== 'product-variations'"
              :key="block.id || index"
              :model="block"
              :product="product"
            />
          </template>
        </div>

        <div v-if="product.isConfigurable" class="product-info__config">
          <VcButton
            color="secondary"
            variant="outline"
            prepend-icon="cube-transparent"
            @click="handleCreateConfiguration"
          >
            {{ $t("shared.catalog.product_details.create_configuration_button") }}
          </VcButton>
        </div>
      </div>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { ImageGallery, DiscountBadge, ProductVideos } from "@/shared/catalog";
import type { IPageContent } from "../types";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  model: IPageContent;
}

defineProps<IProps>();

function handleCreateConfiguration() {
  const productConfigurationElement = document.getElementById("product-configuration-anchor");
  if (productConfigurationElement) {
    productConfigurationElement.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  }
}
</script>

<style lang="scss">
.product-info {
  &__container {
    @apply flex flex-col lg:flex-row lg:gap-8 print:flex-row print:gap-4;
  }

  &__side {
    @apply flex-none lg:w-80 xl:w-[27.5rem] 2xl:w-[30rem] print:hidden;
  }

  &__videos {
    @apply mt-8 lg:mt-3;
  }

  &__print {
    @apply hidden aspect-square w-40 flex-none print:block;
  }

  &__print-img {
    @apply w-full rounded border;
  }

  &__content {
    @apply mt-5 lg:mt-0 lg:grow print:mt-5 print:grow;
  }

  &__blocks {
    @apply flex flex-col gap-6 mb-6;
  }
}
</style>
