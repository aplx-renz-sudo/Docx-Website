#!/usr/bin/env python3
"""
VileDocx Atom 1M — a REAL character-level GPT, trained from scratch.

Architecture (~978k params to honour the "Atom 1M" name):
  vocab 66 (chars) | d_model 96 | 4 layers | 4 heads | ctx 128
Output: Float16 weights + vocab exported for 100% in-browser inference
        (see src/providers/atom-inference.ts).
"""
import json, math, time, numpy as np, torch, torch.nn as nn, torch.nn.functional as F

torch.manual_seed(42); np.random.seed(42)
DEV = "cuda" if torch.cuda.is_available() else "cpu"

# ---------------- data ----------------
text = open("corpus.txt", encoding="utf-8").read()
chars = sorted(set(text))
vocab = {c: i for i, c in enumerate(chars)}
ivocab = {i: c for c, i in vocab.items()}
V = len(chars)
data = np.array([vocab[c] for c in text], dtype=np.int64)
print(f"data tokens: {len(data):,}  vocab: {V}")

# ---------------- model ----------------
D, H, L, BLK = 96, 4, 4, 128

class Head(nn.Module):
    def __init__(s, d):
        super().__init__()
        s.q = nn.Linear(d, d, bias=False); s.k = nn.Linear(d, d, bias=False); s.v = nn.Linear(d, d, bias=False); s.o = nn.Linear(d, d, bias=False)
        s.register_buffer("trie", torch.tril(torch.ones(BLK, BLK)))
    def forward(s, x):
        B, T, C = x.shape
        q, k, v = s.q(x), s.k(x), s.v(x)
        w = (q @ k.transpose(-2, -1)) / math.sqrt(C)
        w = w.masked_fill(s.trie[:T, :T] == 0, float("-inf")).softmax(-1)
        return s.o(w @ v)

class Block(nn.Module):
    def __init__(s):
        super().__init__()
        s.ln1 = nn.LayerNorm(D); s.att = Head(D)
        s.ln2 = nn.LayerNorm(D); s.mlp = nn.Sequential(nn.Linear(D, 4 * D), nn.GELU(), nn.Linear(4 * D, D))
    def forward(s, x):
        x = x + s.att(s.ln1(x)); x = x + s.mlp(s.ln2(x)); return x

class Atom(nn.Module):
    def __init__(s):
        super().__init__()
        s.tok = nn.Embedding(V, D); s.pos = nn.Embedding(BLK, D)
        s.blocks = nn.ModuleList([Block() for _ in range(L)])
        s.lnf = nn.LayerNorm(D); s.head = nn.Linear(D, V, bias=False)
    def forward(s, idx, tgt=None):
        B, T = idx.shape
        x = s.tok(idx) + s.pos(torch.arange(T, device=idx.device))
        for blk in s.blocks: x = blk(x)
        logits = s.head(s.lnf(x))
        loss = F.cross_entropy(logits[:, :-1].reshape(-1, V), tgt[:, 1:].reshape(-1)) if tgt is not None else None
        return logits, loss

model = Atom().to(DEV)
nparams = sum(p.numel() for p in model.parameters())
print(f"parameters: {nparams:,}")

# ---------------- training ----------------
opt = torch.optim.AdamW(model.parameters(), lr=3e-3, weight_decay=1e-2)
bs = 64
steps = 3000
@torch.no_grad()
def get_batch():
    i = torch.randint(len(data) - BLK - 1, (bs,))
    x = torch.stack([torch.from_numpy(data[j: j + BLK]) for j in i]).to(DEV)
    y = torch.stack([torch.from_numpy(data[j + 1: j + BLK + 1]) for j in i]).to(DEV)
    return x, y

lr_sched = lambda it: 3e-3 * (1 - it / steps) ** 0.9 + 1e-4
t0 = time.time()
for it in range(steps + 1):
    for g in opt.param_groups: g["lr"] = lr_sched(it)
    xb, yb = get_batch()
    _, loss = model(xb, yb)
    opt.zero_grad(set_to_none=True); loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    opt.step()
    if it % 250 == 0:
        with torch.no_grad():
            vl = []
            for _ in range(6):
                xv, yv = get_batch(); _, l = model(xv, yv); vl.append(l.item())
        print(f"step {it:5d} | train {loss.item():.3f} | val {np.mean(vl):.3f} | ppl {math.exp(np.mean(vl)):.1f} | {(time.time()-t0)/60:.1f} min", flush=True)

# ---------------- generate check ----------------
@torch.no_grad()
def generate(prompt, maxn=220, temp=0.7):
    ctx = [vocab.get(c, vocab[" "]) for c in prompt][-BLK:]
    idx = torch.tensor([ctx], device=DEV)
    out = []
    for _ in range(maxn):
        logits, _ = model(idx)
        probs = F.softmax(logits[:, -1] / temp, dim=-1)
        nxt = torch.multinomial(probs[0], 1).view(1, 1)
        out.append(ivocab[nxt.item()])
        idx = torch.cat((idx, nxt), dim=1)
        if len(idx.shape) and idx.shape[1] >= BLK: idx = idx[:, -BLK:]
    return "".join(out)

for q in ["User: who are you?\nAssistant:", "User: tell me a joke\nAssistant:", "Question: what is the capital of France\nAnswer:"]:
    print("\n=== SAMPLE ===\n" + q + generate(q))

# ---------------- export Float16 web tensors ----------------
sd = {k: v.detach().cpu() for k, v in model.state_dict().items()}
order = ["tok.weight", "pos.weight", "lnf.weight", "lnf.bias"]
for li in range(L):
    order += [f"blocks.{li}.ln1.weight", f"blocks.{li}.ln1.bias", f"blocks.{li}.att.q.weight",
              f"blocks.{li}.att.k.weight", f"blocks.{li}.att.v.weight", f"blocks.{li}.att.o.weight",
              f"blocks.{li}.ln2.weight", f"blocks.{li}.ln2.bias",
              f"blocks.{li}.mlp.0.weight", f"blocks.{li}.mlp.0.bias",
              f"blocks.{li}.mlp.2.weight", f"blocks.{li}.mlp.2.bias"]
blob = b""; meta = []
for k in order:
    t = sd[k].half().numpy()
    meta.append({"name": k, "shape": list(t.shape), "offset": len(blob)})
    blob += t.tobytes()

import os
os.makedirs("../../public/models", exist_ok=True)
with open("../../public/models/atom-1m.bin", "wb") as f: f.write(blob)
with open("../../public/models/atom-1m.json", "w") as f:
    json.dump({"vocab": chars, "tensors": meta, "config": {"D": D, "H": H, "L": L, "BLK": BLK, "V": V, "params": nparams}}, f)
print(f"\nExported {len(blob)/1e6:.2f} MB Float16 weights -> public/models/")
