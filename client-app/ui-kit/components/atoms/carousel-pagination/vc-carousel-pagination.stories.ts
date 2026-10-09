import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { VcCarouselPagination } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];

const meta: Meta<typeof VcCarouselPagination> = {
  title: "Components/Atoms/VcCarouselPagination",
  component: VcCarouselPagination,
  argTypes: {
    size: {
      control: "inline-radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: SIZES.join(" | "),
        },
      },
    },
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcCarouselPagination size="xs" data-nav-pagination />
        `,
      },
    },
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

let swiperId = 0;

const renderCarousel = (args: Record<string, unknown>) => {
  const id = `swiper-${swiperId++}`;
  return {
    components: { Swiper, SwiperSlide },
    setup: () => ({ args, modules: [Pagination], id }),
    template: `
      <div :id="id">
        <Swiper :modules="modules" :pagination="{ clickable: true, el: '#' + id + ' [data-nav-pagination]' }">
          <SwiperSlide v-for="(i) in [1, 2, 3, 4, 5]" :key="i">{{ i }}</SwiperSlide>
        </Swiper>
        <VcCarouselPagination v-bind="args" data-nav-pagination />
      </div>
    `,
  };
};

export const Basic: StoryType = {
  args: {},
  render: renderCarousel,
  parameters: {
    docs: {
      source: {
        code: `
          <div id="swiper-1">
            <Swiper :modules="[Pagination]" :pagination="{ clickable: true, el: '#swiper-1 [data-nav-pagination]' }">
              <SwiperSlide v-for="(i) in [1, 2, 3, 4, 5]" :key="i">{{ i }}</SwiperSlide>
            </Swiper>
            <VcCarouselPagination data-nav-pagination />
          </div>
        `,
      },
    },
  },
};

export const SizeXS: StoryType = {
  args: {
    size: "xs",
  },
  render: renderCarousel,
  parameters: {
    docs: {
      source: {
        code: `
          <div id="swiper-2">
            <Swiper :modules="[Pagination]" :pagination="{ clickable: true, el: '#swiper-2 [data-nav-pagination]' }">
              <SwiperSlide v-for="(i) in [1, 2, 3, 4, 5]" :key="i">{{ i }}</SwiperSlide>
            </Swiper>
            <VcCarouselPagination size="xs" data-nav-pagination />
          </div>
        `,
      },
    },
  },
};

export const SizeSM: StoryType = {
  args: {
    size: "sm",
  },
  render: renderCarousel,
  parameters: {
    docs: {
      source: {
        code: `
          <div id="swiper-3">
            <Swiper :modules="[Pagination]" :pagination="{ clickable: true, el: '#swiper-3 [data-nav-pagination]' }">
              <SwiperSlide v-for="(i) in [1, 2, 3, 4, 5]" :key="i">{{ i }}</SwiperSlide>
            </Swiper>
            <VcCarouselPagination size="sm" data-nav-pagination />
          </div>
        `,
      },
    },
  },
};

export const SizeMD: StoryType = {
  args: {
    size: "md",
  },
  render: renderCarousel,
  parameters: {
    docs: {
      source: {
        code: `
          <div id="swiper-4">
            <Swiper :modules="[Pagination]" :pagination="{ clickable: true, el: '#swiper-4 [data-nav-pagination]' }">
              <SwiperSlide v-for="(i) in [1, 2, 3, 4, 5]" :key="i">{{ i }}</SwiperSlide>
            </Swiper>
            <VcCarouselPagination size="md" data-nav-pagination />
          </div>
        `,
      },
    },
  },
};
