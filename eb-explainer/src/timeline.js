// One TIMELINE object holds every beat, move and cue.
// Shared by the film page, the audio renderer and the caption exporter.
const TIMELINE = {
  duration: 45,
  fps: 60,
  bpm: 96, // beat = 0.625 s, bar = 2.5 s, 18 bars
  bar: 2.5,

  scenes: [
    { id: 'S1', name: 'Question', t0: 0, t1: 5, teaches: 'The fear: a wedding film means being directed all day.' },
    { id: 'S2', name: 'Model', t0: 5, t1: 15, teaches: 'The day runs on its own; the camera follows it.' },
    { id: 'S3', name: 'Proof', t0: 15, t1: 32.5, teaches: 'Real films exist, and booking one is four steps.' },
    { id: 'S4', name: 'Turn', t0: 32.5, t1: 40, teaches: 'Coverage is the one variable; the film grows with it.' },
    { id: 'S5', name: 'Payoff', t0: 40, t1: 45, teaches: 'Same couple, same camera, now at a distance. Check your date.' },
  ],

  // S1: each directive tightens the frame one notch.
  directives: [
    { t: 0.9, text: '“Look here.”', dx: -1, dy: 0 },
    { t: 1.7, text: '“Hold it.”', dx: 1, dy: 0 },
    { t: 2.5, text: '“Once more.”', dx: 0, dy: 1 },
  ],

  // S2: the couple walks the day; moments happen; the camera trails and captures.
  walk: { t0: 7.6, t1: 11.8, lag: 0.45 },
  moments: [
    { f: 0.3, text: 'The glance down the aisle' },
    { f: 0.58, text: 'The speech that made Dad cry' },
    { f: 1.0, text: 'The last song' },
  ],

  // Photo layer under everything: [t, zoom, navy dim, saturation, blur px] keys per shot.
  // fx/fy is the point of the photo held at frame centre. x = crossfade in, seconds.
  shots: [
    { t0: 0, img: 'film1.jpg', fx: 0.56, fy: 0.3, x: 0, keys: [[0, 1.7, 0.66, 0.3, 0], [4.9, 2.0, 0.68, 0.25, 0], [6.2, 1.08, 0.82, 0.6, 6], [12.9, 1.0, 0.82, 0.6, 6]] },
    { t0: 12.9, img: 'ebrahim.jpg', fx: 0.5, fy: 0.42, x: 0.6, keys: [[12.9, 1.1, 0.3, 1, 0], [15, 1.02, 0.3, 1, 0]] },
    { t0: 15.0, img: 'film1.jpg', fx: 0.56, fy: 0.36, x: 0.5, keys: [[15, 1.14, 0.08, 1, 0], [17, 1.04, 0.08, 1, 0]] },
    { t0: 16.9, img: 'film2.jpg', fx: 0.5, fy: 0.45, x: 0.35, keys: [[16.9, 1.1, 0.08, 1, 0], [18.1, 1.03, 0.08, 1, 0]] },
    { t0: 18.0, img: 'film3.jpg', fx: 0.52, fy: 0.42, x: 0.35, keys: [[18, 1.1, 0.08, 1, 0], [19.2, 1.03, 0.08, 1, 0]] },
    { t0: 19.1, img: 'film4.jpg', fx: 0.5, fy: 0.38, x: 0.35, keys: [[19.1, 1.1, 0.08, 1, 0], [20.1, 1.05, 0.08, 1, 0], [20.9, 1.0, 0.86, 0.6, 8], [22.6, 1.0, 0.86, 0.6, 8]] },
    { t0: 22.5, img: 'film3.jpg', fx: 0.5, fy: 0.45, x: 0.6, keys: [[22.5, 1.12, 0.85, 0.6, 8], [32.6, 1.0, 0.85, 0.6, 8]] },
    { t0: 32.5, img: 'film2.jpg', fx: 0.5, fy: 0.45, x: 0.6, keys: [[32.5, 1.0, 0.86, 0.6, 8], [40.1, 1.1, 0.86, 0.6, 8]] },
    { t0: 40.0, img: 'film1.jpg', fx: 0.56, fy: 0.34, x: 1.0, keys: [[40, 1.25, 0.12, 1, 0], [45, 1.06, 0.1, 1, 0]] },
  ],

  // S3: real films shown on the site.
  films: [
    { img: 'film1.jpg', name: 'Robert & Laura', venue: 'Peckforton Castle', t: 15.9 },
    { img: 'film2.jpg', name: 'Michael & Holly', venue: 'Fox Tail Barn', t: 18.1 },
    { img: 'film3.jpg', name: 'James & Naomi', venue: 'Pryors Hayes', t: 18.6 },
    { img: 'film4.jpg', name: 'Alex & Caitlin', venue: 'Delamere Events', t: 19.1 },
  ],

  steps: [
    { t: 22.6, n: '01', title: 'Check your date', desc: 'Pick your day in the calendar.' },
    { t: 25.1, n: '02', title: 'Let’s talk', desc: 'A relaxed video call, then a tailored quote.' },
    { t: 27.6, n: '03', title: 'Secure it', desc: 'A small booking fee holds your date.' },
    { t: 30.1, n: '04', title: 'Relive it', desc: 'Your films arrive in a private gallery.' },
  ],

  // S4: the day, and how much of it each collection covers.
  ticks: [
    { f: 0.06, label: 'GETTING READY' },
    { f: 0.3, label: 'CEREMONY' },
    { f: 0.55, label: 'SPEECHES' },
    { f: 0.76, label: 'FIRST DANCE' },
    { f: 0.94, label: 'DANCE FLOOR' },
  ],
  tiers: [
    { t: 32.6, f0: 0.27, f1: 0.79, name: 'Essentials', price: 'FROM £1,450', facts: ['Up to 6 hours', 'Highlight film, 4–5 min'], two: false },
    { t: 35.1, f0: 0.03, f1: 0.97, name: 'Signature', price: 'FROM £2,250', facts: ['Up to 10 hours', 'Highlight film, 8–10 min'], two: false },
    { t: 37.6, f0: 0.0, f1: 1.0, name: 'Feature Film', price: 'FROM £3,400', facts: ['Full day, two filmmakers', 'Feature film, 30–45 min'], two: true },
  ],

  // On-screen anchors (never the full caption line). Max two lines, max 8 words a line.
  headlines: [
    { t0: 0.4, t1: 4.8, label: 'WHAT COUPLES EXPECT', lines: ['A camera in your face', 'all day?'], linesAt: 3.3 },
    { t0: 5.2, t1: 7.4, label: 'THE REAL PICTURE', lines: ['Your day runs on its own.'] },
    { t0: 7.6, t1: 12.4, label: 'THE REAL PICTURE', lines: ['Moments happen.', 'Nobody stages them.'] },
    { t0: 12.6, t1: 14.8, label: 'THE IDEA', lines: ['The camera follows.', 'It doesn’t lead.'] },
    { t0: 15.1, t1: 19.9, label: 'THE PROOF', lines: ['Real couples. Real days.'] },
    { t0: 20.1, t1: 22.3, label: 'WHAT ARRIVES', lines: ['In your gallery', 'in 8–10 weeks.'] },
    { t0: 22.6, t1: 32.3, label: 'HOW TO BOOK', lines: ['Four steps.'] },
    { t0: 32.6, t1: 39.8, label: 'CHANGE ONE THING', lines: ['More of the day in.', 'More film back.'] },
  ],

  payoff: { tagline: ['Films that feel the', 'way the day did.'], cta: 'CHECK YOUR DATE', url: 'eb.wetframes.co', ctaAt: 42.6 },

  // Burned-in captions; also exported as captions.srt.
  captions: [
    { t0: 0.3, t1: 4.9, text: 'Most couples expect a wedding film to mean being directed all day.' },
    { t0: 5.2, t1: 7.4, text: 'The real picture: your day runs on its own.' },
    { t0: 7.6, t1: 12.4, text: 'The moments happen whether a camera is there or not.' },
    { t0: 12.6, t1: 14.9, text: 'Filmed from the background. Direction is rare.' },
    { t0: 15.1, t1: 17.4, text: 'A real EB film: Robert & Laura.' },
    { t0: 17.6, t1: 19.9, text: 'Four recent films, each a real wedding.' },
    { t0: 20.1, t1: 22.4, text: 'In your private gallery in 8 to 10 weeks.' },
    { t0: 22.6, t1: 24.9, text: 'Four steps to book. First, pick your date.' },
    { t0: 25.1, t1: 27.4, text: 'Next, a relaxed video call and a quote.' },
    { t0: 27.6, t1: 29.9, text: 'A small booking fee holds your date.' },
    { t0: 30.1, t1: 32.4, text: 'Afterwards, your films arrive ready to share.' },
    { t0: 32.6, t1: 34.9, text: 'Now change one thing: how much is filmed.' },
    { t0: 35.1, t1: 37.4, text: 'Ten hours of coverage doubles the highlight.' },
    { t0: 37.6, t1: 39.9, text: 'Two filmmakers add a 30–45 minute feature.' },
    { t0: 40.1, t1: 42.4, text: 'Same couple, same camera, kept at a distance.' },
    { t0: 42.6, t1: 44.9, text: 'Check your date at eb.wetframes.co.' },
  ],

  // Sound cues: only on actions that carry meaning.
  cues: [
    { t: 0.9, type: 'press', n: 0 }, { t: 1.7, type: 'press', n: 1 }, { t: 2.5, type: 'press', n: 2 },
    { t: 5.0, type: 'release' },
    { t: 9.31, type: 'capture', n: 0 }, { t: 10.49, type: 'capture', n: 1 }, { t: 12.25, type: 'capture', n: 2 },
    { t: 12.6, type: 'motif', gain: 0.8 }, { t: 15.0, type: 'lift' },
    { t: 15.9, type: 'tick', n: 0 }, { t: 18.1, type: 'tick', n: 1 }, { t: 18.6, type: 'tick', n: 2 }, { t: 19.1, type: 'tick', n: 3 },
    { t: 22.6, type: 'step', n: 0 }, { t: 25.1, type: 'step', n: 1 }, { t: 27.6, type: 'step', n: 2 }, { t: 30.1, type: 'step', n: 3 },
    { t: 32.6, type: 'widen', n: 0 }, { t: 35.1, type: 'widen', n: 1 }, { t: 37.6, type: 'widen', n: 2 },
    { t: 40.2, type: 'motif', gain: 1.0 },
    { t: 42.6, type: 'chime' },
  ],

  // Reduced-motion cut: the same sequence of ideas as settled stills, each [switch time, settled time shown], with 0.3 s dissolves.
  rmCuts: [[0, 0.85], [0.9, 1.65], [1.7, 2.45], [2.5, 4.5], [5.0, 7.1], [7.5, 9.25], [9.3, 10.45], [10.5, 12.1], [12.5, 14.5], [15.0, 16.4], [17.5, 18.6], [20.0, 22.0], [22.5, 24.9], [25.0, 27.4], [27.5, 29.9], [30.0, 32.0], [32.5, 34.9], [35.0, 37.4], [37.5, 39.5], [40.0, 42.4], [42.5, 44.95]],
};
if (typeof module !== 'undefined') module.exports = TIMELINE;
