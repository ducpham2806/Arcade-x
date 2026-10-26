/** Small JSON Schema 2020-12 subset used by our exported contracts. No coercion/defaults/removal. */
export type Schema={type?:string;const?:unknown;enum?:readonly unknown[];minimum?:number;maximum?:number;exclusiveMinimum?:number;minLength?:number;maxLength?:number;pattern?:string;properties?:Record<string,Schema>;required?:readonly string[];additionalProperties?:boolean|Schema;items?:Schema|false;prefixItems?:Schema[];minItems?:number;maxItems?:number;uniqueItems?:boolean;allOf?:Schema[];anyOf?:Schema[];if?:Schema;then?:Schema;else?:Schema;$schema?:string;$id?:string;title?:string};
export function assertSchema(s:Schema,v:unknown,path='$'):void{
 const fail=(why:string):never=>{throw Error(`${path}: ${why}`);};
 if(s.const!==undefined&&v!==s.const)fail('unexpected constant');if(s.enum&&!s.enum.includes(v))fail('unknown value');
 if(s.type==='number'||s.type==='integer'){if(typeof v!=='number'||!Number.isFinite(v)||(s.type==='integer'&&!Number.isSafeInteger(v)))fail('finite '+s.type+' required');const n=v as number;if(s.minimum!==undefined&&n<s.minimum||s.maximum!==undefined&&n>s.maximum||s.exclusiveMinimum!==undefined&&n<=s.exclusiveMinimum)fail('number outside range');}
 if(s.type==='null'&&v!==null)fail('null required');
 if(s.type==='boolean'&&typeof v!=='boolean')fail('boolean required');
 if(s.type==='string'){if(typeof v!=='string')fail('string required');const t=v as string,length=[...t].length;if(s.minLength!==undefined&&length<s.minLength||s.maxLength!==undefined&&length>s.maxLength||s.pattern&&!new RegExp(s.pattern).test(t))fail('invalid string');}
 if(s.type==='object'){if(!v||typeof v!=='object'||Array.isArray(v))fail('object required');const d=v as Record<string,unknown>;for(const k of s.required??[])if(!Object.hasOwn(d,k)||d[k]===undefined)fail('missing '+k);for(const [k,value] of Object.entries(d)){const child=s.properties&&Object.hasOwn(s.properties,k)?s.properties[k]:undefined;if(child){if(value!==undefined)assertSchema(child,value,path+'.'+k);}else if(s.additionalProperties===false)fail('unknown property '+k);else if(typeof s.additionalProperties==='object')assertSchema(s.additionalProperties,value,path+'.'+k);}}
 if(s.type==='array'){if(!Array.isArray(v))fail('array required');const a=v as unknown[];if(s.minItems!==undefined&&a.length<s.minItems||s.maxItems!==undefined&&a.length>s.maxItems)fail('array size');if(s.uniqueItems&&new Set(a.map(x=>JSON.stringify(x))).size!==a.length)fail('duplicate items');a.forEach((x,i)=>{const item=s.prefixItems?.[i]??s.items;if(item===false)fail('unexpected tuple member');if(item)assertSchema(item,x,path+'['+i+']');});}
 for(const c of s.allOf??[])assertSchema(c,v,path);
 const matches=(c:Schema)=>{try{assertSchema(c,v,path);return true;}catch{return false;}};
 if(s.anyOf&&!s.anyOf.some(matches))fail('no variant matched');if(s.if){const branch=matches(s.if)?s.then:s.else;if(branch)assertSchema(branch,v,path);}
}
