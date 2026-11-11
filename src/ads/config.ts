export type AdPlacement = 'L1' | 'L2';
export interface AdsConfig {
  enabled: boolean;
  siteReady: boolean;
  production: boolean;
  client: string;
  units: Partial<Record<AdPlacement, string>>;
}
export const disabledAdsConfig: AdsConfig = Object.freeze({enabled:false, siteReady:false, production:false, client:'', units:Object.freeze({})});
export function readAdsConfig(env: Record<string, unknown>): AdsConfig {
  return {
    enabled: env.VITE_ADS_ENABLED === 'true', siteReady: env.VITE_ADS_SITE_READY === 'true',
    production: env.PROD === true && env.VITE_ADS_DEPLOYMENT === 'production', client: typeof env.VITE_ADS_CLIENT === 'string' ? env.VITE_ADS_CLIENT : '',
    units: {L1: typeof env.VITE_ADS_L1 === 'string' ? env.VITE_ADS_L1 : '', L2: typeof env.VITE_ADS_L2 === 'string' ? env.VITE_ADS_L2 : ''},
  };
}
export function validAdUnit(config: AdsConfig, placement: AdPlacement) {
  return /^ca-pub-\d{16}$/.test(config.client) && /^\d{10}$/.test(config.units[placement] || '');
}
