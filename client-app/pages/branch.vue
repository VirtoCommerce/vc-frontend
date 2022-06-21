<template>
  <div class="flex-grow px-[2rem] py-3.5 bg-[color:var(--color-body-bg)] shadow-inner">
    <h1 class="-ml-0.5 text-[1.75rem] uppercase tracking-wide">Chicago branch</h1>

    <div class="mt-4 space-y-6">
      <div class="py-5 px-[1.4rem] rounded border bg-white text-base drop-shadow-[1px_2px_8px_rgba(0,0,0,0.05)]">
        <div class="flex flex-wrap mt-0.5">
          <div class="mb-1 mr-1 font-bold">{{ $t("pages.branch.address") }}</div>
          <div class="mb-1">Cooper Square New York, New York, USA 10003</div>
        </div>

        <div class="flex flex-wrap">
          <div class="mb-1 mr-1 font-bold">{{ $t("pages.branch.phone") }}</div>
          <div class="mb-1">18004434555</div>
        </div>
      </div>

      <div class="rounded border bg-white text-base drop-shadow-[1px_2px_8px_rgba(0,0,0,0.05)]">
        <div class="py-4 px-6 border-b">
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
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
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
