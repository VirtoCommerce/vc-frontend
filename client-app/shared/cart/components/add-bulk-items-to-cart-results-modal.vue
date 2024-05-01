<template>
  <VcModal
    :title="$t('shared.cart.add_bulk_items_to_cart_results_modal.title')"
    modal-width="sm:max-w-3xl"
    is-mobile-fullscreen
  >
    <div class="flex-1 gap-y-5 p-6 md:border-b">
      <VcExpansionPanels class="flex flex-col gap-y-4">
        <VcExpansionPanel v-for="(group, index) in groups" :key="group.name" :expanded="!index && groups.length === 1">
          <template #icon>
            <VcIcon v-if="group.name === 'added'" class="text-[--color-success-500]" name="check-circle" />
            <VcIcon v-else-if="group.name === 'not_added'" class="text-[--color-danger-500]" name="x-circle" />
          </template>

          <template #header-content>
            <div class="flex items-center gap-x-2.5">
              <span class="truncate text-sm font-bold normal-case">
                {{ $t(`shared.cart.add_bulk_items_to_cart_results_modal.groups.${group.name}`) }}
              </span>

              <VcBadge class="flex-none" variant="outline" rounded>
                {{ group.items.length }}
              </VcBadge>
            </div>
          </template>

          <div class="max-h-80 overflow-y-auto rounded-[inherit] md:max-h-72">
            <ul class="w-full md:table">
              <li class="top-0 hidden bg-neutral-50 text-sm font-extrabold md:sticky md:table-row">
                <div class="table-cell border-b px-4 py-2.5">
                  {{ $t("shared.cart.add_bulk_items_to_cart_results_modal.labels.sku") }}
                </div>

                <div class="table-cell border-b px-4 py-2.5">
                  {{ $t("shared.cart.add_bulk_items_to_cart_results_modal.labels.product_name") }}
                </div>

                <div class="table-cell border-b px-4 py-2.5 text-right">
                  {{ $t("shared.cart.add_bulk_items_to_cart_results_modal.labels.quantity") }}
                </div>
              </li>

              <li
                v-for="item in group.items"
                :key="item.sku"
                class="flex flex-wrap border-b px-4 py-2.5 text-sm last:border-0 md:table-row md:border-0 md:p-0 md:odd:bg-neutral-50"
              >
                <div class="flex w-3/5 flex-col pr-3 md:table-cell md:w-auto md:px-4 md:py-2.5 md:align-middle">
                  <span class="text-neutral-400 md:hidden">
                    {{ $t("shared.cart.add_bulk_items_to_cart_results_modal.labels.sku") }}
                  </span>
                  <span class="font-semibold">{{ item.sku }}</span>
                </div>

                <div
                  class="order-first mb-2.5 line-clamp-2 w-full shrink-0 md:mb-0 md:line-clamp-none md:table-cell md:w-auto md:px-4 md:py-2.5 md:align-middle"
                >
                  <router-link
                    :to="links[item.productId]"
                    target="_blank"
                    class="font-semibold text-[--link-color] hover:text-[--link-hover-color]"
                  >
                    {{ item.name }}
                  </router-link>
                </div>

                <div
                  class="flex w-2/5 flex-col md:table-cell md:w-auto md:px-4 md:py-2.5 md:text-right md:align-middle"
                >
                  <span class="text-neutral-400 md:hidden">
                    {{ $t("shared.cart.add_bulk_items_to_cart_results_modal.labels.quantity") }}
                  </span>
                  <span class="font-bold">{{ $n(item.quantity) }}</span>
                </div>
              </li>
            </ul>
          </div>
        </VcExpansionPanel>
      </VcExpansionPanels>
    </div>

    <template #actions="{ close }">
      <VcButton :to="{ name: 'Cart' }" class="max-sm:!min-w-full sm:me-auto" @click="close()">
        {{ $t("common.buttons.view_cart") }}
      </VcButton>

      <VcButton variant="outline" @click="print()">
        {{ $t("common.buttons.print") }}
      </VcButton>

      <VcButton
        @click="
          close();
          $emit('confirm');
        "
      >
        {{ $t("common.buttons.ok") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import { useProductsRoutes, useThemeContext } from "@/core/composables";
import { useWhiteLabeling } from "@/shared/account";
import { VcButton } from "@/ui-kit/components";
import type { ItemForAddBulkItemsToCartResultsModalType } from "@/shared/cart";

type GroupType = { name: "added" | "not_added"; items: ItemForAddBulkItemsToCartResultsModalType[] };

interface IEmits {
  (event: "confirm"): void;
}

interface IProps {
  listName: string;
  items?: ItemForAddBulkItemsToCartResultsModalType[];
}

defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
});
const { items } = toRefs(props);

const links = useProductsRoutes(items, { productIdProperty: "productId" });
const { themeContext } = useThemeContext();
const { whiteLabelingSettings } = useWhiteLabeling();
const { d, t } = useI18n();

const groups = computed<GroupType[]>(() => {
  const result: GroupType[] = [];
  const added: ItemForAddBulkItemsToCartResultsModalType[] = [];
  const notAdded: ItemForAddBulkItemsToCartResultsModalType[] = [];

  props.items.forEach((item) => {
    if (item.isAddedToCart) {
      added.push(item);
    } else {
      notAdded.push(item);
    }
  });

  if (added.length) {
    result.push({ name: "added", items: added });
  }

  if (notAdded.length) {
    result.push({ name: "not_added", items: notAdded });
  }

  return result;
});

function getTableRowsHtml(groupedItems: ItemForAddBulkItemsToCartResultsModalType[]) {
  let rows = "";

  groupedItems.forEach((item: ItemForAddBulkItemsToCartResultsModalType) => {
    rows += `
    <tr class="even:bg-[--color-neutral-50]">
      <td class="px-2.5 py-2">${item.name}</td>
      <td class="px-2.5 py-2">${item.sku}</td>
      <td class="px-2.5 py-2">${item.quantity}</td>
    </tr>`;
  });

  return rows;
}

function print() {
  const logo = computed(() => whiteLabelingSettings.value?.logoUrl ?? themeContext.value?.settings?.logo_image);
  const htmlStyle = document.documentElement.attributes.getNamedItem("style")?.textContent;
  const styleLinks = Array.from(document.head.querySelectorAll("link[rel=stylesheet], style"))
    .map((el) => el.outerHTML)
    .join("");

  const headerHtml = `
  <header class="flex justify-between items-start">
    <img class="h-7" src="${logo.value}" alt="">

    <div class="p-2 border border-[--color-neutral-100] rounded text-xs">
      <div class="font-black">${t("common.labels.created_date")}</div>
      <div class="mt-1">${d(new Date())}</div>
    </div>
  </header>`;

  let contentHtml = "";
  const iconName = (groupName: string) => {
    switch (groupName) {
      case "added":
        return "check-circle";
      case "not_added":
        return "x-circle";
    }
  };

  groups.value.forEach((group) => {
    contentHtml += `
    <div class="space-y-3">
      <h3 class="flex items-center gap-1.5 text-sm font-bold">
        <svg class="vc-icon vc-icon--size--sm text-[--color-secondary-300] flex-none">
          <use href="/static/icons/basic/${iconName(group.name)}.svg#icon" />
        </svg>
        ${t(`shared.cart.add_bulk_items_to_cart_results_modal.groups.${group.name}`)}
      </h3>

      <div class="overflow-hidden border border-[--color-neutral-100] rounded">
        <table class="w-full border-collapse text-xs">
          <thead class="bg-[--color-neutral-50] font-bold text-left">
            <th class="px-2.5 py-2 w-1/2">
              ${t("shared.cart.add_bulk_items_to_cart_results_modal.labels.product_name")}
            </th>
            <th class="px-2.5 py-2 w-1/6">
              ${t("shared.cart.add_bulk_items_to_cart_results_modal.labels.sku")}
            </th>
            <th class="px-2.5 py-2 w-2/6">
              ${t("shared.cart.add_bulk_items_to_cart_results_modal.labels.quantity")}
            </th>
          </thead>

          ${getTableRowsHtml(group.items)}
        </table>
      </div>
    </div>`;
  });

  const footerHtml = `
  <div class="flex items-center justify-between py-3 text-xs">
    <div>
      &copy;
      ${new Date().getFullYear()}
      <strong>${t("shared.layout.footer.company_name")}</strong>.
      ${t("shared.layout.footer.all_rights_reserved")}
    </div>

    <div>
      ${t("shared.layout.footer.asp_net_e_commerce_platform")}
      ${t("shared.layout.footer.by_virto")}
    </div>
  </div>`;

  const printWindow = window.open("", "print")!;

  printWindow.document.write(`
  <html style="${htmlStyle}">
    <head>${styleLinks}</head>
    <body class="font-lato">
      <div class="flex flex-col mx-auto h-full min-h-screen w-full max-w-[1024px] p-6 print:p-0">
        ${headerHtml}

        <div class="grow mt-6 px-4 space-y-6">
          <h2 class="text-xl font-bold uppercase">
            ${props.listName}
          </h2>

          ${contentHtml}
        </div>

        ${footerHtml}
      </div>
    </body>
  </html>`);

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  printWindow.document.close();
  printWindow.focus();
}
</script>
