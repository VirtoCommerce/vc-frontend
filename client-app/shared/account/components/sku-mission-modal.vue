<template>
  <VcModal :title="view.title" max-width="42rem" is-mobile-fullscreen dividers test-id="mission-details-modal">
    <div class="mission-details">
      <!-- Meta -->
      <div class="mission-details__meta">
        <VcChip color="primary" variant="solid-light" size="sm" icon="star" rounded>
          {{ $n(view.rewardPoints, "decimal") }} {{ $t("pages.account.missions.card.points") }}
        </VcChip>

        <span class="mission-details__days">
          <span class="mission-details__dot" :class="`mission-details__dot--${view.dateSeverity}`"></span>
          {{ view.dateLabel }}
        </span>
      </div>

      <p v-if="mission.description" class="mission-details__description">
        {{ mission.description }}
      </p>

      <!-- Products -->
      <ul class="mission-details__items">
        <li v-for="row in rows" :key="row.id" class="mission-details__item">
          <VcImage class="mission-details__image" :src="row.image" :alt="row.name" lazy />

          <div class="mission-details__info">
            <VcTypography tag="span" class="mission-details__name" text-transform="none">
              {{ row.name }}
            </VcTypography>

            <VcChip
              class="mission-details__target"
              size="sm"
              :variant="row.met ? 'solid' : 'outline'"
              :color="row.met ? 'success' : 'neutral'"
              :icon="row.met ? 'check' : undefined"
              rounded
            >
              {{ $t("pages.account.missions.sku_modal.buy_at_least", { count: row.remaining }) }}
            </VcChip>
          </div>

          <div class="mission-details__stepper-wrap">
            <VcQuantityStepper
              v-if="!isMissionCompleted"
              class="mission-details__stepper"
              :model-value="row.quantity"
              :min="0"
              :max="9999"
              allow-zero
              size="sm"
              :aria-label="row.id"
              @update:model-value="setQuantity(row.id, $event)"
            />

            <VcPriceDisplay v-if="row.price" class="mission-details__price" :value="row.price.actual" />
          </div>
        </li>
      </ul>

      <!-- Summary -->
      <dl class="mission-details__summary">
        <div class="mission-details__summary-row">
          <dt>{{ $t("pages.account.missions.sku_modal.total_units") }}</dt>

          <dd>{{ totalUnits }}</dd>
        </div>

        <div class="mission-details__summary-row">
          <dt>{{ $t("pages.account.missions.sku_modal.targets_met") }}</dt>

          <dd :class="{ 'text-success-600': missionCompleted }">{{ summaryMet }} / {{ summaryTarget }}</dd>
        </div>

        <div class="mission-details__summary-row mission-details__summary-row--total">
          <dt>{{ $t("pages.account.missions.sku_modal.cart_subtotal") }}</dt>

          <dd>{{ formatCurrency(cartSubtotal.amount, cartSubtotal.currencyCode) }}</dd>
        </div>
      </dl>
    </div>

    <template #actions="{ close }">
      <span class="mission-details__reward" :class="{ 'mission-details__reward--met': missionCompleted }">
        <VcIcon name="star" size="xs" class="fill-primary" />

        {{
          missionCompleted
            ? $t("pages.account.missions.sku_modal.reward_unlocked", { points: $n(view.rewardPoints, "decimal") })
            : $t("pages.account.missions.sku_modal.reward_hint", { points: $n(view.rewardPoints, "decimal") })
        }}
      </span>

      <VcButton color="secondary" variant="outline" @click="close">
        {{ $t("pages.account.missions.sku_modal.close") }}
      </VcButton>

      <VcButton
        v-if="!isMissionCompleted"
        prepend-icon="cart"
        :loading="addToCartLoading"
        :disabled="!hasItemsToAdd"
        @click="addProductsToCart(close)"
      >
        {{ $t("pages.account.missions.sku_modal.add_to_cart") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { MISSION_STATUS, MISSION_TYPE, useMissionCard } from "@/modules/loyalty/composables";
import { useShortCart } from "@/shared/cart/composables";
import { useNotifications } from "@/shared/notification";
import type { MissionDataType } from "@/modules/loyalty/composables";

const props = defineProps<{
  mission: MissionDataType;
}>();

const { view, formatCurrency } = useMissionCard(() => props.mission);
const { addItemsToCart, changing: addToCartLoading } = useShortCart();
const notifications = useNotifications();
const { t } = useI18n();

// Units the user wants to add to the cart now, keyed by product id.
const quantities = ref<Record<string, number>>({});

const items = computed(() => (props.mission.items ?? []).filter((item) => item != null));

const rows = computed(() =>
  items.value.map((item) => {
    const id = item?.productId ?? "";
    const target = item?.targetQuantity ?? 0;
    const current = item?.currentQuantity ?? 0;
    const quantity = quantities.value[id] ?? 0;

    const remaining = Math.max(target - current, 0);

    return {
      id,
      name: item?.product?.name ?? id,
      image: item?.product?.imgSrc ?? "",
      price: item?.product?.price,
      target,
      // How many units are still needed on top of what's already counted towards the mission.
      remaining: remaining === 0 ? target : remaining,
      quantity,
      met: target > 0 && current + quantity >= target,
    };
  }),
);

const totalUnits = computed(() => rows.value.reduce((sum, row) => sum + row.quantity, 0));
const targetsMet = computed(() => rows.value.filter((row) => row.met).length);

// Sum of unit price * quantity across rows the user is about to add — not returned by the backend.
const cartSubtotal = computed(() => {
  const itemsToAdd = rows.value.filter((row) => row.quantity > 0 && row.price?.actual);
  const amount = itemsToAdd.reduce((sum, row) => sum + row.price!.actual.amount * row.quantity, 0);
  const currencyCode = itemsToAdd[0]?.price?.actual.currency.code;

  return { amount, currencyCode };
});
const isAnyMatch = computed(() => props.mission.missionType === MISSION_TYPE.PerSkuAny);

// PerSkuAny only needs one row met, so the summary caps at "1 of 1"; PerSkuAll needs every row met.
const summaryTarget = computed(() => (isAnyMatch.value ? 1 : rows.value.length));
const summaryMet = computed(() => (isAnyMatch.value ? Math.min(targetsMet.value, 1) : targetsMet.value));
const missionCompleted = computed(() => summaryTarget.value > 0 && summaryMet.value === summaryTarget.value);

// The backend status, not the locally edited quantities, decides whether the mission is actually done.
const isMissionCompleted = computed(() => props.mission.status === MISSION_STATUS.Completed);

function setQuantity(id: string, value: number | undefined): void {
  quantities.value = { ...quantities.value, [id]: value ?? 0 };
}

const hasItemsToAdd = computed(() => rows.value.some((row) => row.quantity > 0));

async function addProductsToCart(close: () => void) {
  const itemsToAdd = rows.value
    .filter((row) => row.quantity > 0)
    .map((row) => ({ productId: row.id, quantity: row.quantity }));

  if (!itemsToAdd.length) {
    return;
  }

  try {
    await addItemsToCart(itemsToAdd);
    notifications.success({ text: t("pages.account.missions.sku_modal.added_to_cart") });
    close();
  } catch {
    notifications.error({ text: t("pages.account.missions.sku_modal.add_to_cart_error") });
  }
}
</script>

<style lang="scss">
.mission-details {
  @apply flex flex-col gap-5 pb-4;

  &__meta {
    @apply flex flex-wrap items-center gap-3;
  }

  &__days {
    @apply flex items-center gap-2 text-sm font-bold text-neutral-600;
  }

  &__dot {
    @apply size-2.5 shrink-0 rounded-full;

    &--safe {
      @apply bg-success-500;
    }

    &--warning {
      @apply bg-warning-500;
    }

    &--danger {
      @apply bg-danger-500;
    }
  }

  &__description {
    @apply text-sm text-neutral-600;
  }

  &__items {
    @apply flex flex-col divide-y divide-neutral-200 border-y border-neutral-200;
  }

  &__item {
    @apply flex items-center gap-4 py-4;
  }

  &__image {
    @apply size-16 shrink-0 rounded-md border border-neutral-200 bg-additional-50 object-contain;
  }

  &__info {
    @apply flex min-w-0 flex-1 flex-col items-start gap-2;
  }

  &__name {
    @apply line-clamp-2 text-sm font-bold text-neutral-900;
  }

  &__stepper-wrap {
    @apply flex shrink-0 flex-col items-end gap-1;
  }

  &__stepper {
    @apply w-32 shrink-0 mb-1;
  }

  &__price {
    @apply text-sm font-bold text-neutral-700;
  }

  &__summary {
    @apply flex flex-col gap-1.5 rounded-lg bg-neutral-50 p-4 border-neutral-200 border;
  }

  &__summary-row {
    @apply flex items-center justify-between text-sm text-neutral-600;

    dd {
      @apply font-bold text-neutral-800;
    }

    &--total {
      @apply mt-1.5 border-t border-dashed border-neutral-300 pt-2.5 text-base font-black text-neutral-900;

      dd {
        @apply font-black text-neutral-900;
      }
    }
  }

  &__reward {
    @apply me-auto flex items-center gap-2 text-sm font-bold text-neutral-500;

    &--met {
      @apply text-success-600;
    }
  }
}
</style>
