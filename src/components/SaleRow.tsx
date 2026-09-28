import { useState } from 'react';
import type { Action } from '../game/engine';
import { ItemIcon } from './ItemIcon';
export function SaleRow({id,name,count,price,act}:{id:string;name:string;count:number;price:number;act:(a:Action)=>boolean}) {
  const [requested,setRequested] = useState(1);
  const amount = Math.min(count, requested);
  return <div className="sale-row"><span><ItemIcon id={id}/>{name}<small>มี {count} · {price} ◉ / ชิ้น</small></span><label>จำนวน<input aria-label={`จำนวนขาย${name}`} type="number" min="1" max={Math.max(1,count)} value={amount || 1} onChange={e=>setRequested(Math.max(1,Math.floor(Number(e.target.value)||1)))}/></label><button disabled={!count} onClick={()=>act({type:'sell',id,amount})}>ขาย {amount} · {price*amount} ◉</button><button className="secondary" disabled={!count} onClick={()=>act({type:'sell',id,amount:count})}>ทั้งหมด · {price*count} ◉</button></div>;
}
