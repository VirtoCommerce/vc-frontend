export interface IFileOptions {
  maxFileCount: number;
  maxFileSize: number;
  allowedExtensions: string[];
}

export interface IFile {
  id: string;
  scope: string;
  name: string;
  contentType: string;
  size: number;
  url: string;
  ownerId: string;
  ownerType: string;
}

export interface ISuccessfulFileUpload extends IFile {
  succeeded: true;
}

export interface IFailedFileUpload {
  succeeded: false;
  name: string;
  errorCode: string;
  errorMessage: string;
  errorParameter: string;
}

export type FileUploadResultType = ISuccessfulFileUpload | IFailedFileUpload;
