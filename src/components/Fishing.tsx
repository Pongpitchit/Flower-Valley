import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ItemIcon } from "./ItemIcon";
import { RODS, CAST_MINUTES } from "../game/data";
import { dispatch, useGame } from "../game/engine";
export function Fishing({ notify, spot = "lake" }: { notify: (s: string) => void; spot?: "lake" | "sea" }) {
  const {upgrades} = useGame();
  const rod=RODS[upgrades.rodLevel];
  const [phase, setPhase] = useState<
      "idle" | "waiting" | "playing" | "won" | "lost"
    >("idle"),
    [sequence, setSequence] = useState<string[]>([]),
    [step, setStep] = useState(0),
    [time, setTime] = useState(100),
    [result, setResult] = useState(""),
    [caughtItemId, setCaughtItemId] = useState<string | null>(null);
  const status = useRef(phase),
    index = useRef(0);
  status.current = phase;
  const start = () => {
    if (["waiting", "playing"].includes(status.current)) return;
    const r = dispatch({ type: "cast" });
    notify(r.message);
    if (r.ok) {
      setCaughtItemId(null);
      index.current = 0;
      setStep(0);
      setTime(100);
      setSequence(
        Array.from({ length: 7 }, () => (Math.random() < 0.5 ? "A" : "D")),
      );
      status.current = "waiting";
      setPhase("waiting");
    }
  };
  useEffect(() => {
    if (phase !== "waiting") return;
    const t = setTimeout(
      () => setPhase("playing"),
      1800 + Math.random() * 2000,
    );
    return () => clearTimeout(t);
  }, [phase]);
  useEffect(() => {
    if (phase !== "playing") return;
    const start = performance.now();
    const t = setInterval(() => {
      const left = Math.max(0, 100 - (performance.now() - start) / 140);
      setTime(left);
      if (left <= 0) {
        status.current = "lost";
        setPhase("lost");
      }
    }, 60);
    return () => clearInterval(t);
  }, [phase]);
  const press = (key: string) => {
    if (status.current !== "playing") return;
    if (sequence[index.current] !== key) {
      status.current = "lost";
      setPhase("lost");
      return;
    }
    index.current++;
    setStep(index.current);
    if (index.current === sequence.length) {
      status.current = "won";
      const r = dispatch({ type: "catch", id: spot === "sea" ? "sea" : undefined });
      setCaughtItemId(r.caughtItemId ?? null);
      setResult(r.message);
      notify(r.message);
      setPhase("won");
    }
  };
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.matches("input,textarea,select")) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (!e.repeat && !["waiting", "playing"].includes(status.current)) start();
      }
      if (e.code === "KeyA" || e.code === "KeyD") {
        e.preventDefault();
        if (!e.repeat) press(e.code === "KeyA" ? "A" : "D");
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [sequence]);
  return (
    <div className="fishing-game">
      <div
        className={
          "fish-illustration " + (phase === "waiting" ? "bobbing" : "")
        }
      >
        {phase === "won" ? (
          caughtItemId && <ItemIcon id={caughtItemId} size={110} />
        ) : <ItemIcon id={spot === "sea" ? "tuna" : "goldfish"} size={110} />}
        <span>≈ ≈ ≈ ≈ ≈</span>
      </div>
      <h3>
        {phase === "idle"
          ? spot === "sea" ? "ลมทะเลพัดเบา ๆ ที่ปลายท่าเรือ" : "ช่วงเวลาเงียบ ๆ ริมทะเลสาบ"
          : phase === "waiting"
            ? "รอปลากินเหยื่อ…"
            : phase === "playing"
              ? "ปลาติดเบ็ดแล้ว!"
              : phase === "won"
                ? result
                : "ปลาว่ายหนีไปแล้ว"}
      </h3>
      <p className="subtle">
        {phase === "playing"
          ? "กดตามลำดับ A / D ให้ครบก่อนหมดเวลา กดผิดปลาจะหนี"
          : phase === "won"
            ? "ของอยู่ในกระเป๋าแล้ว · ฟินน์รับซื้อปลา · โรวันรับซื้อขยะ"
            : phase === "waiting"
              ? "มองผิวน้ำ แล้วรอจังหวะดี ๆ"
              : "Space หย่อนเบ็ด / ตกอีกครั้ง · A / D ดึงปลา · ใช้พลังงาน 10"}
      </p>
      {spot === "sea" && <p className="subtle">ปลาทะเล: ปลาทู · ปลากะพง · ปลาการ์ตูน · ปลาทูน่า (หายาก) — ขายให้ฟินน์ได้ราคาสูงกว่าปลาน้ำจืด</p>}
      <p className="subtle"><ItemIcon id={"rod:"+upgrades.rodLevel} /> {rod.name} · ปลาหายาก {Math.round(rod.rare*100)}% · ขยะ {Math.round(rod.trash*100)}% · ลงเบ็ดครั้งละ {CAST_MINUTES} นาที / 10 พลังงาน</p><p className="subtle">โอกาสต่อครั้งที่ตกสำเร็จ สุ่มใหม่ทุกครั้ง เบ็ดดีเพิ่มโอกาสแต่ไม่ได้รับประกันว่าจะได้ทุกครั้ง</p>
      {phase === "playing" && (
        <>
          <div className="fish-time">
            <i style={{ width: time + "%" }} />
          </div>
          <div className="sequence">
            {sequence.map((s, i) => (
              <span
                key={i}
                className={i < step ? "done" : i === step ? "current" : ""}
              >
                {s}
              </span>
            ))}
          </div>
          <p>
            Fish HP {sequence.length - step} / {sequence.length}
          </p>
          <div className="fish-buttons">
            <button onClick={() => press("A")}>
              <ArrowLeft /> A
            </button>
            <button onClick={() => press("D")}>
              D <ArrowRight />
            </button>
          </div>
        </>
      )}
      {!["waiting", "playing"].includes(phase) && (
        <button onClick={start}>
          {phase === "idle" ? "หย่อนเบ็ด [Space]" : "ตกปลาอีกครั้ง [Space]"} <span>−10 ⚡</span>
        </button>
      )}
    </div>
  );
}
