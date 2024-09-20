<template>
  <VcContainer>
    <VcWidget
      size="lg"
      :style="{ backgroundColor: widgetBackground?.color, backgroundImage: `url(${widgetBackground?.image})` }"
    >
      <template v-if="title" #header>
        <VcTypography tag="h3">
          <span :style="{ color: title?.color }">{{ title?.text }}</span>
          <span class="text-primary-400"> / </span>
          <span :style="{ color: subtitle?.color }">{{ subtitle?.text }}</span>
        </VcTypography>
      </template>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <VcProductCard v-for="item in products" :key="item.id" :view-mode="viewMode" border>
          <VcProductImage :img-src="item.imgSrc" :alt="item.name" />

          <VcProductTitle lines-number="2" :to="productsRoutes[item.id]" :title="item.name">
            {{ item.name }}
          </VcProductTitle>

          <VcProductVendor v-if="$cfg.vendor_enabled">
            {{ item.vendor?.name }}
          </VcProductVendor>

          <VcProductPrice
            v-if="item.hasVariations"
            has-variations
            :actual-price="item.minVariationPrice?.actual"
            :list-price="item.minVariationPrice?.list"
          />

          <VcProductPrice v-else :actual-price="item.price.actual" :list-price="item.price.list" />
        </VcProductCard>
      </div>
    </VcWidget>
  </VcContainer>
</template>

<script setup lang="ts">
import { watchEffect } from "vue";
import { useProductsRoutes } from "@/core/composables";
import { useProducts } from "@/shared/catalog";

interface IProps {
  id?: string;
  widgetBackground?: {
    color?: string;
    image?: string;
  };
  title?: {
    text?: string;
    color?: string;
  };
  subtitle?: {
    text?: string;
    color?: string;
  };
  count?: number;
  query?: string;
  filter?: string;
  viewMode?: "grid" | "list";
}

const props = withDefaults(defineProps<IProps>(), {
  cardType: "list",
  count: 4,
  columnsAmountDesktop: "4",
  columnsAmountTablet: "3",
});

const { products, fetchProducts } = useProducts();
const productsRoutes = useProductsRoutes(products);

watchEffect(async () => {
  await fetchProducts({
    itemsPerPage: props.count,
    keyword: props.query,
    filter: props.filter,
  });
});
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
