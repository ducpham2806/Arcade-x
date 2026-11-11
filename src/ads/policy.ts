import {validAdUnit, type AdsConfig, type AdPlacement} from './config';
export interface AdsConsent {
  status: 'unknown' | 'denied' | 'granted';
  canRequestAds: boolean;
}
// Only an integrated CMP may provide a resolved snapshot. Never infer it from locale,
// navigator, a query parameter or an app-auth session. No consent UI is implemented here.
export const unknownConsent: AdsConsent = Object.freeze({status:'unknown', canRequestAds:false});
export interface AdContext {
  activeGameId: string | null;
  blocked: boolean;
  hasContent: boolean;
  online: boolean;
  visible: boolean;
  mobile: boolean;
}
export function placementAllowed(context: AdContext, placement: AdPlacement): boolean {
  return context.activeGameId === null && context.hasContent && !context.blocked && context.online && context.visible
    && (placement === 'L2' ? context.mobile : !context.mobile);
}
export function canRequestAd(config: AdsConfig, consent: AdsConsent, context: AdContext, placement: AdPlacement): boolean {
  return config.enabled && config.siteReady && config.production && validAdUnit(config, placement)
    && consent.status === 'granted' && consent.canRequestAds && placementAllowed(context, placement);
}
