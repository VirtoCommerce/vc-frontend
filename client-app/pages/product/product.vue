<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner">
    <div v-if="!loading" class="max-w-screen-2xl px-5 md:px-12 mx-auto">
      <!-- Breadcrumbs -->
      <Breadcrumbs class="hidden md:block mb-3" :items="breadcrumbsItems"></Breadcrumbs>
      <div class="md:hidden mb-5">
        <button class="border border-grey-200 rounded bg-white px-3 py-2 hover:bg-gray-100" @click="back()">
          <i class="fas fa-chevron-left text-yellow-500"></i><span class="ml-2 text-cyan-700">Back</span>
        </button>
      </div>
      <h1 class="text-2xl md:text-4xl font-bold uppercase">{{ product.name }}</h1>
      <ProductCard v-if="!withVariations" :product="product"></ProductCard>
      <ProductWithVariationsCard
        v-else
        :product="product"
        :variations-cart-total="variationsCartTotal"
      ></ProductWithVariationsCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  useProducts,
  useBreadcrumbs,
  Breadcrumbs,
  IBreadcrumbsItem,
  ProductCard,
  ProductWithVariationsCard,
} from "@/shared/catalog";
import { Breadcrumb } from "@/core/api/graphql/types";

const route = useRoute();
const router = useRouter();

const { product, loading, loadProduct, withVariations, variationsCartTotal } = useProducts();

const breadcrumbsItems: Ref<IBreadcrumbsItem[]> = ref([{ url: "/", title: "Home" }]);
const { buildBreadcrumbs } = useBreadcrumbs();

const productId = ref(route.params.id as string);

onMounted(async () => {
  await loadProduct(productId.value);
  breadcrumbsItems.value = buildBreadcrumbs(product.value.breadcrumbs as Breadcrumb[]);
});

function back() {
  router.back();
}
</script>

<style lang="scss" scoped></style>
