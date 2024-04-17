export type FooterLinkType = {
  title: string;
  url: string;
  childItems?: FooterLinkType[];
};

export type WhiteLabelingSettingsType = {
  userId: string;
  organizationId: string;
  logoUrl?: string;
  secondaryLogoUrl?: string;
  favIconUrl?: string;
  footerLinks?: FooterLinkType[];
};
