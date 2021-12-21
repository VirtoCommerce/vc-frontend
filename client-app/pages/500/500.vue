<template>
  <div class="polygon-bg flex-grow">
    <div class="mx-auto w-4/5 lg:w-3/5 pt-5 md:pb-32">
      <div class="flex justify-between md:gap-16">
        <div class="flex flex-col py-12">
          <h1 class="text-black-800 text-7xl md:text-8xl font-black mb-5">500</h1>
          <h2 class="text-black-800 text-2xl md:text-4xl font-bold mb-2">Internal Server Error</h2>
          <p class="text-gray-700 text-base md:text-xl leading-relaxed mb-10">We suggest you back to home</p>
          <div>
            <router-link
              to="/"
              tag="button"
              class="bg-yellow-500 hover:bg-yellow-600 uppercase font-bold rounded text-white px-9 py-3 text-base whitespace-nowrap font-roboto"
              >Home page</router-link
            >
          </div>
        </div>
        <div class="hidden md:block py-5">
          <img src="/assets/static/images/errors/500.webp" alt="Internal Server Error" class="w-full max-w-md" />
        </div>
      </div>
    </div>
  </div>
</template>
