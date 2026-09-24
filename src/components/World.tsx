import { useEffect, useRef } from 'react';
import '../world/scene';
import { bridge } from '../world/bridge';
export function World() {
    const host = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = host.current!; el.innerHTML = `<a-scene embedded renderer="antialias: true; colorManagement: true; toneMapping: ACESFilmic; exposure: 1.15; maxCanvasWidth: 2200; maxCanvasHeight: 1600" shadow="type: pcfsoft" xr-mode-ui="enabled: false" vr-mode-ui="enabled: false" loading-screen="enabled: false" device-orientation-permission-ui="enabled: false"><a-entity flower-world></a-entity><a-entity camera="fov: 65; near: 0.08; far: 250" look-controls="enabled: false" wasd-controls="enabled: false"></a-entity></a-scene>`;
        const scene = el.querySelector('a-scene')!; let drag = false, last = { x: 0, y: 0 };
        const down = (e: PointerEvent) => { if (bridge.paused || e.button !== 0) return; drag = true; last = { x: e.clientX, y: e.clientY }; if (e.pointerType === 'mouse' && !document.pointerLockElement) { const canvas = scene.querySelector('canvas'); try { const promise = canvas?.requestPointerLock(); promise?.catch(() => { }); } catch { } } };
        const move = (e: PointerEvent) => { if (bridge.paused) return; if (document.pointerLockElement) { bridge.look.x += e.movementX; bridge.look.y += e.movementY; } else if (drag) { bridge.look.x += (e.clientX - last.x) * 1.3; bridge.look.y += (e.clientY - last.y) * 1.3; last = { x: e.clientX, y: e.clientY }; } };
        const up = () => drag = false; el.addEventListener('pointerdown', down); window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
        const ready = () => bridge.onReady(); scene.addEventListener('loaded', ready); const error = () => bridge.onError('WebGL ขัดข้อง ลองโหลดหน้าใหม่หรือปรับคุณภาพต่ำ'); scene.addEventListener('render-target-loaded', () => scene.querySelector('canvas')?.addEventListener('webglcontextlost', error));
        return () => { el.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); scene.removeEventListener('loaded', ready); el.innerHTML = ''; };
    }, []);
    return <div className="world" ref={host} aria-label="โลกสามมิติ Flower Valley" />;
}
