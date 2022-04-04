<template>
  <div class="pt-7">
    <div class="w-full max-w-screen-2xl mx-auto pb-5 lg:pb-10 px-5 md:px-12">
      <VcBreadcrumbs :items="breadcrumbs"></VcBreadcrumbs>
      <h1 class="font-bold text-gray-900 text-3xl lg:text-4xl mt-5 uppercase" v-t="'pages.demo_landing.header'"></h1>
    </div>

    <div class="bg-gray-100 pt-6 pb-16 lg:py-24">
      <div class="w-full max-w-screen-2xl mx-auto px-5 md:px-12">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-10 items-center">
          <div class="order-2 lg:order-1">
            <div
              class="font-bold text-2xl lg:text-5xl mb-4"
              v-t="'pages.demo_landing.primary_block.primary_text'"
            ></div>
            <div class="text-lg" v-t="'pages.demo_landing.primary_block.secondary_text'"></div>
            <div class="flex mt-6 lg:mt-14 space-x-6">
              <VcButton class="w-1/2 lg:w-auto uppercase px-8">
                {{ $t("pages.demo_landing.primary_block.first_button") }}
              </VcButton>

              <VcButton class="w-1/2 lg:w-auto uppercase px-8 bg-gray-900">
                {{ $t("pages.demo_landing.primary_block.second_button") }}
              </VcButton>
            </div>
          </div>
          <div class="bg-gray-200 rounded aspect-video order-1 lg:order-2"></div>
        </div>
      </div>
    </div>

    <div class="bg-white py-10 lg:py-24">
      <div class="w-full max-w-screen-xl mx-auto px-14 lg:px-32">
        <div
          class="font-bold text-2xl lg:text-4xl mb-6 text-center"
          v-t="'pages.demo_landing.secondary_block.primary_text'"
        ></div>
        <div class="text-base text-center" v-t="'pages.demo_landing.secondary_block.secondary_text'"></div>
      </div>
    </div>

    <div class="bg-gray-100 py-10 lg:py-24">
      <div class="w-full max-w-screen-xl mx-auto px-5 md:px-12">
        <div
          class="font-bold text-2xl lg:text-5xl mb-6 text-center"
          v-t="'pages.demo_landing.features_block.primary_text'"
        ></div>
        <div class="text-base text-center" v-t="'pages.demo_landing.features_block.secondary_text'"></div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-20 gap-y-10 items-center mt-16 px-8 lg:px-0">
          <div class="text-center">
            <VcImage src="/static/images/demo-landing/feat-1.svg" class="h-24 mx-auto mb-9" />
            <div
              class="font-roboto-condensed uppercase font-bold text-2xl mb-3"
              v-t="'pages.demo_landing.features_block.feature_1.title'"
            ></div>
            <div class="text-sm" v-t="'pages.demo_landing.features_block.feature_1.text'"></div>
          </div>
          <div class="text-center">
            <VcImage src="/static/images/demo-landing/feat-2.svg" class="h-24 mx-auto mb-9" />
            <div
              class="font-roboto-condensed uppercase font-bold text-2xl mb-3"
              v-t="'pages.demo_landing.features_block.feature_2.title'"
            ></div>
            <div class="text-sm" v-t="'pages.demo_landing.features_block.feature_2.text'"></div>
          </div>
          <div class="text-center">
            <VcImage src="/static/images/demo-landing/feat-3.svg" class="h-24 mx-auto mb-9" />
            <div
              class="font-roboto-condensed uppercase font-bold text-2xl mb-3"
              v-t="'pages.demo_landing.features_block.feature_3.title'"
            ></div>
            <div class="text-sm" v-t="'pages.demo_landing.features_block.feature_3.text'"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-800 py-10 lg:py-24">
      <div class="w-full max-w-screen-xl mx-auto px-5 md:px-12">
        <div class="flex flex-col lg:block justify-between items-center space-y-10">
          <div
            class="font-bold text-2xl lg:text-3xl text-white text-center"
            v-t="'pages.demo_landing.booking_block.message'"
          ></div>
          <div class="flex w-full items-center justify-center space-x-6">
            <VcButton class="w-1/2 md:w-auto uppercase px-2 md:px-8">
              {{ $t("pages.demo_landing.booking_block.first_button") }}
            </VcButton>

            <VcButton class="w-1/2 md:w-auto uppercase px-2 md:px-8 bg-gray-50 text-yellow-500">
              {{ $t("pages.demo_landing.booking_block.second_button") }}
            </VcButton>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-100 py-10 lg:py-24">
      <div class="w-full max-w-screen-xl mx-auto px-5 md:px-12">
        <h2
          class="text-center font-bold text-3xl lg:text-4xl mb-2 lg:mb-4"
          v-t="'pages.demo_landing.products_block.title'"
        ></h2>
        <div class="text-center lg:text-lg" v-t="'pages.demo_landing.products_block.message'"></div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-4 mt-12">
          <ProductCardGrid v-for="item in products" :key="item.id" :product="item">
            <template #cart-handler>
              <VcButton
                v-if="item.variations?.length"
                :to="{ name: 'Product', params: { productId: item.id } }"
                class="uppercase mb-4"
              >
                {{ $t("pages.demo_landing.products_block.choose_button") }}
              </VcButton>

              <AddToCart v-else :product="item"></AddToCart>
            </template>
          </ProductCardGrid>
        </div>
      </div>
    </div>

    <div class="bg-white py-10 lg:py-24">
      <div class="w-full max-w-screen-xl mx-auto px-14 lg:px-32">
        <div
          class="font-bold text-2xl lg:text-4xl mb-6 text-center"
          v-t="'pages.demo_landing.after_products_block.primary_text'"
        ></div>
        <div class="text-base text-center" v-t="'pages.demo_landing.after_products_block.secondary_text'"></div>
      </div>
    </div>

    <div class="bg-gray-100 py-10 lg:py-24">
      <div class="w-full max-w-screen-xl mx-auto px-14 lg:px-32">
        <div
          class="font-bold text-2xl lg:text-4xl mb-4 text-center"
          v-t="'pages.demo_landing.subscription_block.primary_text'"
        ></div>
        <div
          class="font-bold text-lg mb-8 text-center"
          v-t="'pages.demo_landing.subscription_block.secondary_text'"
        ></div>
        <VcInput
          class="max-w-lg mx-auto"
          :placeholder="$t('pages.demo_landing.subscription_block.input_placeholder')"
        />
        <div class="text-center">
          <div class="mt-4">
            <VcCheckbox class="inline-flex">
              {{ $t("pages.demo_landing.subscription_block.agreement_checkbox_label") }}

              <router-link
                class="text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"
                to="/terms"
              >
                {{ $t("pages.demo_landing.subscription_block.terms_and_policy_link") }}
              </router-link>
            </VcCheckbox>
          </div>

          <VcButton class="uppercase px-12 mt-10">
            {{ $t("pages.demo_landing.subscription_block.submit_button") }}
          </VcButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IBreadcrumbs, VcBreadcrumbs, VcButton, VcImage, VcInput, VcCheckbox } from "@/components";
import { onMounted, ref } from "vue";
import { ProductCardGrid, useProducts } from "@/shared/catalog";
import { AddToCart } from "@/shared/cart";

const { products, fetchProducts } = useProducts();

onMounted(async () => {
  await fetchProducts({
    itemsPerPage: 4,
    filter: '"BRAND":"HP"',
  });
});

const breadcrumbs = ref<IBreadcrumbs[]>([
  { title: "Home", route: "/" },
  { title: "Demo landing", route: "/demo-landing" },
]);
</script>
