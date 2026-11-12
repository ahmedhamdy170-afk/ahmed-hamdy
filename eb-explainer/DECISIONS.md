# Decisions

One line per call made without asking.

- Topic: what EB Wedding Videography does and how to book it. Source of truth is eb.wetframes.co as read on 2026-11-11.
- Audience: engaged couples in the UK who believe a wedding film means a camera in their face and being directed all day.
- Outcome: after watching they can say "it is filmed from the background, booking is four steps, and films start from £1,450".
- Length: 45 s, 18 bars at 96 BPM, so every scene change lands on a bar line.
- Language: English, because the site and its audience are English. Captions are the narration.
- No voice-over: the environment has no speech synthesis or recording, so the film is written to work on captions and music alone. Ducking is therefore not applicable.
- One question the film answers: "Will having a videographer ruin how our day feels?"
- Hook: the belief that a wedding film means being staged. The site's own copy contradicts it ("I blend into the background").
- Metaphor: none. The viewfinder bracket is the camera, the two dots are the couple, the line is the day.
- Direction chosen: A "Viewfinder" (see directions.html). It reuses the site's REC frame and timecode, so the film looks like the site.
- Ground: brand navy #172556, not a warm neutral. The brand overrides the generic rule.
- Accent: the site's REC red #e04a4a, used only for "recording" and "captured". Capture is also shown by corner marks, so colour is never the only signal.
- Type: Cormorant Semibold and Manrope, the site's two faces, loaded from the site's own font files.
- The bracket is the single object that survives every scene: tight frame, camera, film frame, gallery, step marker, coverage window, wide frame.
- "Direction is rare" rather than "never": the site says a gentle direction happens on rare occasions.
- Cut list (left out on purpose): engraved USB, 60-second social teaser, ceremony and speeches edits, destination weddings, the enquiry form fields.
- Film stills: the four thumbnails the site shows under "Recent films", used as the site uses them, with the same names and venues.
- Vertical and square cuts are recomposed (stacked grid, larger type, staggered day labels), not cropped.
- Reduced-motion cut: the same 21 settled frames joined by 0.4 s dissolves, captions on real time.
- Design review and accessibility pass were done inline against the stills, not by a separate reviewer.

## Version 2 (photo-led), 2026-11-12

- Footage and voice-over were not available (YouTube blocked two films behind a sign-in check and the downloads were refused for the other two), so v2 works from the site's own stills only.
- Every scene now sits on a real photo: Robert & Laura crowded and desaturated in the opening, the four films full-bleed in the proof, and the same couple wide and in full colour at the end.
- The filmmaker's own photo from the site carries "The camera follows. It doesn't lead."
- The two white dots no longer stand in for the couple while the photo shows them; they appear only on the day-line diagram.
- Navy bands sit behind text and are computed per frame so every line keeps at least 0.72 navy cover.
- The payoff text moved to the bottom so the couple's faces stay clear.
- In 9:16 and 1:1 the full viewfinder is shorter and lower so its read-outs never touch the headline.
- Music: pads up an octave and quieter, a high-pass at 120 Hz and a low-shelf cut, a new arpeggio and bar bells, a lift on the first real film. Energy below 350 Hz went from most of the mix to about 10%.
