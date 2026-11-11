# EB Wedding Videography explainer (45 s)

A short explainer for eb.wetframes.co: a wedding film does not have to mean being directed all day, here is what you get, and here is how to book.

## Files

| File | What it is |
|---|---|
| `out/master_16x9.mp4` | 1920×1080, 60 fps, H.264 crf 16, AAC. The master. |
| `out/cut_9x16.mp4` | 1080×1920 recomposition for Reels, TikTok and Shorts. |
| `out/cut_1x1.mp4` | 1080×1080 recomposition for feeds. |
| `out/reduced_motion_16x9.mp4` | Same ideas in the same order as 21 stills with dissolves. |
| `out/captions.srt` | The 16 caption lines, also burned into every cut. |
| `out/contact.png` | One still per beat of the master. |
| `out/audio.wav` | The music bed on its own. |
| `src/` | `timeline.js` (every beat, line and cue), `film.js` (drawing), `audio.js` (music). |
| `directions.html` | The four looks considered and why A won. |
| `DECISIONS.md`, `SOURCES.md` | Calls made without asking; where every on-screen claim comes from. |

Rebuild everything with `./build.sh`. Preview live by serving this folder and opening `src/film.html?fmt=16x9&play=1` (`fmt` is `16x9`, `9x16` or `1x1`; add `rm=1` for reduced motion).

## What was tested

- Same frame rendered twice in separate browser launches: byte-identical PNGs (16:9 at 13.37 s and 27.01 s, 9:16 at 13.37 s).
- All four videos probed: 45.000 s, 2700 frames, 60 fps, yuv420p, with audio.
- Loudness measured on the final files: -15.9 LUFS integrated, peak -4.4 dBFS, no silent gaps over 0.5 s.
- Stills at every beat reviewed in all three formats; five layout problems found and fixed (type too small, caption orphan in 1:1, gallery frame touching the headline in 9:16 and 1:1, REC read-out touching the tagline in 9:16, films overlapping the booking steps for half a second).
- 9:16 cut read at 390 px wide: every line legible.
- Contrast computed against the navy ground: lowest text tone is 6.5:1, captions 13.1:1.
- Captions: at most 20 characters per second, at most two lines. On-screen lines: at most 6 words.
- Nothing flashes; the fastest repeating change is one cue per 0.5 s.
- Mid-transition frames pulled from the encoded master and checked.

## What was not tested

- Nobody has listened to the audio. Levels and silence were measured, but how the music sounds was not judged by ear.
- The music is not bit-identical between runs (the frames are); the cause was not investigated.
- No voice-over exists, so "duck the bed under voice" does not apply.
- The design review was done by the author against stills, not by a separate reviewer, and the videos were not watched in real time in a player.
- The REC red dot is 3.7:1 against navy. It is a status mark, not text, and is always paired with the word REC or with corner marks.

## Rights

The logo, fonts, copy and four film stills were taken from eb.wetframes.co for a film about that same business. Confirm the couples shown are happy to appear in an advert before publishing it.
