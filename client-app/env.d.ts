/// <reference types="vite/client" />
/// <reference types="@types/gtag.js" />
/// <reference types="@types/google.maps" />

interface Window {
  gtag: Gtag.Gtag;
  google: typeof google;
}
