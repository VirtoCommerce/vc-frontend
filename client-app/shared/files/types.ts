export interface IFileOptions {
  maxFileCount: number;
  maxFileSize: number;
  allowedExtensions: string[];
}

export interface ISuccessfulFileUpload {
  id: string;
  scope: string;
  name: string;
  contentType: string;
  size: number;
  url: string;
  ownerId: string;
  ownerType: string;
  succeeded: true;
}

export interface IFailedFileUpload {
  succeeded: false;
  name: string;
  errorCode: string;
  errorMessage: string;
  errorParameter?: unknown;
}

export type FileUploadResultType = ISuccessfulFileUpload | IFailedFileUpload;
