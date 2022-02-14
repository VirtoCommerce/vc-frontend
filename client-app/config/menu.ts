import SeoUrl from "@core/seo-routes.enum";

export default {
  header: {
    main: [
      { id: "home", title: "Home", url: "/" },
      {
        id: "catalog",
        title: "All products",
        children: [
          { title: "Carriage Bolts", url: `/${SeoUrl.Catalog}/carriage-bolts` },
          { title: "Flange Bolts", url: `/${SeoUrl.Catalog}/flange-bolts` },
          { title: "Laser Printers", url: `/${SeoUrl.Catalog}/multifunction-printers` },
          { title: "Inkjet Printers", url: `/${SeoUrl.Catalog}/all-in-one` },
        ],
      },
      { id: "bulk", title: "Bulk order pad", url: "/bulk-order" },
      { id: "checkout", title: "Cart", url: "/checkout" },
      { id: "contact", title: "Contact us", url: "/contact" },
    ],
  },
  footer: [],
};
