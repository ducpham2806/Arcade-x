/** Clear held gameplay input without changing the room/server clock. */
export function releaseChatInput(){
 window.dispatchEvent(new CustomEvent('arcadex:chat-input'));
 for(const [key,code] of [['w','KeyW'],['a','KeyA'],['s','KeyS'],['d','KeyD'],[' ','Space'],['ArrowUp','ArrowUp'],['ArrowDown','ArrowDown'],['ArrowLeft','ArrowLeft'],['ArrowRight','ArrowRight']])window.dispatchEvent(new KeyboardEvent('keyup',{key,code,bubbles:true}));
}
