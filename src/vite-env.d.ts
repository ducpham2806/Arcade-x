/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />


interface ImportMetaEnv {
  /** Tank Clash: wss room servers allowed to receive the player's access token (comma separated). */
  readonly VITE_TANK_CLASH_SERVERS?: string;
}
