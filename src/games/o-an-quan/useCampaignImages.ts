import { useEffect, useState } from 'react';
import { OAQ_CAMPAIGN_IMAGES } from './battlefield';

type Asset = keyof typeof OAQ_CAMPAIGN_IMAGES;
type Images = Partial<Record<Asset, HTMLImageElement>>;

export function useCampaignImages(enabled: boolean) {
  const [images, setImages] = useState<Images>({});
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    for (const kind of Object.keys(OAQ_CAMPAIGN_IMAGES) as Asset[]) {
      const image = new Image();
      image.onload = () => {
        if (active) setImages(current => ({ ...current, [kind]: image }));
      };
      image.src = OAQ_CAMPAIGN_IMAGES[kind];
    }
    return () => { active = false; };
  }, [enabled]);
  return images;
}
