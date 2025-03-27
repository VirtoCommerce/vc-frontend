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
      grouped[prop.name] = prop;
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
    imgSrc: "http://image",
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
    imageUrl: "http://lineitem-image",
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
  it("should group line items by vendor and place items without vendor last", () => {
    const item1 = createMockLineItem();
    const item2 = createMockLineItem({ id: "li2", vendor: createMockVendor("v2", "Beta") });
    const item3 = createMockLineItem({ id: "li3", vendor: undefined });
    const item4 = createMockLineItem({ id: "li4" }); // Default vendor is Alpha

    // Cast items to LineItemType to satisfy generic constraints
    const result = groupByVendor([
      item1 as unknown as LineItemType,
      item2 as unknown as LineItemType,
      item3 as unknown as LineItemType,
      item4 as unknown as LineItemType,
    ]);
    expect(result).toHaveLength(3);
    expect(result[0].vendor).toEqual({ id: "v1", name: "Alpha" });
    expect(result[0].items).toEqual([item1, item4]);
    expect(result[1].vendor).toEqual({ id: "v2", name: "Beta" });
    expect(result[1].items).toEqual([item2]);
    expect(result[2].vendor).toBeUndefined();
    expect(result[2].items).toEqual([item3]);
  });
});

describe("prepareLineItem", () => {
  it("should prepare a line item with a non-variation product", () => {
    const product = createMockProduct({
      slug: "normal-product",
      price: createPrice(150),
      properties: [
        createProperty("color", "red"),
        createProperty("size", "M"),
        createProperty("material", "cotton"),
        createProperty("extra", "none"),
      ],
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
    expect(prepared.properties).toHaveLength(3);
  });

  it("should prepare a line item for a variation product", () => {
    const product = createMockProduct({
      slug: "variation-product",
      price: createPrice(200),
      properties: [createProperty("weight", "1kg")],
      masterVariation: createMockVariation(),
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
    expect(prepared.route).toBe(`/product/${product.masterVariation!.id}-${product.masterVariation!.slug}`);
  });

  it("should handle a line item without a product", () => {
    // Create a line item mock
    const lineItem = createMockLineItem({
      id: "li-deleted",
      listPrice: createMoney(100),
      salePrice: createMoney(90),
      placedPrice: undefined,
      extendedPrice: createMoney(80),
    });

    // Then explicitly set product to undefined
    lineItem.product = undefined;

    const prepared = prepareLineItem(lineItem);

    expect(prepared.deleted).toBe(true);
    expect(prepared.listPrice).toBeDefined();
    expect(prepared.listPrice?.amount).toBe(100);
    expect(prepared.actualPrice).toBeDefined();
    expect(prepared.actualPrice?.amount).toBe(90);
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
});

describe("prepareLineItemForProduct", () => {
  it("should prepare a line item from a product", () => {
    const product = createMockProduct({
      id: "p2",
      name: "New Product",
      imgSrc: "http://newimage",
      code: "SKU_NEW",
      slug: "new-product",
      availabilityData: createAvailabilityData(50),
      price: createPrice(250),
    });
    const prepared = prepareLineItemForProduct(product, 2);

    expect(prepared.id).toBe(product.id);
    expect(prepared.listPrice).toBeDefined();
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
});

describe("edge cases", () => {
  it("should handle undefined properties in groupByVendor", () => {
    const result = groupByVendor([]);
    expect(result).toHaveLength(1);
    expect(result[0].vendor).toBeUndefined();
    expect(result[0].items).toEqual([]);
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
});
