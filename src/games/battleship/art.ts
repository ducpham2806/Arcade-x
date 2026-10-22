import manifest from './art.json';
export const artPaths = [...Object.values(manifest.images),...Object.values(manifest.fx).flatMap(f=>f.paths)];
export type Art = {images: Record<string,HTMLImageElement>; fx: Record<string,{frames:HTMLImageElement[];sequence:number[];ms:number}>};
export async function loadArt(): Promise<Art> {
  const image=async(path:string)=>{const im=new Image();im.src=(globalThis as any).__BATTLESHIP_EMBEDDED__?.[path]||path;await im.decode();return im;};
  const images=Object.fromEntries(await Promise.all(Object.entries(manifest.images).map(async([key,path])=>[key,await image(path)])));
  const fx=Object.fromEntries(await Promise.all(Object.entries(manifest.fx).map(async([key,m])=>[key,{frames:await Promise.all(m.paths.map(image)),sequence:m.sequence,ms:m.ms}])));
  return {images,fx};
}
