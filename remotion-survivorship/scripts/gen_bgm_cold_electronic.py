#!/usr/bin/env python3
"""Cold-electronic 60s BGM with overlapping section crossfades (continuity fix)."""

from __future__ import annotations

import math
import wave

import numpy as np

SR = 44100
FPS = 30
DUR = 60.0
N = int(SR * DUR)
t = np.arange(N, dtype=np.float64) / SR
rng = np.random.default_rng(31)


def softclip(x: np.ndarray, d: float = 1.06) -> np.ndarray:
    return np.tanh(x * d) / math.tanh(d)


def place(buf: np.ndarray, t0: float, sig: np.ndarray, amp: float = 1.0) -> None:
    i0 = int(round(t0 * SR))
    if i0 >= N or i0 < 0:
        return
    i1 = min(N, i0 + len(sig))
    buf[i0:i1] += amp * sig[: i1 - i0]


def xfades(t0: float, t1: float, fade_in: float = 1.0, fade_out: float = 1.0) -> np.ndarray:
    """Continuous gain envelope with linear in/out overlaps."""
    e = np.zeros(N)
    m = (t >= t0) & (t <= t1)
    e[m] = 1.0
    if fade_in > 0:
        mi = (t >= t0) & (t < t0 + fade_in)
        e[mi] = (t[mi] - t0) / fade_in
    if fade_out > 0:
        mo = (t > t1 - fade_out) & (t <= t1)
        e[mo] = (t1 - t[mo]) / fade_out
    return np.clip(e, 0, 1)


def sine(freq: float) -> np.ndarray:
    return np.sin(2 * np.pi * freq * t)


def saw(freq: float) -> np.ndarray:
    y = np.zeros_like(t)
    for h in range(1, 9):
        y += (1 / h) * np.sin(2 * np.pi * h * freq * t)
    return 0.55 * y


def noise_lp(k: int = 40) -> np.ndarray:
    n = rng.standard_normal(N)
    return np.convolve(n, np.ones(k) / k, mode="same")


def one_pole(x: np.ndarray, coef: float = 0.2) -> np.ndarray:
    """Approx one-pole via short moving average (vectorized)."""
    k = max(3, int(round(2.0 / max(coef, 1e-3))))
    k = min(k, 801)
    if k % 2 == 0:
        k += 1
    kernel = np.ones(k, dtype=np.float64) / k
    return np.convolve(x, kernel, mode="same")


def chord(freqs: list[float], t0: float, t1: float, amp: float, fade: float = 1.1) -> np.ndarray:
    e = xfades(t0, t1, fade_in=fade, fade_out=fade)
    out = np.zeros(N)
    for f in freqs:
        out += saw(f) * 0.65 + sine(f) * 0.35
    out /= max(len(freqs), 1)
    return amp * e * out


def pluck(freq: float, dur: float = 0.7, bright: float = 0.28) -> np.ndarray:
    nlen = int(dur * SR)
    tt = np.arange(nlen) / SR
    wave = (
        np.sin(2 * np.pi * freq * tt)
        + bright * 0.4 * np.sin(2 * np.pi * 2 * freq * tt)
        + bright * 0.15 * np.sin(2 * np.pi * 3 * freq * tt)
    )
    # longer release to avoid 50ms cliffs
    e = (1 - np.exp(-tt * 70)) * np.exp(-tt * 2.0)
    return softclip(wave * e)


def soft_kick(dur: float = 0.3) -> np.ndarray:
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = 68 * np.exp(-tt * 11) + 34
    ph = 2 * np.pi * np.cumsum(f) / SR
    return softclip(np.sin(ph) * np.exp(-tt * 6.5))


def soft_tick(dur: float = 0.05) -> np.ndarray:
    n = int(dur * SR)
    tt = np.arange(n) / SR
    return softclip(0.45 * np.sin(2 * np.pi * 1180 * tt) * np.exp(-tt * 48))


def main() -> None:
    Am = [220.00, 261.63, 329.63]
    Fmaj = [174.61, 220.00, 261.63]
    Cmaj = [130.81, 164.81, 196.00, 261.63]
    Gmaj = [196.00, 246.94, 293.66]
    Em = [164.81, 196.00, 246.94]

    pads = np.zeros(N)
    # Overlapping chord blocks (~1–1.2s crossfade via fade param)
    pads += chord(Am, 0.0, 8.6, 0.055, fade=1.2)  # extends past old 7.8 cut
    pads += chord(Am, 9.0, 13.8, 0.052, fade=1.2)  # ghost early fade-in from 9.0
    pads += chord(Fmaj, 12.6, 16.8, 0.05, fade=1.1)
    pads += chord(Cmaj, 15.6, 19.8, 0.048, fade=1.1)
    pads += chord(Gmaj, 18.6, 23.2, 0.046, fade=1.1)  # overlaps sieve
    pads += chord(Em, 21.4, 28.8, 0.044, fade=1.1)  # overlaps title
    pads += chord(Am, 27.4, 31.0, 0.058, fade=1.0)
    pads += chord(Fmaj, 29.6, 33.0, 0.055, fade=1.0)
    pads += chord(Cmaj, 31.6, 35.2, 0.052, fade=1.0)  # overlaps transfer
    pads += chord(Am, 33.6, 37.4, 0.05, fade=1.0)
    pads += chord(Gmaj, 36.0, 40.0, 0.048, fade=1.0)
    pads += chord(Fmaj, 38.6, 43.2, 0.046, fade=1.0)  # overlaps ask
    pads += chord(Em, 41.6, 46.4, 0.042, fade=1.0)
    pads += chord(Am, 45.0, 51.3, 0.04, fade=1.0)  # carries through short pre-resolve
    pads += chord(Am, 50.3, 59.0, 0.062, fade=0.55)  # resolve fade-in ~0.5s
    pads += chord([440.0, 523.25, 659.25], 52.0, 58.5, 0.022, fade=1.0)

    # Continuous low pad under intentional micro-rests
    sub = 0.045 * sine(55.0) * xfades(0.0, 59.2, 1.0, 1.5)
    sub += 0.02 * sine(110.0) * xfades(0.0, 59.0, 1.2, 1.5)

    # Mild sidechain (reduced depth — fix #5)
    sc = np.ones(N)
    bpm = 120.0
    beat = 60.0 / bpm
    for ts in np.arange(0, 60, beat / 2):
        depth = 0.10
        if 34 <= ts < 42:
            depth = 0.14  # was harsher
        if 10 <= ts < 22:
            depth = 0.12
        sc *= 1 - depth * np.exp(-((t - ts) ** 2) / (2 * 0.05**2))
    pads *= 0.55 + 0.45 * sc  # never fully duck pads

    # Bass with overlapping notes
    bass = np.zeros(N)
    bass_notes = [
        (0.0, 8.8, 55.0),
        (9.0, 13.5, 55.0),
        (12.8, 16.8, 43.65),
        (15.8, 19.8, 65.41),
        (18.8, 23.0, 49.0),
        (21.6, 28.6, 41.2),
        (27.6, 31.0, 55.0),
        (29.8, 33.2, 43.65),
        (31.8, 35.2, 65.41),
        (33.8, 37.5, 55.0),
        (36.2, 40.2, 49.0),
        (38.8, 43.2, 43.65),
        (41.8, 46.5, 41.2),
        (45.2, 51.2, 55.0),
        (50.4, 58.8, 55.0),
    ]
    for t0, t1, f in bass_notes:
        e = xfades(t0, t1, fade_in=0.9, fade_out=0.9)
        body = sine(f) + 0.3 * sine(f * 2)
        gate = np.ones(N)
        if 34 <= t0 < 42:
            # soft pulse, not hard gate cliffs
            gate = 0.55 + 0.45 * (0.5 + 0.5 * np.sin(2 * np.pi * (bpm / 60) * 2 * t))
        bass += 0.085 * e * body * gate

    # Continuous arp — no full stops between sections
    arp = np.zeros(N)
    patterns = {
        "A": [440.0, 523.25, 659.25, 783.99, 659.25, 523.25],
        "F": [349.23, 440.0, 523.25, 698.46, 523.25, 440.0],
        "desc": [659.25, 587.33, 523.25, 493.88, 440.0, 392.0],
        "sparse": [523.25, 659.25, 783.99, 659.25],
    }

    def run_arp(t0: float, t1: float, pattern: list[float], step: float, amp: float) -> None:
        i = 0
        ts = t0
        while ts < t1:
            f = pattern[i % len(pattern)]
            place(arp, ts, pluck(f, dur=0.75, bright=0.25), amp)
            i += 1
            ts += step

    # Overlapping arp spans
    run_arp(1.8, 9.2, patterns["A"], 0.2, 0.02)
    run_arp(8.8, 22.8, patterns["A"], 0.25, 0.022)  # through former gap into ghost/sieve
    run_arp(21.6, 29.0, patterns["desc"], 0.2, 0.02)
    run_arp(27.6, 35.0, patterns["A"], 0.167, 0.026)
    run_arp(33.8, 43.0, patterns["F"], 0.167, 0.024)
    run_arp(41.8, 51.0, patterns["sparse"], 0.3, 0.016)  # through short pre-resolve
    run_arp(50.5, 57.8, patterns["A"], 0.25, 0.024)

    # Lead motifs
    lead = np.zeros(N)

    def lead_phrase(t0: float, freqs: list[float], gaps: list[float], amp: float, dur: float) -> None:
        tt0 = t0
        for f, g in zip(freqs, gaps):
            place(lead, tt0, pluck(f, dur=dur, bright=0.3), amp)
            tt0 += g

    lead_phrase(2.05, [659.25, 523.25, 440.0], [0.32, 0.32, 0.4], 0.05, 0.7)
    lead_phrase(28.3, [440.0, 523.25, 659.25, 783.99], [0.28, 0.28, 0.28, 0.4], 0.07, 0.75)
    lead_phrase(45.7, [523.25, 659.25], [0.35, 0.45], 0.045, 0.65)
    lead_phrase(50.9, [440.0, 523.25, 659.25, 880.0], [0.4, 0.4, 0.45, 0.6], 0.065, 0.9)

    # Supportive pulse (soft)
    pulse = np.zeros(N)
    kick = soft_kick()
    tick = soft_tick()
    for ts in np.arange(10.0, 21.8, beat):
        place(pulse, ts, kick, 0.055)
    for ts in np.arange(28.5, 33.5, beat):
        place(pulse, ts, kick, 0.05)
    for ts in np.arange(34.0, 41.8, beat / 2):
        if int(ts * 4) % 2 == 0:
            place(pulse, ts, kick, 0.06)
        else:
            place(pulse, ts, tick, 0.03)

    air = 0.012 * one_pole(noise_lp(30), 0.025) * xfades(0.0, 9.5, 0.6, 1.5)

    body = pads + bass + arp + lead + pulse + air

    # (2) short resolve rest ~0.5s: dip mid/high, keep sub/LF
    RESOLVE = 50 + 24 / FPS  # 50.8
    mid_gain = np.ones(N)
    m = (t >= 50.25) & (t < 50.75)
    n_m = int(m.sum())
    if n_m > 0:
        n_down = max(1, int(0.18 * SR))
        n_up = max(1, int(0.18 * SR))
        n_hold = max(0, n_m - n_down - n_up)
        curve = np.concatenate(
            [
                np.linspace(1.0, 0.38, n_down),
                np.full(n_hold, 0.38),
                np.linspace(0.38, 1.0, n_up),
            ]
        )
        mid_gain[m] = curve[:n_m]
    mix = sub + body * mid_gain

    # (1) light impact approach decay ~0.4s — never dead silence
    IMPACT = 8.0
    approach = np.ones(N)
    m = (t >= 7.60) & (t < IMPACT)
    if m.any():
        approach[m] = np.linspace(1.0, 0.58, int(m.sum()))
    m2 = (t >= IMPACT) & (t < IMPACT + 0.4)
    if m2.any():
        approach[m2] = np.linspace(0.65, 1.0, int(m2.sum()))
    mix *= approach

    # mild cue ducks baked into file
    for c, w, depth in [
        (IMPACT, 0.14, 0.15),
        (28 + 8 / FPS, 0.2, 0.10),
        (RESOLVE, 0.22, 0.10),
        (2.0, 0.12, 0.08),
    ]:
        mix *= 1 - depth * np.exp(-((t - c) ** 2) / (2 * w**2))

    fade = np.ones(N)
    fade[t < 0.5] = t[t < 0.5] / 0.5
    fade[t > 57.8] = np.clip((60 - t[t > 57.8]) / 2.2, 0, 1)
    mix *= fade

    mix = softclip(one_pole(mix, 0.25) * 0.35 + mix * 0.65, 1.04)
    peak = float(np.max(np.abs(mix)) + 1e-9)
    mix = mix / peak * 0.9

    delay = int(0.013 * SR)
    left = mix
    right = np.concatenate([np.zeros(delay), mix[:-delay]]) * 0.9 + mix * 0.1

    out = "/workspace/remotion-survivorship/public/sfx/bgm-survivorship.wav"
    with wave.open(out, "w") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        interleaved = np.empty(N * 2, dtype=np.int16)
        interleaved[0::2] = (np.clip(left, -1, 1) * 32767).astype(np.int16)
        interleaved[1::2] = (np.clip(right, -1, 1) * 32767).astype(np.int16)
        w.writeframes(interleaved.tobytes())

    # energy report
    for name, a, b in [
        ("1-7", 1, 7),
        ("7.3-8.0", 7.3, 8.0),
        ("8.0-10.0", 8.0, 10.0),
        ("9.0-10.5", 9.0, 10.5),
        ("21.5-22.5", 21.5, 22.5),
        ("27.5-28.5", 27.5, 28.5),
        ("34-40", 34, 40),
        ("49.3-50.7", 49.3, 50.7),
        ("50.7-56", 50.7, 56),
    ]:
        seg = mix[(t >= a) & (t < b)]
        print(f"{name:12s} rms={float(np.sqrt(np.mean(seg**2))):.4f}")
    print("peak", peak, "wrote", out)


if __name__ == "__main__":
    main()
