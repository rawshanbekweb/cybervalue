"""Records video-lesson narration with the open Navoiy TTS model (Apache-2.0,
aisha-org/navoiy-tts on CosyVoice2). See docs/video-lessons.md.

  NAVOIY_HOME=~/tts python scripts/navoiy-tts.py lines.json out/ ref.wav calm

NAVOIY_HOME holds the CosyVoice checkout, navoiy/ (the model repo files) and
models/ (CosyVoice2-0.5B and emotion_600h_joint.pt). Runs on CPU or GPU."""
import json, random, sys, time
from pathlib import Path

import os
ROOT = Path(os.environ.get("NAVOIY_HOME", ".")).resolve()
sys.path.insert(0, str(ROOT / "CosyVoice"))
sys.path.insert(0, str(ROOT / "CosyVoice/third_party/Matcha-TTS"))
sys.path.insert(0, str(ROOT / "navoiy"))

import torch, torchaudio
from cosyvoice.cli.cosyvoice import CosyVoice2
from uztts.normalize import normalize

lines = json.loads(Path(sys.argv[1]).read_text())
out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
ref = sys.argv[3] if len(sys.argv) > 3 else str(ROOT / "CosyVoice/asset/zero_shot_prompt.wav")
emotion_name = sys.argv[4] if len(sys.argv) > 4 else "calm"
emotions = json.loads((ROOT / "navoiy/emotions_40h.json").read_text())
emotion = next(e for e in emotions if emotion_name in e["tag"].lower() or e["uz"].lower() == emotion_name)
instruction = emotion["instruct"].strip() + "<|endofprompt|>"
torch.set_num_threads(4)

model = CosyVoice2(str(ROOT / "models/CosyVoice2-0.5B"), load_jit=False, load_trt=False, fp16=False)
state = torch.load(ROOT / "models/navoiy/emotion_600h_joint.pt", map_location="cpu", weights_only=True)
for key in ("state_dict", "model", "llm"):
    if isinstance(state, dict) and isinstance(state.get(key), dict):
        state = state[key]
res = model.model.llm.load_state_dict(state, strict=False)
print("missing", len(res.missing_keys), "unexpected", len(res.unexpected_keys), flush=True)
model.model.llm.eval()

for item in lines:
    target = out / f"{item['id']}.wav"
    if target.exists():
        continue
    random.seed(1986); torch.manual_seed(1986)
    t0 = time.time()
    raw = item["text"].replace("‘", "'").replace("’", "'").replace("ʻ", "'").replace("ʼ", "'").replace("“", "").replace("”", "").replace(" — ", ", ")
    text = normalize(raw, mode="infer")
    chunks = []
    with torch.inference_mode():
        for r in model.inference_instruct2(text, instruction, ref, stream=False, speed=item.get("speed", 1.0)):
            chunks.append(r["tts_speech"].detach().cpu())
    audio = torch.cat(chunks, dim=1)
    torchaudio.save(str(target), audio, 24000)
    d = audio.shape[-1] / 24000
    print(f"{item['id']}: {d:.1f}s audio in {time.time()-t0:.1f}s", flush=True)
