<template>
  <b-modal id="orderDetailsModal"
           :visible="!!order"
           :no-enforce-focus="true"
           hide-footer
           size="lg"
           @hide="onHide">
    <div slot="modal-title">
      {{ $t("account.orders.order-details.title") }}
    </div>
    <div role="tablist">
      <b-card no-body class="mb-1 border-0">
        <b-card-header v-b-toggle.accordion-1
                       header-tag="header"
                       class="p-3 bg-white"
                       role="tab">
          <div class="d-flex justify-content-between align-items-center">
            <b :class="{ 'text-primary': showDetails }">{{ $t("account.orders.order-details.details") }}</b>
            <font-awesome-layers v-if="showDetails" :class="{ 'text-primary': showDetails }">
              <font-awesome-icon :icon="faAngleUp" size="lg"></font-awesome-icon>
            </font-awesome-layers>
            <font-awesome-layers v-if="!showDetails">
              <font-awesome-icon :icon="faAngleDown" size="lg"></font-awesome-icon>
            </font-awesome-layers>
          </div>
        </b-card-header>
        <b-collapse
          id="accordion-1"
          :value="showDetails"
          visible
          accordion="my-accordion"
          role="tabpanel">
          <b-card-body v-if="order">
            <order-details-totals :order="order"></order-details-totals>
          </b-card-body>
        </b-collapse>
      </b-card>

      <b-card no-body class="mb-1 border-0">
        <b-card-header v-b-toggle.accordion-2
                       header-tag="header"
                       class="p-3 bg-white"
                       role="tab">
          <div class="d-flex justify-content-between align-items-center">
            <b :class="{ 'text-primary': showOrderDetails }">{{ $t("account.orders.order-details.order-details") }}</b>
            <font-awesome-layers v-if="showOrderDetails" :class="{ 'text-primary': showOrderDetails }">
              <font-awesome-icon :icon="faAngleUp" size="lg"></font-awesome-icon>
            </font-awesome-layers>
            <font-awesome-layers v-if="!showOrderDetails">
              <font-awesome-icon :icon="faAngleDown" size="lg"></font-awesome-icon>
            </font-awesome-layers>
          </div>
        </b-card-header>
        <b-collapse v-if="order"
                    id="accordion-2"
                    :value="showOrderDetails"
                    accordion="my-accordion"
                    role="tabpanel">
          <b-card-body v-for="item in order.items" :key="item.id">
            <order-details-item :item="item"></order-details-item>
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>
  </b-modal>
</template>

<script lang="ts" src="./order-details-modal"></script>
