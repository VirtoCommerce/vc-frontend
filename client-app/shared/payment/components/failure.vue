<template>
  <div
    class="py-16 xl:py-36 px-9 xl:px-20 sm:bg-[url('/static/images/payment/payment-failed.png')] bg-no-repeat bg-contain [background-position:_114%_40px] xl:[background-position:_105%_60px]"
  >
    <div class="max-w-sm">
      <h2
        class="text-[color:var(--color-danger)] sm:text-black text-2xl font-semibold mb-3"
        v-t="'shared.payment.payment_failure.title'"
      />

      <p v-t="'shared.payment.payment_failure.text'" />

      <div class="flex flex-wrap gap-x-5 gap-y-4 mt-9">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
