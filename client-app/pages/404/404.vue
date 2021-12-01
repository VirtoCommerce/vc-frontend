<template>
  <div class="polygon-bg">
    <div class="mx-auto w-3/5 py-5">
      <div class="flex justify-between gap-16">
        <div class="flex flex-col py-12">
          <h1 class="text-black-800 text-7xl md:text-8xl font-black mb-5 font-lato">404</h1>
          <h2 class="text-black-800 text-2xl md:text-4xl font-bold mb-2 font-lato">Page Not Found</h2>
          <p class="text-gray-700 text-base md:text-xl leading-relaxed mb-10 font-lato">We suggest you back to home</p>
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
          <img src="/assets/static/images/404.png" alt="Page not found" class="max-w-md" />
        </div>
      </div>
    </div>
  </div>
</template>
