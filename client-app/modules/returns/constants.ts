export const MODULE_ID = "VirtoCommerce.Return";
export const ENABLED_KEY = "Return.ReturnEnabled";
export const ATTACHMENTS_REQUIRED_KEY = "Return.AttachmentsRequired";
export const FILE_UPLOAD_SCOPE_KEY = "Return.FileUploadScopeName";
export const DEFAULT_FILE_UPLOAD_SCOPE = "return-attachments";

/** Action codes the server reports in availableActions. */
export const RETURN_ACTION = {
  EDIT: "edit",
  SUBMIT: "submit",
  CANCEL: "cancel",
} as const;
