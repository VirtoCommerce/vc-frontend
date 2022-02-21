<template>
  <div class="pt-7">
    <div class="w-full max-w-screen-2xl mx-auto pb-5 lg:pb-10 px-5 md:px-12">
      <VcBreadcrumbs :items="breadcrumbs"></VcBreadcrumbs>
      <h1 class="font-bold text-gray-900 text-3xl lg:text-4xl mt-5 uppercase">Gaming laptop market overview</h1>
    </div>

    <div class="bg-gray-100 pt-6 pb-16 lg:py-24">
      <div class="w-full max-w-screen-2xl mx-auto px-5 md:px-12">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-10 items-center">
          <div class="order-2 lg:order-1">
            <div class="font-bold text-2xl lg:text-5xl mb-4">Professional purchases have never been that easy</div>
            <div class="text-lg">
              Anything you dream about is possible to realise just at the moment when you decide to win
            </div>
            <div class="flex mt-6 lg:mt-14 space-x-6">
              <VcButton class="w-1/2 lg:w-auto uppercase px-8">Learn more</VcButton>
              <VcButton class="w-1/2 lg:w-auto uppercase px-8 bg-gray-900">Get in touch</VcButton>
            </div>
          </div>
          <div class="bg-gray-200 rounded aspect-video order-1 lg:order-2"></div>
        </div>
      </div>
    </div>

    <div class="bg-white py-10 lg:py-24">
      <div class="w-full max-w-screen-xl mx-auto px-14 lg:px-32">
        <div class="font-bold text-2xl lg:text-4xl mb-6 text-center">
          Readability is primarily the concern of designer
        </div>
        <div class="text-base text-center">
          In quo enim maxime consuevit iactare vestra se repellere, idque instituit docere sic: omne animal, simul atque
          insitam in liberos atque haec ratio late patet in quo quaerimus, non ero tibique, si ob rem aperiam eaque
          ipsa, quae sunt in gravissimo bello animadversionis metu contineret.
        </div>
      </div>
    </div>

    <div class="bg-gray-100 py-10 lg:py-24">
      <div class="w-full max-w-screen-xl mx-auto px-5 md:px-12">
        <div class="font-bold text-2xl lg:text-5xl mb-6 text-center">Explore the features</div>
        <div class="text-base text-center">
          With a crystal-clear camera, real-time HD video display, and intuitive flight controls, what will you create?
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-20 gap-y-10 items-center mt-16 px-8 lg:px-0">
          <div class="text-center">
            <VcImage src="/static/images/demo-landing/feat-1.svg" class="h-24 mx-auto mb-9" />
            <div class="font-roboto-condensed uppercase font-bold text-2xl mb-3">Epic Aerial Video</div>
            <div class="text-sm">
              With the Phantom 3 Professional, you're shooting 4K video at up to 30 frames per second and capturing 12
              megapixel photos.
            </div>
          </div>
          <div class="text-center">
            <VcImage src="/static/images/demo-landing/feat-2.svg" class="h-24 mx-auto mb-9" />
            <div class="font-roboto-condensed uppercase font-bold text-2xl mb-3">Live HD View</div>
            <div class="text-sm">
              Simply connect your phone or tablet, and a 720p HD view of everything your camera sees as you fly is
              displayed live.
            </div>
          </div>
          <div class="text-center">
            <VcImage src="/static/images/demo-landing/feat-3.svg" class="h-24 mx-auto mb-9" />
            <div class="font-roboto-condensed uppercase font-bold text-2xl mb-3">Complete Control</div>
            <div class="text-sm">
              Keep your Phantom 3 fully under your command while accessing the most-used features right on the included
              remote
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-800 py-10 lg:py-24">
      <div class="w-full max-w-screen-xl mx-auto px-5 md:px-12">
        <div class="flex flex-col lg:block justify-between items-center space-y-10">
          <div class="font-bold text-2xl lg:text-3xl text-white text-center">Book a free e-commerce consulting</div>
          <div class="flex w-full items-center justify-center space-x-6">
            <VcButton class="w-1/2 md:w-auto uppercase px-2 md:px-8">Learn more</VcButton>
            <VcButton class="w-1/2 md:w-auto uppercase px-2 md:px-8 bg-gray-50 text-yellow-500">Get in touch</VcButton>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-100 py-10 lg:py-24">
      <div class="w-full max-w-screen-xl mx-auto px-5 md:px-12">
        <h2 class="text-center font-bold text-3xl lg:text-4xl mb-2 lg:mb-4">Game laptops</h2>
        <div class="text-center lg:text-lg">
          With a crystal-clear camera, real-time HD video display, and intuitive flight controls, what will you create?
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-4 mt-12">
          <ProductCardGrid v-for="item in products" :key="item.id" :product="item">
            <template #cart-handler>
              <VcButton v-if="item.variations?.length" :to="`/product/${item.id}`" class="uppercase mb-4">
                Choose
              </VcButton>
              <AddToCart v-else :product="item"></AddToCart>
            </template>
          </ProductCardGrid>
        </div>
      </div>
    </div>

    <div class="bg-white py-10 lg:py-24">
      <div class="w-full max-w-screen-xl mx-auto px-14 lg:px-32">
        <div class="font-bold text-2xl lg:text-4xl mb-6 text-center">
          Readability is primarily the concern of designer
        </div>
        <div class="text-base text-center">
          In quo enim maxime consuevit iactare vestra se repellere, idque instituit docere sic: omne animal, simul atque
          insitam in liberos atque haec ratio late patet in quo quaerimus, non ero tibique, si ob rem aperiam eaque
          ipsa, quae sunt in gravissimo bello animadversionis metu contineret.
        </div>
      </div>
    </div>

    <div class="bg-gray-100 py-10 lg:py-24">
      <div class="w-full max-w-screen-xl mx-auto px-14 lg:px-32">
        <div class="font-bold text-2xl lg:text-4xl mb-4 text-center">Subscribe to our promotions</div>
        <div class="font-bold text-lg mb-8 text-center">And be among the first to hear about upcoming events.</div>
        <VcInput class="max-w-lg mx-auto" placeholder="tanya.hill@example.com" />
        <div class="text-center">
          <div class="mt-4">
            <VcCheckbox class="inline-flex">
              By clicking "Submit" I understand that I consent to opt-in to the
              <router-link class="text-cyan-700 hover:text-cyan-900" to="/terms">Terms and Policy</router-link>
            </VcCheckbox>
          </div>
          <VcButton class="uppercase px-12 mt-10">Submit</VcButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IBreadcrumbs, VcBreadcrumbs, VcButton, VcImage, VcInput, VcCheckbox } from "@/components";
import { onMounted, ref } from "vue";
import { ProductCardGrid, useProducts } from "@/shared/catalog";
import { AddToCart } from "@/shared/cart";

const { products, fetchProducts } = useProducts();

onMounted(async () => {
  await fetchProducts({
    itemsPerPage: 4,
    filter: '"BRAND":"HP"',
  });
});

const breadcrumbs = ref<IBreadcrumbs[]>([
  { title: "Home", url: "/" },
  { title: "Demo landing", url: "/demo-landing" },
]);
</script>
