<template>
  <div ref="demoPageAnchor" class="pt-7">
    <div class="mx-auto w-full max-w-screen-2xl px-5 pb-5 md:px-12 lg:pb-10">
      <VcTypography tag="h1">
        {{ $t("pages.demo_landing.header") }}
      </VcTypography>
    </div>

    <div class="bg-neutral-100 pb-16 pt-6 lg:py-24">
      <div class="mx-auto w-full max-w-screen-2xl px-5 md:px-12">
        <div class="grid grid-cols-1 items-center gap-x-20 gap-y-10 lg:grid-cols-2">
          <div class="order-2 lg:order-1">
            <div class="mb-4 text-2xl font-bold lg:text-5xl">
              {{ $t("pages.demo_landing.primary_block.primary_text") }}
            </div>
            <div class="text-lg">
              {{ $t("pages.demo_landing.primary_block.secondary_text") }}
            </div>
            <div class="mt-6 flex gap-6 lg:mt-14">
              <VcButton class="flex-1 lg:flex-none" external-link="https://virtocommerce.com" target="_blank">
                {{ $t("pages.demo_landing.primary_block.first_button") }}
              </VcButton>

              <VcButton class="flex-1 lg:flex-none" external-link="https://virtocommerce.com">
                {{ $t("pages.demo_landing.primary_block.second_button") }}
              </VcButton>
            </div>
          </div>
          <div class="order-1 aspect-video rounded bg-neutral-200 lg:order-2">
            <VcImage
              src="/static/images/demo-landing/note.webp"
              :alt="$t('pages.demo_landing.primary_block.image_alt')"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-additional-50 py-10 lg:py-24">
      <div class="mx-auto w-full max-w-screen-xl px-14 lg:px-32">
        <div class="mb-6 text-center text-2xl font-bold lg:text-4xl">
          {{ $t("pages.demo_landing.secondary_block.primary_text") }}
        </div>
        <div class="text-center text-base">
          {{ $t("pages.demo_landing.secondary_block.secondary_text") }}
        </div>
      </div>
    </div>

    <div class="bg-neutral-100 py-10 lg:py-24">
      <div class="mx-auto w-full max-w-screen-xl px-5 md:px-12">
        <div class="mb-6 text-center text-2xl font-bold lg:text-5xl">
          {{ $t("pages.demo_landing.features_block.primary_text") }}
        </div>
        <div class="text-center text-base">
          {{ $t("pages.demo_landing.features_block.secondary_text") }}
        </div>
        <div class="mt-16 grid grid-cols-1 items-center gap-x-20 gap-y-10 px-8 lg:grid-cols-3 lg:px-0">
          <div class="text-center">
            <VcImage src="/static/images/demo-landing/feat-1.svg" class="mx-auto mb-9 h-24" lazy />
            <div class="mb-3 text-2xl font-bold uppercase">
              {{ $t("pages.demo_landing.features_block.feature_1.title") }}
            </div>
            <div class="text-sm">
              {{ $t("pages.demo_landing.features_block.feature_1.text") }}
            </div>
          </div>
          <div class="text-center">
            <VcImage src="/static/images/demo-landing/feat-2.svg" class="mx-auto mb-9 h-24" lazy />
            <div class="mb-3 text-2xl font-bold uppercase">
              {{ $t("pages.demo_landing.features_block.feature_2.title") }}
            </div>
            <div class="text-sm">
              {{ $t("pages.demo_landing.features_block.feature_2.text") }}
            </div>
          </div>
          <div class="text-center">
            <VcImage src="/static/images/demo-landing/feat-3.svg" class="mx-auto mb-9 h-24" lazy />
            <div class="mb-3 text-2xl font-bold uppercase">
              {{ $t("pages.demo_landing.features_block.feature_3.title") }}
            </div>
            <div class="text-sm">
              {{ $t("pages.demo_landing.features_block.feature_3.text") }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-neutral-800 py-10 lg:py-24">
      <div class="mx-auto w-full max-w-screen-xl px-5 md:px-12">
        <div class="flex flex-col items-center justify-between space-y-10 lg:block">
          <div class="text-center text-2xl font-bold text-additional-50 lg:text-3xl">
            {{ $t("pages.demo_landing.booking_block.message") }}
          </div>
          <div class="flex w-full justify-center gap-6">
            <VcButton class="flex-1 lg:flex-none" external-link="https://virtocommerce.com">
              {{ $t("pages.demo_landing.booking_block.first_button") }}
            </VcButton>

            <VcButton class="flex-1 lg:flex-none" external-link="https://virtocommerce.com">
              {{ $t("pages.demo_landing.booking_block.second_button") }}
            </VcButton>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-neutral-100 py-10 lg:py-24">
      <div class="mx-auto w-full max-w-screen-xl px-5 md:px-12">
        <VcTypography tag="h2" variant="h1" class="mb-2 text-center lg:mb-4">
          {{ $t("pages.demo_landing.products_block.title") }}
        </VcTypography>

        <div class="mb-10 text-center lg:text-lg">
          {{ $t("pages.demo_landing.products_block.message") }}
        </div>

        <div class="grid gap-6 xs:grid-cols-2 md:grid-cols-3 lg:gap-5 xl:grid-cols-4">
          <ProductCardGrid v-for="item in products" :key="item.id" :product="item">
            <template #cart-handler>
              <VcButton v-if="item.hasVariations" :to="productsRoutes[item.id]" class="mb-4">
                {{ $t("pages.demo_landing.products_block.choose_button") }}
              </VcButton>

              <AddToCart v-else :product="item" />
            </template>
          </ProductCardGrid>
        </div>
      </div>
    </div>

    <div class="bg-additional-50 py-10 lg:py-24">
      <div class="mx-auto w-full max-w-screen-xl px-14 lg:px-32">
        <div class="mb-6 text-center text-2xl font-bold lg:text-4xl">
          {{ $t("pages.demo_landing.after_products_block.primary_text") }}
        </div>
        <div class="text-center text-base">
          {{ $t("pages.demo_landing.after_products_block.secondary_text") }}
        </div>
      </div>
    </div>

    <div class="bg-neutral-100 py-10 lg:py-24">
      <div class="mx-auto w-full max-w-screen-xl px-14 lg:px-32">
        <div class="mb-4 text-center text-2xl font-bold lg:text-4xl">
          {{ $t("pages.demo_landing.subscription_block.primary_text") }}
        </div>
        <div class="mb-8 text-center text-lg font-bold">
          {{ $t("pages.demo_landing.subscription_block.secondary_text") }}
        </div>
        <VcInput
          class="mx-auto max-w-lg"
          :placeholder="$t('pages.demo_landing.subscription_block.input_placeholder')"
        />
        <div class="text-center">
          <div class="mt-4">
            <VcCheckbox class="inline-flex">
              {{ $t("pages.demo_landing.subscription_block.agreement_checkbox_label") }}

              <router-link class="text-[--link-color] hover:text-[--link-hover-color]" to="/terms">
                {{ $t("pages.demo_landing.subscription_block.terms_and_policy_link") }}
              </router-link>
            </VcCheckbox>
          </div>

          <VcButton class="mt-10">
            {{ $t("pages.demo_landing.subscription_block.submit_button") }}
          </VcButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useElementVisibility } from "@vueuse/core";
import { onMounted, shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, usePageHead, useProductsRoutes } from "@/core/composables";
import { AddToCart } from "@/shared/cart";
import { ProductCardGrid, useProducts } from "@/shared/catalog";

const { t } = useI18n();
const { products, fetchProducts } = useProducts();

const productsRoutes = useProductsRoutes(products);

const demoPageAnchor = shallowRef<HTMLElement | null>(null);
const demoPageAnchorIsVisible = useElementVisibility(demoPageAnchor);

watch(demoPageAnchorIsVisible, (value) => {
  if (value) {
    usePageHead({
      title: t("pages.demo_landing.meta.title"),
    });
  }
});

useBreadcrumbs([{ title: t("shared.layout.footer.demo_landing_link") }]);

onMounted(async () => {
  await fetchProducts({
    itemsPerPage: 4,
    keyword: "printer",
  });
});
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
