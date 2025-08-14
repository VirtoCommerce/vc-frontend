<template>
  <VcWidget class="product-info" size="lg">
    <div class="product-info__container">
      <div class="product-info__side">
        <ImageGallery :images="firstApplicableVariation?.images ?? product.images">
          <template #badges>
            <BadgesWrapper size="lg">
              <PurchasedBeforeBadge v-if="product.isPurchased" size="lg" show-text />

              <DiscountBadge static :price="product.price" size="lg" />
            </BadgesWrapper>
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
              v-if="shouldShowBlock(block)"
              :key="block.id || index"
              :model="block"
              :product="product"
              v-bind="getBlockProperties(block)"
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
import { computed, toRef } from "vue";
import { ImageGallery, DiscountBadge, ProductVideos } from "@/shared/catalog";
import { useProductVariationProperties } from "@/shared/catalog/composables/useProductVariationProperties";
import type { IPageContent } from "../types";
import type { Product } from "@/core/api/graphql/types";
import BadgesWrapper from "@/shared/catalog/components/badges-wrapper.vue";
import PurchasedBeforeBadge from "@/shared/catalog/components/purchased-before-badge.vue";

const props = defineProps<IProps>();

const BLOCKS_TO_HIDE = ["product-variations"];

interface IProps {
  product: Product;
  model: IPageContent;
  variations: Product[];
  fetchingVariations?: boolean;
}

const variations = toRef(props, "variations");

const { applicableVariations } = useProductVariationProperties(variations);

const firstApplicableVariation = computed(() => {
  return applicableVariations.value[0];
});

function getBlockProperties(block: NonNullable<IPageContent["blocks"]>[number]) {
  if (block.type === "product-options") {
    return {
      variations: props.variations,
      fetchingVariations: props.fetchingVariations,
    };
  }

  return {};
}

function handleCreateConfiguration() {
  const productConfigurationElement = document.getElementById("product-configuration-anchor");
  if (productConfigurationElement) {
    productConfigurationElement.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  }
}

function shouldShowBlock(block: NonNullable<IPageContent["blocks"]>[number]) {
  if (BLOCKS_TO_HIDE.includes(block.type ?? "")) {
    return false;
  }

  return !(block.type === "product-options" && !props.product.hasVariations);
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
