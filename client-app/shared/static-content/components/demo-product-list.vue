<template>
  <div class="demo-product-list-block pb-16 pt-6" :class="background">
    <div class="mx-auto w-full max-w-screen-2xl px-5 md:px-12">
      <h2 class="mb-4 text-center text-2xl">{{ title }}</h2>

      <VcMarkdownRender v-if="content" :src="content" class="my-12 text-center text-lg" />
    </div>

    <div class="flex flex-row justify-center space-x-4">
      <template v-for="(item, index) in products" :key="index">
        <div v-if="item.product" class="flex w-48 flex-col">
          <VcImage
            :src="item.product.imgSrc"
            :alt="item.product.name"
            size-suffix="md"
            class="size-full select-none space-x-4 rounded object-cover object-center"
          />

          <div class="flex flex-row space-x-4">
            <div class="grow truncate">{{ item.product.name }}</div>

            <div class="whitespace-nowrap">{{ item.product.prices[0].list.formattedAmount }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  background?: string;
  title?: string;
  content?: string;
  products: Array<{
    product: {
      id: string;
      code: string;
      name: string;
      imgSrc: string;
      prices: Array<{
        currency: string;
        list: {
          formattedAmount: string;
        };
      }>;
    };
  }>;
}

defineProps<IProps>();
</script>

<style lang="scss">
.demo-product-list-block {
  &.bg-neutral-800 {
    color: white;
  }

  li {
    list-style-position: inside;
  }
}
</style>
