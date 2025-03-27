import { describe, it, expect, vi } from "vitest";
import { PropertyType, PropertyValueTypes } from "@/core/api/graphql/types";
import { groupByVendor, prepareLineItem, prepareLineItems, prepareLineItemForProduct } from "./index";
import type {
  Product,
  PriceType,
  MoneyType,
  LineItemType,
  VariationType,
  Property,
  CommonVendor,
} from "@/core/api/graphql/types";

// Mock dependencies
vi.mock("../product", () => ({
  getProductRoute: (id: string, slug: string) => `/product/${id}-${slug}`,
}));

vi.mock("../properties", () => ({
  getPropertiesGroupedByName: (props: Property[]): Record<string, Property> => {
    return props.reduce((grouped: Record<string, Property>, prop: Property) => {
      if (grouped[prop.name]) {
        grouped[prop.name].value += `, ${prop.value}`;
      } else {
        grouped[prop.name] = prop;
      }
      return grouped;
    }, {});
  },
}));

function createMoney(value: number): MoneyType {
  return {
    amount: value,
    currency: {
      code: "USD",
      cultureName: "en-US",
      englishName: "United States Dollar",
      exchangeRate: 1,
      symbol: "$",
    },
    decimalDigits: 2,
    formattedAmount: `$${value.toFixed(2)}`,
    formattedAmountWithoutCurrency: value.toFixed(2),
    formattedAmountWithoutPoint: value.toFixed(2).replace(".", ""),
    formattedAmountWithoutPointAndCurrency: value.toFixed(2).replace(".", ""),
  };
}

// Factory function for PriceType with all required fields
function createPrice(value: number): PriceType {
  const money = createMoney(value);
  const zeroMoney = createMoney(0);
  const basePrice = {
    ...money,
    actual: money,
    actualWithTax: money,
    discountAmount: zeroMoney,
    discountAmountWithTax: zeroMoney,
    basePrice: money,
    finalPrice: money,
    tax: zeroMoney,
    taxRate: 0,
    discountPercent: 0,
  };

  return {
    ...basePrice,
    currency: "USD",
    discounts: [],
    list: { ...basePrice },
    listWithTax: { ...basePrice },
    sale: { ...basePrice },
    saleWithTax: { ...basePrice },
    tierPrices: [],
  };
}

// Factory function for AvailabilityData
function createAvailabilityData(availableQuantity: number) {
  return {
    availableQuantity,
    inventories: [],
    isActive: true,
    isAvailable: true,
    isBuyable: true,
    extra1: "",
    extra2: "",
    extra3: "",
    isEstimated: false,
    isInStock: true,
    isTrackInventory: true,
  };
}

// Factory function for full Property object, returning type Property
function createProperty(name: string, value: string): Property {
  const property: Property = {
    id: name,
    name,
    value,
    label: name,
    hidden: false,
    multivalue: false,
    sortOrder: 0,
    type: "default",
    propertyType: PropertyType.Category,
    propertyValueType: PropertyValueTypes.ShortText,
  } as Property;

  return property;
}

// Factory functions for mock data

function createMockVendor(id: string, name: string): CommonVendor {
  return { id, name };
}

function createMockVariation(overrides: Partial<VariationType> = {}): VariationType {
  return {
    id: "mv1",
    slug: "master-var",
    assets: [],
    availabilityData: createAvailabilityData(100),
    code: "VAR_CODE",
    images: [],
    name: "Master Variation",
    price: createPrice(100),
    prices: [createPrice(100)],
    properties: [],
    // Additional properties if required can be added here
    ...overrides,
  };
}

function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    assets: [],
    availabilityData: createAvailabilityData(100),
    breadcrumbs: [],
    code: "SKU_1",
    descriptions: [],
    hasVariations: false,
    id: "p1",
    images: [],
    imgSrc: "https://image",
    isConfigurable: false,
    inWishlist: false,
    keyProperties: [],
    maxQuantity: 10,
    minQuantity: 1,
    name: "Test Product",
    outlines: [],
    packSize: 1,
    price: createPrice(100),
    prices: [createPrice(100)],
    productType: "TYPE_A",
    properties: [],
    seoInfo: {
      id: "seo-info",
      isActive: true,
      objectId: "p1",
      objectType: "product",
      semanticUrl: "test-product",
    },
    slug: "test-product",
    variations: [],
    wishlistIds: [],
    ...overrides,
  };
}

function createMockLineItem(overrides: Partial<LineItemType> = {}): LineItemType {
  return {
    id: "li1",
    name: "Test Line Item",
    imageUrl: "https://lineitem-image",
    vendor: createMockVendor("v1", "Alpha"),
    product: createMockProduct(),
    productId: "p1",
    sku: "SKU_LI",
    quantity: 1,
    catalogId: "catalog1",
    createdDate: new Date(),
    discountAmount: createMoney(0),
    discountAmountWithTax: createMoney(0),
    extendedPrice: createMoney(100),
    listPrice: createMoney(100),
    listPriceWithTax: createMoney(100),
    discountTotal: createMoney(0),
    discountTotalWithTax: createMoney(0),
    discounts: [],
    extendedPriceWithTax: createMoney(100),
    listTotal: createMoney(100),
    inStockQuantity: 100,
    isGift: false,
    isReadOnly: false,
    isReccuring: false,
    isValid: true,
    listTotalWithTax: createMoney(100),
    objectType: "lineItem",
    placedPrice: createMoney(100),
    placedPriceWithTax: createMoney(100),
    salePrice: createMoney(100),
    salePriceWithTax: createMoney(100),
    selectedForCheckout: false,
    showPlacedPrice: false,
    requiredShipping: false,
    taxDetails: [],
    taxPercentRate: 0,
    taxTotal: createMoney(0),
    validationErrors: [],
    ...overrides,
  };
}

describe("groupByVendor", () => {
  it("should group all items with the same vendor together, with empty vendor group empty", () => {
    const vendor = createMockVendor("v1", "Alpha");
    const item1 = createMockLineItem({ id: "li1", vendor });
    const item2 = createMockLineItem({ id: "li2", vendor });
    const result = groupByVendor([item1, item2]);

    expect(result).toHaveLength(2);
    expect(result[0].vendor).toEqual(vendor);
    expect(result[0].items).toEqual([item1, item2]);
    expect(result[1].vendor).toBeUndefined();
    expect(result[1].items).toEqual([]);
  });

  it("should sort vendor groups alphabetically by vendor name and then add the group without vendor at the end", () => {
    const vendorA = createMockVendor("v1", "Alpha");
    const vendorB = createMockVendor("v2", "Beta");
    const vendorC = createMockVendor("v3", "Charlie");

    const item1 = createMockLineItem({ id: "li1", vendor: vendorB });
    const item2 = createMockLineItem({ id: "li2", vendor: vendorC });
    const item3 = createMockLineItem({ id: "li3", vendor: vendorA });

    const result = groupByVendor([item1, item2, item3]);

    expect(result[0].vendor).toEqual(vendorA);
    expect(result[1].vendor).toEqual(vendorB);
    expect(result[2].vendor).toEqual(vendorC);

    expect(result[3].vendor).toBeUndefined();
  });

  it("should handle vendors with empty or undefined name properly", () => {
    const vendorEmpty = createMockVendor("v1", "");
    const vendorNormal = createMockVendor("v2", "Beta");
    const item1 = createMockLineItem({ id: "li1", vendor: vendorNormal });
    const item2 = createMockLineItem({ id: "li2", vendor: vendorEmpty });
    const result = groupByVendor([item1, item2]);

    // An empty string is lexically less than a non-empty string,
    // so the vendor with an empty name should come first.
    expect(result[0].vendor).toEqual(vendorEmpty);
    expect(result[1].vendor).toEqual(vendorNormal);
    expect(result[2].vendor).toBeUndefined();
  });

  it("should handle empty array", () => {
    const result = groupByVendor([]);
    expect(result).toHaveLength(1);
    expect(result[0].vendor).toBeUndefined();
    expect(result[0].items).toEqual([]);
  });

  it("should handle all line items without a vendor", () => {
    const item1 = createMockLineItem({ id: "li1", vendor: undefined });
    const item2 = createMockLineItem({ id: "li2", vendor: undefined });
    const result = groupByVendor([item1, item2]);
    expect(result).toHaveLength(1);
    expect(result[0].vendor).toBeUndefined();
    expect(result[0].items).toEqual([item1, item2]);
  });
});

describe("prepareLineItem", () => {
  it("should prepare a line item with a non-variation product", () => {
    const product = createMockProduct({
      slug: "normal-product",
      price: createPrice(150),
      properties: [createProperty("color", "red"), createProperty("size", "M")],
    });
    const lineItem = createMockLineItem({
      id: "li-normal",
      product,
      productId: product.id,
      listPrice: createMoney(150),
      salePrice: createMoney(140),
      placedPrice: createMoney(130),
      extendedPrice: createMoney(120),
      quantity: 2,
    });
    const prepared = prepareLineItem(lineItem);
    expect(prepared.actualPrice).toEqual(createMoney(130));
    expect(prepared.route).toBe(`/product/${lineItem.productId}-normal-product`);
    expect(prepared.properties).toHaveLength(2);
  });

  it("should prepare a line item for a variation product", () => {
    const product = createMockProduct({
      slug: "variation-product",
      price: createPrice(200),
      properties: [createProperty("weight", "1kg")],
      variations: [createMockVariation()],
      hasVariations: true,
    });
    const lineItem = createMockLineItem({
      id: "li-var",
      product,
      productId: product.id,
      listPrice: createMoney(200),
      salePrice: createMoney(190),
      placedPrice: createMoney(180),
      extendedPrice: createMoney(170),
      quantity: 3,
    });
    const prepared = prepareLineItem(lineItem);
    expect(prepared.actualPrice).toEqual(createMoney(180));
    expect(prepared.properties).toHaveLength(1);
    expect(prepared.variations).toHaveLength(1);
  });

  it("should prioritize prices correctly", () => {
    // Test with only listPrice
    const item1 = createMockLineItem({
      listPrice: createMoney(100),
      salePrice: undefined,
      placedPrice: undefined,
    });
    expect(prepareLineItem(item1).actualPrice).toEqual(createMoney(100));

    // Test with listPrice and salePrice
    const item2 = createMockLineItem({
      listPrice: createMoney(100),
      salePrice: createMoney(90),
      placedPrice: undefined,
    });
    expect(prepareLineItem(item2).actualPrice).toEqual(createMoney(90));

    // Test with all prices (placedPrice should take precedence)
    const item3 = createMockLineItem({
      listPrice: createMoney(100),
      salePrice: createMoney(90),
      placedPrice: createMoney(80),
    });
    expect(prepareLineItem(item3).actualPrice).toEqual(createMoney(80));
  });

  it("should handle line items with no prices", () => {
    const lineItem = createMockLineItem({
      listPrice: undefined,
      salePrice: undefined,
      placedPrice: undefined,
      extendedPrice: undefined,
    });
    const prepared = prepareLineItem(lineItem);
    expect(prepared.listPrice).toBeUndefined();
    expect(prepared.actualPrice).toBeUndefined();
    expect(prepared.extendedPrice).toBeUndefined();
  });

  it("should use proper fallbacks for max quantity", () => {
    // maxQuantity from product.maxQuantity
    const product1 = createMockProduct({ maxQuantity: 50 });
    const lineItem1 = createMockLineItem({ product: product1 });
    expect(prepareLineItem(lineItem1).maxQuantity).toBe(50);

    // maxQuantity from inStockQuantity when product.maxQuantity is undefined
    const product2 = createMockProduct({ maxQuantity: undefined });
    const lineItem2 = createMockLineItem({
      product: product2,
      inStockQuantity: 30,
    });
    expect(prepareLineItem(lineItem2).maxQuantity).toBe(30);

    // maxQuantity from availabilityData when others are undefined
    const product3 = createMockProduct({
      maxQuantity: undefined,
      availabilityData: createAvailabilityData(20),
    });
    const lineItem3 = createMockLineItem({
      product: product3,
      inStockQuantity: undefined,
    });
    expect(prepareLineItem(lineItem3).maxQuantity).toBe(20);
  });

  it("should default name to empty string if name is missing", () => {
    const lineItem = createMockLineItem({ name: undefined });
    const prepared = prepareLineItem(lineItem);
    expect(prepared.name).toBe("");
  });

  it("should mark line item as deleted if product is undefined", () => {
    const lineItem = createMockLineItem({ product: undefined });
    const prepared = prepareLineItem(lineItem);
    expect(prepared.deleted).toBe(true);
  });

  it("should limit properties array to first three even if more are provided", () => {
    const extraProperties = [
      createProperty("prop1", "val1"),
      createProperty("prop2", "val2"),
      createProperty("prop3", "val3"),
      createProperty("prop4", "val4"),
      createProperty("prop5", "val5"),
    ];
    const product = createMockProduct({ properties: extraProperties });
    const lineItem = createMockLineItem({ product });
    const prepared = prepareLineItem(lineItem);
    expect(prepared.properties!.length).toBe(3);
    expect(prepared.properties!.map((p) => p.name)).toEqual(["prop1", "prop2", "prop3"]);
  });

  it("should propagate countInCart parameter", () => {
    const lineItem = createMockLineItem();
    const prepared = prepareLineItem(lineItem, 7);
    expect(prepared.countInCart).toBe(7);
  });

  it("should use inStockQuantity from line item if provided over product availabilityData", () => {
    const product = createMockProduct({ availabilityData: createAvailabilityData(50) });
    const lineItem = createMockLineItem({ product, inStockQuantity: 80 });
    const prepared = prepareLineItem(lineItem);
    expect(prepared.inStockQuantity).toBe(80);
  });

  it("should propagate showPlacedPrice flag", () => {
    const lineItem = createMockLineItem({ showPlacedPrice: true });
    const prepared = prepareLineItem(lineItem);
    expect(prepared.showPlacedPrice).toBe(true);
  });

  it("should use productType from line item if present", () => {
    const lineItem = createMockLineItem({ productType: "customType" });
    const prepared = prepareLineItem(lineItem);
    expect(prepared.productType).toBe("customType");
  });

  it("should default properties to empty array when product properties are undefined", () => {
    const product = createMockProduct({ properties: undefined });
    const lineItem = createMockLineItem({ product });
    const prepared = prepareLineItem(lineItem);
    expect(prepared.properties).toEqual([]);
  });

  it("should include configurationItems if provided", () => {
    const configurationItems = [{ id: "conf1", name: "Config 1", type: "text" }];
    const lineItem = createMockLineItem({
      configurationItems,
    });
    const prepared = prepareLineItem(lineItem);
    expect(prepared.configurationItems).toEqual(configurationItems);
  });

  it("should not include configurationItems if not provided", () => {
    const lineItem = createMockLineItem({
      configurationItems: undefined,
    });
    const prepared = prepareLineItem(lineItem);
    expect(prepared.configurationItems).toBeUndefined();
  });

  it("should group properties by name", () => {
    // Create properties with duplicate names.
    const property1 = createProperty("color", "red");
    const property2 = createProperty("color", "blue");
    const property3 = createProperty("size", "M");

    const product = createMockProduct({
      properties: [property1, property2, property3],
    });
    const lineItem = createMockLineItem({ product });
    const prepared = prepareLineItem(lineItem);

    expect(prepared.properties).toHaveLength(2);
    expect(prepared.properties?.find((p) => p.name === "color")?.value).toEqual("red, blue");
    expect(prepared.properties?.find((p) => p.name === "size")?.value).toEqual("M");
  });

  it("should use master variation's route when product has masterVariation", () => {
    const masterVariation = createMockVariation({ id: "mv2", slug: "master-var2" });
    const product = createMockProduct({
      slug: "should-not-use-this",
      masterVariation,
    });
    const lineItem = createMockLineItem({ product });
    const prepared = prepareLineItem(lineItem);
    // The route should be generated from the masterVariation.
    expect(prepared.route).toBe(`/product/${masterVariation.id}-${masterVariation.slug}`);
  });
});

describe("prepareLineItems", () => {
  it("should prepare an array of line items", () => {
    const item1 = createMockLineItem({
      id: "li1",
      listPrice: createMoney(100),
      salePrice: createMoney(90),
      placedPrice: createMoney(80),
      extendedPrice: createMoney(70),
    });
    const item2 = createMockLineItem({
      id: "li2",
      vendor: createMockVendor("v3", "Gamma"),
      listPrice: createMoney(200),
      salePrice: createMoney(180),
      placedPrice: createMoney(160),
      extendedPrice: createMoney(150),
    });
    const preparedItems = prepareLineItems([item1, item2]);
    expect(preparedItems).toHaveLength(2);
    expect(preparedItems[0].actualPrice).toEqual(createMoney(80));
    expect(preparedItems[1].actualPrice).toEqual(createMoney(160));
  });

  it("should return an empty array when input is empty", () => {
    const preparedItems = prepareLineItems([]);
    expect(preparedItems).toEqual([]);
  });
});

describe("prepareLineItemForProduct", () => {
  it("should prepare a line item from a product", () => {
    const product = createMockProduct({
      id: "p2",
      name: "New Product",
      imgSrc: "https://newimage",
      code: "SKU_NEW",
      slug: "new-product",
      availabilityData: createAvailabilityData(50),
      price: createPrice(250),
    });
    const prepared = prepareLineItemForProduct(product, 2);

    expect(prepared.id).toBe(product.id);
    expect(prepared.listPrice?.amount).toBe(250);
    expect(prepared.countInCart).toBe(2);
    expect(prepared.route).toBe(`/product/${product.id}-new-product`);
  });

  it("should handle a product without a price", () => {
    const product = createMockProduct({
      id: "p3",
      price: undefined,
    });
    const prepared = prepareLineItemForProduct(product);
    expect(prepared.listPrice).toBeUndefined();
    expect(prepared.actualPrice).toBeUndefined();
  });

  it("should use availability data from product", () => {
    const product = createMockProduct({
      maxQuantity: undefined,
      availabilityData: createAvailabilityData(75),
    });
    const prepared = prepareLineItemForProduct(product);
    expect(prepared.inStockQuantity).toBe(75);
    expect(prepared.maxQuantity).toBe(75);
  });

  it("should handle a product without availabilityData", () => {
    const product = createMockProduct({
      id: "p6",
      name: "No Availability Product",
      imgSrc: "https://image",
      code: "SKU_NO_AVAIL",
      slug: "no-availability",
      availabilityData: undefined,
      price: createPrice(400),
      maxQuantity: undefined,
    });

    const prepared = prepareLineItemForProduct(product, 3);

    expect(prepared.inStockQuantity).toBeUndefined();
    expect(prepared.maxQuantity).toBeUndefined();
  });
});
