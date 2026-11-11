# 王家大院 · Wang Courtyard VR Scan

Immersive vertical cinematic autoplay roam of **王家大院 (Wang Family Courtyard)** — Vite + Three.js, procedural low-poly architecture, dusk→night lighting, point-cloud gate intro, and reference-style HUD.

## Run

```bash
cd wang-courtyard-demo
npm install
npm run dev
```

Open the printed local URL (portrait stage ~9:16). Tap **Ⅱ** to pause autoplay and orbit; **▶** resumes the roam.

## Chapters

1. Point-cloud gate → **王家大院**
2. Fortress wall dusk push → **堡院 / THE FORTRESS COURT** (brick relief, embers, rim light)
3. Aerial grey-tile courtyards → **五巷五堡** (only aerial beat)
4. Night main court axis → **高家崖**
5. Brick carving / account room → **三雕 · 账房** (extruded relief, shaft light, gold dust)
6. Closing night gate orbit → **中国民居艺术馆** (eye-level slow orbit — not aerial)

Loop ≈ 78s. Chapter edges use a soft point-cloud dissolve. Debug: `window.__WANG_DEMO__.seek(seconds)`.
