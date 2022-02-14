import Text from "./text.vue";
import Image from "./image.vue";

const pages: { [key: string]: any } = {
  "block-text": Text,
  "block-image": Image,
};

export default pages;
