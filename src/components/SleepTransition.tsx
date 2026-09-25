import { useEffect, useRef, useState } from 'react';
import { Moon, Sunrise } from 'lucide-react';
import { dispatch, getState, save, type Action } from '../game/engine';

export function SleepTransition({ action, onComplete }: { action: Action; onComplete: (message: string) => void }) {
  const [phase, setPhase] = useState<'night' | 'morning' | 'fade'>('night');
  const complete = useRef(onComplete);complete.current = onComplete;
  const message = useRef('');
  const forced = action.type !== 'sleep';
  useEffect(() => {
    const change = setTimeout(() => {
      const result = dispatch(action);message.current = result.message;
      if (!result.ok) { complete.current(result.message);return; }
      save();setPhase('morning');
    }, 700);
    const fade = setTimeout(() => setPhase('fade'), 2600);
    const finish = setTimeout(() => complete.current(message.current), 3100);
    return () => { clearTimeout(change);clearTimeout(fade);clearTimeout(finish); };
  }, [action]);
  const s = getState();
  return <div className={'sleep-transition ' + phase} role="status" aria-live="polite" aria-label="เปลี่ยนผ่านการนอน">
    {phase === 'night' ? <><Moon size={46} /><h2>{forced ? 'เที่ยงคืนแล้ว… ได้เวลาพัก' : 'หลับฝันดีนะ'}</h2><p>{forced ? 'ความเหนื่อยล้าพาคุณเข้าสู่ห้วงนิทรา' : 'เก็บเรื่องราววันนี้ไว้ แล้วพบกันตอนเช้า'}</p></> :
      <><Sunrise size={46} /><p>FLOWER VALLEY</p><h2>เช้าวันที่ {s.day} · 06:00</h2><p>{forced ? 'นอนดึกเกินไป พลังงานฟื้นเพียง 60%' : 'พักเต็มอิ่ม พร้อมเริ่มต้นวันใหม่'}</p><strong>พลังงาน {s.energy} / {s.maxEnergy}</strong></>}
  </div>;
}
