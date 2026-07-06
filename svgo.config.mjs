export default {
  multipass: true,
  plugins: [
    "preset-default",
    {
      name: "removeAttrs",
      params: { attrs: ["style", "stroke-width", "stroke-linecap", "stroke-linejoin", "class", "width", "height"] },
    },
    {
      name: "addAttributesToSVGElement",
      params: { attributes: [{ id: "icon" }] },
    },
    {
      name: "convertColors",
      params: { currentColor: true },
    },
  ],
};
