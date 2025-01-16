import type { Assign } from "utility-types";

function mutate<TTarget extends IFile, TSource extends IFile>(
  target: TTarget,
  source: Partial<TSource>, // TODO: Properly check type
): Assign<TTarget, TSource> {
  return Object.assign(target, source) as Assign<TTarget, TSource>;
}

export function isAttachedFile(file: FileType): file is IAttachedFile {
  return file.status === "attached";
}

export function toAttachedFile(
  name: string,
  size: number,
  contentType: string | undefined,
  url: string,
): IAttachedFile {
  return {
    name,
    size,
    contentType,
    status: "attached",
    url,
  };
}

export function isNewfile(file: FileType): file is INewFile {
  return file.status === "new";
}

export function toNewFile(file: File): INewFile {
  return {
    name: file.name,
    size: file.size,
    contentType: file.type,
    status: "new",
    progress: 0,
    file,
  };
}

export function isUploadingFile(file: FileType): file is IUploadingFile {
  return file.status === "uploading";
}

export function toUploadingFile(file: INewFile): IUploadingFile {
  return mutate<INewFile, IUploadingFile>(file, {
    status: "uploading",
  });
}

export function isUploadedFile(file: FileType): file is IUploadedFile {
  return file.status === "uploaded";
}

export function toUploadedFile(file: IUploadingFile, id: string, url: string): IUploadedFile {
  return mutate<IUploadingFile, IUploadedFile>(file, {
    status: "uploaded",
    progress: 100,
    id,
    url,
  });
}

export function isFailedFile(file: FileType): file is IFailedFile {
  return file.status === "error";
}

export function toFailedFile(file: FileType, errorMessage?: string): IFailedFile {
  return mutate<FileType, IFailedFile>(file, {
    status: "error",
    errorMessage,
  });
}

export function isRemovedFile(file: FileType): file is IRemovedFile {
  return file.status === "removed";
}

export function toRemovedFile(file: FileType): IRemovedFile {
  return mutate<FileType, IRemovedFile>(file, {
    status: "removed",
  });
}

export function isFilenameOnly(src: string): boolean {
  return /^[a-zA-Z0-9._-]+(\.[a-zA-Z0-9]+)?$/.test(src);
}
