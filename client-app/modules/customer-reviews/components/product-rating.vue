<template>
  <div class="product-rating">
    <VcRating mode="full" read-only :value="rating.value" :size="size" :with-text="false" />

    <span class="product-rating__value">{{ formattedValue }}</span>

    <span v-if="withReviewCount" class="product-rating__count">
      · {{ $t("common.labels.reviews_count", rating.reviewCount) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Rating } from "@/core/api/graphql/types";

interface IProps {
  rating: Rating;
  size?: VcRatingSizeType;
  withReviewCount?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  size: "sm",
});

const { n } = useI18n();

const formattedValue = computed(() => n(props.rating.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
</script>

<style lang="scss">
.product-rating {
  @apply flex items-center gap-2;

  &__value {
    @apply text-sm font-bold;
  }

  &__count {
    @apply text-sm text-neutral-500;
  }
}
</style>
