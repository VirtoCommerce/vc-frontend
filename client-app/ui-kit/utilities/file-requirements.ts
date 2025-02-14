import { useI18n } from "vue-i18n";
import { getFileSize } from "./file-size";

export function formatsHint(allowedExtensions: Readonly<string[]>) {
  const { t } = useI18n();

  if (allowedExtensions?.length) {
    return allowedExtensions.map((el) => el.replace(/^\./, "").toUpperCase()).join(", ");
  }
  return t("ui_kit.file_uploader.any_format");
}

export function fileSizeHint(fileSize: number) {
  const { n } = useI18n();
  const maxFileSize = getFileSize(fileSize);

  return n(maxFileSize.value, {
    notation: "compact",
    style: "unit",
    unit: maxFileSize.unit,
    unitDisplay: "narrow",
  });
}

export function fileRequirements(allowedExtensions: Readonly<string[]>, maxFileSize: number, maxFileCount: number) {
  const { t } = useI18n();

  return t("ui_kit.file_uploader.requirements", {
    formats: formatsHint(allowedExtensions),
    fileSize: fileSizeHint(maxFileSize),
    maxFileCount: maxFileCount,
  });
}
