<template>
  <VcWidget
    class="product-configuration"
    prepend-icon="adjustments"
    :title="$t('shared.catalog.product_details.product_configuration.title')"
    size="lg"
  >
    <div class="product-configuration__widgets">
      <VcWidget collapsible size="xs">
        <template #title>
          Title
          <div class="product-configuration__description">
            Colorful Party Balloons 100pcs 12inch Chrome Metallic Helium Balloons for Birthday Party Decoration and Arch
            Decoration
          </div>
        </template>

        <div class="product-configuration__items">
          <VcProductCard v-for="i in ['1', '2', '3']" :key="i" view-mode="item" class="product-configuration__item">
            <template #media>
              <VcRadioButton :value="i" name="radio" />
              <VcProductImage />
            </template>

            <VcProductTitle to="#">Product Title</VcProductTitle>

            <VcProductProperties>
              <VcProperty label="Property 1" value="Value 1" />
              <VcProperty label="Property 2" value="Value 1" />
              <VcProperty label="Property 3" value="Value 1" />
              <VcProperty class="@2xl:hidden" label="Price per item">
                <VcPriceDisplay />
              </VcProperty>
            </VcProductProperties>

            <VcProductPrice />

            <VcAddToCart hide-button />

            <VcProductTotal />
          </VcProductCard>

          <VcProductCard view-mode="item" class="product-configuration__item">
            <template #media>
              <VcRadioButton value="none" name="radio" />
              <VcProductImage />
            </template>

            <VcProductTitle title="None" />
          </VcProductCard>
        </div>
      </VcWidget>
    </div>
  </VcWidget>
</template>

<script setup lang="ts"></script>

<style lang="scss">
.product-configuration {
  &__widgets {
    @apply space-y-5;
  }

  &__description {
    @apply mt-1 text-xs font-normal normal-case text-neutral;
  }

  &__items {
    @apply @container mt-5;

    @container (max-width: theme("containers.2xl")) {
      @apply space-y-3;
    }
  }

  &__item {
    @container (max-width: theme("containers.2xl")) {
      @apply border rounded;
    }

    @container (min-width: theme("containers.2xl")) {
      &:nth-child(odd) {
        @apply bg-neutral-50;
      }

      &:first-child {
        @apply rounded-t;
      }

      &:last-child {
        @apply rounded-b;
      }
    }
  }
}
</style>
