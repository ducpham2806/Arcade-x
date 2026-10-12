import { ALL_GAMES_LIST, GAME_REGISTRY } from '../games/registry';
import type { GameMetadata } from '../types';
export type CatalogGame = GameMetadata & { availability: 'published' | 'maintenance'; accessModel: 'free' | 'premium'; supportsOffline: boolean; featured: boolean; sortOrder: number };
export type Catalog = { schemaVersion: 1; games: CatalogGame[]; commerceEnabled: boolean; support: { enabled: boolean; bankName?: string; account?: string; beneficiary?: string; message?: string } };
export const bundledCatalog: Catalog = { schemaVersion: 1, commerceEnabled: false, support: { enabled: false }, games: ALL_GAMES_LIST.map((game, i) => ({...game,availability:'published',accessModel:'free',supportsOffline:!['caro-gomoku','chess','xiangqi'].includes(game.id),featured:['tile-2048','blocker','car-escape'].includes(game.id),sortOrder:i})) };
// Database metadata can select a bundled engine, never execute remote JavaScript.
export function parseCatalog(raw: any): Catalog | null {
  if (raw?.schemaVersion !== 1 || !Array.isArray(raw.games)) return null;
  const seen = new Set<string>();
  const games: CatalogGame[] = raw.games.flatMap((row: any) => {
    const base = GAME_REGISTRY[row?.engine_key];
    if (!base || row.id !== base.id || seen.has(row.id) || !['published','maintenance'].includes(row.status) || !['free','premium'].includes(row.access_model)) return [];
    seen.add(row.id);
    return [{...base,title:typeof row.title==='string'?row.title.slice(0,100):base.title,
      shortDesc:typeof row.short_description==='string'?row.short_description.slice(0,500):base.shortDesc,
      category:['Arcade','Puzzle','Action','Reflex','Multiplayer'].includes(row.category)?row.category:base.category,
      availability:row.status,accessModel:row.access_model,supportsOffline:row.supports_offline===true,featured:row.featured===true,sortOrder:Number.isFinite(row.sort_order)?row.sort_order:100}];
  }).sort((a:CatalogGame,b:CatalogGame)=>a.sortOrder-b.sortOrder || a.id.localeCompare(b.id));
  const support=raw.support;
  return {schemaVersion:1,games,commerceEnabled:raw.commerceEnabled===true,support:support?.enabled===true && ['bankName','account','beneficiary'].every(key=>typeof support[key]==='string' && support[key].length>0) ? {enabled:true,bankName:support.bankName,account:support.account,beneficiary:support.beneficiary,message:typeof support.message==='string'?support.message:''} : {enabled:false}};
}
export const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();
