import type { WhiteLabelingSettingsType } from "@/core/types";

export const whileLabelingSettings: WhiteLabelingSettingsType[] = [
  {
    userId: "cfcec63a-faa5-4511-9aef-ee7672af6710",
    organizationId: "f081c52234754c9c8229aa42d6a19220",
    logoUrl: "/static/images/common/logo-1.svg",
    secondaryLogoUrl: "/static/images/common/logo-white-1.svg",
    favIconUrl: "/static/icons/favicon-1.svg",
    footerLinks: [
      {
        title: "Company Details",
        url: "/company-details",
        childItems: [
          {
            title: "About Us",
            url: "/about-us",
          },
          {
            title: "Investor Relations",
            url: "/investor-relations",
          },
        ],
      },
      {
        title: "Customer Support",
        url: "/customer-support",
        childItems: [
          {
            title: "Catalog Request",
            url: "/catalog-request",
          },
          {
            title: "Contact Us",
            url: "/contact-us",
          },
        ],
      },
    ],
  },
  {
    userId: "07e6a601-b90e-4dbd-a7d0-0f1f89db4f2e",
    organizationId: "",
    logoUrl: "/static/images/common/logo.svg",
    secondaryLogoUrl: "/static/images/common/logo-white.svg",
    favIconUrl: "/static/icons/favicon.svg",
  },
];
