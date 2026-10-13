declare global {interface Window {__RAINBOW_ASSETS__?:Record<string,string>}}
export const asset=(name:string)=>window.__RAINBOW_ASSETS__?.[name]??`${import.meta.env.BASE_URL||'/'}rainbow_blocks_assets/${name}`;
