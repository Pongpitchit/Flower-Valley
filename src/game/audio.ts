// Original synthesized garden score; no downloaded recordings or autoplay.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let active = false, music = true, volume = .5, beat = 0;
let timer: ReturnType<typeof setInterval> | undefined;
function note(frequency: number, delay = 0, length = .35, gain = .1, pan = 0) {
  if (!active || !ctx || !master || document.hidden) return;
  const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain(), p = ctx.createStereoPanner();
  o.type = 'sine'; o.frequency.value = frequency;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .025); g.gain.exponentialRampToValueAtTime(.0001, t + length);
  p.pan.value = pan; o.connect(g).connect(p).connect(master); o.start(t); o.stop(t + length + .03);
}
function updateVolume() { if (ctx && master) master.gain.setTargetAtTime(active && !document.hidden ? volume * .35 : 0, ctx.currentTime, .15); }
export function setVolume(value: number) { volume = Math.max(0, Math.min(1, value)); updateVolume(); }
export function setMusic(on: boolean) { music = on; }
export function setSound(on: boolean) {
  active = on; clearInterval(timer);
  if (!on) { updateVolume(); return; }
  ctx ??= new AudioContext(); void ctx.resume();
  if (!master) {
    master = ctx.createGain(); master.connect(ctx.destination);
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), data = buffer.getChannelData(0);
    let last = 0;
    for (let i=0;i<data.length;i++) { last = (last + (Math.random()*2-1)*.025)/1.025; data[i] = last; }
    const noise = ctx.createBufferSource(), filter = ctx.createBiquadFilter();
    noise.buffer=buffer; noise.loop=true; filter.type='lowpass'; filter.frequency.value=650;
    noise.connect(filter).connect(master); noise.start();
    document.addEventListener('visibilitychange', updateVolume);
  }
  updateVolume();
  const melody = [60,64,67,69,67,64,62,0,60,62,64,67,64,62,60,0,65,69,72,69,67,64,62,0,64,67,69,67,64,62,60,0];
  timer=setInterval(()=>{
    if(document.hidden)return;
    const midi=melody[beat%melody.length];
    if(music && midi) note(440*2**((midi-69)/12),0,1.35,.17);
    if(music && beat%8===0) { note([130.81,110,174.61,130.81][Math.floor(beat/8)%4],0,3,.08); }
    if(beat%11===0) { note(1800,0,.13,.035,-.55); note(2400,.15,.17,.025,-.55); }
    beat++;
  },700);
}
export function chime(kind = 'success', pan = 0) {
  const sounds: Record<string,number[]> = {plant:[240,320],water:[750,520,390],harvest:[523,659,784],fertilize:[330,440,660],cast:[420,230],catch:[523,784,1046],grill:[290,390,520],sell:[880,1174],sellArt:[880,1174],sellBouquet:[880,1174],bouquet:[523,659,880],art:[440,659,880]};
  (sounds[kind] ?? [659,880]).forEach((f,i)=>note(f,i*.09,.27,.18,pan));
}
