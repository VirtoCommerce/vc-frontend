<template>
  <SfTabs :open-tab="1">
    <SfTab data-cy="order-history-tab_my-orders" title="My orders">
      <div v-if="currentOrder">
        <SfButton data-cy="order-history-btn_orders"
                  class="sf-button--text all-orders"
                  @click="currentOrder = null">
          All Orders
        </SfButton>
        <div class="highlighted highlighted--total">
          <SfProperty
            name="Order ID"
            :value="currentOrder.number"
            class="sf-property--full-width property"></SfProperty>
          <SfProperty
            name="Date"
            :value="currentOrder.createdDate"
            class="sf-property--full-width property"></SfProperty>
          <SfProperty
            name="Status"
            :value="currentOrder.status"
            class="sf-property--full-width property"></SfProperty>
          <SfProperty
            name="Total"
            :value="currentOrder.total | money"
            class="sf-property--full-width property"></SfProperty>
        </div>
        <SfTable class="products">
          <SfTableHeading>
            <SfTableHeader class="products__name">
              Product
            </SfTableHeader>
            <SfTableHeader>Quantity</SfTableHeader>
            <SfTableHeader>Price</SfTableHeader>
          </SfTableHeading>
          <SfTableRow v-for="(item, i) in currentOrder.items" :key="i">
            <SfTableData class="products__name">
              <SfLink :link="item.product.name">
                {{ item.name }}
              </SfLink>
            </SfTableData>
            <SfTableData>{{ item.quantity }}</SfTableData>
            <SfTableData>{{ item.price | money }}</SfTableData>
          </SfTableRow>
        </SfTable>
      </div>
      <div v-else>
        <p class="message">
          Check the details and status of your orders in the online store. You can
          also cancel your order or request a return.
        </p>
        <div v-if="orders.length === 0" class="no-orders">
          <p class="no-orders__title">
            You currently have no orders
          </p>
          <SfButton data-cy="order-history-btn_start" class="no-orders__button">
            Start shopping
          </SfButton>
        </div>
        <SfTable v-else class="orders">
          <SfTableHeading>
            <SfTableHeader
              v-for="tableHeader in tableHeaders"
              :key="tableHeader">
              {{ tableHeader }}
            </SfTableHeader>
            <SfTableHeader class="orders__element--right">
              <span class="smartphone-only">Download</span>
              <SfButton
                data-cy="order-history-btn_download-all"
                class="desktop-only sf-button--text orders__download-all"
                @click="downloadOrders()">
                Download all
              </SfButton>
            </SfTableHeader>
          </SfTableHeading>
          <SfTableRow v-for="order in orders" :key="order.id">
            <SfTableData>{{ order.number }}</SfTableData>
            <SfTableData>{{ order.createdDate | moment("YYYY:MM:DD") }}</SfTableData>
            <SfTableData>{{ order.total | money }}</SfTableData>
            <SfTableData>
              <span :class="getStatusTextClass(order)">{{ order.status }}</span>
            </SfTableData>
            <SfTableData class="orders__view orders__element--right">
              <SfButton data-cy="order-history-btn_download"
                        class="sf-button--text smartphone-only"
                        @click="downloadOrder(order)">
                Download
              </SfButton>
              <SfButton data-cy="order-history-btn_view"
                        class="sf-button--text desktop-only"
                        @click="currentOrder = order">
                View details
              </SfButton>
            </SfTableData>
          </SfTableRow>
        </SfTable>
      </div>
    </SfTab>
    <SfTab data-cy="order-history-tab_returns" title="Returns">
      <p class="message">
        This feature is not implemented yet!
      </p>
    </SfTab>
  </SfTabs>
</template>

<script>
import {
  SfTabs,
  SfTable,
  SfButton,
  SfProperty,
  SfLink
} from '@storefront-ui/vue';
import { computed, ref, onMounted } from '@vue/composition-api';
import { useUserOrders } from '@libs/account';


export default {
  components: {
    SfTabs,
    SfTable,
    SfButton,
    SfProperty,
    SfLink
  },
  setup() {
    const { myOrders, totalCount, loading, loadMyOrders } = useUserOrders();
    const currentOrder = ref(null);

    onMounted(async () => {
      await loadMyOrders();
    });

    const tableHeaders = [
      'Order ID',
      'Payment date',
      'Amount',
      'Status'
    ];

    const getStatusTextClass = (order) => {
      const status = order.status;
      switch (status) {
      case 'new':
        return 'text-warning';
      case 'completed':
        return 'text-success';
      default:
        return '';
      }
    };


    const downloadFile = (file, name) => {
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';

      const url = window.URL.createObjectURL(file);
      a.href = url;
      a.download = name;
      a.click();
      window.URL.revokeObjectURL(url);
    };

    const downloadOrders = async () => {
      downloadFile(new Blob([JSON.stringify(myOrders.value)], {type: 'application/json'}), 'orders.json');
    };

    const downloadOrder = async (order) => {
      downloadFile(new Blob([JSON.stringify(order)], {type: 'application/json'}), 'order ' + order.id + '.json');
    };

    return {
      tableHeaders,
      orders: computed(() => myOrders ? myOrders.value : []),
      getStatusTextClass,
      downloadOrder,
      downloadOrders,
      currentOrder
    };
  }
};
</script>

<style lang='scss' scoped>
@import "~@storefront-ui/vue/styles";
.no-orders {
  &__title {
    margin: 0 0 var(--spacer-lg) 0;
    font: var(--font-weight--normal) var(--font-size--base) / 1.6 var(--font-family--primary);
  }
  &__button {
    --button-width: 100%;
    @include for-desktop {
      --button-width: 17,5rem;
    }
  }
}
.orders {
  @include for-desktop {
    &__element {
      &--right {
        --table-column-flex: 0;
        text-align: right;
      }
    }
  }
}
.all-orders {
  --button-padding: var(--spacer-base) 0;
}
.message {
  margin: 0 0 var(--spacer-xl) 0;
  font: var(--font-weight--light) var(--font-size--base) / 1.6 var(--font-family--primary);
  &__link {
    color: var(--c-primary);
    --link-weight: var(--font-weight--medium);
    --link-font-family: var(--font-family--primary);
    --link-font-size: var(--font-size--base);
    text-decoration: none;
    &:hover {
      color: var(--c-text);
    }
  }
}
.product {
  &__properties {
    margin: var(--spacer-xl) 0 0 0;
  }
  &__property,
  &__action {
    font-size: var(--font-size--sm);
  }
  &__action {
    color: var(--c-gray-variant);
    font-size: var(--font-size--sm);
    margin: 0 0 var(--spacer-sm) 0;
    &:last-child {
      margin: 0;
    }
  }
  &__qty {
    color: var(--c-text);
  }
}
.products {
  --table-column-flex: 1;
  &__name {
    margin-right: var(--spacer-sm);
    @include for-desktop {
      --table-column-flex: 2;
    }
  }
}
.highlighted {
  box-sizing: border-box;
  width: 100%;
  background-color: var(--c-light);
  padding: var(--spacer-sm);
  --property-value-font-size: var(--font-size--base);
  --property-name-font-size: var(--font-size--base);
  &:last-child {
    margin-bottom: 0;
  }
  ::v-deep .sf-property__name {
    white-space: nowrap;
  }
  ::v-deep .sf-property__value {
    text-align: right;
  }
  &--total {
    margin-bottom: var(--spacer-sm);
  }
  @include for-desktop {
    padding: var(--spacer-xl);
    --property-name-font-size: var(--font-size--lg);
    --property-name-font-weight: var(--font-weight--medium);
    --property-value-font-size: var(--font-size--lg);
    --property-value-font-weight: var(--font-weight--semibold);
  }
}

</style>
