<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner grow">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <h2 class="text-gray-800 px-6 md:px-0 text-2xl lg:text-3xl font-bold uppercase mb-5">Bulk Order Pad</h2>

      <div class="grid grid-cols-1 lg:grid-cols-3 lg:gap-y-5 lg:gap-5">
        <!-- Error section -->
        <transition name="slide-fade-top" mode="out-in">
          <VcAlert
            v-if="SKUsWithErrors.length"
            class="mx-6 md:mx-0 mb-5 lg:mb-0 col-span-1 lg:col-span-2"
            type="error"
            key="sku"
            icon
          >
            Products with following SKUs was not added to cart: {{ SKUsWithErrors.join(", ") }}
          </VcAlert>

          <VcAlert
            v-else-if="incorrectData"
            key="incorrect"
            class="mx-6 md:mx-0 mb-5 lg:mb-0 col-span-1 lg:col-span-2"
            type="error"
            icon
          >
            The entered data is invalid
          </VcAlert>
        </transition>

        <!-- Mobile Tabs -->
        <VcTabs
          v-model="activeTab"
          :items="tabs"
          text-field="label"
          value-field="id"
          class="lg:hidden col-span-1 px-3.5 md:px-3 bg-white border-y md:border md:rounded-t shadow-sm"
        />

        <!-- Main section -->
        <div :class="{ hidden: activeTab !== 'manually' }" class="lg:block col-span-1 lg:col-span-2">
          <Manually
            :loading="loadingManually"
            @add-to-cart="addManuallyItems"
            @error="showIncorrectDataError"
            class="bg-white md:rounded-b lg:rounded md:border-x md:border-b lg:border shadow-sm"
          />
        </div>

        <!-- Sidebar -->
        <div :class="{ hidden: activeTab !== 'copy&paste' }" class="lg:block col-span-1">
          <CopyAndPaste
            :loading="loadingCSV"
            @add-to-cart="addItemsFromCSVText"
            @error="showIncorrectDataError"
            class="bg-white md:rounded-b lg:rounded md:border-x md:border-b lg:border shadow-sm"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcAlert, VcTabs } from "@/components";
import { CopyAndPaste, Manually } from "@/shared/bulk-order";
import { InputNewBulkItemType } from "@core/api/graphql/types";
import { useCart } from "@/shared/cart";
import { useRouter } from "vue-router";

const tabs = [
  { id: "manually", label: "Manually" },
  { id: "copy&paste", label: "Copy & Paste" },
];

const router = useRouter();
const { loading: loadingCart, cart, addBulkMultipleItemsToCart } = useCart();

const loadingManually = ref(false);
const loadingCSV = ref(false);
const activeTab = ref<"manually" | "copy&paste">(tabs[0].id as "manually");
const incorrectData = ref(false);
const SKUsWithErrors = ref<string[]>([]);

function showIncorrectDataError() {
  SKUsWithErrors.value = [];
  incorrectData.value = true;
}

async function addItems(items: InputNewBulkItemType[]) {
  incorrectData.value = false;
  SKUsWithErrors.value = [];

  if (!items.length || loadingCart.value) return;

  const { errors } = await addBulkMultipleItemsToCart({
    cartId: cart.value.id,
    cartItems: items,
  });

  if (errors?.length) {
    SKUsWithErrors.value = errors.map((error) => error.objectId!);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } else {
    await router.push({ name: "Checkout" });
  }
}

async function addManuallyItems(items: InputNewBulkItemType[]) {
  loadingManually.value = true;
  await addItems(items);
  loadingManually.value = false;
}

async function addItemsFromCSVText(items: InputNewBulkItemType[]) {
  loadingCSV.value = true;
  await addItems(items);
  loadingCSV.value = false;
}
</script>
