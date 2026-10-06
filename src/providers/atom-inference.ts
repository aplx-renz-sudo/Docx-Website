/**
 * VileDocx Atom 1M — REAL in-browser GPT inference engine.
 *
 * This is NOT a simulation. It loads actual Float16 weights (public/models/atom-1m.bin)
 * produced by training a ~470k-parameter character-level Transformer from scratch
 * (see model/train/train_atom.py) and runs a genuine forward pass + autoregressive
 * sampling with top-k / top-p filtering, entirely on-device with zero network calls
 * after the one-time weight fetch (cached forever by the browser HTTP cache).
 */

type TensorMeta = { name: string; shape: number[]; offset: number };

export type AtomModel = {
  vocab: string[];         // char for each token id
  charToId: Map<string, number>;
  cfg: { D: number; L: number; BLK: number; V: number; params: number };
  w: Record<string, Float32Array>;   // dequantized fp32 weights
};

let modelPromise: Promise<AtomModel | null> | null = null;

/** Float16 -> Float32 (IEEE 754 half decoding, no DataView hacks needed). */
function f16ToF32(h: Uint16Array): Float32Array {
  const out = new Float32Array(h.length);
  for (let i = 0; i < h.length; i++) {
    const bits = h[i];
    const sign = (bits & 0x8000) ? -1 : 1;
    const exp = (bits >> 10) & 0x1f;
    const frac = bits & 0x3ff;
    if (exp === 0) out[i] = sign * Math.pow(2, -14) * (frac / 1024);
    else if (exp === 31) out[i] = frac ? NaN : sign * Infinity;
    else out[i] = sign * Math.pow(2, exp - 15) * (1 + frac / 1024);
  }
  return out;
}

async function fetchBuf(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.arrayBuffer();
}

/** Loads + dequantizes the trained Atom weights once; safe to call repeatedly. */
export function loadAtomModel(): Promise<AtomModel | null> {
  if (!modelPromise) {
    modelPromise = (async () => {
      try {
        const [json, bin] = await Promise.all([
          fetch('/models/atom-1m.json').then(r => (r.ok ? r.json() : Promise.reject(new Error('missing manifest')))),
          fetchBuf('/models/atom-1m.bin'),
        ]);
        const bytes = new Uint8Array(bin);
        const w: Record<string, Float32Array> = {};
        for (const t of json.tensors as TensorMeta[]) {
          const n = t.shape.reduce((a, b) => a * b, 1);
          const u16 = new Uint16Array(bytes.buffer, t.offset, n);
          w[t.name] = f16ToF32(u16);
        }
        const vocab: string[] = json.vocab;
        const charToId = new Map<string, number>();
        vocab.forEach((c, i) => charToId.set(c, i));
        return { vocab, charToId, cfg: json.config, w } as AtomModel;
      } catch {
        modelPromise = null; // allow retry on next message
        return null;
      }
    })();
  }
  return modelPromise;
}

// ---------------------------------------------------------------------------
// Minimal tensor ops (row-major matmul, layernorm, gelu, softmax)
// ---------------------------------------------------------------------------

/** y[m,n] += x[k,m] * W[n,k]  (PyTorch Linear: y = x @ W^T), batched over m columns. */
function linear(x: Float32Array, T: number, C: number, W: Float32Array, out: Float32Array, bias?: Float32Array) {
  const N = bias ? bias.length : W.length / C;
  out.fill(0);
  for (let n = 0; n < N; n++) {
    const wRow = n * C;
    for (let c = 0; c < C; c++) {
      const wv = W[wRow + c];
      if (wv === 0) continue;
      for (let t = 0; t < T; t++) out[t * N + n] += wv * x[t * C + c];
    }
    if (bias) for (let t = 0; t < T; t++) out[t * N + n] += bias[n];
  }
}

function layerNorm(x: Float32Array, T: number, C: number, g: Float32Array, b: Float32Array, out: Float32Array) {
  for (let t = 0; t < T; t++) {
    let mean = 0;
    for (let c = 0; c < C; c++) mean += x[t * C + c];
    mean /= C;
    let varc = 0;
    for (let c = 0; c < C; c++) { const d = x[t * C + c] - mean; varc += d * d; }
    const inv = 1 / Math.sqrt(varc / C + 1e-5);
    for (let c = 0; c < C; c++) out[t * C + c] = (x[t * C + c] - mean) * inv * g[c] + b[c];
  }
}

function geluInplace(x: Float32Array) {
  for (let i = 0; i < x.length; i++) {
    const v = x[i];
    x[i] = 0.5 * v * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (v + 0.044715 * v * v * v)));
  }
}

/** Single causal self-attention block (q/k/v/o are C×C, no bias). Writes into `out` for position T-1 only when last=true. */
function attentionFull(x: Float32Array, T: number, C: number, m: AtomModel['w'], li: number, buf: { q: Float32Array; k: Float32Array; v: Float32Array; att: Float32Array; o: Float32Array }) {
  const { q, k, v, att, o } = buf;
  linear(x, T, C, m[`blocks.${li}.att.q.weight`], q);
  linear(x, T, C, m[`blocks.${li}.att.k.weight`], k);
  linear(x, T, C, m[`blocks.${li}.att.v.weight`], v);
  const scale = 1 / Math.sqrt(C);
  // scores row for each t (causal)
  for (let t = 0; t < T; t++) {
    let maxs = -Infinity;
    for (let j = 0; j <= t; j++) {
      let s = 0;
      const kt = j * C, qt = t * C;
      for (let c = 0; c < C; c++) s += q[qt + c] * k[kt + c];
      s *= scale;
      att[j] = s;
      if (s > maxs) maxs = s;
    }
    let sum = 0;
    for (let j = 0; j <= t; j++) { att[j] = Math.exp(att[j] - maxs); sum += att[j]; }
    // weighted sum of v rows -> o row t
    const ot = t * C;
    for (let c = 0; c < C; c++) o[ot + c] = 0;
    for (let j = 0; j <= t; j++) {
      const p = att[j] / sum, vt = j * C;
      for (let c = 0; c < C; c++) o[ot + c] += p * v[vt + c];
    }
  }
  // output projection
  const proj = new Float32Array(T * C);
  linear(o, T, C, m[`blocks.${li}.att.o.weight`], proj);
  return proj;
}

/** Full forward pass over context `ids`; returns logits (length V) for the LAST position. */
function forwardLast(m: AtomModel, ids: number[]): Float32Array {
  const { D, L, BLK, V } = m.cfg;
  const T = Math.min(ids.length, BLK);
  const use = ids.slice(-T);
  const tok = m.w['tok.weight'];       // V × D
  const pos = m.w['pos.weight'];       // BLK × D
  let x = new Float32Array(T * D);
  for (let t = 0; t < T; t++) {
    const te = use[t] * D, pe = t * D, xt = t * D;
    for (let c = 0; c < D; c++) x[xt + c] = tok[te + c] + pos[pe + c];
  }
  for (let li = 0; li < L; li++) {
    const ln1 = new Float32Array(T * D);
    layerNorm(x, T, D, m.w[`blocks.${li}.ln1.weight`], m.w[`blocks.${li}.ln1.bias`], ln1);
    const attnOut = attentionFull(ln1, T, D, m.w, li, {
      q: new Float32Array(T * D), k: new Float32Array(T * D), v: new Float32Array(T * D),
      att: new Float32Array(T), o: new Float32Array(T * D),
    });
    for (let i = 0; i < T * D; i++) x[i] += attnOut[i];
    const ln2 = new Float32Array(T * D);
    layerNorm(x, T, D, m.w[`blocks.${li}.ln2.weight`], m.w[`blocks.${li}.ln2.bias`], ln2);
    const ff1 = new Float32Array(T * 4 * D);
    linear(ln2, T, D, m.w[`blocks.${li}.mlp.0.weight`], ff1, m.w[`blocks.${li}.mlp.0.bias`]);
    geluInplace(ff1);
    const ff2 = new Float32Array(T * D);
    linear(ff1, T, 4 * D, m.w[`blocks.${li}.mlp.2.weight`], ff2, m.w[`blocks.${li}.mlp.2.bias`]);
    for (let i = 0; i < T * D; i++) x[i] += ff2[i];
  }
  const xf = new Float32Array(D);
  const lnf = new Float32Array(D);
  for (let c = 0; c < D; c++) xf[c] = x[(T - 1) * D + c];
  layerNorm(xf, 1, D, m.w['lnf.weight'], m.w['lnf.bias'], lnf);
  const headW = m.w['head.weight']; // V × D
  const logits = new Float32Array(V);
  for (let n = 0; n < V; n++) {
    let s = 0;
    const row = n * D;
    for (let c = 0; c < D; c++) s += headW[row + c] * lnf[c];
    logits[n] = s;
  }
  return logits;
}

export type GenOptions = { maxChars?: number; temperature?: number; topK?: number; topP?: number };

/**
 * Autoregressive generation with real sampling (temperature + top-k + nucleus top-p).
 * Calls onChunk per generated character. Stops at "\n\n" after content begins or at maxChars.
 */
export async function generateAtom(
  m: AtomModel,
  prompt: string,
  onChunk: (text: string) => void,
  opts: GenOptions = {},
  shouldStop?: () => boolean
): Promise<string> {
  const maxChars = opts.maxChars ?? 260;
  const temperature = opts.temperature ?? 0.8;
  const topK = opts.topK ?? 12;
  const topP = opts.topP ?? 0.92;

  const ids: number[] = [];
  for (const ch of prompt) {
    const id = m.charToId.get(ch);
    if (id !== undefined) ids.push(id);
  }
  if (ids.length === 0) ids.push(m.charToId.get(' ') ?? 0);

  let out = '';
  let sawBody = false;
  for (let step = 0; step < maxChars; step++) {
    if (shouldStop?.()) break;
    const logits = forwardLast(m, ids);
    // temperature + top-k truncation
    const scored: { i: number; p: number }[] = [];
    let maxl = -Infinity;
    for (let i = 0; i < logits.length; i++) if (logits[i] > maxl) maxl = logits[i];
    let z = 0;
    for (let i = 0; i < logits.length; i++) { const e = Math.exp((logits[i] - maxl) / Math.max(0.05, temperature)); scored.push({ i, p: e }); z += e; }
    for (const s of scored) s.p /= z;
    scored.sort((a, b) => b.p - a.p);
    const kept = scored.slice(0, Math.max(1, topK));
    // nucleus filter
    let cum = 0; const chosenPool: { i: number; p: number }[] = [];
    for (const cand of kept) { cum += cand.p; chosenPool.push(cand); if (cum >= topP) break; }
    const r = Math.random();
    let acc = 0; let pick = chosenPool[chosenPool.length - 1].i;
    const total = chosenPool.reduce((a, c) => a + c.p, 0);
    for (const cand of chosenPool) { acc += cand.p / total; if (r <= acc) { pick = cand.i; break; } }

    const ch = m.vocab[pick];
    ids.push(pick);
    if (ids.length > m.cfg.BLK) ids.shift();
    out += ch;
    onChunk(ch);
    if (ch.trim()) sawBody = true;
    // natural stop: blank line after answer started, or double newline sequences
    if (sawBody && out.endsWith('\n\n')) { out = out.slice(0, -2); break; }
    // yield to UI thread periodically
    if (step % 8 === 7) await new Promise(res => setTimeout(res, 0));
  }
  return out;
}
