<template>
  <div class="flex-grow px-8 pt-5 pb-7 bg-[color:var(--color-body-bg)] shadow-inner xl:px-19 lg:pt-5 lg:pb-11">
    <h1 class="-ml-0.5 text-28 uppercase font-bold lg:text-34" v-t="data.branch.title"></h1>

    <div class="mt-4 lg:flex lg:items-start lg:mt-6">
      <div class="lg:flex-grow lg:rounded lg:border lg:drop-shadow-md-x lg:bg-white">
        <div
          class="py-5 px-[1.4rem] rounded border bg-white text-base drop-shadow-md-x lg:bg-transparent lg:drop-shadow-none lg:px-8 lg:pt-6 lg:pb-5 lg:rounded-none lg:border-0"
        >
          <div class="mt-0.5 mb-1 lg:mb-0.5">
            <div class="mb-1 mr-1 font-bold lg:mb-2">{{ $t("pages.branch.address") }}</div>
            <div class="" v-t="data.branch.address"></div>
          </div>

          <div class="flex flex-wrap mb-1">
            <div class="mr-1 font-bold">{{ $t("pages.branch.phone") }}</div>
            <div class="" v-t="data.branch.phone"></div>
          </div>
        </div>

        <div
          class="mt-6 rounded border bg-white text-base drop-shadow-md-x lg:bg-transparent lg:drop-shadow-none lg:mt-0 lg:border-0 lg:rounded-none"
        >
          <div class="hidden h-[18px] bg-gradient-to-b from-[#94949421] lg:block"></div>

          <div class="py-4 px-6 border-b lg:py-3 lg:px-8 lg:border-b-0">
            <h2 class="uppercase text-19 font-extrabold lg:text-21">{{ $t("pages.branch.branch_hours") }}</h2>
          </div>
          <div class="m-[1.375rem] text-15 font-medium border rounded lg:mx-8 lg:mt-1.5 lg:mb-9" id="branchHours">
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>MON</td>
                  <td>7:30 AM - 5:00 PM</td>
                </tr>
                <tr>
                  <td>TUE</td>
                  <td>7:30 AM - 5:00 PM</td>
                </tr>
                <tr>
                  <td>WED</td>
                  <td>7:30 AM - 5:00 PM</td>
                </tr>
                <tr>
                  <td>THU</td>
                  <td>7:30 AM - 5:00 PM</td>
                </tr>
                <tr>
                  <td>FRI</td>
                  <td>7:30 AM - 5:00 PM</td>
                </tr>
                <tr>
                  <td>SAT</td>
                  <td class="closed">Closed</td>
                </tr>
                <tr>
                  <td>SUN</td>
                  <td class="closed">Closed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="mt-6 rounded border bg-white text-base drop-shadow-md-x lg:mt-0 lg:ml-8 lg:min-w-[21.125rem]">
        <div class="py-4 px-6 border-b lg:pt-5 lg:pb-4">
          <h2 class="uppercase text-19 font-extrabold lg:text-21">{{ $t("pages.branch.other_branches") }}</h2>
        </div>
        <div class="pt-5 pb-7 px-11 lg:pt-3.5 lg:px-12 lg:pb-9">
          <ul class="list-disc space-y-7">
            <li class="text-primary marker:text-xl" v-for="branch in data.otherBranches">
              <div class="mb-1 text-link text-[1.063rem] font-extrabold lg:text-base" v-t="branch.title"></div>
              <div class="text-[color:var(--color-body-text)] text-sm" v-t="branch.address"></div>
              <div class="text-[color:var(--color-body-text)] text-sm">
                <b>{{ $t("pages.branch.phone") }}</b> <span v-t="branch.phone"></span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const data = {
  branch: {
    title: "Chicago branch",
    address: "Cooper Square New York, New York, USA 10003",
    phone: "18004434555",
  },
  otherBranches: [
    {
      title: "Los Angeles Branch",
      address: "5400 N. Lakewood Avenue Chicago, Illinois, USA 60640",
      phone: "(312) 222-3333",
    },
    {
      title: "New York Branch",
      address: "790 7th Ave New York, New York, USA 10019",
      phone: "(312) 222-3334",
    },
    {
      title: "Tennessee Branch",
      address: "420 Bridge St Franklin, TN, USA",
      phone: "(312) 222-3335",
    },
  ],
};
</script>

<style lang="scss">
#branchHours {
  table {
    @apply table-fixed border-collapse w-full;
  }

  th {
    @apply px-3.5 py-2.5 border-b text-left lg:px-5 lg:pt-3;

    &:first-child {
      @apply w-5/12 lg:w-52;
    }
  }

  tr {
    @apply even:bg-[#FAFAFA];
  }

  td {
    @apply px-3.5 py-3.5 lg:px-5 lg:py-[1.035rem];

    &.closed {
      @apply font-semibold text-[#EC6A5E];
    }
  }
}
</style>
