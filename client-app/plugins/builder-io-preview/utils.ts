export function isPreviewMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const isEditing = urlParams.get("__builder_editing__");

  return Boolean(isEditing);
}
