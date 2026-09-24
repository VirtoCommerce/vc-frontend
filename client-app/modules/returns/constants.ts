export const MODULE_ID = "VirtoCommerce.Return";
export const ENABLED_KEY = "Return.ReturnEnabled";
export const ATTACHMENTS_REQUIRED_KEY = "Return.AttachmentsRequired";
export const FILE_UPLOAD_SCOPE = "return-attachments";
export const VIEW_ORGANIZATION_RETURNS_PERMISSION = "xapi:my_organization:return:view";

export const RETURN_ACTION = {
  EDIT: "edit",
  SUBMIT: "submit",
  CANCEL: "cancel",
} as const;

export const RETURN_SCOPE = {
  ORGANIZATION: "organization",
  OWN: "own",
} as const;
