<template>
  <VcModal
    ref="modalRef"
    class="sku-mission-modal"
    :title="view.title"
    max-width="60rem"
    is-mobile-fullscreen
    dividers
    test-id="sku-mission-modal"
  >
    <div class="sku-mission-modal__content">
      <!-- Meta -->
      <div class="sku-mission-modal__meta">
        <VcChip color="warning" variant="tonal" size="sm" rounded>
          <VcIcon name="star" variant="solid" />
          {{ $n(view.rewardPoints, "decimal") }} {{ $t("pages.account.missions.card.points") }}
        </VcChip>

        <MissionDateBadge :severity="view.dateSeverity" :label="view.dateLabel" />
      </div>

      <p v-if="mission.description" class="sku-mission-modal__description">
        {{ mission.description }}
      </p>

      <!-- Products -->
      <VcLineItems
        class="sku-mission-modal__items"
        :items="lineItems"
        :browser-target="browserTarget"
        with-image
        with-properties
        with-price
        with-total
      >
        <template v-if="!isMissionCompleted" #titles>
          <div class="text-center">
            {{ $t("common.labels.quantity") }}
          </div>
        </template>

        <template #after-title="{ item }">
          <VcChip
            class="sku-mission-modal__target"
            size="sm"
            :variant="rowsById[item.id].met ? 'solid' : 'outline'"
            :color="rowsById[item.id].met ? 'success' : 'neutral'"
            :icon="rowsById[item.id].met ? 'check' : undefined"
            rounded
          >
            {{ $t("pages.account.missions.sku_modal.buy_at_least", { count: rowsById[item.id].remaining }) }}
          </VcChip>
        </template>

        <template v-if="!isMissionCompleted" #default="{ item }">
          <QuantityControl
            mode="stepper"
            class="sku-mission-modal__stepper"
            :model-value="rowsById[item.id].quantity"
            :name="item.id"
            :min-quantity="rowsById[item.id].minQuantity"
            :max-quantity="rowsById[item.id].maxQuantity"
            :available-quantity="rowsById[item.id].availableQuantity"
            :pack-size="rowsById[item.id].packSize"
            :is-active="rowsById[item.id].isActive"
            :is-available="rowsById[item.id].isAvailable"
            :is-buyable="rowsById[item.id].isBuyable"
            :is-in-stock="rowsById[item.id].isInStock"
            allow-zero
            size="sm"
            @update:model-value="setQuantity(item.id, $event)"
            @update:validation="setValidation(item.id, $event)"
          >
            <div class="sku-mission-modal__badges">
              <InStock
                :is-in-stock="rowsById[item.id].isInStock"
                :is-available="rowsById[item.id].isAvailable"
                :quantity="rowsById[item.id].availableQuantity"
              />

              <CountInCart :product-id="item.id" :currency="rowsById[item.id].price?.actual.currency.code" />
            </div>
          </QuantityControl>
        </template>
      </VcLineItems>

      <!-- Summary -->
      <div class="sku-mission-modal__summary">
        <dl class="sku-mission-modal__summary-list">
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

        <p class="sku-mission-modal__summary-hint">
          {{ $t("pages.account.missions.sku_modal.subtotal_hint") }}
        </p>
      </div>
    </div>

    <template #actions="{ close }">
      <div class="sku-mission-modal__actions">
        <span class="sku-mission-modal__reward" :class="{ 'sku-mission-modal__reward--met': missionCompleted }">
          <VcIcon name="star" size="xs" variant="solid" class="text-primary" />

          {{
            missionCompleted
              ? $t("pages.account.missions.sku_modal.reward_unlocked", { points: $n(view.rewardPoints, "decimal") })
              : $t("pages.account.missions.sku_modal.reward_hint", { points: $n(view.rewardPoints, "decimal") })
          }}
        </span>

        <VcButton class="sku-mission-modal__action" color="secondary" variant="outline" @click="close">
          {{ $t("pages.account.missions.sku_modal.close") }}
        </VcButton>

        <VcButton
          v-if="!isMissionCompleted"
          class="sku-mission-modal__action"
          prepend-icon="cart"
          :loading="addToCartLoading"
          :disabled="!hasItemsToAdd"
          @click="addProductsToCart(close)"
        >
          {{ $t("pages.account.missions.sku_modal.add_to_cart") }}
        </VcButton>
      </div>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useBrowserTarget } from "@/core/composables";
import { getProductRoute } from "@/core/utilities";
import { useShortCart } from "@/shared/cart/composables";
import { CountInCart, InStock } from "@/shared/catalog/components";
import { useCloseModalOnRouteChange } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import { MISSION_STATUS, MISSION_TYPE, useMissionCard } from "../composables";
import MissionDateBadge from "./mission-date-badge.vue";
import type { MissionDataType } from "../composables";
import type { MoneyType, Property } from "@/core/api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";
import QuantityControl from "@/shared/common/components/quantity-control.vue";

interface IProps {
  mission: MissionDataType;
}

const props = defineProps<IProps>();

const modalRef = useTemplateRef<{ close: () => void }>("modalRef");
useCloseModalOnRouteChange(() => modalRef.value?.close());

const { view, formatCurrency } = useMissionCard(() => props.mission);
const { cart, updateItemCartQuantity, changing: addToCartLoading } = useShortCart();
const { browserTarget } = useBrowserTarget();
const notifications = useNotifications();
const { t } = useI18n();

// Locally edited quantities, keyed by product id — only set once the user touches a stepper.
const quantities = ref<Record<string, number>>({});
const rowValidity = ref<Record<string, boolean>>({});

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
      // QuantityControl treats a missing flag as "true" while InStock treats it as "false" —
      // default to false so a product without availability data can't be added.
      isActive: item?.product?.availabilityData?.isActive ?? false,
      isAvailable: item?.product?.availabilityData?.isAvailable ?? false,
      isBuyable: item?.product?.availabilityData?.isBuyable ?? false,
      isInStock: item?.product?.availabilityData?.isInStock ?? false,
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

const rowsById = computed(() => Object.fromEntries(rows.value.map((row) => [row.id, row])));

// The mission query returns a trimmed price, so the table's money values are built from it here.
function toMoney(amount: number, currencyCode?: string): MoneyType {
  return {
    amount,
    formattedAmount: formatCurrency(amount, currencyCode),
    currency: { code: currencyCode },
  } as MoneyType;
}

const lineItems = computed<PreparedLineItemType[]>(() =>
  rows.value.map((row) => {
    const price = row.price?.actual;
    const unitPrice = price ? toMoney(price.amount, price.currency.code) : undefined;

    return {
      id: row.id,
      name: row.name,
      imageUrl: row.image,
      route: row.route,
      sku: row.sku,
      properties: row.sku ? [{ name: "sku", label: t("common.labels.sku"), value: row.sku } as Property] : [],
      listPrice: unitPrice,
      actualPrice: unitPrice,
      extendedPrice: price ? toMoney(price.amount * row.quantity, price.currency.code) : undefined,
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

function setValidation(id: string, validation: { isValid: true } | { isValid: false; errorMessage: string }): void {
  rowValidity.value = { ...rowValidity.value, [id]: validation.isValid };
}

// Only rows whose quantity actually differs from what's already in the cart need to be submitted.
const changedRows = computed(() => rows.value.filter((row) => row.quantity !== row.inCart));
const hasItemsToAdd = computed(
  () => changedRows.value.length > 0 && changedRows.value.every((row) => rowValidity.value[row.id] !== false),
);

async function addProductsToCart(close: () => void) {
  if (!changedRows.value.length) {
    return;
  }

  try {
    await Promise.all(
      changedRows.value.map((row) => updateItemCartQuantity(row.id, row.quantity, row.price?.actual.currency.code)),
    );
    notifications.success({
      text: t("pages.account.missions.sku_modal.added_to_cart"),
      duration: 10000,
    });
    close();
  } catch {
    notifications.error({
      text: t("pages.account.missions.sku_modal.add_to_cart_error"),
      duration: 10000,
    });
  }
}
</script>

<style lang="scss">
.sku-mission-modal {
  &__content {
    @apply flex flex-col gap-5 pb-4;
  }

  &__meta {
    @apply flex flex-wrap items-center gap-3;
  }

  &__description {
    @apply text-sm text-neutral-600;
  }

  &__target {
    @apply mt-2;
  }

  &__items .vc-line-item__name-actions {
    @apply block;
  }

  &__badges {
    @apply mt-2 flex gap-1.5;
  }

  &__stepper {
    @apply w-32;
  }

  &__summary {
    @apply flex flex-col gap-3 rounded-[--vc-radius] bg-neutral-50 p-4 border-neutral-200 border;
  }

  &__summary-list {
    @apply flex flex-col gap-1.5;
  }

  &__summary-hint {
    @apply text-xs text-neutral-500;
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

  // Own footer container so the actions follow the viewport, not the ui-kit's container queries.
  &__actions {
    @apply flex w-full flex-wrap items-center gap-x-5 gap-y-2;

    @media (min-width: theme("screens.md")) {
      @apply flex-nowrap;
    }
  }

  &__reward {
    @apply flex basis-full items-center gap-2 text-sm font-bold text-neutral-500;

    &--met {
      @apply text-success-600;
    }

    @media (min-width: theme("screens.md")) {
      @apply me-auto basis-auto;
    }
  }

  &__action {
    @apply w-full;

    // Below `md` the buttons share a row of their own, splitting the full width.
    @media (min-width: theme("screens.sm")) {
      @apply w-auto flex-1;
    }

    @media (min-width: theme("screens.md")) {
      @apply min-w-32 flex-none;
    }
  }
}
</style>
