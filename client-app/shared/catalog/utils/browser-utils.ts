export function getBrowserZoom() {
  return Math.round(((window.outerWidth - 10) / window.innerWidth) * 100) / 100;
}
