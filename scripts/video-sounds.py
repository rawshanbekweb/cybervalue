"""Generates the background music and sound effects of the video lessons.

Everything is synthesised here, so there is nothing to license:

  python3 scripts/video-sounds.py .video-cache/sounds

writes music.wav (a calm 90 BPM loop, about 43 s) and whoosh, pop, alarm,
type, ding and magic .wav files, all 24 kHz mono. scripts/video-tts.ts mixes
them under the narration. Needs numpy and scipy.
"""
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

SR = 24000
rng = np.random.default_rng(7)


def t(seconds):
    return np.arange(int(SR * seconds)) / SR


def env(n, attack=0.01, release=0.2):
    a = np.minimum(1, np.arange(n) / max(1, int(SR * attack)))
    r = np.minimum(1, (n - np.arange(n)) / max(1, int(SR * release)))
    return a * r


def lowpass(x, hz):
    b, a = butter(2, hz / (SR / 2), "low")
    return lfilter(b, a, x)


def highpass(x, hz):
    b, a = butter(2, hz / (SR / 2), "high")
    return lfilter(b, a, x)


def note(f, seconds, kind="sine"):
    x = t(seconds)
    if kind == "saw":
        return 2 * ((x * f) % 1) - 1
    if kind == "tri":
        return 2 * np.abs(2 * ((x * f) % 1) - 1) - 1
    return np.sin(2 * np.pi * f * x)


def save(path, x, gain=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    wavfile.write(path, SR, (x * 32767).astype(np.int16))


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


def music():
    bpm = 90
    beat = 60 / bpm
    bar = beat * 4
    # Am  F  C  G, two rounds: 8 bars.
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]] * 2
    total = int(SR * bar * len(chords))
    out = np.zeros(total)
    for i, chord in enumerate(chords):
        start = int(SR * bar * i)
        # Soft pad.
        pad = sum(lowpass(note(midi(n), bar, "saw"), 900) for n in chord) / 3
        pad *= env(len(pad), 0.4, 0.6) * 0.35
        out[start : start + len(pad)] += pad
        # Bass.
        bass = note(midi(chord[0] - 12), bar, "tri") * env(int(SR * bar), 0.02, 0.3) * 0.35
        out[start : start + len(bass)] += bass
        # Plucked arpeggio in eighths.
        for k in range(8):
            n = chord[k % 3] + (12 if k >= 4 else 0)
            p = note(midi(n), beat / 2, "tri") * np.exp(-t(beat / 2) * 9) * 0.18
            s = start + int(SR * k * beat / 2)
            out[s : s + len(p)] += p
        # Kick on 1 and 3, hat on the off-beats.
        for k in range(4):
            s = start + int(SR * k * beat)
            if k % 2 == 0:
                x = t(0.25)
                kick = np.sin(2 * np.pi * (50 + 80 * np.exp(-x * 30)) * x) * np.exp(-x * 14) * 0.5
                out[s : s + len(kick)] += kick
            h = s + int(SR * beat / 2)
            hat = highpass(rng.normal(0, 1, int(SR * 0.05)), 6000) * np.exp(-t(0.05) * 70) * 0.08
            out[h : h + len(hat)] += hat
    return out


def whoosh():
    n = int(SR * 0.6)
    noise = rng.normal(0, 1, n)
    sweep = np.linspace(300, 3000, n)
    y = np.zeros(n)
    # A band of noise sliding upwards.
    for i in range(0, n, 600):
        seg = noise[i : i + 600]
        b, a = butter(2, [sweep[i] / (SR / 2), min(0.95, sweep[i] * 1.6 / (SR / 2))], "band")
        y[i : i + len(seg)] = lfilter(b, a, seg)
    return y * np.sin(np.linspace(0, np.pi, n)) ** 2


def pop():
    x = t(0.12)
    return np.sin(2 * np.pi * (900 - 500 * x / 0.12) * x) * np.exp(-x * 40)


def alarm():
    parts = []
    for f in (880, 660, 880, 660):
        parts.append(note(f, 0.16, "saw") * env(int(SR * 0.16), 0.005, 0.03) * 0.6)
    return lowpass(np.concatenate(parts), 3000)


def typing():
    out = np.zeros(int(SR * 1.2))
    for k in range(9):
        s = int(SR * (k * 0.13 + rng.uniform(0, 0.03)))
        c = highpass(rng.normal(0, 1, int(SR * 0.02)), 2500) * np.exp(-t(0.02) * 250)
        out[s : s + len(c)] += c
    return out


def ding():
    x = t(0.9)
    return (np.sin(2 * np.pi * 1320 * x) + 0.5 * np.sin(2 * np.pi * 1980 * x)) * np.exp(-x * 5)


def magic():
    out = np.zeros(int(SR * 1.0))
    for k, n in enumerate([72, 76, 79, 84, 88]):
        p = note(midi(n), 0.5) * np.exp(-t(0.5) * 7) * 0.5
        s = int(SR * k * 0.08)
        out[s : s + len(p)] += p
    return out


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else ".video-cache/sounds")
    out.mkdir(parents=True, exist_ok=True)
    save(out / "music.wav", music(), 0.8)
    for name, fn in [
        ("whoosh", whoosh),
        ("pop", pop),
        ("alarm", alarm),
        ("type", typing),
        ("ding", ding),
        ("magic", magic),
    ]:
        save(out / f"{name}.wav", fn())
    print(f"sounds → {out}")


if __name__ == "__main__":
    main()
