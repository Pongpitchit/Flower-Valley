import type { Action } from '../game/engine';
import { ItemIcon } from './ItemIcon';
export function SaleRow({id,name,count,price,act}:{id:string;name:string;count:number;price:number;act:(a:Action)=>boolean}) {
  return <div className="sale-row"><span><ItemIcon id={id}/>{name}<small>มี {count} · {price} ◉ / ชิ้น</small></span><button disabled={!count} onClick={()=>act({type:'sell',id,amount:1})}>ขาย 1 · {price} ◉</button><button className="secondary" disabled={!count} onClick={()=>act({type:'sell',id,amount:count})}>ขายทั้งหมด ({count}) · {price*count} ◉</button></div>;
}
