export function getEpParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const ep = urlParams.get("ep");

  return ep?.replace(/\/$/, "");
}

export function isPreviewMode(ep?: string): boolean {
  const referrer = document.referrer?.replace(/\/$/, "");

  return Boolean(referrer && ep && referrer === ep);
}
