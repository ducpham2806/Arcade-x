/** Bounded, data-only replay wire contract shared by client and verifier. */
export const CONTENT='r01-10-v1' as const;
export type Command=[number,number,number,boolean,number?]|[0];
export type Proof={version:1;commands:Command[]};
export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function parseProof(value:unknown):Proof{
 const p=value as Proof;
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).sort().join(',')!=='commands,version'||p.version!==1||!Array.isArray(p.commands)||p.commands.length<1||p.commands.length>20000)throw Error('Invalid proof');
 let ticks=0,acks=0;
 for(const c of p.commands){if(!Array.isArray(c))throw Error('Invalid command');if(c.length===1&&c[0]===0){if(++acks>2)throw Error('Too many tutorial acknowledgements');continue;}
 if((c.length!==4&&c.length!==5)||!Number.isInteger(c[0])||c[0]<1||c[0]>600||!Number.isFinite(c[1])||!Number.isFinite(c[2])||Math.abs(c[1])>256||Math.abs(c[2])>256||typeof c[3]!=='boolean'||(c.length===5&&(!Number.isFinite(c[4])||Math.abs(c[4]!)>1)))throw Error('Invalid input');ticks+=c[0];if(ticks>54000)throw Error('Replay too long');}
 return p;
}
