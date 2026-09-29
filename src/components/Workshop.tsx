import { useGame, SAVE_KEY } from "../game/engine";
import { ART_PRICES, moodName } from "../game/balance";
import { useEffect, useRef, useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { type Artwork } from "../game/engine";
const palette = [
  "#435b43",
  "#779269",
  "#d4a252",
  "#c87982",
  "#8d7caa",
  "#5b8caa",
  "#785848",
  "#f2ead8",
  "#2c3430",
];
export function Painting({
  finish,
}: {
  finish: (art: Omit<Artwork, "id" | "price">) => boolean;
}) {
  const {artDay} = useGame();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(palette[0]),
    [size, setSize] = useState(10),
    [name, setName] = useState("บ่ายวันหนึ่งในสวน");
  const drawing = useRef(false),
    last = useRef({ x: 0, y: 0 }),
    [dirty, setDirty] = useState(false);
  const clear = () => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#f5edda";
    ctx.fillRect(0, 0, c.width, c.height);
    setDirty(false);
    localStorage.removeItem(SAVE_KEY+"-painting-draft");
  };
  useEffect(()=>{
    const draft=localStorage.getItem(SAVE_KEY+"-painting-draft");
    clear();
    if(draft){const image=new Image();image.onload=()=>{if(canvas.current){canvas.current.getContext("2d")!.drawImage(image,0,0);setDirty(true);localStorage.setItem(SAVE_KEY+"-painting-draft",draft);}};image.src=draft;}
  }, []);
  const keepDraft=()=>{drawing.current=false;try {localStorage.setItem(SAVE_KEY+"-painting-draft",canvas.current!.toDataURL("image/png"));}catch{/* Export remains available if storage is full. */}};
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * 512) / r.width,
      y: ((e.clientY - r.top) * 512) / r.height,
    };
  };
  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const p = point(e),
      ctx = canvas.current!.getContext("2d")!;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    setDirty(true);
  };
  return (
    <>
      <p className="subtle">
        วาดได้แม้พลังงานน้อย บันทึกใช้สูงสุด 15 พลังงาน · ส่งออก PNG ได้เสมอ
      </p>
      <div className="paint-layout">
        <canvas
          className="paint-canvas"
          width={512}
          height={512}
          ref={canvas}
          aria-label="ผ้าใบวาดภาพ"
          onPointerDown={(e) => {
            drawing.current = true;
            last.current = point(e);
            e.currentTarget.setPointerCapture(e.pointerId);
            const ctx = canvas.current!.getContext("2d")!;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(last.current.x, last.current.y, size / 2, 0, Math.PI * 2);
            ctx.fill();
            setDirty(true);
          }}
          onPointerMove={draw}
          onPointerUp={keepDraft}
          onPointerCancel={keepDraft}
        />
        <div className="paint-tools">
          <div className="palette">
            {palette.map((c) => (
              <button
                key={c}
                aria-label={"สี " + c}
                className={color === c ? "selected" : ""}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <label>
            ขนาดพู่กัน{" "}
            <input
              type="range"
              min="2"
              max="40"
              value={size}
              onChange={(e) => setSize(+e.target.value)}
            />
          </label>
          <button className="secondary" onClick={clear}>
            <RotateCcw size={16} /> ล้างผ้าใบ
          </button>
        </div>
      </div>
      <p className="recipe-summary">วันนี้{moodName(artDay)} · เหลือ {artDay.limit-artDay.used}/{artDay.limit} ชิ้น · ขายภาพ {ART_PRICES.painting} ◉ · ใช้พลังงานสูงสุด 15 (พลังงานหมดก็ยังบันทึกได้)</p>
      <button className="secondary" onClick={()=>{
        const a=document.createElement("a");a.href=canvas.current!.toDataURL("image/png");a.download=(name.trim()||"Flower Valley")+".png";a.click();
      }}>ส่งออกภาพ PNG</button>
      <div className="form-row">
        <input
          aria-label="ชื่อภาพ"
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          disabled={!dirty || !name.trim() || artDay.used >= artDay.limit}
          onClick={() => {
            if (
              finish({
                kind: "painting",
                name,
                image: canvas.current!.toDataURL("image/png"),
              })
            )
              clear();
          }}
        >
          <Save size={16} /> บันทึกภาพ
        </button>
      </div>
    </>
  );
}

export { ModelPainting as Sculpture } from "./ModelPainting";
