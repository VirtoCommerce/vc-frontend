<template>
  <div class="flex-grow px-[2rem] pt-3.5 pb-7 bg-[color:var(--color-body-bg)] shadow-inner lg:px-[4.688rem] lg:pt-4">
    <h1 class="-ml-0.5 text-[1.75rem] uppercase tracking-wide lg:text-[2.125rem]" v-t="data.branch.title"></h1>

    <div class="mt-4 lg:flex lg:items-start lg:mt-5">
      <div class="lg:flex-grow">
        <div
          class="py-5 px-[1.4rem] rounded border bg-white text-base drop-shadow-[1px_2px_8px_rgba(0,0,0,0.05)] lg:px-8 lg:pt-6 lg:pb-5 lg:rounded-none lg:border-0"
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
          class="mt-6 rounded border bg-white text-base drop-shadow-[1px_2px_8px_rgba(0,0,0,0.05)] lg:mt-0 lg:border-0 lg:rounded-none"
        >
          <div class="py-4 px-6 border-b lg:border-b-0">
            <h2 class="uppercase text-[1.188rem] font-bold tracking-wide">Branch hours</h2>
          </div>
          <div class="m-[1.35rem] text-[0.938rem] border rounded" id="branchHours">
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

      <div
        class="mt-6 rounded border bg-white text-base drop-shadow-[1px_2px_8px_rgba(0,0,0,0.05)] lg:mt-0 lg:ml-8 lg:min-w-[21.125rem]"
      >
        <div class="py-4 px-6 border-b lg:pt-5 lg:pb-4">
          <h2 class="uppercase text-[1.188rem] font-bold tracking-wide">Other branches</h2>
        </div>
        <div class="pt-5 pb-7 px-11 lg:pt-4 lg:px-12 lg:pb-9">
          <ul class="list-disc space-y-7">
            <li class="text-[#F0AD4E] marker:text-[1.25rem]" v-for="branch in data.otherBranches">
              <div class="mb-1 text-[#00739E] text-[1.063rem] font-extrabold lg:text-base" v-t="branch.title"></div>
              <div class="text-[color:var(--color-body-text)] text-sm" v-t="branch.address"></div>
              <div class="text-[color:var(--color-body-text)] text-sm">
                <b>Phone:</b> <span v-t="branch.phone"></span>
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
      phone: "(312) 222-3333",
    },
    {
      title: "Tennessee Branch",
      address: "420 Bridge St Franklin, TN, USA",
      phone: "(312) 222-3333",
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
    @apply px-3.5 py-2.5 border-b text-left;

    &:first-child {
      @apply w-5/12;
    }
  }

  tr {
    @apply even:bg-[#FAFAFA];
  }

  td {
    @apply px-3.5 py-[0.915rem];

    &.closed {
      @apply font-semibold text-[#EC6A5E];
    }
  }
}
</style>
