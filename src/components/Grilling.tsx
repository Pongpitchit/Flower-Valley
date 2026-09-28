import { useEffect, useRef, useState } from "react";
import { FISH, GRILLED_FISH, GRILL_ENERGY, GRILL_MINUTES } from "../game/data";
import { dispatch, useGame } from "../game/engine";
import { ItemIcon } from "./ItemIcon";

export function Grilling({ notify }: { notify: (message: string) => void }) {
  const s = useGame();
  const [cooking, setCooking] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const busy = useRef(false);
  useEffect(() => () => clearTimeout(timer.current), []);
  function grill(id: string) {
    if (busy.current) return;
    busy.current = true;
    setCooking(id);
    timer.current = setTimeout(() => {
      const result = dispatch({ type: "grill", id });
      notify(result.message);
      busy.current = false;
      setCooking(null);
    }, 2600);
  }
  return (
    <>
      <p className="dialogue">ค่อย ๆ ย่างปลาข้างกองไฟ แล้วนำไปขายให้ฟินน์</p>
      <p className="subtle">
        ปลา 1 ตัว · −{GRILL_ENERGY} พลังงาน · {GRILL_MINUTES} นาทีในเกม ·
        ราคาขายเพิ่ม 50%
        <br />
        ออกจากหน้าต่างก่อนเสร็จจะยกเลิก โดยไม่เสียปลา พลังงาน หรือเวลา
      </p>
      {cooking && (
        <div className="grilling-progress" role="status">
          <span>🔥 กำลังย่าง{FISH.find((f) => f.id === cooking)?.name}…</span>
          <div className="progress">
            <i />
          </div>
        </div>
      )}
      <div className="item-list">
        {FISH.map((fish, i) => (
          <div key={fish.id}>
            <span>
              <ItemIcon id={"grilled:" + fish.id} size={52} />
              {fish.name}ย่าง
              <small>
                ปลาสด {s.inventory[fish.id] || 0} · ย่างแล้ว{" "}
                {s.inventory["grilled:" + fish.id] || 0} · ขาย{" "}
                {GRILLED_FISH[i].price} ◉
              </small>
            </span>
            <button
              disabled={
                !!cooking ||
                !(s.inventory[fish.id] > 0) ||
                s.energy < GRILL_ENERGY ||
                s.time + GRILL_MINUTES >= 1440
              }
              onClick={() => grill(fish.id)}
            >
              ย่าง 1 ตัว
            </button>
          </div>
        ))}
      </div>
      {s.time + GRILL_MINUTES >= 1440 && (
        <p className="subtle">
          ดึกเกินกว่าจะย่างเสร็จก่อนเที่ยงคืน กลับมาย่างพรุ่งนี้นะ
        </p>
      )}
    </>
  );
}
