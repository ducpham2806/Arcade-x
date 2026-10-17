import React from 'react';
import {artUrl} from './art';
export const Art:React.FC<{name:string;size?:number;className?:string;label?:string}> = ({name,size=24,className='',label}) => <img className={`eat-art ${className}`} width={size} height={size} src={artUrl(name)} alt={label||''} aria-hidden={label?undefined:true} draggable={false}/>;
