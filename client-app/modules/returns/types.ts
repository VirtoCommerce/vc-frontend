export type ReturnAttachmentFragmentType = {
  name: string;
  url: string;
  size: number;
  mimeType?: string;
};

export type ReturnDraftLineType = {
  orderLineItemId: string;
  name?: string;
  sku?: string;
  measureUnit?: string;
  quantity: number;
  reasonCode: string;
  reasonComment: string;
  serialNumber: string;
  attachments: ReturnAttachmentFragmentType[];
  attachmentUrls: string[];
};

export type ReturnsFilterDataType = {
  statuses: string[];
  startDate?: string;
  endDate?: string;
};

export type ReturnStatusOptionType = {
  code: string;
  label: string;
};
