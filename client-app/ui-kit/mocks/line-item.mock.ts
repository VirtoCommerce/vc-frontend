import { getMoney } from "./money.mock";

const propertiesMock: VcPropertyType[] = [
  {
    name: "Brand",
    value: "GRAINGER APPROVED",
    label: "Brand",
  },
  {
    name: "EYE INSIDE DIA",
    value: "3/4''",
    label: "EYE INSIDE DIA",
  },
  {
    name: "EYEBOLT TYPE",
    value: "Turned Wire",
    label: "EYEBOLT TYPE",
  },
  {
    name: "MATERIAL",
    value: "Steel",
    label: "MATERIAL",
  },
  {
    name: "OVERALL LENGTH",
    value: '2.50"',
    label: "OVERALL LENGTH",
  },
  {
    name: "SYSTEM OF MEASUREMENT",
    value: "Inch",
    label: "SYSTEM OF MEASUREMENT",
  },
  {
    name: "THREAD SIZE",
    value: "3/8-16″",
    label: "THREAD SIZE",
  },
];

export const preparedLineItemMock1: VcLineItemType = {
  id: "52ae03eb-2bf9-4361-9e36-c53f75fe0438",
  name: "Eyebolt, 3/8-16,3/4In, Turned Wire, PK10",
  imageUrl: "https://vcst-dev.govirto.com/cms-content/assets/catalog/7829d/5ZE93/5ZE93.jpg",
  listPrice: getMoney(8.85),
  extendedPrice: getMoney(4062.15),
  sku: "5ZE93",
  properties: propertiesMock.slice(0, 3),
};

export const preparedLineItemMock2: VcLineItemType = {
  id: "4be239b3-a95e-4cb9-8bf7-a1e92e594150",
  name: "Eye Bolt,Carbon Steel 4.6,M6x70,PK25",
  imageUrl: "https://vcst-dev.govirto.com/cms-content/assets/catalog/7829d/38DJ66/5ZA21_AS01.jpg",
  listPrice: getMoney(57.25),
  actualPrice: getMoney(47.25),
  extendedPrice: getMoney(47.25),
  deleted: false,
  route: "/bolts/eyebolts/eye-boltcarbon-steel-46m6x70pk25",
  properties: propertiesMock.slice(0, 3),
};
