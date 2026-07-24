<template>
  <VcModal
    ref="modalRef"
    :title="view.title"
    max-width="42rem"
    is-mobile-fullscreen
    dividers
    test-id="sku-mission-modal"
  >
    <div class="sku-mission-modal">
      <!-- Meta -->
      <div class="sku-mission-modal__meta">
        <VcChip color="primary" variant="soft" size="sm" rounded>
          <VcIcon name="star" variant="solid" />
          {{ $n(view.rewardPoints, "decimal") }} {{ $t("pages.account.missions.card.points") }}
        </VcChip>

        <span class="sku-mission-modal__days">
          <VcBadge :color="view.dateSeverity" />

          {{ view.dateLabel }}
        </span>
      </div>

      <p v-if="mission.description" class="sku-mission-modal__description">
        {{ mission.description }}
      </p>

      <!-- Products -->
      <ul class="sku-mission-modal__items">
        <li v-for="row in rows" :key="row.id" class="sku-mission-modal__item">
          <VcImage class="sku-mission-modal__image" :src="row.image" :alt="row.name" lazy />

          <div class="sku-mission-modal__info">
            <VcProductTitle
              class="sku-mission-modal__name"
              :to="row.route"
              :title="row.name"
              :target="browserTarget"
              :lines-number="1"
            >
              {{ row.name }}
            </VcProductTitle>

            <span v-if="row.sku || row.price" class="sku-mission-modal__subtitle">
              <span v-if="row.sku">{{ $t("common.labels.sku") }} #{{ row.sku }}</span>
              ·
              <VcPriceDisplay v-if="row.price" :value="row.price.actual" />
            </span>

            <VcChip
              class="sku-mission-modal__target"
              size="sm"
              :variant="row.met ? 'solid' : 'outline'"
              :color="row.met ? 'success' : 'neutral'"
              :icon="row.met ? 'check' : undefined"
              rounded
            >
              {{ $t("pages.account.missions.sku_modal.buy_at_least", { count: row.remaining }) }}
            </VcChip>
          </div>

          <div class="sku-mission-modal__stepper-wrap">
            <QuantityControl
              v-if="!isMissionCompleted"
              mode="stepper"
              class="sku-mission-modal__stepper"
              :model-value="row.quantity"
              :name="row.id"
              :min-quantity="row.minQuantity"
              :max-quantity="row.maxQuantity"
              :available-quantity="row.availableQuantity"
              :pack-size="row.packSize"
              :is-active="row.isActive"
              :is-available="row.isAvailable"
              :is-buyable="row.isBuyable"
              :is-in-stock="row.isInStock"
              allow-zero
              size="sm"
              @update:model-value="setQuantity(row.id, $event)"
            >
              <div class="sku-mission-modal__badges">
                <InStock
                  :is-in-stock="row.isInStock"
                  :is-available="row.isAvailable"
                  :quantity="row.availableQuantity"
                />

                <CountInCart :product-id="row.id" :currency="row.price?.actual.currency.code" />
              </div>
            </QuantityControl>
          </div>
        </li>
      </ul>

      <!-- Summary -->
      <dl class="sku-mission-modal__summary">
        <div class="sku-mission-modal__summary-row">
          <dt>{{ $t("pages.account.missions.sku_modal.total_units") }}</dt>

          <dd>{{ totalUnits }}</dd>
        </div>

        <div class="sku-mission-modal__summary-row">
          <dt>{{ $t("pages.account.missions.sku_modal.targets_met") }}</dt>

          <dd :class="{ 'text-success-600': missionCompleted }">{{ summaryMet }} / {{ summaryTarget }}</dd>
        </div>

        <div class="sku-mission-modal__summary-row sku-mission-modal__summary-row--total">
          <dt>{{ $t("pages.account.missions.sku_modal.cart_subtotal") }}</dt>

          <dd>{{ formatCurrency(cartSubtotal.amount, cartSubtotal.currencyCode) }}</dd>
        </div>
      </dl>
    </div>

    <template #actions="{ close }">
      <span class="sku-mission-modal__reward" :class="{ 'sku-mission-modal__reward--met': missionCompleted }">
        <VcIcon name="star" size="xs" variant="solid" class="text-primary" />

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
import { useBrowserTarget } from "@/core/composables";
import { getProductRoute } from "@/core/utilities";
import { useShortCart } from "@/shared/cart/composables";
import { CountInCart, InStock } from "@/shared/catalog/components";
import { useNotifications } from "@/shared/notification";
import { MISSION_STATUS, MISSION_TYPE, useMissionCard } from "../composables";
import type { MissionDataType } from "../composables";
import QuantityControl from "@/shared/common/components/quantity-control.vue";

const props = defineProps<{
  mission: MissionDataType;
}>();

const { view, formatCurrency } = useMissionCard(() => props.mission);
const { cart, updateItemCartQuantity, changing: addToCartLoading } = useShortCart();
const { browserTarget } = useBrowserTarget();
const notifications = useNotifications();
const { t } = useI18n();

// Locally edited quantities, keyed by product id — only set once the user touches a stepper.
const quantities = ref<Record<string, number>>({});

const items = computed(() => (props.mission.items ?? []).filter((item) => item != null));

function getCartQuantity(productId: string, currencyCode?: string): number {
  return (
    cart.value?.items.find(
      (cartItem) => cartItem.productId === productId && (!currencyCode || cartItem.currencyCode === currencyCode),
    )?.quantity ?? 0
  );
}

const rows = computed(() =>
  items.value.map((item) => {
    const id = item?.productId ?? "";
    const target = item?.targetQuantity ?? 0;
    const current = item?.currentQuantity ?? 0;
    const inCart = getCartQuantity(id, item?.product?.price?.actual.currency.code);
    const quantity = quantities.value[id] ?? inCart;

    const remaining = Math.max(target - current, 0);

    return {
      id,
      name: item?.product?.name ?? id,
      sku: item?.product?.code,
      route: getProductRoute(id, item?.product?.slug),
      image: item?.product?.imgSrc ?? "",
      price: item?.product?.price,
      minQuantity: item?.product?.minQuantity,
      maxQuantity: item?.product?.maxQuantity,
      availableQuantity: item?.product?.availabilityData?.availableQuantity,
      packSize: item?.product?.packSize,
      isActive: item?.product?.availabilityData?.isActive,
      isAvailable: item?.product?.availabilityData?.isAvailable,
      isBuyable: item?.product?.availabilityData?.isBuyable,
      isInStock: item?.product?.availabilityData?.isInStock,
      target,
      // How many units are still needed on top of what's already counted towards the mission.
      remaining: remaining === 0 ? target : remaining,
      quantity,
      // Quantity already sitting in the cart, so we only submit rows the user actually changed.
      inCart,
      met: target > 0 && current + quantity >= target,
    };
  }),
);

const totalUnits = computed(() => rows.value.reduce((sum, row) => sum + row.quantity, 0));
const targetsMet = computed(() => rows.value.filter((row) => row.met).length);

// Sum of unit price * quantity across rows currently set to a non-zero quantity — not returned by the backend.
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

// Only rows whose quantity actually differs from what's already in the cart need to be submitted.
const changedRows = computed(() => rows.value.filter((row) => row.quantity !== row.inCart));
const hasItemsToAdd = computed(() => changedRows.value.length > 0);

async function addProductsToCart(close: () => void) {
  if (!changedRows.value.length) {
    return;
  }

  try {
    await Promise.all(
      changedRows.value.map((row) => updateItemCartQuantity(row.id, row.quantity, row.price?.actual.currency.code)),
    );
    notifications.success({ text: t("pages.account.missions.sku_modal.added_to_cart") });
    close();
  } catch {
    notifications.error({ text: t("pages.account.missions.sku_modal.add_to_cart_error") });
  }
}
</script>

<style lang="scss">
.sku-mission-modal {
  @apply flex flex-col gap-5 pb-4;

  &__meta {
    @apply flex flex-wrap items-center gap-3;
  }

  &__days {
    @apply flex items-center gap-2 text-sm font-bold text-neutral-600;
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
    @apply size-18 shrink-0 rounded-md border border-neutral-200 bg-additional-50 object-contain;
  }

  &__info {
    @apply flex min-w-0 flex-1 flex-col items-start gap-1 font-semibold;
  }

  &__target {
    @apply mt-2;
  }

  &__badges {
    @apply mt-2 flex gap-1.5;
  }

  &__name {
    --vc-product-title-font-size: theme("fontSize.sm");
    --vc-product-title-text-color: theme("colors.neutral.900");
  }

  &__subtitle {
    @apply flex flex-wrap items-center gap-x-1 text-xs text-neutral-500;
  }

  &__stepper-wrap {
    @apply flex shrink-0 flex-col items-end gap-1;
  }

  &__stepper {
    @apply w-32 shrink-0 mb-1;
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
