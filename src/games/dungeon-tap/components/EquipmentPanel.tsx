import React,{useEffect,useRef,useState} from 'react';
import {Action,DungeonState,reduceDungeon,statsFor} from '../engine';
import {EquipmentItem,AllyEquipmentItem,EquipmentSlot,AllyEquipSlot} from '../types';
import {RARITY_CONFIG} from '../equipmentData';
import {calculateAllyItemPower} from '../allyEquipmentData';
import {calculateItemBasePower,formatNumber as fmt} from '../utils/upgradeMath';
import {GearArt} from './RasterSprite';
import {FantasyIcon as Icon} from './FantasyIcon';

type Item=EquipmentItem|AllyEquipmentItem;
export const HERO_SLOTS:EquipmentSlot[]=['weapon','armor','helmet','cloak','ring'];
export const ALLY_SLOTS:AllyEquipSlot[]=['ally_weapon','ally_armor','ally_accessory'];
export const ALLY_KEYS=['equippedWeapon','equippedArmor','equippedAccessory'] as const;
const SLOT_NAMES:Record<string,string>={weapon:'Vũ khí',armor:'Áo giáp',helmet:'Mũ',cloak:'Áo choàng',ring:'Nhẫn',ally_weapon:'Vũ khí',ally_armor:'Áo giáp',ally_accessory:'Phụ kiện'};
export function equippedEntries(s:DungeonState){return [
 ...HERO_SLOTS.map(slot=>({key:`hero:${slot}`,item:s.equipped[slot]})),
 ...s.allies.flatMap(a=>ALLY_KEYS.map((key,i)=>({key:`${a.id}:${ALLY_SLOTS[i]}`,item:a[key]})))
];}
export function changedEquipment(before:DungeonState,after:DungeonState){
 const previous=new Map(equippedEntries(before).map(e=>[e.key,JSON.stringify(e.item)]));
 return equippedEntries(after).filter(e=>previous.get(e.key)!==JSON.stringify(e.item)).map(e=>e.key);
}
function signed(n:number,percent=false){const amount=percent?`${Math.abs(n).toFixed(1)} đ.%`:fmt(Math.abs(n));return `${n>0?'+':n<0?'−':''}${amount}`;}
export function StatComparison({before,after}:{before:DungeonState;after:DungeonState}){
 const a=statsFor(before),b=statsFor(after);
 const rows=[{label:'Sát thương chạm',a:a.tap,b:b.tap},{label:'DPS đội',a:a.dps,b:b.dps},{label:'Bạo kích',a:a.crit*100,b:b.crit*100,percent:true},{label:'Vàng',a:a.gold,b:b.gold,mult:true}];
 return <div className="fx-gear-comparison" aria-label="Thay đổi chỉ số thực tế">{rows.map(r=>{const delta=r.b-r.a;return <div key={r.label}><span>{r.label}</span><span>{r.percent?`${r.a.toFixed(1)}%`:r.mult?`×${r.a.toFixed(2)}`:fmt(r.a)} → <b>{r.percent?`${r.b.toFixed(1)}%`:r.mult?`×${r.b.toFixed(2)}`:fmt(r.b)}</b></span><strong className={delta>1e-8?'is-gain':delta< -1e-8?'is-loss':'is-neutral'}>{r.mult?`${delta>0?'+':delta<0?'−':''}${Math.abs(delta).toFixed(2)}×`:signed(Math.abs(delta)<1e-8?0:delta,r.percent)}</strong></div>;})}</div>;
}
function ItemTraits({item,current}:{item:Item;current?:Item|null}){
 const ally='profession' in item;
 const fields=ally?[['dpsBonusPercent','DPS','%'],['skillBonusPercent','Sát thương kỹ năng','%'],['cooldownReductionSec','Giảm hồi chiêu','s'],['teamBuffBonusPercent','Bổ trợ DPS','%']]:[['tapDmgBonus','Sát thương chạm','%'],['heroDmgBonus','DPS đội','%'],['critRateBonus','Bạo kích','đ.%'],['goldBonus','Vàng','%']];
 return <dl className="fx-item-traits">{fields.map(([key,label,unit])=>{const value=Number((item as any)[key]||0),old=Number((current as any)?.[key]||0),delta=value-old;return <div key={key}><dt>{label}</dt><dd>{current?`${old} → `:''}<b>{value}{unit}</b>{current&&<em className={delta>0?'is-gain':delta<0?'is-loss':'is-neutral'}> ({delta>0?'+':''}{Number(delta.toFixed(2))}{unit})</em>}</dd></div>;})}</dl>;
}
export function EquipmentPanel({s,send,paused,initialMode='hero',initialAllyId=''}:{s:DungeonState;send:(a:Action)=>void;paused:boolean;initialMode?:'hero'|'ally';initialAllyId?:string}){
 const [mode,setMode]=useState(initialMode),[allyId,setAllyId]=useState(initialAllyId),[selected,setSelected]=useState(''),[filter,setFilter]=useState('all'),[tools,setTools]=useState(false),[confirmSell,setConfirmSell]=useState(false);
 const [result,setResult]=useState<{text:string;before?:DungeonState;after?:DungeonState;changed:string[]}|null>(null);
 const pending=useRef<{before:DungeonState;label:string}|null>(null);
 const unlocked=s.allies.filter(a=>a.unlocked),ally=unlocked.find(a=>a.id===allyId)||unlocked[0];
 const inventory:Item[]=mode==='hero'?s.inventory:s.allyInventory.filter(it=>it.profession===ally?.profession);
 const worn:({slot:string;item:Item|null})[]=mode==='hero'?HERO_SLOTS.map(slot=>({slot,item:s.equipped[slot]})):ally?ALLY_SLOTS.map((slot,i)=>({slot,item:ally[ALLY_KEYS[i]]})):[];
 const selectedItem=[...worn.map(e=>e.item),...inventory].find(it=>it?.id===selected);
 const isWorn=!!selectedItem&&worn.some(e=>e.item?.id===selectedItem.id),current=selectedItem?worn.find(e=>e.slot===selectedItem.slot)?.item:null;
 const equipAction:Action|undefined=selectedItem&&!isWorn?{type:'equip',id:selectedItem.id,...(mode==='ally'?{allyId:ally?.id}:{})}:undefined;
 const preview=equipAction?reduceDungeon(s,equipAction):null;
 useEffect(()=>{const p=pending.current;if(!p||s===p.before)return;pending.current=null;const changed=changedEquipment(p.before,s);setResult(changed.length?{text:`${p.label} · ${changed.length} ô cập nhật`,before:p.before,after:s,changed}:{text:'Trang bị chưa thay đổi. Hãy kiểm tra lại món đồ hoặc số vàng.',changed:[]});},[s]);
 const act=(action:Action,label:string)=>{
  if(paused)return;
  const prediction=reduceDungeon(s,action);
  if(!changedEquipment(s,prediction).length){setResult({text:action.type==='best'?'Đang mặc những món tốt nhất theo sức mạnh gốc. Không có món phù hợp để thay.':'Không thể thay đổi trang bị: kiểm tra số vàng, cấp tối đa hoặc nhân vật sử dụng.',changed:[]});return;}
  pending.current={before:s,label};setResult(null);send(action);
 };
 const switchMode=(next:'hero'|'ally')=>{setMode(next);setSelected('');setResult(null);setConfirmSell(false);};
 const better=(it:Item)=>{const old=worn.find(e=>e.slot===it.slot)?.item;return 'profession' in it?calculateAllyItemPower(it)>calculateAllyItemPower(old as AllyEquipmentItem):calculateItemBasePower(it)>calculateItemBasePower(old as EquipmentItem);};
 const itemButton=(it:Item,slot?:string)=>{
  const equipped=!!slot,key=equipped?`${mode==='hero'?'hero':ally?.id}:${slot}`:'';
  return <button key={slot||it.id} type="button" data-item-id={it.id} data-slot={it.slot} data-changed={result?.changed.includes(key)||undefined} className={`fx-item ${selected===it.id?'is-selected':''} ${equipped?'is-equipped':''}`} style={{'--rarity':RARITY_CONFIG[it.rarity].color} as React.CSSProperties} aria-label={`${equipped?'Đang mặc: ':''}${it.name}, ${RARITY_CONFIG[it.rarity].name}, cấp ${it.level}`} aria-pressed={selected===it.id} onClick={()=>setSelected(it.id)}>
   {slot&&<small className="fx-slot-label">{SLOT_NAMES[slot]}</small>}<GearArt slot={it.slot} profession={'profession' in it?it.profession:undefined}/><span className="fx-item-level">+{it.level}</span><small className="fx-item-name">{it.name}</small>{equipped?<i className="fx-equipped-check" aria-hidden="true">✓</i>:better(it)&&<i className="fx-improve" title="Sức mạnh gốc cao hơn">↑</i>}
  </button>;
 };
 return <>
  <div className="fx-segment"><button aria-pressed={mode==='hero'} onClick={()=>switchMode('hero')}>Anh hùng</button><button aria-pressed={mode==='ally'} onClick={()=>switchMode('ally')}>Đồng đội</button></div>
  {mode==='ally'&&(ally?<label className="fx-gear-owner"><span>Trang bị cho</span><select aria-label="Đồng đội trang bị" value={ally.id} onChange={e=>{setAllyId(e.target.value);setSelected('');setResult(null);}}>{unlocked.map(a=><option key={a.id} value={a.id}>{a.name} · Lv.{a.level}</option>)}</select></label>:<p className="fx-detail-note">Chiêu mộ đồng đội ở tab Đội hình để sử dụng trang bị.</p>)}
  <div className={`fx-equipped ${mode==='ally'?'fx-equipped-ally':''}`} aria-label={mode==='hero'?'Trang bị đang mặc':`Trang bị đang mặc của ${ally?.name||'đồng đội'}`}>{worn.map(({slot,item})=>item?itemButton(item,slot):<div key={slot} className="fx-empty-slot" data-slot={slot}><small>{SLOT_NAMES[slot]}</small><GearArt slot={slot} profession={mode==='ally'?ally?.profession:undefined}/><span>Trống</span></div>)}</div>
  {result&&<section className="fx-equip-result" role="status" aria-live="polite"><b>{result.text}</b>{result.before&&result.after&&<><StatComparison before={result.before} after={result.after}/><details className="fx-equip-changes"><summary>Món đã cập nhật</summary>{equippedEntries(result.after).filter(e=>result.changed.includes(e.key)&&e.item).map(e=>{const old=equippedEntries(result.before!).find(p=>p.key===e.key)?.item;return <article key={e.key}><b>{old?`${old.name} +${old.level}`:'Ô trống'} → {e.item!.name} +{e.item!.level}</b><ItemTraits item={e.item!} current={old}/></article>;})}</details></>}</section>}
  <div className="fx-tool-row"><button className="fx-gold" disabled={paused||mode==='ally'&&!ally} onClick={()=>act({type:'best',ally:mode==='ally',...(mode==='ally'?{allyId:ally?.id}:{})},'Đã mặc trang bị tốt nhất')}><Icon name="check"/>Mặc tốt nhất</button><select aria-label="Lọc độ hiếm" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tất cả</option>{Object.entries(RARITY_CONFIG).map(([id,r])=><option key={id} value={id}>{r.name}</option>)}</select><button aria-label="Tùy chọn túi đồ" onClick={()=>setTools(!tools)}><Icon name="settings"/></button></div>
  {tools&&<div className="fx-utility-row"><button disabled={paused} onClick={()=>send({type:'autoPickup'})}>Tự nhặt: {s.autoPickup?'Bật':'Tắt'}</button><button disabled={paused||!(mode==='hero'?s.inventory:s.allyInventory).length} onClick={()=>setConfirmSell(true)}>Bán kho</button></div>}
  {confirmSell&&<div className="fx-confirm"><p>Bán toàn bộ {mode==='hero'?'đồ anh hùng':'đồ đồng đội'} trong kho?</p><small>Giữ toàn bộ đồ đang mặc.</small><div><button onClick={()=>setConfirmSell(false)}>Hủy</button><button disabled={paused} className="fx-gold" onClick={()=>{send({type:'sellAll',ally:mode==='ally'});setConfirmSell(false);setSelected('');}}>Bán</button></div></div>}
  {s.pending.length>0&&<button disabled={paused} className="fx-wide fx-gold" onClick={()=>send({type:'pickup'})}>Nhặt {s.pending.length} món đang chờ</button>}
  {selectedItem&&<div className="fx-item-detail" style={{'--rarity':RARITY_CONFIG[selectedItem.rarity].color} as React.CSSProperties}><button className="fx-detail-close" aria-label="Đóng chi tiết vật phẩm" onClick={()=>setSelected('')}>×</button><GearArt slot={selectedItem.slot} profession={'profession' in selectedItem?selectedItem.profession:undefined}/><div><h3>{selectedItem.name}</h3><small>{RARITY_CONFIG[selectedItem.rarity].name} · +{selectedItem.level} · {isWorn?'Đang mặc':'Trong kho'}</small>{current&&!isWorn&&<p>Thay: {current.name} +{current.level}</p>}</div>
   <ItemTraits item={selectedItem} current={isWorn?undefined:current}/>
   {preview&&<section className="fx-equip-preview"><b>Sau khi trang bị</b><StatComparison before={s} after={preview}/></section>}
   <div className="fx-item-actions"><button className="fx-gold" disabled={paused||isWorn||!equipAction} onClick={()=>equipAction&&act(equipAction,`Đã trang bị ${selectedItem.name}${mode==='ally'?` cho ${ally?.name}`:''}`)}>{isWorn?'Đang mặc':mode==='ally'?'Mặc cho đồng đội':'Trang bị'}</button>
   {(mode==='hero'||isWorn)&&<button disabled={paused||s.gold<selectedItem.upgradeCost||selectedItem.level>=20} onClick={()=>act({type:'upgradeItem',id:selectedItem.id,count:1,...(mode==='ally'?{allyId:ally?.id,slot:selectedItem.slot as AllyEquipSlot}:{})},`Đã rèn ${selectedItem.name}`)}>Rèn · {fmt(selectedItem.upgradeCost)}</button>}
   {!isWorn&&<button disabled={paused} onClick={()=>{send({type:'sell',id:selectedItem.id,ally:mode==='ally'});setSelected('');}}>Bán · {fmt(selectedItem.sellValue)}</button>}</div>
  </div>}
  <div className="fx-inventory" aria-label="Kho vật phẩm">{inventory.filter(it=>filter==='all'||it.rarity===filter).map(it=>itemButton(it))}</div>{!inventory.filter(it=>filter==='all'||it.rarity===filter).length&&<div className="fx-empty"><Icon name="chest"/><span>Chưa có vật phẩm phù hợp trong kho</span></div>}
 </>;
}
