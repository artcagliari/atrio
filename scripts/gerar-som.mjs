import { writeFileSync } from "node:fs";
const rate = 22050;
const notes = [ { f: 880, start: 0, dur: 0.18 }, { f: 1174.66, start: 0.16, dur: 0.28 } ];
const total = Math.ceil(rate * 0.46);
const data = new Float32Array(total);
for (const n of notes) {
  const s0 = Math.floor(n.start * rate), len = Math.floor(n.dur * rate);
  for (let i = 0; i < len && s0 + i < total; i++) {
    const t = i / rate;
    const env = Math.min(1, i / (rate * 0.01)) * Math.exp(-t * 9);
    data[s0 + i] += 0.28 * env * (Math.sin(2 * Math.PI * n.f * t) + 0.15 * Math.sin(4 * Math.PI * n.f * t));
  }
}
const buf = Buffer.alloc(44 + total * 2);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + total * 2, 4); buf.write("WAVE", 8);
buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(total * 2, 40);
for (let i = 0; i < total; i++) buf.writeInt16LE(Math.max(-1, Math.min(1, data[i])) * 32767, 44 + i * 2);
writeFileSync(new URL("../public/sounds/alerta-urgente.wav", import.meta.url), buf);
console.log("ok", buf.length, "bytes");
