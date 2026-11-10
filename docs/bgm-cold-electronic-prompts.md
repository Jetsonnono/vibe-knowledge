# 《幸存者偏差》60s · 冷电子 BGM 生成提示词

> 用途：按成片卡点分段生成 / 拼轨。气质：**cold electronic**（冷电子纪录片 / 科技解谜）。  
> 总长：60s · 120–124 BPM 可 · 无歌词 · 低中频为主，不抢字幕。

## Master prompt（整曲）

```
Cold electronic documentary underscore, 60 seconds, instrumental only,
dark cyan atmosphere, sparse and precise, sidechained soft pads,
deep sub bass, glassy arpeggio, minimal techno pulse that stays under voice,
no vocals, no drops that slam, cinematic knowledge-video energy,
mix leaves headroom for SFX hits at cue points.
```

## 分段提示词（对齐成片）

| 时段 | 画面卡点 | Prompt |
| --- | --- | --- |
| 0:00–0:08 | 弹孔 tick → 提问 ding | `Cold intro: filtered noise wash, soft ticking pulse synced to sparse hits, glassy high arpeggio enters gently, tension without aggression, 0–8s` |
| 0:08–0:10 | 「错了」impact 前留白→impact | `Near-silence then a controlled low impact boom and bass duck, freeze the groove for 0.7s before the hit, cold electronic, 8–10s` |
| 0:10–0:22 | 幽灵反转 | `Airy cold pad, distant sub bass, slow evolving chord (Am–F–C–G color), sparse pulse, mysterious reveal mood, 10–22s` |
| 0:22–0:28 | 筛子 | `Light IDM ticks, descending synth motif suggesting filtering, keep groove thin, 22–28s` |
| 0:28–0:34 | 片名 chime | `Lift: brighter cold chords, short melodic hook on glassy synth, still restrained, title-card energy, 28–34s` |
| 0:34–0:42 | 三例迁移 | `Syncopated soft kick + muted pluck ostinato, modern cold tech, slight forward motion, 34–42s` |
| 0:42–0:50 | 缺席？ | `Sparse again, questioning interval motif, space and delay, 42–50s` |
| 0:50–1:00 | 金句 resolve | `Rest 0.8s then warm-cold resolution: Am tonic melody, long pad tail, emotional but not cinematic trailer, fade out, 50–60s` |

## Negative prompt

```
no vocals, no EDM festival drop, no trap hi-hats wall, no cheerful pop,
no lo-fi vinyl crackle comedy vibe, no orchestral trailer brass
```
