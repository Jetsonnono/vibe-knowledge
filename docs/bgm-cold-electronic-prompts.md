# 《幸存者偏差》60s · 冷电子 BGM 生成提示词（连续性修订）

> 气质：**cold electronic** · 总长 60s · 无歌词  
> **结构规则（必须）**：相邻段 **重叠 0.8–1.5s crossfade**；arp/pad/bass **不得**在段缝整段停掉；大卡点前最多 **0.3–0.6s 轻收**，禁止 ~2s+ 死静音。

## Master prompt

```
Cold electronic documentary underscore, 60 seconds, instrumental only,
continuous overlapping sections with 1s crossfades, dark cyan atmosphere,
sidechained soft pads (shallow), deep sub bass always present,
glassy arpeggio that never fully stops, minimal techno pulse under dialogue,
no vocals, no hard silent gaps, leave slight headroom for SFX.
```

## 分段提示词（交叠时间）

| 时段（含重叠） | 画面卡点 | Prompt |
| --- | --- | --- |
| 0:00–0:09 | 弹孔→提问 | `Cold intro pad+bass+arp, continuous, glassy arp enters ~2s, tension, crossfade into next by 8.5–9.5s` |
| 0:07.6–0:08.4 | 「错了」前轻收 | `ONLY 0.3–0.5s light decay of mids, keep sub pad; never dead silence; then continue` |
| 0:09.0–0:23 | 幽灵（9.0 起淡入） | `Airy cold pad fading in from 9.0 overlapping impact tail; Am–F–C–G; sparse pulse; arp continues` |
| 0:21.4–0:29 | 筛子 | `Descending arp motif, thin groove, 0.8–1.2s overlap with previous/next chord blocks` |
| 0:27.4–0:35 | 片名 | `Brighter cold chords + melodic hook; crossfade from sieve; arp keeps running` |
| 0:33.6–0:43 | 迁移 | `Soft syncopation, muted plucks with release tails, shallow sidechain only, no 50ms cliffs` |
| 0:41.6–0:51.2 | 缺席？ | `Sparser intervals but continuous LF pad; questioning motif; carry through to resolve` |
| 0:50.25–0:50.75 | 金句前 | `0.4–0.6s light dip on mids/highs ONLY; keep low-frequency pad; then 0.5s fade-in` |
| 0:50.3–1:00 | 金句 resolve | `Am tonic melody, long pad tail, fade out by 60s` |

## Negative prompt

```
no hard silent gaps longer than 0.6s, no hard cuts between sections,
no vocals, no festival EDM drops, no trap hat walls, no cheerful pop
```

## 实现备注

- 成片文件：`remotion-survivorship/public/sfx/bgm-survivorship.mp3`
- 生成脚本：`remotion-survivorship/scripts/gen_bgm_cold_electronic.py`
- `BeatAudio.tsx`：整曲单轨播放；duck 仅约 –2～–4dB，且避开短留白窗
