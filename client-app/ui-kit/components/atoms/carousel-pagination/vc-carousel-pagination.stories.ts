import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { VcCarouselPagination } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xs", "sm", "md"];

export default {
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
} as Meta<typeof VcCarouselPagination>;

let i = 0;

const Template: StoryFn = (args) => ({
  components: { VcCarouselPagination, Swiper, SwiperSlide },
  setup: () => ({ args, modules: [Pagination], count: i++ }),
  template: `
  <div id="swiper-${i}">
    <Swiper :modules="modules" :pagination="{ clickable: true, el: '#swiper-${i} [data-nav-pagination]' }">
      <SwiperSlide v-for="(i) in [1, 2, 3, 4, 5]" :key="i">{{ i }}</SwiperSlide>
    </Swiper>
    <VcCarouselPagination v-bind="args" data-nav-pagination />
  </div>
  `,
});

export const Basic = Template.bind({});

export const SizeXS = Template.bind({});
SizeXS.args = {
  size: "xs",
};

export const SizeSM = Template.bind({});
SizeSM.args = {
  size: "sm",
};
